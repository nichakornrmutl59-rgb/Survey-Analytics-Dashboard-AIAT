import { isDashboardAuthenticated } from "../../auth";

const SHEET_ID = process.env.GOOGLE_SHEET_ID?.trim() ?? "";

const SHEETS = [
  { name: "ทำงาน_354", group: "ทำงาน" },
  { name: "เรียน_291", group: "เรียน" },
  { name: "ทำงาน และเรียนไปด้วย_114", group: "เรียนและทำงาน" },
  { name: "ว่างงาน_48", group: "ว่างงาน" },
] as const;

const MEDAL_SHEETS = [
  { name: "Season 1_107", season: "Season 1" },
  { name: "Season 2_126", season: "Season 2" },
  { name: "Season 3_134", season: "Season 3" },
  { name: "Season 4_170", season: "Season 4" },
  { name: "Season 5_129", season: "Season 5" },
] as const;

type Group = (typeof SHEETS)[number]["group"];

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value.length || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function clean(value?: string) {
  const result = value?.trim() ?? "";
  return result === "-" ? "" : result;
}

function salaryFor(group: Group, row: string[], workType: string) {
  if (group === "เรียนและทำงาน") return clean(row[29]);
  if (group === "ว่างงาน") return clean(row[24]);
  if (group !== "ทำงาน") return "";

  if (workType.includes("เจ้าของกิจการ")) return clean(row[30]);
  if (workType.includes("ฟรีแลนซ์")) return clean(row[34]);
  if (workType.includes("นักวิจัย")) return clean(row[45]);
  if (workType.includes("อาจารย์")) return clean(row[60]);
  return clean(row[24]);
}

function valueFromHeaders(
  headers: string[],
  row: string[],
  include: RegExp,
  exclude?: RegExp,
) {
  for (let index = 0; index < headers.length; index += 1) {
    const header = clean(headers[index]);
    if (!header || !include.test(header) || (exclude && exclude.test(header))) continue;
    const value = clean(row[index]);
    if (value) return value;
  }
  return "";
}

function isGenericOrganizationLabel(value?: string) {
  const normalized = clean(value)
    .toLocaleLowerCase("th")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return false;

  return /^(?:ภาคเอกชน|เอกชน|ภาครัฐ(?:\s*\/\s*รัฐวิสาหกิจ)?|หน่วยงานภาครัฐ|ราชการ|รัฐวิสาหกิจ|สถาบันการศึกษา(?:\s*\/\s*(?:มหาวิทยาลัย|วิจัย))?|การศึกษา(?:\s*\/\s*วิจัย)?|startup\s*\/?\s*sme|องค์กรไม่แสวงกำไร|อาชีพอิสระ|private(?:\s+sector)?|public(?:\s+sector)?|government|education(?:\s*\/\s*research)?|ngo|non[- ]?profit)$/i.test(normalized);
}

function inferOrganization(headers: string[], row: string[]) {
  const candidates: Array<{ value: string; score: number; index: number }> = [];

  for (let index = 0; index < headers.length; index += 1) {
    const header = clean(headers[index]);
    const value = clean(row[index]);
    if (!header || !value || isGenericOrganizationLabel(value)) continue;
    if (!/บริษัท|หน่วยงาน|องค์กร|สถานที่ทำงาน|สังกัด|กิจการ|company|organization|employer|workplace/i.test(header)) continue;
    if (/ประเภท|ภาคส่วน|sector|อุตสาหกรรม|เว็บไซต์|website|url|ตำแหน่ง|position|จำนวน|พนักงาน|employee|สถานะ|รายได้|income|salary|ลูกค้า|client|ความสนใจ|interest|สนับสนุน|support|ลักษณะ|รูปแบบ|ขนาด/i.test(header)) continue;

    let score = 0;
    if (/ชื่อ\s*(?:บริษัท|หน่วยงาน|องค์กร|กิจการ)|(?:บริษัท|หน่วยงาน|องค์กร|กิจการ).*ชื่อ/i.test(header)) score += 12;
    if (/สถานที่ทำงาน|workplace|employer/i.test(header)) score += 8;
    if (/สังกัด/i.test(header)) score += 6;
    if (/company|organization/i.test(header)) score += 4;
    if (/ชื่อ/i.test(header)) score += 3;
    if (/กรุณาระบุ|โปรดระบุ|ระบุ/i.test(header)) score += 1;

    candidates.push({ value, score, index });
  }

  candidates.sort((a, b) => b.score - a.score || a.index - b.index);
  return candidates[0]?.value ?? "";
}

function inferOrganizationSector(headers: string[], row: string[]) {
  return valueFromHeaders(
    headers,
    row,
    /ประเภท.*(?:บริษัท|หน่วยงาน|องค์กร)|(?:บริษัท|หน่วยงาน|องค์กร).*ประเภท|ภาคส่วน.*(?:หน่วยงาน|องค์กร)|(?:หน่วยงาน|องค์กร).*ภาคส่วน|ลักษณะ.*(?:หน่วยงาน|องค์กร)|organization\s*(?:type|sector)|employer\s*type/i,
  );
}

function inferSector(headers: string[], row: string[]) {
  const value = valueFromHeaders(
    headers,
    row,
    /(?:^|\b)sector(?:\b|$)|อุตสาหกรรม|ประเภทธุรกิจ|ประเภทของธุรกิจ|ธุรกิจ.*ด้าน|ด้าน.*ธุรกิจ/i,
    /ภาคส่วนหน่วยงาน|ประเภทหน่วยงาน|หน่วยงาน.*ประเภท|องค์กร.*ประเภท|สังกัด/i,
  );

  // Values such as "ภาครัฐ / รัฐวิสาหกิจ" describe the organization type,
  // not the participant's industry. Leaving sector empty prevents them from
  // being incorrectly counted as Public Services.
  return isGenericOrganizationLabel(value) ? "" : value;
}

function workFields(group: Group, row: string[], workType: string): Record<string, string> {
  if (group === "เรียน") {
    return {
      educationLevel: clean(row[16]),
      fieldOfStudy: clean(row[17]),
      aiFieldOfStudy: clean(row[18]),
      institution: clean(row[19]),
      institutionType: clean(row[20]),
      studyYear: clean(row[21]),
      aiConfidence: clean(row[25]),
      aiDevelopment: clean(row[26]),
      futureStudyPlan: clean(row[29]),
      desiredEducationLevel: clean(row[31]),
      desiredStudyField: clean(row[32]),
      desiredStudyInstitution: clean(row[33]),
      desiredStudyTimeline: clean(row[34]),
      tools: clean(row[30]),
      scholarship: clean(row[36]),
      scholarshipAfterProject: clean(row[40]),
    };
  }

  if (group === "เรียนและทำงาน") {
    return {
      educationLevel: clean(row[17]),
      fieldOfStudy: clean(row[18]),
      institution: clean(row[19]),
      graduation: clean(row[21]),
      organization: clean(row[22]),
      organizationSector: clean(row[23]),
      sector: "",
      employmentType: clean(row[24]),
      position: clean(row[25]),
      responsibilities: clean(row[26]),
      workDuration: clean(row[27]),
      workHours: clean(row[28]),
      aiUsage: clean(row[30]),
    };
  }

  if (group === "ว่างงาน") {
    return {
      unemploymentDuration: clean(row[17]),
      priorExperience: clean(row[18]),
      priorRole: clean(row[19]),
      desiredRole: clean(row[20]),
      desiredSector: clean(row[21]),
      aiDevelopment: clean(row[22]),
      desiredSkills: clean(row[23]),
      startupInterest: clean(row[25]),
      startupField: clean(row[26]),
      startupStage: clean(row[27]),
      desiredSupport: clean(row[29]),
    };
  }

  if (workType.includes("เจ้าของกิจการ")) {
    return {
      organizationSector: clean(row[17]),
      organization: clean(row[27]),
      sector: clean(row[29]),
      employeeCount: clean(row[31]),
      businessStatus: clean(row[32]),
      responsibilities: clean(row[33]),
      portfolio: clean(row[28]),
      aiUsage: "",
    };
  }

  if (workType.includes("ฟรีแลนซ์")) {
    return {
      organizationSector: clean(row[17]),
      // The freelancer form stores the work scope in this column. Do not treat
      // that free-text answer as an explicitly supplied industry; the dashboard
      // can infer a Sector from the work context when the real Sector is absent.
      sector: "",
      responsibilities: clean(row[33]),
      clientGroup: clean(row[35]),
      aiUsage: clean(row[36]),
      aiField: clean(row[37]),
      tools: clean(row[39]),
      outcomes: clean(row[40]),
      portfolio: clean(row[41]),
    };
  }

  if (workType.includes("นักวิจัย")) {
    return {
      organizationSector: clean(row[17]),
      organization: clean(row[42]),
      position: clean(row[43]),
      responsibilities: clean(row[44]),
      researchTopic: clean(row[46]),
      aiField: clean(row[47]),
      outcomes: clean(row[48]),
      portfolio: clean(row[49]),
      receivedFunding: clean(row[50]),
      funder: clean(row[51]),
      fundingValue: clean(row[52]),
      aiUsage: clean(row[47]),
    };
  }

  if (workType.includes("อาจารย์")) {
    return {
      organizationSector: clean(row[17]),
      organization: clean(row[55]),
      position: clean(row[56]),
      teachingLevel: clean(row[57]),
      fieldOfStudy: clean(row[58]),
      aiUsage: clean(row[59]),
      aiField: clean(row[61]),
      teachingPlatform: clean(row[62]),
      studentReach: clean(row[63]),
      outcomes: clean(row[64]),
      portfolio: clean(row[65]),
    };
  }

  return {
    organizationSector: clean(row[17]),
    sector: "",
    organization: clean(row[18]),
    website: clean(row[19]),
    position: clean(row[20]),
    responsibilities: clean(row[21]),
    aiUsage: clean(row[22]),
    aiField: clean(row[23]),
    workDuration: clean(row[25]),
    portfolio: clean(row[26]),
  };
}

function normalize(group: Group, row: string[], rowIndex: number, headers: string[]) {
  const workType = group === "ทำงาน" ? clean(row[16]) : "";
  const fields = workFields(group, row, workType);

  if (group === "ทำงาน" || group === "เรียนและทำงาน") {
    const organizationFromHeader = inferOrganization(headers, row);
    const organizationSectorFromHeader = inferOrganizationSector(headers, row);
    const sectorFromHeader = inferSector(headers, row);

    if (organizationFromHeader) {
      fields.organization = organizationFromHeader;
    } else if (isGenericOrganizationLabel(fields.organization)) {
      fields.organization = "";
    }

    if (organizationSectorFromHeader) fields.organizationSector = organizationSectorFromHeader;
    if (sectorFromHeader) fields.sector = sectorFromHeader;
  }

  return {
    // Row index is always included because participant codes are not guaranteed
    // to be unique in the source sheets. Unique keys prevent stale React cards
    // from surviving when a company/Sector filter changes the visible list.
    key: `${group}-${clean(row[1]) || "row"}-${rowIndex}`,
    group,
    code: clean(row[1]),
    season: clean(row[2]),
    track: clean(row[3]),
    house: clean(row[4]),
    title: clean(row[5]),
    firstName: clean(row[6]),
    lastName: clean(row[7]),
    nickname: clean(row[8]),
    gender: clean(row[9]),
    email: clean(row[10]),
    age: clean(row[11]),
    social: clean(row[12]),
    phone: clean(row[13]),
    address: clean(row[14]),
    workType,
    income: salaryFor(group, row, workType),
    ...fields,
  };
}

async function loadSheet(sheet: (typeof SHEETS)[number]) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet.name)}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "text/csv" },
  });

  if (!response.ok) {
    throw new Error(`อ่านชีท ${sheet.name} ไม่สำเร็จ (${response.status})`);
  }

  const csv = await response.text();
  if (csv.trimStart().startsWith("<")) {
    throw new Error(`ชีท ${sheet.name} ไม่ได้เปิดสิทธิ์ให้อ่านด้วยลิงก์`);
  }

  const rows = parseCsv(csv);
  const headers = rows[0] ?? [];

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => clean(cell)))
    .map((row, index) => normalize(sheet.group, row, index + 1, headers));
}

function medalType(value?: string) {
  const normalized = clean(value);
  const lower = normalized.toLocaleLowerCase("en");
  if (normalized.startsWith("เหรียญทองแดง")) return "เหรียญทองแดง";
  if (normalized.startsWith("เหรียญเงิน")) return "เหรียญเงิน";
  if (normalized.startsWith("เหรียญทอง")) return "เหรียญทอง";
  if (lower.includes("ai developer")) return "AI Developer";
  if (lower.includes("ai participant")) return "AI Participant";
  if (lower.includes("ai designer")) return "AI Designer";
  return "ไม่ได้เหรียญ";
}

async function loadMedalSheet(sheet: (typeof MEDAL_SHEETS)[number]) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet.name)}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "text/csv" },
  });

  if (!response.ok) {
    throw new Error(`อ่านชีท ${sheet.name} ไม่สำเร็จ (${response.status})`);
  }

  const csv = await response.text();
  if (csv.trimStart().startsWith("<")) {
    throw new Error(`ชีท ${sheet.name} ไม่ได้เปิดสิทธิ์ให้อ่านด้วยลิงก์`);
  }

  return parseCsv(csv)
    .slice(1)
    .filter((row) => clean(row[1]) || clean(row[3]) || clean(row[4]))
    .map((row, index) => ({
      key: `medal-${sheet.season}-${clean(row[1]) || index + 1}`,
      season: sheet.season,
      code: clean(row[1]),
      title: clean(row[2]),
      firstName: clean(row[3]),
      lastName: clean(row[4]),
      organization: clean(row[5]),
      award: clean(row[6]),
      medalType: medalType(row[6]),
    }));
}

export async function GET() {
  if (!(await isDashboardAuthenticated())) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    if (!SHEET_ID) {
      throw new Error("ยังไม่ได้ตั้งค่า GOOGLE_SHEET_ID");
    }

    const [groups, medalGroups] = await Promise.all([
      Promise.all(SHEETS.map(loadSheet)),
      Promise.all(MEDAL_SHEETS.map(loadMedalSheet)),
    ]);
    const participants = groups.flat();
    const medalRecipients = medalGroups.flat();

    return Response.json(
      {
        participants,
        medalRecipients,
        updatedAt: new Date().toISOString(),
        source: "Google Sheets",
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถอ่านข้อมูลได้";
    return Response.json(
      { error: message },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
