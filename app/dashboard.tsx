"use client";

import { GradientCard } from "@/components/ui/gradient-card";
import { Card as GlowCard, CardCanvas } from "@/components/ui/animated-glow-card";
import { HeroSection } from "@/components/ui/hero-section-2";
import ParticlesComponent from "@/components/ui/particles-bg";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type Participant = {
  key: string;
  group: string;
  code: string;
  season: string;
  track: string;
  house: string;
  title: string;
  firstName: string;
  lastName: string;
  nickname: string;
  gender: string;
  email: string;
  age: string;
  social: string;
  phone: string;
  address: string;
  workType: string;
  income: string;
  [key: string]: string;
};

type ApiResponse = {
  participants?: unknown;
  medalRecipients?: unknown;
  awardDiagnostics?: unknown;
  updatedAt?: string;
  error?: string;
};

type AwardDiagnostic = {
  season: string;
  sheet: string;
  expectedRows: number;
  sourceRows: number;
  recognizedRows: number;
  unresolvedRows: number;
  categoryMismatch: boolean;
  counts: Record<string, number>;
  expectedCounts: Record<string, number>;
  discoveredAiAwardColumns?: Record<string, string>;
  unresolvedAwardValues?: string[];
};

type MedalRecipient = {
  key: string;
  season: string;
  code: string;
  title: string;
  firstName: string;
  lastName: string;
  organization: string;
  award: string;
  medalType: string;
};

const GROUPS = [
  { name: "ทำงาน", color: "#FF7A1A", soft: "#FFF0E2", short: "ทำงาน", gradient: "orange" },
  { name: "เรียน", color: "#2F6BFF", soft: "#EAF0FF", short: "เรียน", gradient: "blue" },
  { name: "เรียนและทำงาน", color: "#FF4FA3", soft: "#FFEAF5", short: "เรียน + ทำงาน", gradient: "pink" },
  { name: "ว่างงาน", color: "#19BCEB", soft: "#E8FAFF", short: "ว่างงาน", gradient: "cyan" },
] as const;

const GROUP_COLOR: Record<string, string> = Object.fromEntries(
  GROUPS.map((group) => [group.name, group.color]),
);

const TRACK_NAMES = ["AI Innovator", "AI Engineer", "AI Researcher"] as const;

const TRACK_COLORS: Record<string, string> = {
  "AI Engineer": "#2F6BFF",
  "AI Innovator": "#FF4FA3",
  "AI Researcher": "#FF7A1A",
};

const WORK_TYPES = [
  "พนักงานประจำ",
  "เจ้าของกิจการ / ผู้ประกอบการ / Startup Founder",
  "ฟรีแลนซ์ / ที่ปรึกษา (Freelancer / Consultant)",
  "อาจารย์ / ผู้สอน",
  "นักวิจัย / วิชาการ",
];

const SECTORS = [
  { name: "Public Services", color: "#2F6BFF" },
  { name: "Healthcare", color: "#19BCEB" },
  { name: "Education Technology", color: "#19BCEB" },
  { name: "Tourism", color: "#FF4FA3" },
  { name: "Manufacturing", color: "#FF7A1A" },
  { name: "Finance", color: "#163A8A" },
  { name: "Safety & Security", color: "#E94B5F" },
  { name: "Agriculture", color: "#22A06B" },
] as const;

const DETAIL_FIELDS: Array<[string, string]> = [
  ["educationLevel", "ระดับการศึกษา"],
  ["fieldOfStudy", "สาขา / หลักสูตร"],
  ["aiFieldOfStudy", "สาขาที่เกี่ยวข้องกับ AI"],
  ["institution", "สถาบันการศึกษา"],
  ["institutionType", "ประเภทสถานศึกษา"],
  ["studyYear", "ปีการศึกษา"],
  ["graduation", "คาดว่าจะจบการศึกษา"],
  ["organization", "บริษัท / หน่วยงาน"],
  ["website", "เว็บไซต์บริษัท / หน่วยงาน"],
  ["organizationSector", "ภาคส่วนหน่วยงาน"],
  ["sector", "ภาคส่วน / อุตสาหกรรม"],
  ["sectorSource", "ที่มาของการจัดกลุ่ม Sector"],
  ["employmentType", "ลักษณะการจ้างงาน"],
  ["position", "ตำแหน่ง"],
  ["responsibilities", "หน้าที่ / ขอบเขตงาน"],
  ["workDuration", "ระยะเวลาทำงาน"],
  ["workHours", "ชั่วโมงทำงานต่อสัปดาห์"],
  ["income", "รายได้เฉลี่ยต่อเดือน"],
  ["aiUsage", "ความเกี่ยวข้อง / การใช้ AI"],
  ["aiField", "ด้าน AI ที่เกี่ยวข้อง"],
  ["aiConfidence", "ความมั่นใจด้าน AI"],
  ["aiDevelopment", "ด้าน AI ที่ต้องการพัฒนา"],
  ["tools", "เครื่องมือ / เทคโนโลยี"],
  ["researchTopic", "หัวข้องานวิจัย"],
  ["teachingLevel", "ระดับที่สอน"],
  ["teachingPlatform", "แพลตฟอร์มการสอน"],
  ["studentReach", "ผู้เรียนต่อปี"],
  ["outcomes", "ผลลัพธ์ / ผลงาน"],
  ["receivedFunding", "ได้รับทุนวิจัย"],
  ["funder", "แหล่งทุน"],
  ["fundingValue", "มูลค่าทุน"],
  ["scholarship", "ได้รับทุนการศึกษา"],
  ["scholarshipAfterProject", "ทุนเกิดหลังเข้าร่วมโครงการ"],
  ["futureStudyPlan", "แผนศึกษาต่อ"],
  ["desiredEducationLevel", "ระดับการศึกษาที่ต้องการศึกษาต่อ"],
  ["desiredStudyField", "สาขาที่สนใจศึกษาต่อ"],
  ["desiredStudyInstitution", "สถาบัน / ประเทศที่คาดหวัง"],
  ["desiredStudyTimeline", "แผนระยะเวลาศึกษาต่อ"],
  ["unemploymentDuration", "ระยะเวลาว่างงาน"],
  ["priorExperience", "ประสบการณ์ทำงานเดิม"],
  ["priorRole", "งานที่เคยทำ"],
  ["desiredRole", "งานที่สนใจ"],
  ["desiredSector", "ภาคส่วนที่สนใจ"],
  ["desiredSkills", "ทักษะที่ต้องการพัฒนา"],
  ["startupInterest", "ความสนใจทำ Startup"],
  ["startupField", "ด้านธุรกิจที่สนใจ"],
  ["startupStage", "สถานะแนวคิดธุรกิจ"],
  ["desiredSupport", "การสนับสนุนที่ต้องการ"],
  ["employeeCount", "จำนวนพนักงาน"],
  ["businessStatus", "สถานะธุรกิจ"],
  ["clientGroup", "กลุ่มลูกค้า"],
  ["portfolio", "ผลงาน / หลักฐาน"],
];

const FOOTER_LOGOS = [
  { src: "/sponsor-mhesi.png", alt: "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม", fit: "seal" },
  { src: "/sponsor-tsri.png", alt: "สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม", fit: "tsri" },
  { src: "/sponsor-rorworpo.png", alt: "สำนักงานเร่งรัดการวิจัยและนวัตกรรม", fit: "standard" },
  { src: "/sponsor-bpko.png", alt: "หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่", fit: "bpko" },
  { src: "/sponsor-ailoveu.jpg", alt: "AI Love U", fit: "wide" },
  { src: "/sponsor-aiat.jpg", alt: "สมาคมปัญญาประดิษฐ์ประเทศไทย", fit: "aiat" },
  { src: "/sponsor-aiat10.png", alt: "AIAT ครบรอบ 10 ปี", fit: "aiat10" },
  { src: "/sponsor-nectec.png", alt: "NECTEC", fit: "wide" },
  { src: "/sponsor-rmutl.png", alt: "มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา", fit: "rmutl" },
  { src: "/sponsor-siit.png", alt: "สถาบันเทคโนโลยีนานาชาติสิรินธร", fit: "wide" },
  { src: "/sponsor-superai.png", alt: "Super AI Engineer", fit: "superai" },
] as const;

function countBy(items: Participant[], key: keyof Participant) {
  return items.reduce<Record<string, number>>((result, item) => {
    const value = item[key]?.trim();
    if (value) result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}

function sortEntries(entries: Array<[string, number]>) {
  return entries.sort((a, b) => b[1] - a[1]);
}

function parseTracks(value?: string) {
  const raw = value?.trim() ?? "";
  if (!raw) return [] as string[];
  const normalized = raw.toLocaleLowerCase("en");
  const canonical = TRACK_NAMES.filter((track) => normalized.includes(track.toLocaleLowerCase("en")));
  if (canonical.length) return [...canonical];
  return [raw];
}

function participantHasTrack(person: Participant, track: string) {
  return parseTracks(person.track).includes(track);
}

function participantIdentityKey(person: Participant) {
  const normalizedName = `${person.firstName ?? ""}${person.lastName ?? ""}`
    .normalize("NFKC")
    .toLocaleLowerCase("th")
    .replace(/[\s.'’"()\-–—]/g, "");
  if (normalizedName) return `name:${normalizedName}`;

  const normalizedEmail = (person.email ?? "").trim().toLocaleLowerCase("en");
  if (normalizedEmail) return `email:${normalizedEmail}`;

  const normalizedPhone = (person.phone ?? "").replace(/\D/g, "");
  if (normalizedPhone) return `phone:${normalizedPhone}`;

  const normalizedCode = (person.code ?? "").trim().toLocaleLowerCase("en");
  if (normalizedCode) return `code:${normalizedCode}`;

  return person.key;
}

function countTrackMemberships(items: Participant[]) {
  return items.reduce<Record<string, number>>((result, person) => {
    parseTracks(person.track).forEach((track) => {
      result[track] = (result[track] ?? 0) + 1;
    });
    return result;
  }, {});
}

function findParticipantForMedal(recipient: MedalRecipient, participants: Participant[]) {
  const normalizedCode = recipient.code.trim().toLocaleLowerCase("th");
  const normalizedName = `${recipient.firstName}${recipient.lastName}`.replace(/\s/g, "").toLocaleLowerCase("th");
  if (normalizedCode) {
    const byCode = participants.find((person) => person.code.trim().toLocaleLowerCase("th") === normalizedCode);
    if (byCode) return byCode;
  }
  const byName = participants.filter((person) => `${person.firstName}${person.lastName}`.replace(/\s/g, "").toLocaleLowerCase("th") === normalizedName);
  return byName.find((person) => person.season === recipient.season) ?? byName[0];
}

function percent(value: number, total: number) {
  if (!total) return "0";
  return ((value / total) * 100).toFixed(1);
}

function normalizeGender(value?: string) {
  const normalized = value?.trim().toLocaleLowerCase("th") ?? "";
  if (!normalized) return "ไม่ระบุ";
  if (normalized === "ชาย" || normalized === "ผู้ชาย" || normalized === "male") return "ชาย";
  if (normalized === "หญิง" || normalized === "ผู้หญิง" || normalized === "female") return "หญิง";
  return "อื่น ๆ / ไม่ประสงค์ระบุ";
}

function ageRange(value?: string) {
  const age = Number.parseInt(value?.replace(/[^0-9]/g, "") ?? "", 10);
  if (!Number.isFinite(age)) return "ไม่ระบุ";
  if (age < 18) return "ต่ำกว่า 18 ปี";
  if (age <= 22) return "18–22 ปี";
  if (age <= 29) return "23–29 ปี";
  if (age <= 39) return "30–39 ปี";
  if (age <= 49) return "40–49 ปี";
  return "50 ปีขึ้นไป";
}

function normalizeEducation(value?: string) {
  const normalized = value?.trim() ?? "";
  if (!normalized) return "ไม่ระบุ";
  if (/ประถม/.test(normalized)) return "ประถมศึกษา";
  if (/มัธยมศึกษาตอนต้น|ม\.ต้น/.test(normalized)) return "มัธยมศึกษาตอนต้น";
  if (/มัธยมศึกษาตอนปลาย|ม\.ปลาย/.test(normalized)) return "มัธยมศึกษาตอนปลาย";
  if (/ปวช|อนุปริญญา|ปวส/.test(normalized)) return "ปวช. / ปวส. / อนุปริญญา";
  if (/ปริญญาตรี/.test(normalized)) return "ปริญญาตรี";
  if (/ปริญญาโท/.test(normalized)) return "ปริญญาโท";
  if (/ปริญญาเอก/.test(normalized)) return "ปริญญาเอก";
  return "อื่น ๆ";
}

function normalizeSector(value?: string) {
  const normalized = value?.trim().toLocaleLowerCase("th") ?? "";
  if (!normalized) return "";

  if (/public service|public administration|public sector|e-government|government|ราชการ|ภาครัฐ|รัฐวิสาหกิจ|กระทรวง|กรม|เทศบาล|อบต|บริการประชาชน|บริการสาธารณะ|นโยบายสาธารณะ/.test(normalized)) return "Public Services";
  if (/healthcare|health care|healthcares|medical|medicine|hospital|clinic|clinical|pharma|patient|radiology|สุขภาพ|การแพทย์|โรงพยาบาล|คลินิก|สาธารณสุข|เภสัช|ผู้ป่วย|เวช|รังสี|โรค/.test(normalized)) return "Healthcare";
  if (/education technology|educational technology|education|edtech|e-learning|learning management system|lms\b|school|university|academy|curriculum|student|learner|teacher|lecturer|instructor|การศึกษา|มหาวิทยาลัย|โรงเรียน|สถาบันการศึกษา|เทคโนโลยีการศึกษา|หลักสูตร|ผู้เรียน|นักเรียน|นักศึกษา|การสอน|สอน|อาจารย์|ครู|อบรม/.test(normalized)) return "Education Technology";
  if (/toursim|tourism|travel|hospitality|hotel|airline|aviation|reservation|ท่องเที่ยว|นักท่องเที่ยว|โรงแรม|การบิน|สายการบิน|บริการที่พัก|ที่พัก|จองห้อง/.test(normalized)) return "Tourism";
  if (/manufactoring|manufacturing|manufacturer|factory|industrial|automotive|electronics|production|assembly|machine|machinery|quality control|\bqc\b|การผลิต|โรงงาน|อุตสาหกรรม|ยานยนต์|อิเล็กทรอนิกส์|เครื่องจักร|สายการผลิต|ควบคุมคุณภาพ/.test(normalized)) return "Manufacturing";
  if (/finance|financial|fintech|bank|banking|insurance|investment|accounting|credit|lending|loan|payment|การเงิน|ธนาคาร|ประกัน|การลงทุน|บัญชี|สินเชื่อ|เครดิต|ชำระเงิน/.test(normalized)) return "Finance";
  if (/safety|security|cyber|defen[cs]e|police|military|threat|intrusion|soc\b|ความปลอดภัย|ความมั่นคง|ไซเบอร์|ตำรวจ|ทหาร|ป้องกัน|ภัยคุกคาม|การบุกรุก/.test(normalized)) return "Safety & Security";
  if (/agriculure|agriculture|agricultural|agri|farm|farming|crop|livestock|irrigation|เกษตร|ฟาร์ม|ปศุสัตว์|เพาะปลูก|พืช|ชลประทาน|การเกษตร/.test(normalized)) return "Agriculture";

  return "";
}

function inferSectorFromWorkContext(participant: Participant) {
  // Sector is an industry classification, not the same thing as organization type.
  // When the source has no explicit Sector, use the participant's actual work
  // context. Responsibilities are deliberately checked first because they best
  // describe what the participant works on.
  const candidates: Array<[string, string | undefined]> = [
    ["หน้าที่ / ขอบเขตงาน", participant.responsibilities],
    ["หัวข้องานวิจัย", participant.researchTopic],
    ["กลุ่มลูกค้า", participant.clientGroup],
    ["ตำแหน่ง", participant.position],
    ["บริษัท / หน่วยงาน", isGenericOrganizationLabel(participant.organization) ? "" : participant.organization],
    ["ด้าน AI ที่เกี่ยวข้อง", participant.aiField],
    ["สาขา / หลักสูตร", participant.fieldOfStudy],
  ];

  for (const [source, value] of candidates) {
    const sector = normalizeSector(value);
    if (sector) return { sector, source };
  }

  // Teaching work is sufficiently specific to place in Education Technology even
  // when the free-text responsibility field is empty.
  if (/อาจารย์|ผู้สอน|teacher|lecturer|instructor/i.test(participant.workType ?? "")) {
    return { sector: "Education Technology", source: "รูปแบบการทำงาน" };
  }

  return { sector: "", source: "" };
}

function normalizeOrganizationSector(value?: string) {
  const normalized = value?.trim().toLocaleLowerCase("th") ?? "";
  if (!normalized || normalized === "-" || normalized === "ไม่ระบุ") return "ไม่ระบุ";
  if (/ภาครัฐ|รัฐวิสาหกิจ|ราชการ|หน่วยงานรัฐ|public sector|government/.test(normalized)) return "ภาครัฐ / รัฐวิสาหกิจ";
  if (/สถาบันการศึกษา|มหาวิทยาลัย|วิจัย|โรงเรียน|education|university|research/.test(normalized)) return "สถาบันการศึกษา / วิจัย";
  if (/สตาร์ทอัพ|startup|sme/.test(normalized)) return "Startup / SME";
  if (/ภาคเอกชน|private|บริษัท/.test(normalized)) return "ภาคเอกชน";
  if (/ไม่แสวง|มูลนิธิ|สมาคม|ngo|non.?profit/.test(normalized)) return "องค์กรไม่แสวงกำไร";
  if (/อิสระ|ฟรีแลนซ์|freelance|self.?employ/.test(normalized)) return "อาชีพอิสระ";
  return "อื่น ๆ";
}

function isGenericOrganizationLabel(value?: string) {
  const normalized = value
    ?.trim()
    .toLocaleLowerCase("th")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ") ?? "";

  if (!normalized) return false;
  return /^(?:ภาคเอกชน|เอกชน|ภาครัฐ(?:\s*\/\s*รัฐวิสาหกิจ)?|หน่วยงานภาครัฐ|ราชการ|รัฐวิสาหกิจ|สถาบันการศึกษา(?:\s*\/\s*(?:มหาวิทยาลัย|วิจัย))?|การศึกษา(?:\s*\/\s*วิจัย)?|startup\s*\/?\s*sme|องค์กรไม่แสวงกำไร|อาชีพอิสระ|private(?:\s+sector)?|public(?:\s+sector)?|government|education(?:\s*\/\s*research)?|ngo|non[- ]?profit)$/i.test(normalized);
}

function educationRank(value?: string) {
  const normalized = value?.trim() ?? "";
  if (/ปริญญาเอก/.test(normalized)) return 7;
  if (/ปริญญาโท/.test(normalized)) return 6;
  if (/ปริญญาตรี/.test(normalized)) return 5;
  if (/ปวส|อนุปริญญา/.test(normalized)) return 4;
  if (/ปวช|มัธยมศึกษาตอนปลาย|ม\.ปลาย/.test(normalized)) return 3;
  if (/มัธยมศึกษาตอนต้น|ม\.ต้น/.test(normalized)) return 2;
  if (/ประถม/.test(normalized)) return 1;
  return 0;
}

function countDerived(items: Participant[], getValue: (item: Participant) => string) {
  return items.reduce<Record<string, number>>((result, item) => {
    const value = getValue(item);
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}

function sanitizeParticipant(value: unknown, index: number): Participant | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const source = value as Record<string, unknown>;
  const participant = Object.fromEntries(
    Object.entries(source).map(([key, fieldValue]) => [key, typeof fieldValue === "string" ? fieldValue : fieldValue == null ? "" : String(fieldValue)]),
  ) as Participant;

  // Always make the client-side key unique. The source participant code can be
  // duplicated across rows/seasons, and duplicate React keys may leave stale
  // participant cards visible after applying a company/Sector filter.
  participant.key = `${participant.key || "participant"}-${index + 1}`;
  participant.sectorOriginal = participant.sector;

  const explicitSector = isGenericOrganizationLabel(participant.sectorOriginal)
    ? ""
    : normalizeSector(participant.sectorOriginal);

  if (explicitSector) {
    participant.sector = explicitSector;
    participant.sectorSource = "ระบุในข้อมูลต้นทาง";
  } else {
    const inferred = inferSectorFromWorkContext(participant);
    participant.sector = inferred.sector;
    participant.sectorSource = inferred.sector ? `จัดกลุ่มจาก${inferred.source}` : "";
  }

  return participant;
}

function sanitizeParticipants(value: unknown): Participant[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((participant, index) => sanitizeParticipant(participant, index))
    .filter((participant): participant is Participant => participant !== null);
}

function sanitizeMedalRecipients(value: unknown): MedalRecipient[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const source = item as Record<string, unknown>;
    const text = (key: string) => typeof source[key] === "string" ? source[key] : source[key] == null ? "" : String(source[key]);
    const medalType = text("medalType");
    if (!medalType) return [];
    return [{
      key: text("key") || `medal-${index + 1}`,
      season: text("season"),
      code: text("code"),
      title: text("title"),
      firstName: text("firstName"),
      lastName: text("lastName"),
      organization: text("organization"),
      award: text("award"),
      medalType,
    }];
  });
}

function formatUpdatedAt(value: string) {
  if (!value) return "กำลังเชื่อมข้อมูล";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function initials(person: Participant) {
  return `${person.firstName.charAt(0)}${person.lastName.charAt(0)}` || "—";
}

function extractLinks(value: string) {
  const matches = value.match(/(?:https?:\/\/|www\.)[^\s,]+/gi) ?? [];
  return Array.from(
    new Set(
      matches.map((link) => {
        const cleanLink = link.replace(/[)\]}>.;]+$/, "");
        return cleanLink.startsWith("www.") ? `https://${cleanLink}` : cleanLink;
      }),
    ),
  );
}

function textWithoutLinks(value: string) {
  return value
    .replace(/(?:https?:\/\/|www\.)[^\s,]+/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, "")
    .trim();
}

function DetailValue({ field, value }: { field: string; value: string }) {
  const links = extractLinks(value);
  const description = textWithoutLinks(value);

  if (!links.length) return <strong>{value}</strong>;

  const actionLabel =
    field === "portfolio" || field === "outcomes"
      ? "เปิดผลงาน / หลักฐาน"
      : field === "website"
        ? "เปิดเว็บไซต์"
        : "เปิดลิงก์";

  return (
    <div className="detail-value">
      {description && <strong>{description}</strong>}
      <div className="evidence-actions">
        {links.map((link, index) => (
          <a key={link} className="evidence-button" href={link} target="_blank" rel="noopener noreferrer">
            {actionLabel}{links.length > 1 ? ` ${index + 1}` : ""}<span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  total,
  color,
  onClick,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="bar-label">
        <span>{label}</span>
        <strong>{value.toLocaleString("th-TH")}</strong>
      </div>
      <div className="bar-track">
        <span style={{ width: `${Math.max((value / Math.max(total, 1)) * 100, 1.5)}%`, background: color }} />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button className="bar-row bar-button" type="button" onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div className="bar-row">{content}</div>;
}

export default function Dashboard() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [medalRecipients, setMedalRecipients] = useState<MedalRecipient[]>([]);
  const [awardDiagnostics, setAwardDiagnostics] = useState<AwardDiagnostic[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"overview" | "track-report" | "award-report" | "people">("overview");
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("ทั้งหมด");
  const [trackFilter, setTrackFilter] = useState("ทั้งหมด");
  const [seasonFilter, setSeasonFilter] = useState("ทั้งหมด");
  const [workFilter, setWorkFilter] = useState("ทั้งหมด");
  const [selected, setSelected] = useState<Participant | null>(null);
  const [showStartups, setShowStartups] = useState(false);
  const [showIndustry, setShowIndustry] = useState(false);
  const [industrySectorFilter, setIndustrySectorFilter] = useState<string | null>(null);
  const [showTrackHouses, setShowTrackHouses] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [demographicDirectory, setDemographicDirectory] = useState<"gender" | "age" | null>(null);
  const [demographicTrack, setDemographicTrack] = useState<string | null>(null);
  const [demographicFilter, setDemographicFilter] = useState<string | null>(null);
  const [selectedStudySeason, setSelectedStudySeason] = useState<string | null>(null);
  const [studyLevelFilter, setStudyLevelFilter] = useState("ทั้งหมด");
  const [showMedals, setShowMedals] = useState(false);
  const [medalSeasonFilter, setMedalSeasonFilter] = useState("ทั้งหมด");
  const [medalTypeFilter, setMedalTypeFilter] = useState("ทั้งหมด");
  const [medalTrackFilter, setMedalTrackFilter] = useState("ทั้งหมด");
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [incomeSummaryView, setIncomeSummaryView] = useState<"organizations" | "sectors" | null>(null);
  const [incomeListFilter, setIncomeListFilter] = useState<{ type: "organization" | "sector"; value: string } | null>(null);
  const [page, setPage] = useState(1);
  const [trackSummaryDirectory, setTrackSummaryDirectory] = useState<"memberships" | "unique" | "multi" | null>(null);
  const [trackSummaryTrackFilter, setTrackSummaryTrackFilter] = useState("ทั้งหมด");
  const [trackSummaryQuery, setTrackSummaryQuery] = useState("");
  const [trackSummaryPage, setTrackSummaryPage] = useState(1);

  const loadData = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch(`/api/participants?fresh=${Date.now()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiResponse;
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      if (!response.ok || !Array.isArray(payload.participants)) {
        throw new Error(payload.error || "ไม่สามารถเชื่อมต่อข้อมูลได้");
      }
      setParticipants(sanitizeParticipants(payload.participants));
      setMedalRecipients(sanitizeMedalRecipients(payload.medalRecipients));
      setAwardDiagnostics(Array.isArray(payload.awardDiagnostics) ? payload.awardDiagnostics as AwardDiagnostic[] : []);
      setUpdatedAt(payload.updatedAt ?? new Date().toISOString());
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "ไม่สามารถเชื่อมต่อข้อมูลได้");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => loadData(), 0);
    const interval = window.setInterval(() => loadData(true), 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") loadData(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const totals = useMemo(() => countBy(participants, "group"), [participants]);
  const tracks = useMemo(() => sortEntries(Object.entries(countTrackMemberships(participants))), [participants]);
  const aiEngineerParticipants = useMemo(
    () => participants.filter((item) => participantHasTrack(item, "AI Engineer")),
    [participants],
  );
  const aiEngineerHouseGroups = useMemo(() => {
    const groups = new Map<string, Participant[]>();
    aiEngineerParticipants.forEach((person) => {
      const house = person.house?.trim() || "ไม่ระบุบ้าน";
      groups.set(house, [...(groups.get(house) ?? []), person]);
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "th", { numeric: true }));
  }, [aiEngineerParticipants]);
  const visibleAiEngineerHouseParticipants = useMemo(() => {
    if (!selectedHouse) return aiEngineerParticipants;
    return aiEngineerHouseGroups.find(([house]) => house === selectedHouse)?.[1] ?? [];
  }, [aiEngineerParticipants, aiEngineerHouseGroups, selectedHouse]);
  const seasons = useMemo(
    () => Object.keys(countBy(participants, "season")).sort((a, b) => a.localeCompare(b, "th", { numeric: true })),
    [participants],
  );
  const workers = useMemo(() => participants.filter((item) => item.group === "ทำงาน"), [participants]);
  const workTypes = useMemo(() => countBy(workers, "workType"), [workers]);
  const genderEntries = useMemo(() => {
    const counts = countDerived(participants, (item) => normalizeGender(item.gender));
    return [
      ["ชาย", counts["ชาย"] ?? 0],
      ["หญิง", counts["หญิง"] ?? 0],
      ["อื่น ๆ", (counts["อื่น ๆ / ไม่ประสงค์ระบุ"] ?? 0) + (counts["ไม่ระบุ"] ?? 0)],
    ] as Array<[string, number]>;
  }, [participants]);
  const ageEntries = useMemo(() => {
    const counts = countDerived(participants, (item) => ageRange(item.age));
    return ["ต่ำกว่า 18 ปี", "18–22 ปี", "23–29 ปี", "30–39 ปี", "40–49 ปี", "50 ปีขึ้นไป", "ไม่ระบุ"]
      .map((label) => [label, counts[label] ?? 0] as [string, number])
      .filter(([, count]) => count > 0);
  }, [participants]);
  const demographicBaseParticipants = useMemo(
    () => demographicTrack
      ? participants.filter((person) => participantHasTrack(person, demographicTrack))
      : participants,
    [demographicTrack, participants],
  );
  const demographicDirectoryGroups = useMemo(() => {
    if (!demographicDirectory) return [] as Array<[string, Participant[]]>;
    if (demographicDirectory === "gender") {
      const labels = ["ชาย", "หญิง", "อื่น ๆ"];
      return labels
        .map((label) => [label, demographicBaseParticipants.filter((person) => {
          const normalized = normalizeGender(person.gender);
          return label === "อื่น ๆ" ? normalized !== "ชาย" && normalized !== "หญิง" : normalized === label;
        })] as [string, Participant[]])
        .filter(([, people]) => people.length > 0);
    }
    const labels = ["ต่ำกว่า 18 ปี", "18–22 ปี", "23–29 ปี", "30–39 ปี", "40–49 ปี", "50 ปีขึ้นไป", "ไม่ระบุ"];
    return labels
      .map((label) => [label, demographicBaseParticipants.filter((person) => ageRange(person.age) === label)] as [string, Participant[]])
      .filter(([, people]) => people.length > 0);
  }, [demographicBaseParticipants, demographicDirectory]);
  const visibleDemographicParticipants = useMemo(() => {
    if (!demographicDirectory) return [] as Participant[];
    if (!demographicFilter) return demographicBaseParticipants;
    return demographicDirectoryGroups.find(([label]) => label === demographicFilter)?.[1] ?? [];
  }, [demographicBaseParticipants, demographicDirectory, demographicDirectoryGroups, demographicFilter]);
  const openDemographicDirectory = (type: "gender" | "age", track: string | null = null) => {
    setDemographicTrack(track);
    setDemographicFilter(null);
    setDemographicDirectory(type);
  };
  const closeDemographicDirectory = () => {
    setDemographicDirectory(null);
    setDemographicTrack(null);
    setDemographicFilter(null);
  };

  const educationEntries = useMemo(() => {
    const counts = countDerived(participants, (item) => normalizeEducation(item.educationLevel));
    return ["ประถมศึกษา", "มัธยมศึกษาตอนต้น", "มัธยมศึกษาตอนปลาย", "ปวช. / ปวส. / อนุปริญญา", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก", "อื่น ๆ", "ไม่ระบุ"]
      .map((label) => [label, counts[label] ?? 0] as [string, number])
      .filter(([, count]) => count > 0);
  }, [participants]);
  const organizationSectorEntries = useMemo(() => {
    const employed = participants.filter((item) => item.group === "ทำงาน" || item.group === "เรียนและทำงาน");
    const counts = countDerived(employed, (item) => normalizeOrganizationSector(item.organizationSector));
    return ["ภาครัฐ / รัฐวิสาหกิจ", "ภาคเอกชน", "สถาบันการศึกษา / วิจัย", "Startup / SME", "องค์กรไม่แสวงกำไร", "อาชีพอิสระ", "อื่น ๆ", "ไม่ระบุ"]
      .map((label) => [label, counts[label] ?? 0] as [string, number])
      .filter(([, count]) => count > 0);
  }, [participants]);
  const incomeEntries = useMemo(() => {
    const counts = countBy(participants.filter((item) => item.group === "ทำงาน" || item.group === "เรียนและทำงาน"), "income");
    return ["น้อยกว่า 20,000 บาท", "20,001-35,000 บาท", "35,001-50,000 บาท", "มากกว่า 50,000 บาท"]
      .map((income) => [income, counts[income] ?? 0] as [string, number]);
  }, [participants]);
  const selectedIncomeParticipants = useMemo(
    () => selectedIncome
      ? participants.filter(
          (item) => (item.group === "ทำงาน" || item.group === "เรียนและทำงาน") && item.income === selectedIncome,
        )
      : [],
    [participants, selectedIncome],
  );
  const selectedIncomeSectors = useMemo(
    () => sortEntries(Object.entries(countBy(selectedIncomeParticipants, "sector"))).slice(0, 5),
    [selectedIncomeParticipants],
  );
  const selectedIncomeOrganizations = useMemo(() => {
    const groups = new Map<string, Participant[]>();
    selectedIncomeParticipants.forEach((person) => {
      const organization = person.organization?.trim();
      if (organization) groups.set(organization, [...(groups.get(organization) ?? []), person]);
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "th"));
  }, [selectedIncomeParticipants]);
  const selectedIncomeSectorGroups = useMemo(
    () => SECTORS.map((sector) => [sector.name, selectedIncomeParticipants.filter((person) => person.sector === sector.name)] as [string, Participant[]])
      .filter(([, people]) => people.length > 0),
    [selectedIncomeParticipants],
  );
  const visibleIncomeParticipants = useMemo(() => {
    if (!incomeListFilter) return selectedIncomeParticipants;

    // Reuse the exact participant array behind the clicked summary card. This
    // guarantees that a card labelled “1 คน” renders exactly one participant,
    // instead of independently filtering the source data with slightly
    // different whitespace/normalization rules.
    if (incomeListFilter.type === "organization") {
      return selectedIncomeOrganizations.find(([organization]) => organization === incomeListFilter.value)?.[1] ?? [];
    }

    return selectedIncomeSectorGroups.find(([sector]) => sector === incomeListFilter.value)?.[1] ?? [];
  }, [selectedIncomeParticipants, selectedIncomeOrganizations, selectedIncomeSectorGroups, incomeListFilter]);
  const startupFounders = useMemo(
    () => participants.filter((item) => item.workType?.includes("เจ้าของกิจการ")),
    [participants],
  );
  const employedParticipants = useMemo(
    () => participants.filter((item) => item.group === "ทำงาน" || item.group === "เรียนและทำงาน"),
    [participants],
  );
  const sectorDirectory = useMemo(() => {
    const groups = new Map<string, Participant[]>(SECTORS.map((sector) => [sector.name, []]));
    employedParticipants.forEach((item) => {
      const sector = item.sector?.trim();
      if (sector && groups.has(sector)) groups.set(sector, [...(groups.get(sector) ?? []), item]);
    });
    return [...groups.entries()];
  }, [employedParticipants]);
  const unclassifiedIndustryParticipants = useMemo(
    () => employedParticipants.filter((item) => !item.sector?.trim()),
    [employedParticipants],
  );
  const organizationDirectory = useMemo(() => {
    const groups = new Map<string, Participant[]>();
    employedParticipants.forEach((item) => {
      const organization = item.organization?.trim() ?? "";
      if (organization && !isGenericOrganizationLabel(organization)) {
        groups.set(organization, [...(groups.get(organization) ?? []), item]);
      }
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [employedParticipants]);
  const selectedIndustryParticipants = useMemo(
    () => industrySectorFilter
      ? employedParticipants.filter((item) => item.sector?.trim() === industrySectorFilter)
      : employedParticipants,
    [employedParticipants, industrySectorFilter],
  );
  const selectedIndustryOrganizations = useMemo(() => {
    if (!industrySectorFilter) return organizationDirectory;
    const groups = new Map<string, Participant[]>();
    selectedIndustryParticipants.forEach((item) => {
      const organization = item.organization?.trim() ?? "";
      if (organization && !isGenericOrganizationLabel(organization)) {
        groups.set(organization, [...(groups.get(organization) ?? []), item]);
      }
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "th"));
  }, [industrySectorFilter, organizationDirectory, selectedIndustryParticipants]);
  const selectedIndustryUnspecifiedParticipants = useMemo(
    () => selectedIndustryParticipants.filter((item) => {
      const organization = item.organization?.trim();
      return !organization || isGenericOrganizationLabel(organization);
    }),
    [selectedIndustryParticipants],
  );
  const openIndustryDirectory = (sector: string | null = null) => {
    setIndustrySectorFilter(sector);
    setShowIndustry(true);
  };
  const knownIncomeParticipants = useMemo(
    () => employedParticipants.filter((item) => Boolean(item.income)),
    [employedParticipants],
  );
  const incomeStats = useMemo(() => {
    const counts = countBy(knownIncomeParticipants, "income");
    return ["น้อยกว่า 20,000 บาท", "20,001-35,000 บาท", "35,001-50,000 บาท", "มากกว่า 50,000 บาท"]
      .map((label) => [label, counts[label] ?? 0] as [string, number]);
  }, [knownIncomeParticipants]);
  const incomeEstimatedAverage = useMemo(() => {
    const midpoint: Record<string, number> = { "น้อยกว่า 20,000 บาท": 15000, "20,001-35,000 บาท": 27500, "35,001-50,000 บาท": 42500, "มากกว่า 50,000 บาท": 55000 };
    const totalIncome = incomeStats.reduce((sum, [label, count]) => sum + (midpoint[label] ?? 0) * count, 0);
    const counted = incomeStats.reduce((sum, [, count]) => sum + count, 0);
    return counted ? Math.round(totalIncome / counted) : 0;
  }, [incomeStats]);
  const continuingStudents = useMemo(
    () => participants.filter((item) => item.group === "เรียน" && educationRank(item.desiredEducationLevel) > educationRank(item.educationLevel)),
    [participants],
  );
  const continuingBySeason = useMemo(
    () => seasons.map((season) => {
      const people = continuingStudents.filter((item) => item.season === season);
      return { season, people, levels: sortEntries(Object.entries(countBy(people, "desiredEducationLevel"))) };
    }).filter((item) => item.people.length > 0),
    [continuingStudents, seasons],
  );
  const selectedStudySeasonEntry = useMemo(
    () => selectedStudySeason ? continuingBySeason.find((item) => item.season === selectedStudySeason) ?? null : null,
    [continuingBySeason, selectedStudySeason],
  );
  const visibleStudyParticipants = useMemo(
    () => !selectedStudySeasonEntry
      ? []
      : studyLevelFilter === "ทั้งหมด"
        ? selectedStudySeasonEntry.people
        : selectedStudySeasonEntry.people.filter((item) => item.desiredEducationLevel === studyLevelFilter),
    [selectedStudySeasonEntry, studyLevelFilter],
  );
  const classifiedIndustryParticipants = useMemo(
    () => employedParticipants.filter((item) => Boolean(item.sector?.trim())),
    [employedParticipants],
  );
  const organizationParticipantTotal = useMemo(
    () => organizationDirectory.reduce((sum, [, people]) => sum + people.length, 0),
    [organizationDirectory],
  );
  const medalTypes = [
    { name: "เหรียญทอง", color: "#F2A900" },
    { name: "เหรียญเงิน", color: "#8591AA" },
    { name: "เหรียญทองแดง", color: "#C66A2B" },
    { name: "AI Developer", color: "#2F6BFF" },
    { name: "AI Designer", color: "#19BCEB" },
    { name: "AI Participant", color: "#19BCEB" },
  ] as const;
  const reportMedalRecipients = useMemo(
    () => medalRecipients.filter((item) => medalTypes.some((type) => type.name === item.medalType)),
    [medalRecipients],
  );
  const medalCounts = useMemo(
    () => reportMedalRecipients.reduce<Record<string, number>>((result, item) => {
      result[item.medalType] = (result[item.medalType] ?? 0) + 1;
      return result;
    }, {}),
    [reportMedalRecipients],
  );
  const medalSeasons = ["Season 1", "Season 2", "Season 3", "Season 4", "Season 5"];
  const medalSeasonSummary = useMemo(
    () => medalSeasons.map((season) => ({
      season,
      total: reportMedalRecipients.filter((item) => item.season === season).length,
      counts: medalTypes.map((type) => ({ ...type, value: reportMedalRecipients.filter((item) => item.season === season && item.medalType === type.name).length })),
    })),
    [reportMedalRecipients],
  );
  const medalRecipientsInTrack = useMemo(
    () => medalTrackFilter === "ทั้งหมด"
      ? reportMedalRecipients
      : reportMedalRecipients.filter((recipient) => {
          const participant = findParticipantForMedal(recipient, participants);
          return participant ? participantHasTrack(participant, medalTrackFilter) : false;
        }),
    [reportMedalRecipients, medalTrackFilter, participants],
  );
  const medalRecipientsInSeason = useMemo(
    () => medalSeasonFilter === "ทั้งหมด"
      ? medalRecipientsInTrack
      : medalRecipientsInTrack.filter((item) => item.season === medalSeasonFilter),
    [medalRecipientsInTrack, medalSeasonFilter],
  );
  const filteredMedalCounts = useMemo(
    () => medalRecipientsInSeason.reduce<Record<string, number>>((result, item) => {
      result[item.medalType] = (result[item.medalType] ?? 0) + 1;
      return result;
    }, {}),
    [medalRecipientsInSeason],
  );
  const visibleMedalRecipients = medalRecipientsInSeason.filter((item) => (
    medalTypeFilter === "ทั้งหมด" || item.medalType === medalTypeFilter
  ));
  const openMedalDirectory = useCallback((season = "ทั้งหมด", medalType = "ทั้งหมด", track = "ทั้งหมด") => {
    setMedalSeasonFilter(season);
    setMedalTypeFilter(medalType);
    setMedalTrackFilter(track);
    setShowMedals(true);
  }, []);
  const participantByMedal = useCallback((recipient: MedalRecipient) => findParticipantForMedal(recipient, participants), [participants]);
  const trackReportData = useMemo(() => TRACK_NAMES.map((track) => {
    const people = participants.filter((person) => participantHasTrack(person, track));
    const status = GROUPS.map((group) => ({
      ...group,
      count: people.filter((person) => person.group === group.name).length,
    }));
    const genderCounts = countDerived(people, (person) => normalizeGender(person.gender));
    const gender = [
      { label: "ชาย", count: genderCounts["ชาย"] ?? 0, color: "#2F6BFF" },
      { label: "หญิง", count: genderCounts["หญิง"] ?? 0, color: "#FF4FA3" },
      { label: "อื่น ๆ", count: (genderCounts["อื่น ๆ / ไม่ประสงค์ระบุ"] ?? 0) + (genderCounts["ไม่ระบุ"] ?? 0), color: "#19BCEB" },
    ].filter((item) => item.count > 0);
    const ageCounts = countDerived(people, (person) => ageRange(person.age));
    const age = ["ต่ำกว่า 18 ปี", "18–22 ปี", "23–29 ปี", "30–39 ปี", "40–49 ปี", "50 ปีขึ้นไป", "ไม่ระบุ"]
      .map((label, index) => ({ label, count: ageCounts[label] ?? 0, color: ["#19BCEB", "#2F6BFF", "#6D4AFF", "#FF4FA3", "#FF7A1A", "#E9A11B", "#A7B2CF"][index] }))
      .filter((item) => item.count > 0);
    const educationCounts = countDerived(people, (person) => normalizeEducation(person.educationLevel));
    const education = ["ประถมศึกษา", "มัธยมศึกษาตอนต้น", "มัธยมศึกษาตอนปลาย", "ปวช. / ปวส. / อนุปริญญา", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก", "อื่น ๆ", "ไม่ระบุ"]
      .map((label, index) => ({ label, count: educationCounts[label] ?? 0, color: ["#19BCEB", "#2F6BFF", "#4E5DE7", "#6D4AFF", "#FF4FA3", "#FF7A1A", "#E9A11B", "#8D78E6", "#A7B2CF"][index] }))
      .filter((item) => item.count > 0);
    const medals = reportMedalRecipients.filter((recipient) => {
      const participant = findParticipantForMedal(recipient, participants);
      return participant ? participantHasTrack(participant, track) : false;
    });
    const medalCountsByType = medalTypes.map((type) => ({
      ...type,
      count: medals.filter((recipient) => recipient.medalType === type.name).length,
    }));
    return { track, people, status, gender, age, education, medals, medalCountsByType };
  }), [reportMedalRecipients, participants]);
  const trackMembershipTotal = useMemo(() => trackReportData.reduce((sum, item) => sum + item.people.length, 0), [trackReportData]);
  const participantTrackDirectory = useMemo(() => {
    const byPerson = new Map<string, { person: Participant; records: Participant[]; tracks: Set<string> }>();
    participants.forEach((person) => {
      const identity = participantIdentityKey(person);
      const current = byPerson.get(identity) ?? { person, records: [], tracks: new Set<string>() };
      current.records.push(person);
      parseTracks(person.track).forEach((track) => current.tracks.add(track));
      // Prefer the record with the most contact/profile context as the representative row.
      const score = (item: Participant) => [item.email, item.phone, item.organization, item.position, item.nickname, item.season].filter(Boolean).length;
      if (score(person) > score(current.person)) current.person = person;
      byPerson.set(identity, current);
    });
    return Array.from(byPerson.values()).map((entry) => ({
      person: entry.person,
      records: entry.records,
      tracks: [
        ...TRACK_NAMES.filter((track) => entry.tracks.has(track)),
        ...Array.from(entry.tracks).filter((track) => !TRACK_NAMES.some((canonicalTrack) => canonicalTrack === track)),
      ] as string[],
    }));
  }, [participants]);
  const participantTrackSummary = useMemo(() => ({
    uniqueParticipantCount: participantTrackDirectory.length,
    multiTrackParticipantCount: participantTrackDirectory.filter((entry) => entry.tracks.length > 1).length,
  }), [participantTrackDirectory]);
  const trackSummaryRows = useMemo(() => {
    const normalizedQuery = trackSummaryQuery.trim().toLocaleLowerCase("th");
    const rows = trackSummaryDirectory === "memberships"
      ? participants.map((person) => ({ person, records: [person], tracks: parseTracks(person.track) }))
      : participantTrackDirectory.filter((entry) => trackSummaryDirectory !== "multi" || entry.tracks.length > 1);
    return rows.filter((entry) => {
      const matchesTrack = trackSummaryTrackFilter === "ทั้งหมด" || entry.tracks.includes(trackSummaryTrackFilter);
      if (!matchesTrack) return false;
      if (!normalizedQuery) return true;
      const person = entry.person;
      const haystack = [person.code, person.title, person.firstName, person.lastName, person.nickname, person.email, person.phone, ...entry.tracks]
        .join(" ")
        .toLocaleLowerCase("th");
      return haystack.includes(normalizedQuery);
    });
  }, [participantTrackDirectory, participants, trackSummaryDirectory, trackSummaryQuery, trackSummaryTrackFilter]);
  const trackSummaryPageSize = 20;
  const trackSummaryPageCount = Math.max(1, Math.ceil(trackSummaryRows.length / trackSummaryPageSize));
  const visibleTrackSummaryRows = trackSummaryRows.slice((trackSummaryPage - 1) * trackSummaryPageSize, trackSummaryPage * trackSummaryPageSize);
  const trackSummaryTrackCounts = useMemo(() => TRACK_NAMES.map((track) => [
    track,
    (trackSummaryDirectory === "memberships"
      ? participants.filter((person) => participantHasTrack(person, track)).length
      : participantTrackDirectory.filter((entry) => (trackSummaryDirectory !== "multi" || entry.tracks.length > 1) && entry.tracks.includes(track)).length),
  ] as const), [participantTrackDirectory, participants, trackSummaryDirectory]);
  const openTrackSummaryDirectory = (type: "memberships" | "unique" | "multi") => {
    setTrackSummaryDirectory(type);
    setTrackSummaryTrackFilter("ทั้งหมด");
    setTrackSummaryQuery("");
    setTrackSummaryPage(1);
  };
  const openTrackStatusPeople = (track: string, status: string | null = null) => {
    setQuery("");
    setGroupFilter(status ?? "ทั้งหมด");
    setTrackFilter(track);
    setSeasonFilter("ทั้งหมด");
    setWorkFilter("ทั้งหมด");
    setPage(1);
    setView("people");
  };
  const closeTrackSummaryDirectory = () => {
    setTrackSummaryDirectory(null);
    setTrackSummaryTrackFilter("ทั้งหมด");
    setTrackSummaryQuery("");
    setTrackSummaryPage(1);
  };
  const medalsWithoutParticipantMatch = useMemo(() => reportMedalRecipients.filter((recipient) => !findParticipantForMedal(recipient, participants)).length, [reportMedalRecipients, participants]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th");
    return participants.filter((item) => {
      const haystack = [item.code, item.title, item.firstName, item.lastName, item.nickname, item.email, item.phone]
        .join(" ")
        .toLocaleLowerCase("th");
      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (groupFilter === "ทั้งหมด" || item.group === groupFilter) &&
        (trackFilter === "ทั้งหมด" || participantHasTrack(item, trackFilter)) &&
        (seasonFilter === "ทั้งหมด" || item.season === seasonFilter) &&
        (workFilter === "ทั้งหมด" || item.workType === workFilter)
      );
    });
  }, [participants, query, groupFilter, trackFilter, seasonFilter, workFilter]);

  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const selectGroup = (group: string) => {
    setGroupFilter(group);
    setPage(1);
    setView("people");
  };

  const clearFilters = () => {
    setQuery("");
    setGroupFilter("ทั้งหมด");
    setTrackFilter("ทั้งหมด");
    setSeasonFilter("ทั้งหมด");
    setWorkFilter("ทั้งหมด");
    setPage(1);
  };

  const openIncomeDirectory = (income: string) => {
    setSelectedIncome(income);
    setIncomeSummaryView(null);
    setIncomeListFilter(null);
  };

  const closeIncomeDirectory = () => {
    setSelectedIncome(null);
    setIncomeSummaryView(null);
    setIncomeListFilter(null);
  };

  const openTrackHouseDirectory = () => {
    setSelectedHouse(null);
    setShowTrackHouses(true);
  };

  const closeTrackHouseDirectory = () => {
    setShowTrackHouses(false);
    setSelectedHouse(null);
  };

  const detailReturnLabel = selectedIncome
    ? "กลับไปรายชื่อในช่วงรายได้"
    : selectedStudySeason
      ? `กลับไปแผนเรียนต่อ ${selectedStudySeason}`
      : showMedals
        ? "กลับไปรายชื่อผู้ได้รับเหรียญ"
        : showTrackHouses
          ? "กลับไปรายชื่อบ้าน AI Engineer"
          : demographicDirectory
            ? demographicDirectory === "gender" ? "กลับไปรายชื่อตามเพศ" : "กลับไปรายชื่อตามช่วงอายุ"
            : showStartups
            ? "กลับไปทะเบียน Startup"
            : "กลับไปยังรายการเดิม";

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  };

  const total = participants.length;
  const genderColors = ["#2F6BFF", "#FF4FA3", "#19BCEB"] as const;
  const genderTotal = genderEntries.reduce((sum, [, count]) => sum + count, 0);
  const genderPercent = (count: number) => `${((count / Math.max(genderTotal, 1)) * 100).toLocaleString("th-TH", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const genderGradient = genderEntries.reduce((result, [, count], index) => {
    const previous = genderEntries.slice(0, index).reduce((sum, [, value]) => sum + value, 0);
    const start = (previous / Math.max(genderTotal, 1)) * 360;
    const end = ((previous + count) / Math.max(genderTotal, 1)) * 360;
    return `${result}${index ? ", " : ""}${genderColors[index] ?? "#19BCEB"} ${start}deg ${end}deg`;
  }, "");
  const genderCalloutPoints = genderEntries.map(([, count], index) => {
    const previous = genderEntries.slice(0, index).reduce((sum, [, value]) => sum + value, 0);
    const midpoint = ((previous + count / 2) / Math.max(genderTotal, 1)) * 360;
    const radians = (midpoint * Math.PI) / 180;
    const radius = 134;
    return {
      x: 210 + Math.sin(radians) * radius,
      y: 175 - Math.cos(radians) * radius,
    };
  });
  const genderCalloutTargets = [
    { x: 337, y: 238 },
    { x: 145, y: 76 },
    { x: 245, y: 48 },
  ];
  const trackTotal = tracks.reduce((sum, [, count]) => sum + count, 0);
  const trackGradient = tracks.reduce((result, [track, count], index) => {
    const previous = tracks.slice(0, index).reduce((sum, [, value]) => sum + value, 0);
    const start = (previous / Math.max(trackTotal, 1)) * 360;
    const end = ((previous + count) / Math.max(trackTotal, 1)) * 360;
    const color = TRACK_COLORS[track] ?? "#19BCEB";
    return `${result}${index ? ", " : ""}${color} ${start}deg ${end}deg`;
  }, "");
  const groupGradient = GROUPS.reduce(
    (result, group, index) => {
      const previous = GROUPS.slice(0, index).reduce((sum, item) => sum + (totals[item.name] ?? 0), 0);
      const start = (previous / Math.max(total, 1)) * 360;
      const end = ((previous + (totals[group.name] ?? 0)) / Math.max(total, 1)) * 360;
      return `${result}${index ? ", " : ""}${group.color} ${start}deg ${end}deg`;
    },
    "",
  );
  const seasonLegendData = GROUPS.map((group) => ({
    ...group,
    count: totals[group.name] ?? 0,
    percent: percent(totals[group.name] ?? 0, total),
  }));

  return (
    <main>
      <ParticlesComponent />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="กลับด้านบน">
          <span className="brand-logos" aria-hidden="true">
            <Image className="brand-logo-aiat" src="/aiat-10-logo.png" width={283} height={240} alt="" priority />
            <i />
            <Image className="brand-logo-superai" src="/super-ai-logo.png" width={276} height={260} alt="" priority />
          </span>
          <span className="brand-text">
            <strong>ระบบติดตามผลผู้เข้าร่วมโครงการ</strong>
            <small>Super AI Engineer • AIAT</small>
          </span>
        </a>
        <nav className="view-switch" aria-label="เลือกมุมมอง">
          <button className={view === "overview" ? "active" : ""} type="button" onClick={() => setView("overview")}>ภาพรวม</button>
          <button className={view === "track-report" ? "active" : ""} type="button" onClick={() => setView("track-report")}>รายงาน Track</button>
          <button className={view === "award-report" ? "active" : ""} type="button" onClick={() => setView("award-report")}>รายงานเหรียญ</button>
          <button className={view === "people" ? "active" : ""} type="button" onClick={() => setView("people")}>รายบุคคล</button>
        </nav>
        <div className="sync-status">
          <span className="dataset-update-badge" aria-label="ข้อมูลชุดนี้อัปเดตวันที่ 17 ก.ค. 2569">
            <span>ข้อมูลชุดนี้อัปเดต</span>
            <strong>17 ก.ค. 2569</strong>
          </span>
          <span className={error ? "status-dot error" : "status-dot"} />
          <div>
            <small>{error ? "การเชื่อมต่อขัดข้อง" : "เชื่อมต่อ Google Sheets"}</small>
            <strong>{formatUpdatedAt(updatedAt)}</strong>
          </div>
          <button className="refresh-button" type="button" onClick={() => loadData(true)} disabled={refreshing} aria-label="อัปเดตข้อมูลทันที">
            <span className={refreshing ? "spin" : ""}>↻</span>
          </button>
          <button className="logout-button" type="button" onClick={logout}>ออกจากระบบ</button>
        </div>
      </header>

      <div className="page-shell" id="top">
        {error && (
          <div className="error-banner" role="alert">
            <span>!</span>
            <div><strong>ยังแสดงข้อมูลล่าสุดไม่ได้</strong><p>{error}</p></div>
            <button type="button" onClick={() => loadData()}>ลองอีกครั้ง</button>
          </div>
        )}

        {view === "overview" ? (
          <>
            <HeroSection
              title={<>ติดตามผลผู้เข้าร่วมโครงการ<br /><span>Super AI Engineer</span></>}
              subtitle="ภาพรวมเส้นทางหลังจบโครงการ เพื่อมองเห็นกำลังคนที่เข้าสู่อุตสาหกรรม การศึกษาต่อ และโอกาสพัฒนาเชิงนโยบาย"
              callToAction={{ text: "สำรวจผู้เข้าร่วม", onClick: () => setView("people") }}
              privacyText="ข้อมูลส่วนบุคคลแสดงเฉพาะหน้ารายบุคคล"
              backgroundImage="/sponsor-superai.png"
              liveValue={loading ? "—" : total.toLocaleString("th-TH")}
              liveLabel="ผู้เข้าร่วมที่ติดตามผลแล้ว"
            />

            <section className="demographic-section demographic-first" aria-labelledby="demographic-heading">
              <div className="demographic-title">
                <h2 id="demographic-heading">ข้อมูลพื้นฐานผู้เข้าร่วมโครงการ</h2>
              </div>
              <div className="demographic-grid">
                <article className="panel demographic-card gender-card">
                  <div className="demographic-card-heading"><span>เพศ</span><div className="demographic-total"><small>รวม</small><strong>{total.toLocaleString("th-TH")}</strong></div></div>
                  <div className="gender-donut-wrap">
                    <div className="gender-donut-stage">
                      <svg className="gender-callout-lines" viewBox="0 0 420 350" aria-hidden="true">
                        {genderEntries.map(([label], index) => {
                          const point = genderCalloutPoints[index];
                          const target = genderCalloutTargets[index];
                          const color = genderColors[index] ?? "#19BCEB";
                          if (!point || !target) return null;
                          return (
                            <g key={`${label}-leader`}>
                              <line x1={point.x} y1={point.y} x2={target.x} y2={target.y} stroke={color} />
                              <circle cx={point.x} cy={point.y} r="5.5" fill="#fff" stroke={color} />
                            </g>
                          );
                        })}
                      </svg>
                      {genderEntries.map(([label, count], index) => (
                        <div className={`gender-callout gender-callout-${index + 1}`} key={`${label}-callout`}>
                          <div className="gender-callout-badge">
                            <i style={{ background: genderColors[index] ?? "#19BCEB" }} />
                            <span>{label}</span>
                            <strong>{genderPercent(count)}</strong>
                          </div>
                        </div>
                      ))}
                      <div className="donut gender-donut" style={{ background: `conic-gradient(${genderGradient || "#e5e7eb 0deg 360deg"})` }}>
                        <div><strong>{genderTotal.toLocaleString("th-TH")}</strong><span>ผู้เข้าร่วม</span></div>
                      </div>
                    </div>
                    <div className="gender-inline-legend" aria-label="สรุปจำนวนตามเพศ">
                      {genderEntries.map(([label, count], index) => (
                        <div key={label}>
                          <i style={{ background: genderColors[index] ?? "#19BCEB" }} />
                          <span>{label}</span>
                          <strong>{count.toLocaleString("th-TH")}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="demographic-directory-button" type="button" onClick={() => openDemographicDirectory("gender")}>
                    <span className="button-label">ดูรายชื่อตามเพศ</span>
                    <span className="button-icon" aria-hidden="true">→</span>
                  </button>
                </article>

                <article className="panel demographic-card age-card">
                  <div className="demographic-card-heading"><span>ช่วงอายุ</span><div className="demographic-total"><small>รวม</small><strong>{total.toLocaleString("th-TH")}</strong></div></div>
                  <div className="demographic-bars compact-demographic-bars">
                    {ageEntries.map(([label, count], index) => (
                      <BreakdownBar key={label} label={label} value={count} total={total} color={["#19BCEB", "#2F6BFF", "#6D4AFF", "#FF4FA3", "#FF7A1A", "#E9A11B", "#A7B2CF"][index] ?? "#19BCEB"} />
                    ))}
                  </div>
                  <button className="demographic-directory-button age-directory-button" type="button" onClick={() => openDemographicDirectory("age")}>
                    <span className="button-label">ดูรายชื่อตามช่วงอายุ</span>
                    <span className="button-icon" aria-hidden="true">→</span>
                  </button>
                </article>

                <article className="panel demographic-card education-card">
                  <div className="demographic-card-heading"><span>ระดับการศึกษา</span><div className="demographic-total"><small>รวม</small><strong>{total.toLocaleString("th-TH")}</strong></div></div>
                  <p className="demographic-note">กลุ่มทำงานและว่างงานไม่มีคำถามระดับการศึกษา จึงรวมเป็น “ไม่ระบุ”</p>
                  <div className="demographic-bars compact-demographic-bars">
                    {educationEntries.map(([label, count], index) => (
                      <BreakdownBar key={label} label={label} value={count} total={total} color={["#19BCEB", "#2F6BFF", "#4F58E8", "#6D4AFF", "#FF4FA3", "#FF7A1A", "#E9A11B", "#8D70DA", "#A7B2CF"][index] ?? "#19BCEB"} />
                    ))}
                  </div>
                </article>
              </div>
            </section>

            <section className="insight-grid bottom-grid demographic-insights">
              <article className="panel track-distribution-panel">
                <div className="panel-heading">
                  <div><h2>การกระจายตาม Track</h2></div>
                  <span className="big-context">{trackTotal.toLocaleString("th-TH")}</span>
                </div>
                <div className="track-donut-layout">
                  <div className="donut track-donut" style={{ background: `conic-gradient(${trackGradient || "#e5e7eb 0deg 360deg"})` }}>
                    <div><strong>{trackTotal.toLocaleString("th-TH")}</strong><span>คน (นับตาม Track)</span></div>
                  </div>
                  <div className="track-legend-list">
                    {tracks.map(([track, count]) => {
                      const color = TRACK_COLORS[track] ?? "#19BCEB";
                      const isAiEngineer = track === "AI Engineer";
                      return (
                        <div
                          className={`track-legend-item ${isAiEngineer ? "track-legend-engineer" : ""}`}
                          key={track}
                          style={{ "--track-color": color } as React.CSSProperties}
                        >
                          <div className="track-legend-main">
                            <i style={{ background: color }} />
                            <span>{track}</span>
                            <strong>{count.toLocaleString("th-TH")}</strong>
                          </div>
                          <small>{percent(count, trackTotal)}% ของผู้ที่ระบุ Track</small>
                          {isAiEngineer && (
                            <button type="button" onClick={openTrackHouseDirectory}>
                              ดูรายละเอียด “บ้าน” →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="track-counting-note">ผู้เข้าร่วมที่มีมากกว่า 1 Track จะถูกนับซ้ำในทุก Track ที่เข้าร่วม</p>
              </article>

              <article className="panel">
                <div className="panel-heading"><div><h2>ภาคส่วนการทำงาน</h2></div></div>
                <div className="bars-list compact-bars">
                  {organizationSectorEntries.map(([sector, count], index) => (
                    <BreakdownBar key={sector} label={sector} value={count} total={Math.max(...organizationSectorEntries.map(([, value]) => value), 1)} color={["#2F6BFF", "#FF7A1A", "#6D4AFF", "#FF4FA3", "#22A06B", "#19BCEB", "#E9A11B", "#A7B2CF"][index] ?? "#2F6BFF"} />
                  ))}
                </div>
                <p className="organization-sector-note">จัดกลุ่มจากคำตอบ “หน่วยงานที่สังกัด” ของกลุ่มทำงาน และกลุ่มเรียนพร้อมทำงาน</p>
              </article>
            </section>

            <section className="panel season-panel">
              <div className="panel-heading"><div><h2>เส้นทางของผู้เข้าร่วมในแต่ละ Season</h2></div></div>
              <div className="season-explainer">
                <p>สีในแต่ละแถบแสดง “เส้นทางปัจจุบัน” ของผู้เข้าร่วมใน Season นั้น ๆ และความยาวของสีคือสัดส่วนของคนในกลุ่มนั้น</p>
                <div className="season-legend" role="list" aria-label="คำอธิบายสีของเส้นทางผู้เข้าร่วม">
                  {seasonLegendData.map((group) => (
                    <div className="season-legend-item" key={group.name} role="listitem">
                      <i style={{ background: group.color }} aria-hidden="true" />
                      <div>
                        <strong>{group.name}</strong>
                        <span>{group.count.toLocaleString("th-TH")} คน • {group.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="season-chart">
                {seasons.map((season) => {
                  const seasonParticipants = participants.filter((item) => item.season === season);
                  const seasonTotal = seasonParticipants.length;
                  const seasonBreakdown = GROUPS
                    .map((group) => {
                      const value = seasonParticipants.filter((item) => item.group === group.name).length;
                      return value ? `${group.short} ${value} คน (${percent(value, seasonTotal)}%)` : null;
                    })
                    .filter(Boolean)
                    .join(" • ");
                  return (
                    <div className="season-row" key={season}>
                      <strong>{season}</strong>
                      <div className="season-stack-wrap">
                        <div className="season-stack" title={seasonBreakdown} aria-label={`${season}: ${seasonBreakdown}`}>
                          {GROUPS.map((group) => {
                            const value = seasonParticipants.filter((item) => item.group === group.name).length;
                            return value ? <span key={group.name} title={`${group.short}: ${value} คน (${percent(value, seasonTotal)}%)`} style={{ width: `${(value / seasonTotal) * 100}%`, background: group.color }} /> : null;
                          })}
                        </div>
                        <small>{seasonBreakdown}</small>
                      </div>
                      <span>{seasonTotal}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="status-summary-section" aria-labelledby="status-summary-heading">
              <div className="status-summary-heading">
                <div>
                  <h2 id="status-summary-heading">ภาพรวมสถานะปัจจุบัน</h2>
                </div>
              </div>

              <div className="insight-grid status-insight-grid">
                <article className="panel status-panel">
                  <div className="panel-heading">
                    <div><h2>เส้นทางปัจจุบัน</h2></div>
                    <span className="panel-note">คลิกแต่ละกลุ่มเพื่อดูรายชื่อ</span>
                  </div>
                  <div className="donut-layout">
                    <div className="donut" style={{ background: `conic-gradient(${groupGradient || "#e5e7eb 0deg 360deg"})` }}>
                      <div><strong>{total.toLocaleString("th-TH")}</strong><span>ทั้งหมด</span></div>
                    </div>
                    <div className="legend-list">
                      {GROUPS.map((group) => (
                        <button key={group.name} type="button" onClick={() => selectGroup(group.name)}>
                          <i style={{ background: group.color }} /><span>{group.short}</span><strong>{percent(totals[group.name] ?? 0, total)}%</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                </article>

                <article className="panel work-panel">
                  <div className="panel-heading">
                    <div><h2>รูปแบบการทำงาน</h2></div>
                    <span className="big-context">{workers.length}</span>
                  </div>
                  <div className="bars-list">
                    {WORK_TYPES.map((workType, index) => (
                      <BreakdownBar
                        key={workType}
                        label={workType.replace(" (Freelancer / Consultant)", "")}
                        value={workTypes[workType] ?? 0}
                        total={workers.length}
                        color={["#FF7A1A", "#2F6BFF", "#FF4FA3", "#19BCEB", "#6D4AFF"][index]}
                        onClick={() => { setGroupFilter("ทำงาน"); setWorkFilter(workType); setPage(1); setView("people"); }}
                      />
                    ))}
                  </div>
                </article>
              </div>

              <div className="stat-strip">
                {GROUPS.map((group) => (
                  <GradientCard
                    key={group.name}
                    gradient={group.gradient}
                    badgeText={group.short}
                    badgeColor={group.color}
                    value={loading ? "—" : (totals[group.name] ?? 0).toLocaleString("th-TH")}
                    description={`${percent(totals[group.name] ?? 0, total)}% ของผู้เข้าร่วมทั้งหมด`}
                    actionText="ดูรายชื่อ"
                    imageUrl="/super-ai-logo.png"
                    onClick={() => selectGroup(group.name)}
                    aria-label={`ดูรายชื่อกลุ่ม${group.short}`}
                  />
                ))}
              </div>
            </section>

            <section className="income-section income-overview-section" aria-labelledby="income-overview-heading">
              <div className="section-heading income-heading">
                <div><h2 id="income-overview-heading">ช่วงรายได้ของผู้ที่ทำงาน</h2></div>
              </div>
              <CardCanvas className="income-glow-canvas">
                <div className="income-grid income-card-grid">
                  {incomeEntries.map(([income, count], index) => (
                    <GlowCard
                      className={`income-glow-card income-glow-card-${index + 1}`}
                      glowColor={["#FF7A1A", "#2F6BFF", "#FF4FA3", "#19BCEB"][index]}
                      softColor={["#FFF1E3", "#EAF1FF", "#FFEAF5", "#E7FAFF"][index]}
                      key={income}
                    >
                      <button
                        className="income-card"
                        type="button"
                        onClick={() => openIncomeDirectory(income)}
                        aria-label={`ดูข้อมูลเชิงคุณภาพของผู้มีรายได้ ${income}`}
                      >
                        <span className="income-card-dot" />
                        <small>ช่วงรายได้ต่อเดือน</small>
                        <strong>{count.toLocaleString("th-TH")}</strong>
                        <p>{income}</p>
                        <b>ดูข้อมูลเชิงคุณภาพ <i aria-hidden="true">→</i></b>
                      </button>
                    </GlowCard>
                  ))}
                </div>
              </CardCanvas>
            </section>

            <section className="outcome-section" aria-labelledby="outcome-heading">
              <div className="section-heading outcome-heading">
                <div><h2 id="outcome-heading">ผลลัพธ์ด้านรายได้ อุตสาหกรรม และการศึกษาต่อ</h2></div>
              </div>
              <div className="outcome-kpi-grid">
                <article><span>ผู้มีข้อมูลรายได้</span><strong>{knownIncomeParticipants.length.toLocaleString("th-TH")}</strong><p>จากกลุ่มทำงานและเรียนควบคู่กับงาน</p></article>
                <article><span>รายได้เฉลี่ยโดยประมาณ</span><strong>฿{incomeEstimatedAverage.toLocaleString("th-TH")}</strong><p>ต่อเดือน • ประมาณจากค่ากลางของช่วงรายได้</p></article>
                <article><span>มีแผนศึกษาต่อระดับสูงขึ้น</span><strong>{continuingStudents.length.toLocaleString("th-TH")}</strong><p>ผู้เรียนที่ระบุระดับการศึกษาที่ต้องการศึกษาต่อ</p></article>
              </div>
              <div className="outcome-grid">
                <article className="panel industry-preview-card">
                  <div className="outcome-card-heading"><h3>หน่วยงานที่มีผู้เข้าร่วมทำงานมากที่สุด</h3><button type="button" onClick={() => openIndustryDirectory()}>ดูทั้งหมด →</button></div>
                  <div className="outcome-panel-total"><span>ยอดรวมที่ระบุชื่อหน่วยงาน</span><strong>{organizationParticipantTotal.toLocaleString("th-TH")} คน</strong><small>{organizationDirectory.length.toLocaleString("th-TH")} บริษัท / หน่วยงาน</small></div>
                  <div className="rank-list rank-list-static">{organizationDirectory.slice(0, 6).map(([name, people], index) => <div key={name}><b>{index + 1}</b><span>{name}</span><strong>{people.length}</strong></div>)}</div>
                </article>
                <article className="panel sector-preview-card">
                  <div className="outcome-card-heading"><h3>Sector / อุตสาหกรรม</h3><button type="button" onClick={() => openIndustryDirectory()}>ดูรายชื่อทั้งหมด →</button></div>
                  <div className="outcome-panel-total"><span>ยอดรวมผู้ทำงาน</span><strong>{employedParticipants.length.toLocaleString("th-TH")} คน</strong><small>จัดกลุ่ม Sector แล้ว {classifiedIndustryParticipants.length.toLocaleString("th-TH")} คน</small></div>
                  <p className="sector-click-hint">คลิกแต่ละ Sector เพื่อดูบริษัทและหน่วยงานในกลุ่ม • หากไม่ได้ระบุ Sector ระบบจะจัดกลุ่มจากหน้าที่ / ขอบเขตงานก่อน</p>
                  <div className="bars-list compact-bars">{sectorDirectory.map(([sector, people], index) => <BreakdownBar key={sector} label={sector} value={people.length} total={employedParticipants.length} color={SECTORS[index].color} onClick={() => openIndustryDirectory(sector)} />)}</div>
                  {unclassifiedIndustryParticipants.length > 0 && <p className="sector-click-hint">ยังจัดกลุ่ม Sector ไม่ได้ {unclassifiedIndustryParticipants.length.toLocaleString("th-TH")} คน เนื่องจากข้อมูลหน้าที่ / ขอบเขตงานยังไม่ชี้ไปที่อุตสาหกรรมใดชัดเจน</p>}
                </article>
                <article className="panel education-season-card">
                  <div className="outcome-card-heading"><h3>แผนเรียนต่อ แยกตาม Season</h3><span>กดแต่ละ Season เพื่อดูรายชื่อ</span></div>
                  <div className="outcome-panel-total education-total"><span>ยอดรวมแผนศึกษาต่อระดับสูงขึ้น</span><strong>{continuingStudents.length.toLocaleString("th-TH")} คน</strong><small>{continuingBySeason.length.toLocaleString("th-TH")} Season ที่มีข้อมูล</small></div>
                  <div className="education-season-list">{continuingBySeason.map(({ season, people, levels }) => <button key={season} className="education-season-row" type="button" onClick={() => { setSelectedStudySeason(season); setStudyLevelFilter("ทั้งหมด"); }} aria-label={`ดูรายชื่อผู้มีแผนเรียนต่อ ${season} จำนวน ${people.length} คน`}><div><strong>{season}</strong><span>{people.length.toLocaleString("th-TH")} คน <b aria-hidden="true">→</b></span></div><p>{levels.map(([level, count]) => `${level} ${count}`).join(" • ")}</p></button>)}</div>
                </article>
              </div>
            </section>

            <section className="startup-section" aria-labelledby="startup-heading">
              <div className="section-heading startup-heading">
                <div><h2 id="startup-heading">Startup ที่เกิดขึ้นจากผู้เข้าร่วมโครงการ</h2></div>
              </div>
              <button className="startup-summary-card" type="button" onClick={() => setShowStartups(true)}>
                <span className="startup-summary-copy"><small>จำนวนกิจการ / บริษัท / โครงการ Startup</small><strong>{startupFounders.length.toLocaleString("th-TH")}</strong><p>คลิกเพื่อดูว่ามีอะไรบ้าง พร้อมข้อมูลเว็บไซต์ ประเภทธุรกิจ รายได้ จำนวนพนักงาน และสถานะปัจจุบัน</p></span>
                <span className="startup-summary-action">เปิดทะเบียน Startup <b>→</b></span>
              </button>
            </section>

            <section className="medal-section medal-after-startup" aria-labelledby="medal-heading">
              <div className="medal-section-heading">
                <div>
                  <span>ผลสัมฤทธิ์ของผู้เข้าร่วม • SEASON 1–5</span>
                  <h2 id="medal-heading">รางวัล / เหรียญของผู้เข้าร่วม</h2>
                  <p>สรุปเฉพาะผู้ได้รับเหรียญและรางวัล AI Developer, AI Designer, AI Participant โดยเปิดดูรายชื่อและรายละเอียดแต่ละคนได้</p>
                </div>
                <button type="button" onClick={() => openMedalDirectory()}>
                  ดูรายชื่อรางวัล / เหรียญทั้งหมด <b aria-hidden="true">→</b>
                </button>
              </div>

              <div className="medal-overview-grid">
                <button className="medal-total-card" type="button" onClick={() => openMedalDirectory()}>
                  <span>ผู้มีข้อมูลรางวัลทั้งหมด</span>
                  <strong>{reportMedalRecipients.length.toLocaleString("th-TH")}</strong>
                  <small>รายการ • คลิกเพื่อดูรายชื่อและสังกัด</small>
                  <i aria-hidden="true">🏅</i>
                </button>
                {medalTypes.map((type) => (
                  <button
                    className={`medal-type-card medal-type-${type.name === "เหรียญทอง" ? "gold" : type.name === "เหรียญเงิน" ? "silver" : type.name === "เหรียญทองแดง" ? "bronze" : "award"}`}
                    type="button"
                    key={type.name}
                    onClick={() => openMedalDirectory("ทั้งหมด", type.name)}
                  >
                    <i style={{ background: type.color }} />
                    <span>{type.name}</span>
                    <strong>{(medalCounts[type.name] ?? 0).toLocaleString("th-TH")}</strong>
                    <small>คน • ดูข้อมูลเชิงคุณภาพ</small>
                    <b aria-hidden="true">→</b>
                  </button>
                ))}
              </div>

              <div className="medal-season-panel">
                <div className="medal-season-heading"><h3>รางวัล / เหรียญในแต่ละ Season</h3><span>6 ประเภท • รายงานเฉพาะผู้ได้รับรางวัล</span></div>
                <div className="medal-season-list">
                  {medalSeasonSummary.map(({ season, total: seasonMedals, counts }) => (
                    <button key={season} type="button" onClick={() => openMedalDirectory(season)}>
                      <div><strong>{season}</strong><span>{seasonMedals.toLocaleString("th-TH")} คน</span></div>
                      <div className="medal-season-stack" aria-label={`${season} มีผู้ได้รับรางวัลหรือเหรียญ ${seasonMedals} คน`}>
                        {counts.map((entry) => entry.value > 0 ? <i key={entry.name} title={`${entry.name} ${entry.value} คน`} style={{ width: `${(entry.value / Math.max(seasonMedals, 1)) * 100}%`, background: entry.color }} /> : null)}
                      </div>
                      <small>{counts.map((entry) => `${entry.name.replace("เหรียญ", "")} ${entry.value}`).join(" • ")}</small>
                    </button>
                  ))}
                </div>
              </div>
            </section>

          </>
        ) : view === "track-report" ? (
          <section className="track-report-view">
            <button className="back-overview-button" type="button" onClick={() => setView("overview")}>
              <span aria-hidden="true">←</span> กลับสู่ภาพรวม
            </button>
            <div className="track-report-heading">
              <div>
                <h1>สถานภาพและผลลัพธ์ แยกตาม Track</h1>
                <p>รายงานนี้นับแยกตาม Track หากผู้เข้าร่วมคนเดียวอยู่มากกว่า 1 Track จะถูกนับซ้ำแยกในแต่ละ Track เพื่อให้ผลลัพธ์ของ AI Innovator, AI Engineer และ AI Researcher แยกจากกันชัดเจน</p>
              </div>
              <div className="track-report-summary">
                <button type="button" onClick={() => openTrackSummaryDirectory("memberships")} aria-label={`ดูข้อมูลจำนวนตาม Track ${trackMembershipTotal.toLocaleString("th-TH")} คน`}>
                  <span>จำนวนตาม Track</span><strong>{trackMembershipTotal.toLocaleString("th-TH")}</strong><small>คน • รวมแบบนับซ้ำตาม Track</small><b aria-hidden="true">ดูข้อมูล →</b>
                </button>
                <button type="button" onClick={() => openTrackSummaryDirectory("unique")} aria-label={`ดูผู้เข้าร่วมจริง ${participantTrackSummary.uniqueParticipantCount.toLocaleString("th-TH")} คน`}>
                  <span>ผู้เข้าร่วมจริง</span><strong>{participantTrackSummary.uniqueParticipantCount.toLocaleString("th-TH")}</strong><small>จำนวนบุคคลไม่ซ้ำ</small><b aria-hidden="true">ดูข้อมูล →</b>
                </button>
                <button type="button" onClick={() => openTrackSummaryDirectory("multi")} aria-label={`ดูผู้ที่อยู่หลาย Track ${participantTrackSummary.multiTrackParticipantCount.toLocaleString("th-TH")} คน`}>
                  <span>อยู่หลาย Track</span><strong>{participantTrackSummary.multiTrackParticipantCount.toLocaleString("th-TH")}</strong><small>คนที่ถูกนับในมากกว่า 1 Track</small><b aria-hidden="true">ดูข้อมูล →</b>
                </button>
              </div>
            </div>

            <div className="track-status-report-grid">
              {trackReportData.map((entry) => {
                const color = TRACK_COLORS[entry.track] ?? "#2F6BFF";
                return (
                  <article className="track-status-report-card" key={entry.track} style={{ "--report-track-color": color } as React.CSSProperties}>
                    <header>
                      <div><i style={{ background: color }} /><span>สถานภาพปัจจุบัน</span><h2>{entry.track}</h2></div>
                      <strong>{entry.people.length.toLocaleString("th-TH")}<small> คน</small></strong>
                    </header>
                    <button className="track-status-all-button" type="button" onClick={() => openTrackStatusPeople(entry.track)}>
                      <span>ดูรายชื่อทั้งหมดใน {entry.track}</span><b aria-hidden="true">→</b>
                    </button>
                    <div className="track-status-list">
                      {entry.status.map((group) => (
                        <button className="track-status-row" type="button" key={group.name} onClick={() => openTrackStatusPeople(entry.track, group.name)} aria-label={`ดูรายชื่อ ${entry.track} สถานะ ${group.name} ${group.count.toLocaleString("th-TH")} คน`}>
                          <div><span><i style={{ background: group.color }} />{group.name}</span><strong>{group.count.toLocaleString("th-TH")} คน <b aria-hidden="true">→</b></strong></div>
                          <div className="track-status-bar"><span style={{ width: `${(group.count / Math.max(entry.people.length, 1)) * 100}%`, background: group.color }} /></div>
                          <small>{percent(group.count, entry.people.length)}%</small>
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            <section className="track-demographic-section" aria-labelledby="track-demographic-heading">
              <div className="track-demographic-heading">
                <div>
                  <h2 id="track-demographic-heading">ข้อมูลพื้นฐานผู้เข้าร่วมโครงการ แยกตาม Track</h2>
                  <p>เพศ อายุ และระดับการศึกษาใช้ฐานสมาชิกของแต่ละ Track โดยคนที่อยู่มากกว่า 1 Track จะถูกนับซ้ำในทุก Track ที่สังกัดเช่นเดียวกับรายงานสถานภาพ</p>
                </div>
              </div>
              <div className="track-demographic-list">
                {trackReportData.map((entry) => {
                  const color = TRACK_COLORS[entry.track] ?? "#2F6BFF";
                  const totalPeople = Math.max(entry.people.length, 1);
                  return (
                    <article className="track-demographic-card" key={`${entry.track}-demographics`} style={{ "--report-track-color": color } as React.CSSProperties}>
                      <header>
                        <div><i style={{ background: color }} /><h3>{entry.track}</h3></div>
                        <strong>{entry.people.length.toLocaleString("th-TH")}<small> คน</small></strong>
                      </header>
                      <div className="track-demographic-columns">
                        <section className="track-demographic-block track-demographic-block-action">
                          <div className="track-demographic-block-heading">
                            <h4>เพศ</h4>
                          </div>
                          <div className="track-demographic-gender">
                            {entry.gender.map((item) => (
                              <div key={item.label}>
                                <span><i style={{ background: item.color }} />{item.label}</span>
                                <strong>{item.count.toLocaleString("th-TH")}<small>{percent(item.count, entry.people.length)}%</small></strong>
                              </div>
                            ))}
                          </div>
                          <button className="demographic-directory-button track-demographic-directory-button" type="button" onClick={() => openDemographicDirectory("gender", entry.track)}>
                            <span className="button-label">ดูรายชื่อตามเพศ</span>
                            <span className="button-icon" aria-hidden="true">→</span>
                          </button>
                        </section>
                        <section className="track-demographic-block track-demographic-block-action">
                          <div className="track-demographic-block-heading">
                            <h4>ช่วงอายุ</h4>
                          </div>
                          <div className="track-demographic-bars">
                            {entry.age.map((item) => (
                              <div key={item.label}>
                                <div><span>{item.label}</span><strong>{item.count.toLocaleString("th-TH")}</strong></div>
                                <div className="track-demographic-bar"><span style={{ width: `${(item.count / totalPeople) * 100}%`, background: item.color }} /></div>
                                <small>{percent(item.count, entry.people.length)}%</small>
                              </div>
                            ))}
                          </div>
                          <button className="demographic-directory-button track-demographic-directory-button" type="button" onClick={() => openDemographicDirectory("age", entry.track)}>
                            <span className="button-label">ดูรายชื่อตามช่วงอายุ</span>
                            <span className="button-icon" aria-hidden="true">→</span>
                          </button>
                        </section>
                        <section className="track-demographic-block">
                          <h4>ระดับการศึกษา</h4>
                          <div className="track-demographic-bars education-breakdown">
                            {entry.education.map((item) => (
                              <div key={item.label}>
                                <div><span>{item.label}</span><strong>{item.count.toLocaleString("th-TH")}</strong></div>
                                <div className="track-demographic-bar"><span style={{ width: `${(item.count / totalPeople) * 100}%`, background: item.color }} /></div>
                                <small>{percent(item.count, entry.people.length)}%</small>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        ) : view === "award-report" ? (
          <section className="track-report-view award-report-view">
            <button className="back-overview-button" type="button" onClick={() => setView("overview")}>
              <span aria-hidden="true">←</span> กลับสู่ภาพรวม
            </button>
            <div className="track-report-heading award-report-heading">
              <div>
                <p className="eyebrow">AWARD / MEDAL REPORT</p>
                <h1>Report รางวัล / เหรียญ แยกตาม Track</h1>
                <p>รายงานเฉพาะผลรางวัลของแต่ละ Track แยก AI Innovator, AI Engineer และ AI Researcher โดยคนที่อยู่มากกว่า 1 Track จะถูกนับซ้ำในทุก Track ที่สังกัด</p>
              </div>
              <div className="track-report-summary award-report-summary">
                <article><span>รายการรางวัลทั้งหมด</span><strong>{reportMedalRecipients.length.toLocaleString("th-TH")}</strong><small>เฉพาะผู้ได้รับรางวัล / เหรียญ</small></article>
                <article><span>จำนวนตาม Track</span><strong>{trackReportData.reduce((sum, entry) => sum + entry.medals.length, 0).toLocaleString("th-TH")}</strong><small>คน • นับซ้ำเมื่ออยู่หลาย Track</small></article>
                <article><span>จับคู่ข้อมูลไม่ได้</span><strong>{medalsWithoutParticipantMatch.toLocaleString("th-TH")}</strong><small>รายการที่ยังไม่พบผู้เข้าร่วม</small></article>
              </div>
            </div>

            <section className="medal-section award-report-overview-section" aria-labelledby="award-report-overview-heading">
              <div className="medal-section-heading">
                <div>
                  <span>ผลสัมฤทธิ์ของผู้เข้าร่วม • SEASON 1–5</span>
                  <h2 id="award-report-overview-heading">รางวัล / เหรียญของผู้เข้าร่วม</h2>
                  <p>สรุปเฉพาะผู้ได้รับเหรียญและรางวัล AI Developer, AI Designer, AI Participant พร้อมดูรายละเอียดรวมและแยกตาม Season</p>
                </div>
                <button type="button" onClick={() => openMedalDirectory()}>
                  ดูรายชื่อรางวัล / เหรียญทั้งหมด <b aria-hidden="true">→</b>
                </button>
              </div>

              <div className="medal-overview-grid">
                <button className="medal-total-card" type="button" onClick={() => openMedalDirectory()}>
                  <span>ผู้มีข้อมูลรางวัลทั้งหมด</span>
                  <strong>{reportMedalRecipients.length.toLocaleString("th-TH")}</strong>
                  <small>รายการ • คลิกเพื่อดูรายชื่อและสังกัด</small>
                  <i aria-hidden="true">🏅</i>
                </button>
                {medalTypes.map((type) => (
                  <button
                    className={`medal-type-card medal-type-${type.name === "เหรียญทอง" ? "gold" : type.name === "เหรียญเงิน" ? "silver" : type.name === "เหรียญทองแดง" ? "bronze" : "award"}`}
                    type="button"
                    key={`award-report-${type.name}`}
                    onClick={() => openMedalDirectory("ทั้งหมด", type.name)}
                  >
                    <i style={{ background: type.color }} />
                    <span>{type.name}</span>
                    <strong>{(medalCounts[type.name] ?? 0).toLocaleString("th-TH")}</strong>
                    <small>คน • ดูข้อมูลเชิงคุณภาพ</small>
                    <b aria-hidden="true">→</b>
                  </button>
                ))}
              </div>

              <div className="medal-season-panel">
                <div className="medal-season-heading"><h3>รางวัล / เหรียญในแต่ละ Season</h3><span>6 ประเภท • รายงานเฉพาะผู้ได้รับรางวัล</span></div>
                <div className="medal-season-list">
                  {medalSeasonSummary.map(({ season, total: seasonMedals, counts }) => (
                    <button key={`award-report-${season}`} type="button" onClick={() => openMedalDirectory(season)}>
                      <div><strong>{season}</strong><span>{seasonMedals.toLocaleString("th-TH")} คน</span></div>
                      <div className="medal-season-stack" aria-label={`${season} มีผู้ได้รับรางวัลหรือเหรียญ ${seasonMedals} คน`}>
                        {counts.map((entry) => entry.value > 0 ? <i key={entry.name} title={`${entry.name} ${entry.value} คน`} style={{ width: `${(entry.value / Math.max(seasonMedals, 1)) * 100}%`, background: entry.color }} /> : null)}
                      </div>
                      <small>{counts.map((entry) => `${entry.name.replace("เหรียญ", "")} ${entry.value}`).join(" • ")}</small>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="track-medal-report-section standalone-award-report" aria-labelledby="track-medal-report-heading">
              <div className="track-medal-report-heading">
                <div><h2 id="track-medal-report-heading">ผลรางวัลของแต่ละ Track</h2><p>แสดงเฉพาะเหรียญทอง / เงิน / ทองแดง, AI Developer, AI Designer และ AI Participant แยกตาม Track</p></div>
                {medalsWithoutParticipantMatch > 0 && <span>มี {medalsWithoutParticipantMatch.toLocaleString("th-TH")} รายการรางวัลที่ยังจับคู่กับข้อมูลผู้เข้าร่วมไม่ได้</span>}
              </div>
              <div className="track-medal-report-grid">
                {trackReportData.map((entry) => {
                  const color = TRACK_COLORS[entry.track] ?? "#2F6BFF";
                  return (
                    <article className="track-medal-report-card" key={`${entry.track}-medals`} style={{ "--report-track-color": color } as React.CSSProperties}>
                      <header><div><i style={{ background: color }} /><h3>{entry.track}</h3></div><strong>{entry.medals.length.toLocaleString("th-TH")}<small> รายการ</small></strong></header>
                      <div className="track-medal-type-list">
                        {entry.medalCountsByType.map((type) => (
                          <div key={type.name}><span><i style={{ background: type.color }} />{type.name}</span><strong>{type.count.toLocaleString("th-TH")}</strong></div>
                        ))}
                      </div>
                      <button type="button" onClick={() => openMedalDirectory("ทั้งหมด", "ทั้งหมด", entry.track)}>ดูรายชื่อรางวัล / เหรียญใน {entry.track} <span aria-hidden="true">→</span></button>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        ) : (
          <section className="people-view">
            <button
              className="back-overview-button"
              type="button"
              onClick={() => setView("overview")}
            >
              <span aria-hidden="true">←</span> กลับสู่ภาพรวม
            </button>
            <div className="people-heading">
              <div><p className="eyebrow">PARTICIPANT DIRECTORY</p><h1>ข้อมูลรายบุคคล</h1><p>ค้นหา ตรวจสอบเส้นทาง และเปิดดูรายละเอียดของผู้เข้าร่วมแต่ละคน</p></div>
              <div className="people-count"><strong>{filtered.length.toLocaleString("th-TH")}</strong><span>รายการที่พบ</span></div>
            </div>

            <div className="privacy-banner"><span>◉</span><p><strong>ข้อมูลส่วนบุคคล</strong> เบอร์โทร อีเมล และที่อยู่จะแสดงเมื่อเปิดรายละเอียดเท่านั้น โปรดใช้ตามวัตถุประสงค์ของโครงการ</p></div>

            <div className="filter-panel">
              <label className="search-field"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="ค้นหารหัส ชื่อ ชื่อเล่น อีเมล หรือเบอร์โทร" /></label>
              <label><span>กลุ่ม</span><select value={groupFilter} onChange={(event) => { setGroupFilter(event.target.value); if (event.target.value !== "ทำงาน") setWorkFilter("ทั้งหมด"); setPage(1); }}><option>ทั้งหมด</option>{GROUPS.map((group) => <option key={group.name}>{group.name}</option>)}</select></label>
              <label><span>Track</span><select value={trackFilter} onChange={(event) => { setTrackFilter(event.target.value); setPage(1); }}><option>ทั้งหมด</option>{tracks.map(([track]) => <option key={track}>{track}</option>)}</select></label>
              <label><span>Season</span><select value={seasonFilter} onChange={(event) => { setSeasonFilter(event.target.value); setPage(1); }}><option>ทั้งหมด</option>{seasons.map((season) => <option key={season}>{season}</option>)}</select></label>
              <label><span>รูปแบบงาน</span><select value={workFilter} onChange={(event) => { setWorkFilter(event.target.value); setPage(1); }} disabled={groupFilter !== "ทำงาน" && groupFilter !== "ทั้งหมด"}><option>ทั้งหมด</option>{WORK_TYPES.map((workType) => <option key={workType}>{workType}</option>)}</select></label>
              <button className="clear-button" type="button" onClick={clearFilters}>ล้างตัวกรอง</button>
            </div>

            <div className="table-shell">
              <table>
                <thead><tr><th>ผู้เข้าร่วม</th><th>รหัส</th><th>สถานะ</th><th>Track</th><th>Season</th><th>เส้นทางปัจจุบัน</th><th aria-label="รายละเอียด" /></tr></thead>
                <tbody>
                  {pageItems.map((person) => (
                    <tr key={person.key} onClick={() => setSelected(person)}>
                      <td><div className="person-cell"><span style={{ background: `${GROUP_COLOR[person.group]}18`, color: GROUP_COLOR[person.group] }}>{initials(person)}</span><div><strong>{person.title}{person.firstName} {person.lastName}</strong><small>{person.nickname ? `“${person.nickname}”` : "ไม่ระบุชื่อเล่น"}</small></div></div></td>
                      <td><code>{person.code || "—"}</code></td>
                      <td><span className="group-pill" style={{ background: `${GROUP_COLOR[person.group]}15`, color: GROUP_COLOR[person.group] }}><i style={{ background: GROUP_COLOR[person.group] }} />{person.group}</span></td>
                      <td>{person.track || "—"}</td>
                      <td>{person.season || "—"}</td>
                      <td className="path-cell">{person.workType || person.position || person.educationLevel || person.desiredRole || "—"}</td>
                      <td><button className="row-button" type="button" aria-label={`ดูรายละเอียด ${person.firstName}`} onClick={(event) => { event.stopPropagation(); setSelected(person); }}>→</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && !pageItems.length && <div className="empty-state"><strong>ไม่พบข้อมูลที่ตรงกับตัวกรอง</strong><button type="button" onClick={clearFilters}>ล้างตัวกรองทั้งหมด</button></div>}
              {loading && <div className="loading-state"><span /><span /><span /><p>กำลังอ่านข้อมูลล่าสุดจาก Google Sheets</p></div>}
            </div>

            <div className="pagination">
              <span>หน้า {page} จาก {pageCount}</span>
              <div><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>← ก่อนหน้า</button><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>ถัดไป →</button></div>
            </div>
          </section>
        )}
      </div>

      <footer className="dashboard-footer">
        <div className="footer-heading">
          <div className="footer-title">
            <strong>ระบบติดตามผลโครงการ Super AI Engineer</strong>
            <small>สมาคมปัญญาประดิษฐ์ประเทศไทย</small>
          </div>
          <p>ข้อมูลจาก Google Sheets • อัปเดตอัตโนมัติทุก 60 วินาที</p>
          <button
            className="back-to-top-button"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="กลับไปด้านบนของหน้า"
          >
            <span aria-hidden="true">↑</span> กลับด้านบน
          </button>
        </div>
        <div className="footer-logo-strip" aria-label="เครือข่ายผู้สนับสนุนและหน่วยงานความร่วมมือ">
          {FOOTER_LOGOS.map((logo) => (
            <div className={`footer-logo footer-logo-${logo.fit}`} key={logo.src} title={logo.alt}>
              <Image src={logo.src} alt={logo.alt} fill sizes="100px" />
            </div>
          ))}
        </div>
      </footer>

      {selected && (
        <div className="drawer-backdrop participant-detail-backdrop" role="presentation">
          <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`รายละเอียด ${selected.firstName} ${selected.lastName}`} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
            <button className="drawer-close" type="button" onClick={() => setSelected(null)} aria-label="ปิดรายละเอียด">×</button>
            <button className="drawer-back-button" type="button" onClick={() => setSelected(null)}><span aria-hidden="true">←</span> {detailReturnLabel}</button>
            <div className="drawer-hero">
              <span className="large-avatar" style={{ background: `${GROUP_COLOR[selected.group]}18`, color: GROUP_COLOR[selected.group] }}>{initials(selected)}</span>
              <div><span className="group-pill" style={{ background: `${GROUP_COLOR[selected.group]}15`, color: GROUP_COLOR[selected.group] }}><i style={{ background: GROUP_COLOR[selected.group] }} />{selected.group}</span><h2>{selected.title}{selected.firstName} {selected.lastName}</h2><p>{selected.nickname ? `ชื่อเล่น “${selected.nickname}”` : "ไม่ระบุชื่อเล่น"} • {selected.gender || "ไม่ระบุเพศ"} • อายุ {selected.age || "—"} ปี</p></div>
            </div>

            <div className="identity-grid">
              <div><span>รหัสผู้เข้าอบรม</span><strong>{selected.code || "—"}</strong></div>
              <div><span>Season</span><strong>{selected.season || "—"}</strong></div>
              <div><span>Track</span><strong>{selected.track || "—"}</strong></div>
              <div><span>บ้าน AI Engineer</span><strong>{selected.house || "—"}</strong></div>
            </div>

            <section className="drawer-section contact-section"><h3>ข้อมูลติดต่อ <span>ข้อมูลส่วนบุคคล</span></h3><div className="contact-grid"><div><span>อีเมล</span><a href={selected.email ? `mailto:${selected.email}` : undefined}>{selected.email || "—"}</a></div><div><span>เบอร์โทร</span><a href={selected.phone ? `tel:${selected.phone}` : undefined}>{selected.phone || "—"}</a></div><div><span>ช่องทางอื่น</span>{extractLinks(selected.social).length ? <a className="contact-action" href={extractLinks(selected.social)[0]} target="_blank" rel="noopener noreferrer">เปิดช่องทางติดต่อ ↗</a> : <p>{selected.social || "—"}</p>}</div><div className="full-span"><span>ที่อยู่</span><p>{selected.address || "—"}</p></div></div></section>

            <section className="drawer-section"><h3>เส้นทางหลังจบโครงการ</h3><div className="detail-list">{selected.workType && <div><span>รูปแบบการทำงาน</span><strong>{selected.workType}</strong></div>}{DETAIL_FIELDS.filter(([key]) => Boolean(selected[key])).map(([key, label]) => <div key={key}><span>{label}</span><DetailValue field={key} value={selected[key]} /></div>)}</div></section>
          </aside>
        </div>
      )}

      {selectedIncome && (
        <div className="drawer-backdrop income-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeIncomeDirectory(); }}>
          <section className="income-directory" role="dialog" aria-modal="true" aria-label={`ข้อมูลเชิงคุณภาพช่วงรายได้ ${selectedIncome}`}>
            <button className="drawer-close" type="button" onClick={closeIncomeDirectory} aria-label="ปิดข้อมูลช่วงรายได้">×</button>
            <header className="income-directory-heading">
              <p>ข้อมูลเชิงคุณภาพตามช่วงรายได้</p>
              <h2>{selectedIncome}</h2>
              <span>พบทั้งหมด <strong>{selectedIncomeParticipants.length.toLocaleString("th-TH")}</strong> คน</span>
            </header>

            <div className="income-directory-summary">
              <article><span>ผู้เข้าร่วม</span><strong>{selectedIncomeParticipants.length.toLocaleString("th-TH")}</strong><small>คนที่ระบุรายได้ช่วงนี้</small></article>
              <button className={`income-summary-button ${incomeSummaryView === "organizations" ? "active" : ""}`} type="button" onClick={() => { setIncomeSummaryView(incomeSummaryView === "organizations" ? null : "organizations"); setIncomeListFilter(null); }} aria-expanded={incomeSummaryView === "organizations"} aria-controls="income-summary-browser"><span>บริษัท / หน่วยงาน</span><strong>{selectedIncomeOrganizations.length.toLocaleString("th-TH")}</strong><small>แห่งที่ระบุชื่อไว้</small><b>กดดูรายชื่อทั้งหมด →</b></button>
              <button className={`income-summary-button income-sector-summary ${incomeSummaryView === "sectors" ? "active" : ""}`} type="button" onClick={() => { setIncomeSummaryView(incomeSummaryView === "sectors" ? null : "sectors"); setIncomeListFilter(null); }} aria-expanded={incomeSummaryView === "sectors"} aria-controls="income-summary-browser"><span>Sector ที่พบ</span><strong>{selectedIncomeSectorGroups.length.toLocaleString("th-TH")}</strong><small>{selectedIncomeSectors.map(([sector, count]) => `${sector} ${count}`).join(" • ") || "ยังไม่ระบุ Sector"}</small><b>กดดูบริษัทในแต่ละ Sector →</b></button>
            </div>

            {incomeSummaryView && (
              <section className="income-summary-browser" id="income-summary-browser" aria-label={incomeSummaryView === "organizations" ? "รายชื่อบริษัทและหน่วยงาน" : "รายชื่อ Sector และบริษัทภายใน"}>
                <header>
                  <div><span>{incomeSummaryView === "organizations" ? "COMPANY & ORGANIZATION" : "SECTOR DIRECTORY"}</span><h3>{incomeSummaryView === "organizations" ? "บริษัท / หน่วยงานที่ระบุชื่อไว้" : "Sector และบริษัท / หน่วยงานภายใน"}</h3></div>
                  <button type="button" onClick={() => { setIncomeSummaryView(null); setIncomeListFilter(null); }}>ซ่อนรายการ ↑</button>
                </header>
                {incomeSummaryView === "organizations" ? (
                  <div className="income-organization-browser">
                    {selectedIncomeOrganizations.map(([organization, people]) => (
                      <button className={incomeListFilter?.type === "organization" && incomeListFilter.value === organization ? "selected" : ""} key={organization} type="button" onClick={() => setIncomeListFilter({ type: "organization", value: organization })}>
                        <span>{organization}<small>{people[0]?.sector || "ยังไม่ระบุ Sector"}</small></span><strong>{people.length.toLocaleString("th-TH")} คน</strong>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="income-sector-browser">
                    {selectedIncomeSectorGroups.map(([sector, people]) => {
                      const organizations = [...new Set(people.map((person) => person.organization).filter(Boolean))];
                      return (
                        <button className={incomeListFilter?.type === "sector" && incomeListFilter.value === sector ? "selected" : ""} key={sector} type="button" onClick={() => setIncomeListFilter({ type: "sector", value: sector })}>
                          <span className="income-sector-browser-heading"><i style={{ background: SECTORS.find((item) => item.name === sector)?.color }} /><b>{sector}</b><strong>{people.length.toLocaleString("th-TH")} คน</strong></span>
                          <small>{organizations.join(" • ") || "ยังไม่ระบุชื่อบริษัท / หน่วยงาน"}</small>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <div className="income-list-heading">
              <div><span>รายชื่อผู้เข้าร่วม</span><strong>{visibleIncomeParticipants.length.toLocaleString("th-TH")} คน</strong></div>
              {incomeListFilter && <button type="button" onClick={() => setIncomeListFilter(null)}>แสดงทั้งหมด {selectedIncomeParticipants.length.toLocaleString("th-TH")} คน ×</button>}
            </div>

            <div className="income-person-list">
              {visibleIncomeParticipants.map((person, index) => {
                const evidence = extractLinks(person.portfolio || person.outcomes || "");
                return (
                  <article className="income-person-card" key={`${person.key}-${person.code || "no-code"}-${person.email || "no-email"}-${index}`}>
                    <span className="income-person-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="income-person-main">
                      <div className="income-person-meta"><span>{person.season || "ไม่ระบุ Season"}</span><span>{person.track || "ไม่ระบุ Track"}</span></div>
                      <h3>{person.title}{person.firstName} {person.lastName}</h3>
                      <p>{person.organization || "ไม่ระบุบริษัท / หน่วยงาน"}</p>
                    </div>
                    <dl className="income-person-facts">
                      <div><dt>ตำแหน่ง / รูปแบบงาน</dt><dd>{person.position || person.workType || "ไม่ระบุ"}</dd></div>
                      <div><dt>Sector / อุตสาหกรรม</dt><dd>{person.sector || "ไม่ระบุ"}</dd></div>
                      <div><dt>ความเกี่ยวข้องกับ AI</dt><dd>{person.aiUsage || person.aiField || person.responsibilities || "ไม่ระบุ"}</dd></div>
                      <div><dt>ข้อมูลเชิงคุณภาพเพิ่มเติม</dt><dd>{person.outcomes || person.responsibilities || person.tools || "ไม่ระบุ"}</dd></div>
                    </dl>
                    <div className="income-person-actions">
                      {evidence.length > 0 && <a href={evidence[0]} target="_blank" rel="noopener noreferrer">ผลงาน / หลักฐาน ↗</a>}
                      <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...person }); }}>ดูข้อมูลรายบุคคล →</button>
                    </div>
                  </article>
                );
              })}
              {!visibleIncomeParticipants.length && <div className="empty-state"><strong>ไม่พบข้อมูลตามตัวกรองนี้</strong></div>}
            </div>
          </section>
        </div>
      )}

      {trackSummaryDirectory && (
        <div className="drawer-backdrop track-summary-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTrackSummaryDirectory(); }}>
          <section className="track-house-directory track-summary-directory" role="dialog" aria-modal="true" aria-label={trackSummaryDirectory === "memberships" ? "รายชื่อตาม Track" : trackSummaryDirectory === "unique" ? "รายชื่อผู้เข้าร่วมจริง" : "รายชื่อผู้ที่อยู่หลาย Track"}>
            <button className="drawer-close" type="button" onClick={closeTrackSummaryDirectory} aria-label="ปิดรายชื่อสรุป Track">×</button>
            <header className="track-house-directory-heading track-summary-directory-heading">
              <span>TRACK DIRECTORY</span>
              <h2>{trackSummaryDirectory === "memberships" ? "จำนวนตาม Track" : trackSummaryDirectory === "unique" ? "ผู้เข้าร่วมจริง" : "ผู้ที่อยู่หลาย Track"}</h2>
              <p>{trackSummaryDirectory === "memberships"
                ? "แสดงรายการสมาชิกตาม Track และนับซ้ำเมื่อบุคคลเดียวอยู่มากกว่า 1 Track"
                : trackSummaryDirectory === "unique"
                  ? "รวมข้อมูลบุคคลเดียวกันให้เหลือ 1 คน แม้มีหลายรหัสหรือหลาย Track"
                  : "แสดงเฉพาะผู้เข้าร่วมที่พบว่าอยู่มากกว่า 1 Track"} <strong>{trackSummaryRows.length.toLocaleString("th-TH")}</strong> คน</p>
            </header>

            <div className="track-summary-toolbar">
              <label className="track-summary-search"><span aria-hidden="true">⌕</span><input value={trackSummaryQuery} onChange={(event) => { setTrackSummaryQuery(event.target.value); setTrackSummaryPage(1); }} placeholder="ค้นหารหัส ชื่อ ชื่อเล่น อีเมล หรือเบอร์โทร" /></label>
              <div className="track-summary-track-filters" role="group" aria-label="กรองตาม Track">
                <button className={trackSummaryTrackFilter === "ทั้งหมด" ? "active" : ""} type="button" onClick={() => { setTrackSummaryTrackFilter("ทั้งหมด"); setTrackSummaryPage(1); }}>ทั้งหมด</button>
                {trackSummaryTrackCounts.map(([track, count]) => (
                  <button className={trackSummaryTrackFilter === track ? "active" : ""} type="button" key={track} onClick={() => { setTrackSummaryTrackFilter(track); setTrackSummaryPage(1); }}>{track}<strong>{count.toLocaleString("th-TH")}</strong></button>
                ))}
              </div>
            </div>

            <div className="track-house-list-heading track-summary-list-heading">
              <div><span>{trackSummaryTrackFilter === "ทั้งหมด" ? "ทุก Track" : trackSummaryTrackFilter}</span><strong>{trackSummaryRows.length.toLocaleString("th-TH")} รายการ</strong></div>
            </div>

            <div className="track-house-person-list track-summary-person-list">
              {visibleTrackSummaryRows.map((entry, index) => {
                const person = entry.person;
                const seasons = Array.from(new Set(entry.records.map((record) => record.season).filter(Boolean)));
                const codes = Array.from(new Set(entry.records.map((record) => record.code).filter(Boolean)));
                const displayIndex = (trackSummaryPage - 1) * trackSummaryPageSize + index + 1;
                return (
                  <article className="track-house-person-card track-summary-person-card" key={`${participantIdentityKey(person)}-${entry.tracks.join("-")}-${displayIndex}`}>
                    <span className="track-house-person-index">{String(displayIndex).padStart(2, "0")}</span>
                    <div className="track-house-person-main">
                      <div>{entry.tracks.map((track) => <span key={track} style={{ color: TRACK_COLORS[track] ?? "#2F6BFF" }}>{track}</span>)}</div>
                      <h3>{person.title}{person.firstName} {person.lastName}</h3>
                      <p>{person.nickname ? `ชื่อเล่น ${person.nickname}` : "ไม่ระบุชื่อเล่น"}</p>
                    </div>
                    <dl className="track-house-person-facts">
                      <div><dt>รหัส</dt><dd>{codes.length ? codes.join(" / ") : "ไม่ระบุ"}</dd></div>
                      <div><dt>Season</dt><dd>{seasons.length ? seasons.join(" / ") : "ไม่ระบุ"}</dd></div>
                      <div><dt>สถานะปัจจุบัน</dt><dd>{person.group || "ไม่ระบุ"}</dd></div>
                    </dl>
                    <button className="track-house-person-action" type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...person, track: entry.tracks.join(", ") }); }}>ดูข้อมูลรายบุคคล →</button>
                  </article>
                );
              })}
              {visibleTrackSummaryRows.length === 0 && <div className="empty-state"><strong>ไม่พบข้อมูลตามตัวกรองนี้</strong></div>}
            </div>

            {trackSummaryPageCount > 1 && (
              <div className="track-summary-pagination">
                <span>หน้า {trackSummaryPage} จาก {trackSummaryPageCount}</span>
                <div><button type="button" onClick={() => setTrackSummaryPage((current) => Math.max(1, current - 1))} disabled={trackSummaryPage === 1}>← ก่อนหน้า</button><button type="button" onClick={() => setTrackSummaryPage((current) => Math.min(trackSummaryPageCount, current + 1))} disabled={trackSummaryPage === trackSummaryPageCount}>ถัดไป →</button></div>
              </div>
            )}
          </section>
        </div>
      )}

      {demographicDirectory && (
        <div className="drawer-backdrop demographic-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDemographicDirectory(); }}>
          <section className="track-house-directory demographic-directory" role="dialog" aria-modal="true" aria-label={demographicDirectory === "gender" ? "รายชื่อตามเพศ" : "รายชื่อตามช่วงอายุ"}>
            <button className="drawer-close" type="button" onClick={closeDemographicDirectory} aria-label="ปิดรายชื่อข้อมูลพื้นฐาน">×</button>
            <header className="track-house-directory-heading demographic-directory-heading">
              <span>{demographicTrack ? demographicTrack : "ข้อมูลพื้นฐานผู้เข้าร่วมโครงการ"}</span>
              <h2>{demographicDirectory === "gender" ? "รายชื่อตามเพศ" : "รายชื่อตามช่วงอายุ"}{demographicTrack ? ` • ${demographicTrack}` : ""}</h2>
              <p>{demographicTrack ? `สมาชิก ${demographicTrack}` : "ผู้เข้าร่วมทั้งหมด"} <strong>{demographicBaseParticipants.length.toLocaleString("th-TH")}</strong> คน เลือกกลุ่มด้านล่างเพื่อดูว่าเป็นใครบ้าง</p>
            </header>

            <div className="track-house-filter-grid demographic-filter-grid" role="group" aria-label={demographicDirectory === "gender" ? "เลือกเพศ" : "เลือกช่วงอายุ"}>
              <button className={!demographicFilter ? "active" : ""} type="button" onClick={() => setDemographicFilter(null)}>
                <span>ทั้งหมด</span>
                <strong>{demographicBaseParticipants.length.toLocaleString("th-TH")} คน</strong>
              </button>
              {demographicDirectoryGroups.map(([label, people]) => (
                <button className={demographicFilter === label ? "active" : ""} type="button" key={label} onClick={() => setDemographicFilter(label)}>
                  <span>{label}</span>
                  <strong>{people.length.toLocaleString("th-TH")} คน</strong>
                </button>
              ))}
            </div>

            <div className="track-house-list-heading">
              <div>
                <span>{demographicFilter || (demographicDirectory === "gender" ? "ทุกเพศ" : "ทุกช่วงอายุ")}</span>
                <strong>{visibleDemographicParticipants.length.toLocaleString("th-TH")} คน</strong>
              </div>
              {demographicFilter && <button type="button" onClick={() => setDemographicFilter(null)}>แสดงทั้งหมด ×</button>}
            </div>

            <div className="track-house-person-list" key={`${demographicDirectory}-${demographicFilter || "all"}`}>
              {visibleDemographicParticipants.map((person, index) => (
                <article className="track-house-person-card demographic-person-card" key={`${person.key}-${person.code || "no-code"}-${person.email || "no-email"}-${index}`}>
                  <span className="track-house-person-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="track-house-person-main">
                    <div><span>{normalizeGender(person.gender) === "อื่น ๆ / ไม่ประสงค์ระบุ" || normalizeGender(person.gender) === "ไม่ระบุ" ? "อื่น ๆ" : normalizeGender(person.gender)}</span><span>{ageRange(person.age)}</span></div>
                    <h3>{person.title}{person.firstName} {person.lastName}</h3>
                    <p>{person.code || "ไม่ระบุรหัส"} • {person.nickname ? `ชื่อเล่น ${person.nickname}` : "ไม่ระบุชื่อเล่น"}</p>
                  </div>
                  <dl className="track-house-person-facts">
                    <div><dt>Track / Season</dt><dd>{person.track || "ไม่ระบุ Track"} • {person.season || "ไม่ระบุ Season"}</dd></div>
                    <div><dt>สถานะปัจจุบัน</dt><dd>{person.group || "ไม่ระบุ"}</dd></div>
                    <div><dt>บริษัท / สถาบัน</dt><dd>{person.organization || person.institution || "ไม่ระบุ"}</dd></div>
                  </dl>
                  <button className="track-house-person-action" type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...person }); }}>ดูข้อมูลรายบุคคล →</button>
                </article>
              ))}
              {visibleDemographicParticipants.length === 0 && <div className="empty-state"><strong>ไม่พบรายชื่อตามกลุ่มที่เลือก</strong></div>}
            </div>
          </section>
        </div>
      )}

      {showTrackHouses && (
        <div className="drawer-backdrop track-house-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTrackHouseDirectory(); }}>
          <section className="track-house-directory" role="dialog" aria-modal="true" aria-label="รายละเอียดบ้านของ AI Engineer">
            <button className="drawer-close" type="button" onClick={closeTrackHouseDirectory} aria-label="ปิดรายละเอียดบ้าน AI Engineer">×</button>
            <header className="track-house-directory-heading">
              <span>AI ENGINEER • HOUSE DIRECTORY</span>
              <h2>บ้านของ AI Engineer</h2>
              <p>พบผู้เข้าร่วม AI Engineer <strong>{aiEngineerParticipants.length.toLocaleString("th-TH")}</strong> คน แบ่งเป็น <strong>{aiEngineerHouseGroups.length.toLocaleString("th-TH")}</strong> บ้าน/กลุ่ม กดชื่อบ้านเพื่อดูว่าเป็นใครบ้าง</p>
            </header>

            <div className="track-house-filter-grid" role="group" aria-label="เลือกบ้าน AI Engineer">
              <button className={!selectedHouse ? "active" : ""} type="button" onClick={() => setSelectedHouse(null)}>
                <span>ทั้งหมด</span>
                <strong>{aiEngineerParticipants.length.toLocaleString("th-TH")} คน</strong>
              </button>
              {aiEngineerHouseGroups.map(([house, people]) => (
                <button className={selectedHouse === house ? "active" : ""} type="button" key={house} onClick={() => setSelectedHouse(house)}>
                  <span>{house}</span>
                  <strong>{people.length.toLocaleString("th-TH")} คน</strong>
                </button>
              ))}
            </div>

            <div className="track-house-list-heading">
              <div>
                <span>{selectedHouse || "ทุกบ้าน"}</span>
                <strong>{visibleAiEngineerHouseParticipants.length.toLocaleString("th-TH")} คน</strong>
              </div>
              {selectedHouse && <button type="button" onClick={() => setSelectedHouse(null)}>แสดงทุกบ้าน ×</button>}
            </div>

            <div className="track-house-person-list">
              {visibleAiEngineerHouseParticipants.map((person, index) => (
                <article className="track-house-person-card" key={`${person.key}-${person.code || "no-code"}-${person.email || "no-email"}-${index}`}>
                  <span className="track-house-person-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="track-house-person-main">
                    <div><span>{person.house?.trim() || "ไม่ระบุบ้าน"}</span><span>{person.season || "ไม่ระบุ Season"}</span></div>
                    <h3>{person.title}{person.firstName} {person.lastName}</h3>
                    <p>{person.code || "ไม่ระบุรหัส"} • {person.nickname ? `ชื่อเล่น ${person.nickname}` : "ไม่ระบุชื่อเล่น"}</p>
                  </div>
                  <dl className="track-house-person-facts">
                    <div><dt>สถานะปัจจุบัน</dt><dd>{person.group || "ไม่ระบุ"}</dd></div>
                    <div><dt>บริษัท / สถาบัน</dt><dd>{person.organization || person.institution || "ไม่ระบุ"}</dd></div>
                    <div><dt>ตำแหน่ง / การศึกษา</dt><dd>{person.position || person.fieldOfStudy || person.educationLevel || "ไม่ระบุ"}</dd></div>
                  </dl>
                  <button className="track-house-person-action" type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...person }); }}>ดูข้อมูลรายบุคคล →</button>
                </article>
              ))}
              {visibleAiEngineerHouseParticipants.length === 0 && <div className="empty-state"><strong>ไม่พบรายชื่อในบ้านนี้</strong></div>}
            </div>
          </section>
        </div>
      )}

      {selectedStudySeasonEntry && (
        <div className="drawer-backdrop study-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelectedStudySeason(null); setStudyLevelFilter("ทั้งหมด"); } }}>
          <section className="study-directory" role="dialog" aria-modal="true" aria-label={`รายชื่อผู้มีแผนเรียนต่อ ${selectedStudySeasonEntry.season}`}>
            <button className="drawer-close" type="button" onClick={() => { setSelectedStudySeason(null); setStudyLevelFilter("ทั้งหมด"); }} aria-label="ปิดรายชื่อแผนเรียนต่อ">×</button>
            <header className="study-directory-heading">
              <span>CONTINUING EDUCATION • {selectedStudySeasonEntry.season}</span>
              <h2>แผนเรียนต่อ {selectedStudySeasonEntry.season}</h2>
              <p>ผู้ที่มีแผนศึกษาต่อระดับสูงขึ้นใน Season นี้ <strong>{selectedStudySeasonEntry.people.length.toLocaleString("th-TH")}</strong> คน • ยอดรวมทุก Season <strong>{continuingStudents.length.toLocaleString("th-TH")}</strong> คน</p>
            </header>
            <div className="study-directory-levels" role="group" aria-label="กรองตามระดับการศึกษาที่ต้องการศึกษาต่อ">
              <button type="button" className={studyLevelFilter === "ทั้งหมด" ? "is-active" : ""} aria-pressed={studyLevelFilter === "ทั้งหมด"} onClick={() => setStudyLevelFilter("ทั้งหมด")}><b>ทั้งหมด</b><strong>{selectedStudySeasonEntry.people.length.toLocaleString("th-TH")} คน</strong></button>
              {selectedStudySeasonEntry.levels.map(([level, count]) => <button type="button" key={level} className={studyLevelFilter === level ? "is-active" : ""} aria-pressed={studyLevelFilter === level} onClick={() => setStudyLevelFilter(level)}><b>{level}</b><strong>{count.toLocaleString("th-TH")} คน</strong></button>)}
            </div>
            <div className="study-directory-result-heading">
              <span>{studyLevelFilter === "ทั้งหมด" ? "แสดงทุกระดับ" : `เฉพาะ ${studyLevelFilter}`}</span>
              <strong>{visibleStudyParticipants.length.toLocaleString("th-TH")} คน</strong>
            </div>
            <div className="study-directory-list" key={`${selectedStudySeasonEntry.season}-${studyLevelFilter}`}>
              {visibleStudyParticipants.map((person, index) => (
                <article className="study-person-card" key={`${person.key}-${person.code || "no-code"}-${person.email || "no-email"}-${index}`}>
                  <span className="study-person-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="study-person-main">
                    <div><span>{person.track || "ไม่ระบุ Track"}</span><span>{person.code || "ไม่ระบุรหัส"}</span></div>
                    <h3>{person.title}{person.firstName} {person.lastName}</h3>
                    <p>{person.institution || person.organization || "ไม่ระบุสถาบันปัจจุบัน"}</p>
                  </div>
                  <dl className="study-person-facts">
                    <div><dt>ระดับปัจจุบัน</dt><dd>{person.educationLevel || "ไม่ระบุ"}</dd></div>
                    <div><dt>ระดับที่ต้องการศึกษาต่อ</dt><dd>{person.desiredEducationLevel || "ไม่ระบุ"}</dd></div>
                    <div><dt>สาขาที่สนใจ</dt><dd>{person.desiredStudyField || "ไม่ระบุ"}</dd></div>
                    <div><dt>สถาบัน / ประเทศที่คาดหวัง</dt><dd>{person.desiredStudyInstitution || "ไม่ระบุ"}</dd></div>
                  </dl>
                  <div className="study-person-actions">
                    <span>{person.desiredStudyTimeline || person.futureStudyPlan || "ไม่ระบุช่วงเวลา"}</span>
                    <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...person }); }}>ดูข้อมูลรายบุคคล →</button>
                  </div>
                </article>
              ))}
              {visibleStudyParticipants.length === 0 && <div className="empty-state"><strong>ไม่พบรายชื่อตามระดับที่เลือก</strong></div>}
            </div>
          </section>
        </div>
      )}

      {showMedals && (
        <div className="drawer-backdrop medal-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowMedals(false); }}>
          <section className="medal-directory" role="dialog" aria-modal="true" aria-label="รายชื่อรางวัลและเหรียญ">
            <button className="drawer-close" type="button" onClick={() => setShowMedals(false)} aria-label="ปิดรายชื่อรางวัลและเหรียญ">×</button>
            <header className="medal-directory-heading">
              <span>AWARD / MEDAL DIRECTORY • SEASON 1–5</span>
              <h2>รางวัล / เหรียญของผู้เข้าร่วม</h2>
              <p>ข้อมูลจากชีทรายชื่อรางวัล แยกเป็นเหรียญทอง เงิน ทองแดง, AI Developer, AI Designer และ AI Participant</p>
            </header>
            <div className="medal-directory-summary">
              <article><span>{medalTrackFilter === "ทั้งหมด" ? (medalTypeFilter === "ทั้งหมด" ? (medalSeasonFilter === "ทั้งหมด" ? "ผู้มีข้อมูลรางวัลทั้งหมด" : `ผู้ได้รับเหรียญ • ${medalSeasonFilter}`) : `ผลลัพธ์ • ${medalTypeFilter}`) : `${medalTrackFilter} • ${medalTypeFilter === "ทั้งหมด" ? "ทุกประเภทรางวัล" : medalTypeFilter}`}</span><strong>{visibleMedalRecipients.length.toLocaleString("th-TH")}</strong><small>คน • ตัวเลขเปลี่ยนตามตัวกรอง</small></article>
              {medalTypes.map((type) => <article key={type.name} className={medalTypeFilter === type.name ? "is-selected" : ""}><i style={{ background: type.color }} /><span>{type.name}</span><strong>{(filteredMedalCounts[type.name] ?? 0).toLocaleString("th-TH")}</strong><small>คน • ใน Season ที่เลือก</small></article>)}
            </div>

            <div className="medal-filter-groups">
              <div className="medal-filter-group" role="group" aria-label="กรองตาม Season">
                <strong>Season</strong>
                <div className="medal-filter-row">
                  <button className={medalSeasonFilter === "ทั้งหมด" ? "active" : ""} type="button" onClick={() => setMedalSeasonFilter("ทั้งหมด")}>ทุก Season</button>
                  {medalSeasons.map((season) => <button className={medalSeasonFilter === season ? "active" : ""} type="button" key={season} onClick={() => setMedalSeasonFilter(season)}>{season}</button>)}
                </div>
              </div>
              <div className="medal-filter-group" role="group" aria-label="กรองตาม Track">
                <strong>Track</strong>
                <div className="medal-filter-row">
                  <button className={medalTrackFilter === "ทั้งหมด" ? "active" : ""} type="button" onClick={() => setMedalTrackFilter("ทั้งหมด")}>ทุก Track</button>
                  {TRACK_NAMES.map((track) => <button className={medalTrackFilter === track ? "active" : ""} type="button" key={track} onClick={() => setMedalTrackFilter(track)}>{track}</button>)}
                </div>
              </div>
              <div className="medal-filter-group" role="group" aria-label="กรองตามประเภทรางวัล / เหรียญ">
                <strong>ประเภทรางวัล / เหรียญ</strong>
                <div className="medal-filter-row">
                  <button className={medalTypeFilter === "ทั้งหมด" ? "active" : ""} type="button" onClick={() => setMedalTypeFilter("ทั้งหมด")}>ทุกประเภท</button>
                  {medalTypes.map((type) => <button className={medalTypeFilter === type.name ? "active" : ""} type="button" key={type.name} onClick={() => setMedalTypeFilter(type.name)}><i style={{ background: type.color }} />{type.name}</button>)}
                </div>
              </div>
            </div>

            <div className="medal-result-heading"><span>รายการที่แสดง • {medalTrackFilter === "ทั้งหมด" ? "ทุก Track" : medalTrackFilter} • {medalSeasonFilter === "ทั้งหมด" ? "ทุก Season" : medalSeasonFilter} • {medalTypeFilter === "ทั้งหมด" ? "ทุกประเภทรางวัล" : medalTypeFilter}</span><strong>{visibleMedalRecipients.length.toLocaleString("th-TH")} คน</strong></div>
            <div className="medal-recipient-list" key={`${medalTrackFilter}-${medalSeasonFilter}-${medalTypeFilter}`}>
              {visibleMedalRecipients.map((recipient, index) => {
                const matchedParticipant = participantByMedal(recipient);
                const extraAward = recipient.award.replace(/^เหรียญทองแดง(?:\s*\([^)]*\))?\s*,?\s*|^เหรียญเงิน(?:\s*\([^)]*\))?\s*,?\s*|^เหรียญทอง(?:\s*\([^)]*\))?\s*,?\s*|^AI\s*Developer\s*,?\s*|^AI\s*Participant\s*,?\s*|^AI\s*Designer\s*,?\s*/i, "").trim();
                return (
                  <article className="medal-recipient-card" key={`${medalTrackFilter}-${medalSeasonFilter}-${medalTypeFilter}-${recipient.key}-${recipient.season}-${recipient.medalType}-${index}`}>
                    <span className="medal-recipient-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="medal-recipient-main">
                      <div><span>{recipient.season}</span><span>{recipient.code || "ไม่ระบุรหัส"}</span></div>
                      <h3>{recipient.title}{recipient.firstName} {recipient.lastName}</h3>
                      <p>{recipient.organization || "ไม่ระบุสังกัด"}</p>
                    </div>
                    <div className="medal-recipient-award">
                      <span><i style={{ background: medalTypes.find((type) => type.name === recipient.medalType)?.color }} />{recipient.medalType}</span>
                      <p>{extraAward || "ไม่มีรายละเอียดรางวัลเพิ่มเติม"}</p>
                    </div>
                    <div className="medal-recipient-actions">
                      {matchedParticipant ? <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...matchedParticipant }); }}>ดูข้อมูลรายบุคคล →</button> : <span>ยังไม่พบในแบบติดตามผล</span>}
                    </div>
                  </article>
                );
              })}
              {visibleMedalRecipients.length === 0 && <div className="empty-state"><strong>ไม่พบรายการรางวัล / เหรียญตามตัวกรองนี้</strong><p>ลองเลือก Season หรือประเภทรางวัล / เหรียญอื่น</p></div>}
            </div>
          </section>
        </div>
      )}

      {showStartups && (
        <div className="drawer-backdrop startup-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowStartups(false); }}>
          <section className="startup-directory" role="dialog" aria-modal="true" aria-label="ทะเบียน Startup ของผู้เข้าร่วมโครงการ">
            <button className="drawer-close" type="button" onClick={() => setShowStartups(false)} aria-label="ปิดทะเบียน Startup">×</button>
            <header className="startup-directory-heading"><p className="eyebrow">STARTUP DIRECTORY</p><h2>กิจการ / บริษัท / โครงการ Startup</h2><p>พบทั้งหมด <strong>{startupFounders.length.toLocaleString("th-TH")}</strong> รายการ • คลิกแต่ละรายการเพื่อดูรายละเอียดเพิ่มเติมของผู้ก่อตั้ง</p></header>
            <div className="startup-list">
              {startupFounders.map((startup, index) => {
                const links = extractLinks(startup.portfolio);
                return (
                  <article className="startup-list-card" key={startup.key}>
                    <div className="startup-list-index">{String(index + 1).padStart(2, "0")}</div>
                    <div className="startup-list-main"><span className="startup-status-pill">{startup.businessStatus || "ไม่ระบุสถานะ"}</span><h3>{startup.organization || "ไม่ระบุชื่อกิจการ"}</h3><p>{startup.sector || "ไม่ระบุประเภทธุรกิจ"}</p><small>ผู้ก่อตั้ง: {startup.title}{startup.firstName} {startup.lastName}</small></div>
                    <dl className="startup-facts"><div><dt>รายได้เฉลี่ยต่อเดือน</dt><dd>{startup.income || "ไม่ระบุ"}</dd></div><div><dt>จำนวนพนักงาน</dt><dd>{startup.employeeCount || "ไม่ระบุ"}</dd></div></dl>
                    <div className="startup-list-actions">
                      {links.length > 0 ? <a href={links[0]} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>เว็บไซต์ / ช่องทางติดต่อ ↗</a> : <span>ไม่ระบุเว็บไซต์</span>}
                      <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...startup }); }}>ดูข้อมูลผู้ก่อตั้ง →</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {showIndustry && (
        <div className="drawer-backdrop industry-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowIndustry(false); }}>
          <section className="industry-directory" role="dialog" aria-modal="true" aria-label="รายชื่อบริษัทและหน่วยงาน">
            <button className="drawer-close" type="button" onClick={() => setShowIndustry(false)} aria-label="ปิดรายชื่อบริษัทและหน่วยงาน">×</button>
            <header className="industry-directory-heading">
              <span className="industry-directory-eyebrow">SECTOR / อุตสาหกรรม</span>
              <h2>{industrySectorFilter ?? "บริษัท และหน่วยงานทั้งหมด"}</h2>
              <p>
                ผู้เข้าร่วม <strong>{selectedIndustryParticipants.length.toLocaleString("th-TH")}</strong> คน
                <span aria-hidden="true"> • </span>
                บริษัท/หน่วยงานที่ระบุชื่อ <strong>{selectedIndustryOrganizations.length.toLocaleString("th-TH")}</strong> แห่ง
              </p>
            </header>
            {industrySectorFilter && <button className="industry-directory-back" type="button" onClick={() => setIndustrySectorFilter(null)}>← ดูบริษัทและหน่วยงานทั้งหมด</button>}
            {selectedIndustryOrganizations.length > 0 ? (
              <div className="organization-list organization-list-static">{selectedIndustryOrganizations.map(([organization, people], index) => <div className="organization-row" key={organization}><b>{String(index + 1).padStart(2, "0")}</b><span>{organization}</span><strong>{people.length.toLocaleString("th-TH")} คน</strong></div>)}</div>
            ) : (
              <div className="industry-directory-empty"><strong>ยังไม่มีรายชื่อบริษัทหรือหน่วยงาน</strong><p>พบผู้เข้าร่วมใน Sector นี้ {selectedIndustryParticipants.length.toLocaleString("th-TH")} คน แต่ข้อมูลต้นทางยังไม่มีชื่อบริษัทหรือหน่วยงานที่อ่านได้</p></div>
            )}
            {selectedIndustryUnspecifiedParticipants.length > 0 && (
              <section className="industry-unspecified" aria-label="ผู้เข้าร่วมที่ยังไม่ระบุบริษัทหรือหน่วยงาน">
                <div className="industry-unspecified-heading"><strong>ยังไม่ระบุบริษัท / หน่วยงาน</strong><span>{selectedIndustryUnspecifiedParticipants.length.toLocaleString("th-TH")} คน</span></div>
                <div className="industry-unspecified-list">
                  {selectedIndustryUnspecifiedParticipants.map((person) => (
                    <button key={person.key} type="button" onClick={() => setSelected(person)}>
                      <span><b>{person.title}{person.firstName} {person.lastName}</b><small>{person.position || person.workType || person.clientGroup || "กดเพื่อดูรายละเอียดผู้เข้าร่วม"}</small></span>
                      <strong>ดูข้อมูล →</strong>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
