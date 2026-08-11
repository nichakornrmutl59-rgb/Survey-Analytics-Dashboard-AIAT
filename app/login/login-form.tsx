"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

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
        <div className="login-logos">
          <Image src="/aiat-10-logo.png" width={283} height={240} alt="AIAT ครบรอบ 10 ปี" priority />
          <span />
          <Image src="/super-ai-logo.png" width={276} height={260} alt="Super AI Engineer" priority />
        </div>
        <div>
          <p className="eyebrow">SECURE OUTCOME DASHBOARD</p>
          <h1>ระบบติดตามผล<br />ผู้เข้าร่วมโครงการ</h1>
          <p>ข้อมูลรายบุคคลสำหรับผู้ได้รับอนุญาตจากสมาคมปัญญาประดิษฐ์ประเทศไทยเท่านั้น</p>
        </div>
        <small>Artificial Intelligence Association of Thailand</small>
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
