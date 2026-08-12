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
  updatedAt?: string;
  error?: string;
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
  { name: "Education Technology", color: "#6D4AFF" },
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

  if (/public service|public sector|government|ราชการ|ภาครัฐ|รัฐวิสาหกิจ|กระทรวง|กรม|เทศบาล|อบต/.test(normalized)) return "Public Services";
  if (/healthcare|health care|healthcares|health|medical|medicine|hospital|clinic|pharma|สุขภาพ|การแพทย์|โรงพยาบาล|สาธารณสุข|เภสัช/.test(normalized)) return "Healthcare";
  if (/education technology|education|edtech|learning|school|university|academy|training|การศึกษา|มหาวิทยาลัย|โรงเรียน|สถาบันการศึกษา|เทคโนโลยีการศึกษา/.test(normalized)) return "Education Technology";
  if (/toursim|tourism|travel|hospitality|hotel|airline|aviation|ท่องเที่ยว|โรงแรม|การบิน|สายการบิน|บริการที่พัก/.test(normalized)) return "Tourism";
  if (/manufactoring|manufacturing|manufacturer|factory|industrial|automotive|electronics|production|การผลิต|โรงงาน|อุตสาหกรรม|ยานยนต์|อิเล็กทรอนิกส์/.test(normalized)) return "Manufacturing";
  if (/finance|financial|fintech|bank|banking|insurance|investment|accounting|การเงิน|ธนาคาร|ประกัน|การลงทุน|บัญชี/.test(normalized)) return "Finance";
  if (/safety|security|cyber|defen[cs]e|police|military|ความปลอดภัย|ความมั่นคง|ไซเบอร์|ตำรวจ|ทหาร|ป้องกัน/.test(normalized)) return "Safety & Security";
  if (/agriculure|agriculture|agricultural|agri|farm|farming|crop|livestock|เกษตร|ฟาร์ม|ปศุสัตว์|เพาะปลูก/.test(normalized)) return "Agriculture";

  return "";
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

  participant.key = participant.key || `participant-${index + 1}`;
  participant.sectorOriginal = participant.sector;
  participant.sector = normalizeSector(participant.sector);
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
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"overview" | "people">("overview");
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("ทั้งหมด");
  const [trackFilter, setTrackFilter] = useState("ทั้งหมด");
  const [seasonFilter, setSeasonFilter] = useState("ทั้งหมด");
  const [workFilter, setWorkFilter] = useState("ทั้งหมด");
  const [selected, setSelected] = useState<Participant | null>(null);
  const [showStartups, setShowStartups] = useState(false);
  const [showIndustry, setShowIndustry] = useState(false);
  const [showMedals, setShowMedals] = useState(false);
  const [medalSeasonFilter, setMedalSeasonFilter] = useState("ทั้งหมด");
  const [medalTypeFilter, setMedalTypeFilter] = useState("ทั้งหมด");
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [incomeSummaryView, setIncomeSummaryView] = useState<"organizations" | "sectors" | null>(null);
  const [incomeListFilter, setIncomeListFilter] = useState<{ type: "organization" | "sector"; value: string } | null>(null);
  const [page, setPage] = useState(1);

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
  const tracks = useMemo(() => sortEntries(Object.entries(countBy(participants, "track"))), [participants]);
  const seasons = useMemo(
    () => Object.keys(countBy(participants, "season")).sort((a, b) => a.localeCompare(b, "th", { numeric: true })),
    [participants],
  );
  const workers = useMemo(() => participants.filter((item) => item.group === "ทำงาน"), [participants]);
  const workTypes = useMemo(() => countBy(workers, "workType"), [workers]);
  const genderEntries = useMemo(() => {
    const counts = countDerived(participants, (item) => normalizeGender(item.gender));
    return ["ชาย", "หญิง", "อื่น ๆ / ไม่ประสงค์ระบุ", "ไม่ระบุ"]
      .map((label) => [label, counts[label] ?? 0] as [string, number])
      .filter(([, count]) => count > 0);
  }, [participants]);
  const ageEntries = useMemo(() => {
    const counts = countDerived(participants, (item) => ageRange(item.age));
    return ["ต่ำกว่า 18 ปี", "18–22 ปี", "23–29 ปี", "30–39 ปี", "40–49 ปี", "50 ปีขึ้นไป", "ไม่ระบุ"]
      .map((label) => [label, counts[label] ?? 0] as [string, number])
      .filter(([, count]) => count > 0);
  }, [participants]);
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
    return selectedIncomeParticipants.filter((person) => person[incomeListFilter.type] === incomeListFilter.value);
  }, [selectedIncomeParticipants, incomeListFilter]);
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
  const organizationDirectory = useMemo(() => {
    const groups = new Map<string, Participant[]>();
    employedParticipants.forEach((item) => {
      const organization = item.organization?.trim() ?? "";
      if (organization) groups.set(organization, [...(groups.get(organization) ?? []), item]);
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [employedParticipants]);
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
  const medalTypes = [
    { name: "เหรียญทอง", color: "#F2A900" },
    { name: "เหรียญเงิน", color: "#8591AA" },
    { name: "เหรียญทองแดง", color: "#C66A2B" },
  ] as const;
  const medalCounts = useMemo(
    () => medalRecipients.reduce<Record<string, number>>((result, item) => {
      result[item.medalType] = (result[item.medalType] ?? 0) + 1;
      return result;
    }, {}),
    [medalRecipients],
  );
  const medalSeasons = ["Season 1", "Season 2", "Season 3", "Season 4", "Season 5"];
  const medalSeasonSummary = useMemo(
    () => medalSeasons.map((season) => ({
      season,
      total: medalRecipients.filter((item) => item.season === season).length,
      counts: medalTypes.map((type) => ({ ...type, value: medalRecipients.filter((item) => item.season === season && item.medalType === type.name).length })),
    })),
    [medalRecipients],
  );
  const medalRecipientsInSeason = useMemo(
    () => medalSeasonFilter === "ทั้งหมด"
      ? medalRecipients
      : medalRecipients.filter((item) => item.season === medalSeasonFilter),
    [medalRecipients, medalSeasonFilter],
  );
  const filteredMedalCounts = useMemo(
    () => medalRecipientsInSeason.reduce<Record<string, number>>((result, item) => {
      result[item.medalType] = (result[item.medalType] ?? 0) + 1;
      return result;
    }, {}),
    [medalRecipientsInSeason],
  );
  const visibleMedalRecipients = medalRecipients.filter((item) => (
    (medalSeasonFilter === "ทั้งหมด" || item.season === medalSeasonFilter)
    && (medalTypeFilter === "ทั้งหมด" || item.medalType === medalTypeFilter)
  ));
  const openMedalDirectory = useCallback((season = "ทั้งหมด", medalType = "ทั้งหมด") => {
    setMedalSeasonFilter(season);
    setMedalTypeFilter(medalType);
    setShowMedals(true);
  }, []);
  const participantByMedal = useCallback((recipient: MedalRecipient) => {
    const normalizedCode = recipient.code.trim().toLocaleLowerCase("th");
    const normalizedName = `${recipient.firstName}${recipient.lastName}`.replace(/\s/g, "").toLocaleLowerCase("th");
    return participants.find((person) => {
      if (normalizedCode && person.code.trim().toLocaleLowerCase("th") === normalizedCode) return true;
      return `${person.firstName}${person.lastName}`.replace(/\s/g, "").toLocaleLowerCase("th") === normalizedName;
    });
  }, [participants]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th");
    return participants.filter((item) => {
      const haystack = [item.code, item.title, item.firstName, item.lastName, item.nickname, item.email, item.phone]
        .join(" ")
        .toLocaleLowerCase("th");
      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (groupFilter === "ทั้งหมด" || item.group === groupFilter) &&
        (trackFilter === "ทั้งหมด" || item.track === trackFilter) &&
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

  const detailReturnLabel = selectedIncome
    ? "กลับไปรายชื่อในช่วงรายได้"
    : showMedals
      ? "กลับไปรายชื่อผู้ได้รับเหรียญ"
      : showStartups
        ? "กลับไปทะเบียน Startup"
        : "กลับไปยังรายการเดิม";

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  };

  const total = participants.length;
  const groupGradient = GROUPS.reduce(
    (result, group, index) => {
      const previous = GROUPS.slice(0, index).reduce((sum, item) => sum + (totals[item.name] ?? 0), 0);
      const start = (previous / Math.max(total, 1)) * 360;
      const end = ((previous + (totals[group.name] ?? 0)) / Math.max(total, 1)) * 360;
      return `${result}${index ? ", " : ""}${group.color} ${start}deg ${end}deg`;
    },
    "",
  );

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
          <button className={view === "people" ? "active" : ""} type="button" onClick={() => setView("people")}>รายบุคคล</button>
        </nav>
        <div className="sync-status">
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
                  <div className="demographic-card-heading"><span>เพศ</span><strong>{total.toLocaleString("th-TH")}</strong></div>
                  <div className="demographic-bars">
                    {genderEntries.map(([label, count], index) => (
                      <BreakdownBar key={label} label={label} value={count} total={total} color={["#2F6BFF", "#FF4FA3", "#6D4AFF", "#A7B2CF"][index] ?? "#19BCEB"} />
                    ))}
                  </div>
                </article>

                <article className="panel demographic-card age-card">
                  <div className="demographic-card-heading"><span>ช่วงอายุ</span><strong>{total.toLocaleString("th-TH")}</strong></div>
                  <div className="demographic-bars compact-demographic-bars">
                    {ageEntries.map(([label, count], index) => (
                      <BreakdownBar key={label} label={label} value={count} total={total} color={["#19BCEB", "#2F6BFF", "#6D4AFF", "#FF4FA3", "#FF7A1A", "#E9A11B", "#A7B2CF"][index] ?? "#19BCEB"} />
                    ))}
                  </div>
                </article>

                <article className="panel demographic-card education-card">
                  <div className="demographic-card-heading"><span>ระดับการศึกษา</span><strong>{total.toLocaleString("th-TH")}</strong></div>
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
              <article className="panel">
                <div className="panel-heading"><div><h2>การกระจายตาม Track</h2></div></div>
                <div className="bars-list compact-bars">
                  {tracks.map(([track, count], index) => (
                    <BreakdownBar key={track} label={track} value={count} total={total} color={["#2F6BFF", "#FF7A1A", "#FF4FA3"][index] ?? "#19BCEB"} />
                  ))}
                </div>
                <div className="mini-note"><strong>AI Engineer</strong><span>ดูรายละเอียด “บ้าน” ของผู้เข้าร่วมได้ในหน้ารายบุคคล</span></div>
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
              <div className="season-chart">
                {seasons.map((season) => {
                  const seasonTotal = participants.filter((item) => item.season === season).length;
                  return (
                    <div className="season-row" key={season}>
                      <strong>{season}</strong>
                      <div className="season-stack">
                        {GROUPS.map((group) => {
                          const value = participants.filter((item) => item.season === season && item.group === group.name).length;
                          return value ? <span key={group.name} title={`${group.short}: ${value}`} style={{ width: `${(value / seasonTotal) * 100}%`, background: group.color }} /> : null;
                        })}
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
                <span>เลือกการ์ดเพื่อดูรายชื่อและรายละเอียด</span>
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
                  <div className="outcome-card-heading"><h3>หน่วยงานที่มีผู้เข้าร่วมทำงานมากที่สุด</h3><button type="button" onClick={() => setShowIndustry(true)}>ดูทั้งหมด →</button></div>
                  <div className="rank-list rank-list-static">{organizationDirectory.slice(0, 6).map(([name, people], index) => <div key={name}><b>{index + 1}</b><span>{name}</span><strong>{people.length}</strong></div>)}</div>
                </article>
                <article className="panel sector-preview-card">
                  <div className="outcome-card-heading"><h3>ตาม Sector / อุตสาหกรรม</h3><button type="button" onClick={() => setShowIndustry(true)}>ดูรายชื่อบริษัท / หน่วยงาน →</button></div>
                  <div className="bars-list compact-bars">{sectorDirectory.map(([sector, people], index) => <BreakdownBar key={sector} label={sector} value={people.length} total={employedParticipants.length} color={SECTORS[index].color} />)}</div>
                </article>
                <article className="panel education-season-card">
                  <div className="outcome-card-heading"><h3>แผนเรียนต่อ แยกตาม Season</h3><span>ระดับที่ต้องการศึกษาต่อ</span></div>
                  <div className="education-season-list">{continuingBySeason.map(({ season, people, levels }) => <div key={season} className="education-season-row"><div><strong>{season}</strong><span>{people.length.toLocaleString("th-TH")} คน</span></div><p>{levels.map(([level, count]) => `${level} ${count}`).join(" • ")}</p></div>)}</div>
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
                  <h2 id="medal-heading">ผู้ที่ได้รับเหรียญ</h2>
                  <p>สรุปจากรายชื่อรางวัลราย Season และเปิดดูรายละเอียดเชิงคุณภาพของผู้ได้รับเหรียญแต่ละคนได้</p>
                </div>
                <button type="button" onClick={() => openMedalDirectory()}>
                  ดูรายชื่อผู้ได้รับเหรียญทั้งหมด <b aria-hidden="true">→</b>
                </button>
              </div>

              <div className="medal-overview-grid">
                <button className="medal-total-card" type="button" onClick={() => openMedalDirectory()}>
                  <span>ผู้ได้รับเหรียญทั้งหมด</span>
                  <strong>{medalRecipients.length.toLocaleString("th-TH")}</strong>
                  <small>คน • คลิกเพื่อดูรายชื่อและสังกัด</small>
                  <i aria-hidden="true">🏅</i>
                </button>
                {medalTypes.map((type) => (
                  <button
                    className={`medal-type-card medal-type-${type.name === "เหรียญทอง" ? "gold" : type.name === "เหรียญเงิน" ? "silver" : "bronze"}`}
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
                <div className="medal-season-heading"><h3>จำนวนผู้ได้รับเหรียญในแต่ละ Season</h3><span>ทอง • เงิน • ทองแดง</span></div>
                <div className="medal-season-list">
                  {medalSeasonSummary.map(({ season, total: seasonMedals, counts }) => (
                    <button key={season} type="button" onClick={() => openMedalDirectory(season)}>
                      <div><strong>{season}</strong><span>{seasonMedals.toLocaleString("th-TH")} คน</span></div>
                      <div className="medal-season-stack" aria-label={`${season} มีผู้ได้รับเหรียญ ${seasonMedals} คน`}>
                        {counts.map((entry) => entry.value > 0 ? <i key={entry.name} title={`${entry.name} ${entry.value} คน`} style={{ width: `${(entry.value / Math.max(seasonMedals, 1)) * 100}%`, background: entry.color }} /> : null)}
                      </div>
                      <small>{counts.map((entry) => `${entry.name.replace("เหรียญ", "")} ${entry.value}`).join(" • ")}</small>
                    </button>
                  ))}
                </div>
              </div>
            </section>

          </>
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
                  <article className="income-person-card" key={person.key}>
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

      {showMedals && (
        <div className="drawer-backdrop medal-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowMedals(false); }}>
          <section className="medal-directory" role="dialog" aria-modal="true" aria-label="รายชื่อผู้ได้รับเหรียญ">
            <button className="drawer-close" type="button" onClick={() => setShowMedals(false)} aria-label="ปิดรายชื่อผู้ได้รับเหรียญ">×</button>
            <header className="medal-directory-heading">
              <span>MEDAL RECIPIENTS • SEASON 1–5</span>
              <h2>ผู้ที่ได้รับเหรียญ</h2>
              <p>ข้อมูลเชิงคุณภาพจากชีทรายชื่อรางวัล ประกอบด้วยรหัส ชื่อ สังกัด Season และประเภทรางวัล</p>
            </header>

            <div className="medal-directory-summary">
              <article><span>{medalTypeFilter === "ทั้งหมด" ? (medalSeasonFilter === "ทั้งหมด" ? "ผู้ได้รับเหรียญทั้งหมด" : `ผู้ได้รับเหรียญ • ${medalSeasonFilter}`) : `ผลลัพธ์ • ${medalTypeFilter}`}</span><strong>{visibleMedalRecipients.length.toLocaleString("th-TH")}</strong><small>คน • ตัวเลขเปลี่ยนตามตัวกรอง</small></article>
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
              <div className="medal-filter-group" role="group" aria-label="กรองตามประเภทเหรียญ">
                <strong>ประเภทเหรียญ</strong>
                <div className="medal-filter-row">
                  <button className={medalTypeFilter === "ทั้งหมด" ? "active" : ""} type="button" onClick={() => setMedalTypeFilter("ทั้งหมด")}>ทุกประเภท</button>
                  {medalTypes.map((type) => <button className={medalTypeFilter === type.name ? "active" : ""} type="button" key={type.name} onClick={() => setMedalTypeFilter(type.name)}><i style={{ background: type.color }} />{type.name}</button>)}
                </div>
              </div>
            </div>

            <div className="medal-result-heading"><span>รายการที่แสดง • {medalSeasonFilter === "ทั้งหมด" ? "ทุก Season" : medalSeasonFilter} • {medalTypeFilter === "ทั้งหมด" ? "ทุกประเภทเหรียญ" : medalTypeFilter}</span><strong>{visibleMedalRecipients.length.toLocaleString("th-TH")} คน</strong></div>
            <div className="medal-recipient-list" key={`${medalSeasonFilter}-${medalTypeFilter}`}>
              {visibleMedalRecipients.map((recipient, index) => {
                const matchedParticipant = participantByMedal(recipient);
                const extraAward = recipient.award.replace(/^เหรียญทองแดง(?:\s*\([^)]*\))?\s*,?\s*|^เหรียญเงิน(?:\s*\([^)]*\))?\s*,?\s*|^เหรียญทอง(?:\s*\([^)]*\))?\s*,?\s*/, "").trim();
                return (
                  <article className="medal-recipient-card" key={`${medalSeasonFilter}-${medalTypeFilter}-${recipient.key}-${recipient.season}-${recipient.medalType}-${index}`}>
                    <span className="medal-recipient-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="medal-recipient-main">
                      <div><span>{recipient.season}</span><span>{recipient.code || "ไม่ระบุรหัส"}</span></div>
                      <h3>{recipient.title}{recipient.firstName} {recipient.lastName}</h3>
                      <p>{recipient.organization || "ไม่ระบุสังกัด"}</p>
                    </div>
                    <div className="medal-recipient-award">
                      <span><i style={{ background: medalTypes.find((type) => type.name === recipient.medalType)?.color }} />{recipient.medalType}</span>
                      <p>{extraAward || "ไม่มีรางวัลพิเศษที่ระบุเพิ่มเติม"}</p>
                    </div>
                    <div className="medal-recipient-actions">
                      {matchedParticipant ? <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelected({ ...matchedParticipant }); }}>ดูข้อมูลรายบุคคล →</button> : <span>ยังไม่พบในแบบติดตามผล</span>}
                    </div>
                  </article>
                );
              })}
              {visibleMedalRecipients.length === 0 && <div className="empty-state"><strong>ไม่พบผู้ได้รับเหรียญตามตัวกรองนี้</strong><p>ลองเลือก Season หรือประเภทเหรียญอื่น</p></div>}
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
            <header className="industry-directory-heading"><h2>บริษัท และหน่วยงาน</h2><p>พบทั้งหมด <strong>{organizationDirectory.length.toLocaleString("th-TH")}</strong> แห่ง</p></header>
            <div className="organization-list organization-list-static">{organizationDirectory.map(([organization, people], index) => <div className="organization-row" key={organization}><b>{String(index + 1).padStart(2, "0")}</b><span>{organization}</span><strong>{people.length.toLocaleString("th-TH")}</strong></div>)}</div>
          </section>
        </div>
      )}
    </main>
  );
}
