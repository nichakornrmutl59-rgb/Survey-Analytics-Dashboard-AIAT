"use client";

import { SplineScene } from "@/components/ui/splite";
import Image from "next/image";
import { FormEvent, useState } from "react";

import styles from "./login.module.css";

const TOP_LOGOS = [
  { src: "/sponsor-aiat.jpg", alt: "สมาคมปัญญาประดิษฐ์ประเทศไทย", fit: "topAiAt" },
  { src: "/sponsor-aiat10.png", alt: "AIAT ครบรอบ 10 ปี", fit: "topAnniversary" },
  { src: "/sponsor-superai.png", alt: "Super AI Engineer", fit: "topSuperAi" },
] as const;

const SUPPORTER_LOGOS = [
  { src: "/sponsor-mhesi.png", alt: "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม", fit: "logoSeal" },
  { src: "/sponsor-tsri.png", alt: "สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม", fit: "logoTsri" },
  { src: "/sponsor-rorworpo.png", alt: "สำนักงานเร่งรัดการวิจัยและนวัตกรรม", fit: "logoStandard" },
  { src: "/sponsor-bpko.png", alt: "หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่", fit: "logoBpko" },
  { src: "/sponsor-ailoveu.jpg", alt: "AI Love U", fit: "logoWide" },
  { src: "/sponsor-aiat.jpg", alt: "สมาคมปัญญาประดิษฐ์ประเทศไทย", fit: "logoAiAt" },
  { src: "/sponsor-aiat10.png", alt: "AIAT ครบรอบ 10 ปี", fit: "logoAnniversary" },
  { src: "/sponsor-nectec.png", alt: "NECTEC", fit: "logoWide" },
  { src: "/sponsor-rmutl.png", alt: "มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา", fit: "logoTall" },
  { src: "/sponsor-siit.png", alt: "สถาบันเทคโนโลยีนานาชาติสิรินธร", fit: "logoWide" },
] as const;

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "เข้าสู่ระบบไม่สำเร็จ");
      window.location.replace("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.topLogos} aria-label="หน่วยงานหลักของโครงการ">
          {TOP_LOGOS.map((logo) => (
            <div className={`${styles.topLogo} ${styles[logo.fit]}`} key={logo.src}>
              <Image className={styles.logoImage} src={logo.src} alt={logo.alt} fill sizes="150px" priority />
            </div>
          ))}
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>SECURE OUTCOME DASHBOARD</p>
          <h1>ระบบติดตามผล<br />ผู้เข้าร่วมโครงการ</h1>
          <p className={styles.description}>
            ข้อมูลรายบุคคลสำหรับผู้ได้รับอนุญาตจากสมาคมปัญญาประดิษฐ์ประเทศไทยเท่านั้น
          </p>
        </div>

        <div className={styles.splineStage} aria-label="โมเดล AI สามมิติแบบโต้ตอบ">
          <div className={styles.splineGlow} aria-hidden="true" />
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className={styles.splineCanvas}
          />
          <span className={styles.splineHint}>เลื่อนเมาส์เพื่อโต้ตอบกับ AI 3D</span>
        </div>

        <div className={styles.supporters}>
          <small>เครือข่ายผู้สนับสนุนและหน่วยงานความร่วมมือ</small>
          <div className={styles.supporterTrack}>
            {SUPPORTER_LOGOS.map((logo) => (
              <div className={`${styles.supporterLogo} ${styles[logo.fit]}`} key={logo.src} title={logo.alt}>
                <Image className={styles.logoImage} src={logo.src} alt={logo.alt} fill sizes="94px" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.formCard} onSubmit={submit}>
          <p className={styles.formEyebrow}>เข้าสู่ระบบ</p>
          <h2>ยืนยันตัวตนเพื่อดูข้อมูล</h2>
          <p className={styles.formIntro}>กรอกชื่อผู้ใช้และรหัสผ่านที่ผู้ดูแลระบบกำหนดให้</p>

          <label className={styles.field}>
            <span>ชื่อผู้ใช้</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required autoFocus />
          </label>
          <label className={styles.field}>
            <span>รหัสผ่าน</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>

          {error && <div className={styles.error} role="alert">{error}</div>}
          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}<span>→</span>
          </button>
          <small className={styles.sessionNote}>เซสชันจะหมดอายุอัตโนมัติภายใน 8 ชั่วโมง</small>
        </form>
      </section>
    </main>
  );
}
