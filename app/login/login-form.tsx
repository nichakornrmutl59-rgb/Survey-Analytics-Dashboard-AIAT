"use client";

import { Card } from "@/components/ui/card";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import Image from "next/image";
import { FormEvent, useState } from "react";

const TOP_LOGOS = [
  { src: "/sponsor-aiat.jpg", alt: "สมาคมปัญญาประดิษฐ์ประเทศไทย", width: 640, height: 384 },
  { src: "/sponsor-aiat10.png", alt: "AIAT ครบรอบ 10 ปี", width: 1706, height: 1476 },
  { src: "/sponsor-superai.png", alt: "Super AI Engineer", width: 1624, height: 1498 },
] as const;

const SUPPORTER_LOGOS = [
  { src: "/sponsor-mhesi.png", alt: "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม" },
  { src: "/sponsor-tsri.png", alt: "สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม" },
  { src: "/sponsor-rorworpo.png", alt: "สำนักงานเร่งรัดการวิจัยและนวัตกรรม" },
  { src: "/sponsor-bpko.png", alt: "หน่วยบริหารและจัดการทุนด้านการพัฒนาระดับพื้นที่" },
  { src: "/sponsor-ailoveu.jpg", alt: "AI Love U" },
  { src: "/sponsor-aiat.jpg", alt: "สมาคมปัญญาประดิษฐ์ประเทศไทย" },
  { src: "/sponsor-aiat10.png", alt: "AIAT ครบรอบ 10 ปี" },
  { src: "/sponsor-nectec.png", alt: "NECTEC" },
  { src: "/sponsor-rmutl.png", alt: "มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา" },
  { src: "/sponsor-siit.png", alt: "สถาบันเทคโนโลยีนานาชาติสิรินธร" },
  { src: "/sponsor-superai.png", alt: "Super AI Engineer" },
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
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-top-logos" aria-label="หน่วยงานหลักของโครงการ">
          {TOP_LOGOS.map((logo) => (
            <div className="login-top-logo" key={logo.src}>
              <Image src={logo.src} width={logo.width} height={logo.height} alt={logo.alt} priority />
            </div>
          ))}
        </div>

        <div className="login-hero-copy">
          <p className="eyebrow">SECURE OUTCOME DASHBOARD</p>
          <h1>ระบบติดตามผล<br />ผู้เข้าร่วมโครงการ</h1>
          <p>ข้อมูลรายบุคคลสำหรับผู้ได้รับอนุญาตจากสมาคมปัญญาประดิษฐ์ประเทศไทยเท่านั้น</p>
        </div>

        <Card className="login-spline-stage" aria-label="โมเดล AI สามมิติแบบโต้ตอบ">
          <Spotlight size={430} fill="rgba(114, 220, 255, .54)" />
          <div className="login-spline-orbit" aria-hidden="true" />
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="login-spline-canvas"
          />
          <span className="login-spline-hint">เลื่อนเมาส์เพื่อโต้ตอบกับ AI 3D</span>
        </Card>

        <div className="login-supporters">
          <small>เครือข่ายผู้สนับสนุนและหน่วยงานความร่วมมือ</small>
          <div className="login-supporter-track">
            {SUPPORTER_LOGOS.map((logo) => (
              <div className="login-supporter-logo" key={logo.src} title={logo.alt}>
                <Image src={logo.src} width={150} height={72} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <form onSubmit={submit}>
          <p className="eyebrow">เข้าสู่ระบบ</p>
          <h2>ยืนยันตัวตนเพื่อดูข้อมูล</h2>
          <p className="login-intro">กรอกชื่อผู้ใช้และรหัสผ่านที่ผู้ดูแลระบบกำหนดให้</p>

          <label>
            <span>ชื่อผู้ใช้</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required autoFocus />
          </label>
          <label>
            <span>รหัสผ่าน</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>

          {error && <div className="login-error" role="alert">{error}</div>}
          <button type="submit" disabled={submitting}>{submitting ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}<span>→</span></button>
          <small>เซสชันจะหมดอายุอัตโนมัติภายใน 8 ชั่วโมง</small>
        </form>
      </section>
    </main>
  );
}
