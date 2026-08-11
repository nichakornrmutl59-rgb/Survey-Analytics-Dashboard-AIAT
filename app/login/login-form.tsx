"use client";

import Image from "next/image";
import { FormEvent, PointerEvent as ReactPointerEvent, useRef, useState } from "react";

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
  const loginPageRef = useRef<HTMLElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function moveMascot(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const vertical = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    const target = loginPageRef.current;
    if (!target) return;
    target.style.setProperty("--mascot-x", `${horizontal * 18}px`);
    target.style.setProperty("--mascot-y", `${vertical * 12}px`);
    target.style.setProperty("--mascot-rotate-x", `${vertical * -4}deg`);
    target.style.setProperty("--mascot-rotate-y", `${horizontal * 6}deg`);
  }

  function resetMascot() {
    const target = loginPageRef.current;
    if (!target) return;
    target.style.setProperty("--mascot-x", "0px");
    target.style.setProperty("--mascot-y", "0px");
    target.style.setProperty("--mascot-rotate-x", "0deg");
    target.style.setProperty("--mascot-rotate-y", "0deg");
  }

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
    <main ref={loginPageRef} className="login-page" onPointerMove={moveMascot} onPointerLeave={resetMascot}>
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

        <div className="login-mascot-stage" aria-hidden="true">
          <div className="login-mascot-glow" />
          <Image className="login-mascot" src="/mascot-head.png" width={1190} height={1138} alt="" priority />
        </div>

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
