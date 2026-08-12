"use client";

import { GradientCard } from "@/components/ui/gradient-card";
import { HeroSection } from "@/components/ui/hero-section-2";
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
  updatedAt?: string;
  error?: string;
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
  return participant;
}

function sanitizeParticipants(value: unknown): Participant[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((participant, index) => sanitizeParticipant(participant, index))
    .filter((participant): participant is Participant => participant !== null);
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
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [industryTab, setIndustryTab] = useState<"sector" | "organization">("sector");
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
  const sectorEntries = useMemo(
    () => sortEntries(Object.entries(countBy(participants.filter((item) => item.group === "ทำงาน" || item.group === "เรียนและทำงาน"), "sector"))).slice(0, 6),
    [participants],
  );
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
  const startupFounders = useMemo(
    () => participants.filter((item) => item.workType?.includes("เจ้าของกิจการ")),
    [participants],
  );
  const employedParticipants = useMemo(
    () => participants.filter((item) => item.group === "ทำงาน" || item.group === "เรียนและทำงาน"),
    [participants],
  );
  const sectorDirectory = useMemo(() => {
    const groups = new Map<string, Participant[]>();
    employedParticipants.forEach((item) => {
      const sector = item.sector?.trim() || "ไม่ระบุ Sector";
      groups.set(sector, [...(groups.get(sector) ?? []), item]);
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
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
                <p>รวมกลุ่มทำงานและเรียนควบคู่กับงาน เฉพาะผู้ที่ระบุรายได้ • คลิกแต่ละช่วงเพื่อดูข้อมูลเชิงคุณภาพ</p>
              </div>
              <div className="income-grid income-card-grid">
                {incomeEntries.map(([income, count], index) => (
                  <button
                    className={`income-card income-card-${index + 1}`}
                    key={income}
                    type="button"
                    onClick={() => setSelectedIncome(income)}
                    aria-label={`ดูข้อมูลเชิงคุณภาพของผู้มีรายได้ ${income}`}
                  >
                    <span className="income-card-dot" style={{ background: ["#FF7A1A", "#2F6BFF", "#FF4FA3", "#19BCEB"][index] }} />
                    <small>ช่วงรายได้ต่อเดือน</small>
                    <strong>{count.toLocaleString("th-TH")}</strong>
                    <p>{income}</p>
                    <b>ดูข้อมูลเชิงคุณภาพ <i aria-hidden="true">→</i></b>
                  </button>
                ))}
              </div>
            </section>

            <section className="startup-section" aria-labelledby="startup-heading">
              <div className="section-heading startup-heading">
                <div><p className="eyebrow">STARTUP DIRECTORY</p><h2 id="startup-heading">Startup ที่เกิดขึ้นจากผู้เข้าร่วมโครงการ</h2></div>
                <p>ข้อมูลเชิงคุณภาพจากผู้ที่ระบุสถานะเป็นเจ้าของกิจการ ผู้ประกอบการ หรือ Startup Founder</p>
              </div>
              <button className="startup-summary-card" type="button" onClick={() => setShowStartups(true)}>
                <span className="startup-summary-copy"><small>จำนวนกิจการ / บริษัท / โครงการ Startup</small><strong>{startupFounders.length.toLocaleString("th-TH")}</strong><p>คลิกเพื่อดูว่ามีอะไรบ้าง พร้อมข้อมูลเว็บไซต์ ประเภทธุรกิจ รายได้ จำนวนพนักงาน และสถานะปัจจุบัน</p></span>
                <span className="startup-summary-action">เปิดทะเบียน Startup <b>→</b></span>
              </button>
            </section>

            <section className="outcome-section" aria-labelledby="outcome-heading">
              <div className="section-heading outcome-heading">
                <div><p className="eyebrow">INDUSTRY & EDUCATION OUTCOMES</p><h2 id="outcome-heading">ผลลัพธ์ด้านรายได้ อุตสาหกรรม และการศึกษาต่อ</h2></div>
                <p>เชื่อมภาพรวมเชิงสถิติเข้ากับรายชื่อบริษัท หน่วยงาน และผู้เข้าร่วมในแต่ละ Season</p>
              </div>
              <div className="outcome-kpi-grid">
                <article><span>ผู้มีข้อมูลรายได้</span><strong>{knownIncomeParticipants.length.toLocaleString("th-TH")}</strong><p>จากกลุ่มทำงานและเรียนควบคู่กับงาน</p></article>
                <article><span>รายได้เฉลี่ยโดยประมาณ</span><strong>฿{incomeEstimatedAverage.toLocaleString("th-TH")}</strong><p>ต่อเดือน • ประมาณจากค่ากลางของช่วงรายได้</p></article>
                <article><span>Sector ที่พบ</span><strong>{sectorDirectory.length.toLocaleString("th-TH")}</strong><p>คลิกด้านล่างเพื่อดูบริษัทและหน่วยงานภายใต้ Sector</p></article>
                <article><span>มีแผนศึกษาต่อระดับสูงขึ้น</span><strong>{continuingStudents.length.toLocaleString("th-TH")}</strong><p>ผู้เรียนที่ระบุระดับการศึกษาที่ต้องการศึกษาต่อ</p></article>
              </div>
              <div className="outcome-grid">
                <article className="panel income-stat-card">
                  <div className="outcome-card-heading"><h3>สถิติช่วงรายได้ต่อเดือน</h3><span>{knownIncomeParticipants.length.toLocaleString("th-TH")} ผู้ตอบ</span></div>
                  <div className="bars-list compact-bars">{incomeStats.map(([label, count], index) => <BreakdownBar key={label} label={label} value={count} total={knownIncomeParticipants.length} color={["#19BCEB", "#2F6BFF", "#6D4AFF", "#FF4FA3"][index]} />)}</div>
                </article>
                <article className="panel industry-preview-card">
                  <div className="outcome-card-heading"><h3>หน่วยงานที่มีผู้เข้าร่วมทำงานมากที่สุด</h3><button type="button" onClick={() => { setIndustryTab("organization"); setShowIndustry(true); }}>ดูทั้งหมด →</button></div>
                  <div className="rank-list">{organizationDirectory.slice(0, 6).map(([name, people], index) => <button key={name} type="button" onClick={() => { setIndustryTab("organization"); setShowIndustry(true); }}><b>{index + 1}</b><span>{name}<small>{people[0]?.sector || "ไม่ระบุ Sector"}</small></span><strong>{people.length}</strong></button>)}</div>
                </article>
                <article className="panel sector-preview-card">
                  <div className="outcome-card-heading"><h3>การทำงานตาม Sector / อุตสาหกรรม</h3><button type="button" onClick={() => { setIndustryTab("sector"); setShowIndustry(true); }}>ดูบริษัทภายใต้ Sector →</button></div>
                  <div className="bars-list compact-bars">{sectorDirectory.slice(0, 7).map(([sector, people], index) => <BreakdownBar key={sector} label={sector} value={people.length} total={employedParticipants.length} color={["#2F6BFF", "#19BCEB", "#FF7A1A", "#FF4FA3", "#6D4AFF", "#163A8A", "#E9A11B"][index]} onClick={() => { setIndustryTab("sector"); setShowIndustry(true); }} />)}</div>
                </article>
                <article className="panel education-season-card">
                  <div className="outcome-card-heading"><h3>แผนเรียนต่อ แยกตาม Season</h3><span>ระดับที่ต้องการศึกษาต่อ</span></div>
                  <div className="education-season-list">{continuingBySeason.map(({ season, people, levels }) => <div key={season} className="education-season-row"><div><strong>{season}</strong><span>{people.length.toLocaleString("th-TH")} คน</span></div><p>{levels.map(([level, count]) => `${level} ${count}`).join(" • ")}</p></div>)}</div>
                </article>
              </div>
            </section>

            <section className="insight-grid bottom-grid">
              <article className="panel">
                <div className="panel-heading"><div><p className="eyebrow">03 / TRACK</p><h2>การกระจายตาม Track</h2></div></div>
                <div className="bars-list compact-bars">
                  {tracks.map(([track, count], index) => (
                    <BreakdownBar key={track} label={track} value={count} total={total} color={["#2F6BFF", "#FF7A1A", "#FF4FA3"][index] ?? "#19BCEB"} />
                  ))}
                </div>
                <div className="mini-note"><strong>AI Engineer</strong><span>ดูรายละเอียด “บ้าน” ของผู้เข้าร่วมได้ในหน้ารายบุคคล</span></div>
              </article>

              <article className="panel">
                <div className="panel-heading"><div><p className="eyebrow">04 / SECTOR</p><h2>ภาคส่วนการทำงาน</h2></div><span className="panel-note">จากผู้ที่ระบุภาคส่วน</span></div>
                <div className="bars-list compact-bars">
                  {sectorEntries.map(([sector, count], index) => (
                    <BreakdownBar key={sector} label={sector.replace("สถาบันการศึกษา / มหาวิทยาลัย", "สถาบันการศึกษา")} value={count} total={sectorEntries[0]?.[1] ?? 1} color={["#2F6BFF", "#19BCEB", "#FF7A1A", "#FF4FA3", "#6D4AFF", "#163A8A"][index]} />
                  ))}
                </div>
              </article>
            </section>

            <section className="panel season-panel">
              <div className="panel-heading"><div><p className="eyebrow">05 / COHORT VIEW</p><h2>เส้นทางของผู้เข้าร่วมในแต่ละ Season</h2></div><span className="panel-note">จำนวนผู้ตอบแบบติดตามผล</span></div>
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
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`รายละเอียด ${selected.firstName} ${selected.lastName}`}>
            <button className="drawer-close" type="button" onClick={() => setSelected(null)} aria-label="ปิดรายละเอียด">×</button>
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
        <div className="drawer-backdrop income-directory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedIncome(null); }}>
          <section className="income-directory" role="dialog" aria-modal="true" aria-label={`ข้อมูลเชิงคุณภาพช่วงรายได้ ${selectedIncome}`}>
            <button className="drawer-close" type="button" onClick={() => setSelectedIncome(null)} aria-label="ปิดข้อมูลช่วงรายได้">×</button>
            <header className="income-directory-heading">
              <p>ข้อมูลเชิงคุณภาพตามช่วงรายได้</p>
              <h2>{selectedIncome}</h2>
              <span>พบทั้งหมด <strong>{selectedIncomeParticipants.length.toLocaleString("th-TH")}</strong> คน</span>
            </header>

            <div className="income-directory-summary">
              <article><span>ผู้เข้าร่วม</span><strong>{selectedIncomeParticipants.length.toLocaleString("th-TH")}</strong><small>คนที่ระบุรายได้ช่วงนี้</small></article>
              <article><span>บริษัท / หน่วยงาน</span><strong>{new Set(selectedIncomeParticipants.map((person) => person.organization).filter(Boolean)).size.toLocaleString("th-TH")}</strong><small>แห่งที่ระบุชื่อไว้</small></article>
              <article><span>Sector ที่พบ</span><strong>{new Set(selectedIncomeParticipants.map((person) => person.sector).filter(Boolean)).size.toLocaleString("th-TH")}</strong><small>{selectedIncomeSectors.map(([sector, count]) => `${sector} ${count}`).join(" • ") || "ยังไม่ระบุ Sector"}</small></article>
            </div>

            <div className="income-person-list">
              {selectedIncomeParticipants.map((person, index) => {
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
                      <button type="button" onClick={() => { setSelectedIncome(null); setSelected(person); }}>ดูข้อมูลรายบุคคล →</button>
                    </div>
                  </article>
                );
              })}
              {!selectedIncomeParticipants.length && <div className="empty-state"><strong>ไม่พบข้อมูลในช่วงรายได้นี้</strong></div>}
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
                      <button type="button" onClick={() => { setShowStartups(false); setSelected(startup); }}>ดูข้อมูลผู้ก่อตั้ง →</button>
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
          <section className="industry-directory" role="dialog" aria-modal="true" aria-label="รายละเอียด Sector บริษัท และหน่วยงาน">
            <button className="drawer-close" type="button" onClick={() => setShowIndustry(false)} aria-label="ปิดรายละเอียดอุตสาหกรรม">×</button>
            <header className="industry-directory-heading"><p className="eyebrow">INDUSTRY DIRECTORY</p><h2>Sector บริษัท และหน่วยงาน</h2><div className="industry-tabs"><button className={industryTab === "sector" ? "active" : ""} type="button" onClick={() => setIndustryTab("sector")}>แยกตาม Sector</button><button className={industryTab === "organization" ? "active" : ""} type="button" onClick={() => setIndustryTab("organization")}>แยกตามบริษัท / หน่วยงาน</button></div></header>
            {industryTab === "sector" ? <div className="industry-groups">{sectorDirectory.map(([sector, people]) => <article key={sector}><header><h3>{sector}</h3><strong>{people.length.toLocaleString("th-TH")} คน</strong></header><div>{[...new Set(people.map((person) => person.organization).filter(Boolean))].map((organization) => { const members = people.filter((person) => person.organization === organization); return <button key={organization} type="button" onClick={() => { setShowIndustry(false); setSelected(members[0]); }}><span>{organization}<small>{members.map((person) => `${person.firstName} ${person.lastName}`).join(", ")}</small></span><b>{members.length}</b></button>; })}</div></article>)}</div> : <div className="organization-list">{organizationDirectory.map(([organization, people], index) => <button key={organization} type="button" onClick={() => { setShowIndustry(false); setSelected(people[0]); }}><b>{String(index + 1).padStart(2, "0")}</b><span>{organization}<small>{people[0]?.sector || "ไม่ระบุ Sector"} • {people.map((person) => `${person.firstName} ${person.lastName}`).join(", ")}</small></span><strong>{people.length}</strong></button>)}</div>}
          </section>
        </div>
      )}
    </main>
  );
}
