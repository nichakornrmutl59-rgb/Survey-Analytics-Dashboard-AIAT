# แดชบอร์ดผลลัพธ์ผู้เข้าร่วมโครงการ — Production Edition

แดชบอร์ดภาษาไทยพร้อมระบบเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน เหมาะสำหรับข้อมูลรายบุคคลที่ไม่ควรแสดงแบบสาธารณะ ซอร์สโค้ดสามารถเก็บใน Public GitHub ได้ เพราะไม่มีรหัสผ่าน รหัสชีท หรือข้อมูลผู้เข้าร่วมอยู่ใน Repository

## ความสามารถ

- หน้า Login พร้อม Session Cookie แบบ `HttpOnly`, `Secure` และ `SameSite=Strict`
- รหัสผ่านจัดเก็บเป็น PBKDF2-SHA256 Hash ไม่เก็บข้อความรหัสผ่านจริง
- เซสชันหมดอายุภายใน 3 ชั่วโมง
- ป้องกัน API ข้อมูลผู้เข้าร่วมจากผู้ที่ยังไม่ได้เข้าสู่ระบบ
- สรุปสถานะ Track, Season, ภาคส่วน รายได้ และความเกี่ยวข้องกับ AI
- ค้นหา กรอง และเปิดข้อมูลรายบุคคล
- เปิดลิงก์ผลงานและหลักฐานได้
- อัปเดตข้อมูลจาก Google Sheets ทุก 60 วินาที

## ตั้งค่าครั้งแรก

ต้องใช้ Node.js `>=22.13.0`

```bash
npm install
cp .env.example .env.local
```

สร้าง Password Hash และ `AUTH_SECRET`:

```bash
npm run create-password -- "รหัสผ่านที่ต้องการ"
```

นำค่าที่ได้ไปใส่ใน `.env.local` พร้อมกำหนด:

```env
GOOGLE_SHEET_ID=รหัส Google Sheet
DASHBOARD_USERNAME=ชื่อผู้ใช้
DASHBOARD_PASSWORD_HASH=ค่าที่สร้างจากคำสั่งด้านบน
AUTH_SECRET=ค่าที่สร้างจากคำสั่งด้านบน
```

ห้ามอัปโหลด `.env.local` ขึ้น GitHub

## ทดสอบในเครื่อง

```bash
npm run dev
```

เปิด `http://localhost:3000`

## ตรวจสอบก่อน Deploy

```bash
npm run lint
npm run build
npm run start
```

## Deploy ด้วย Vercel

1. อัปโหลดซอร์สขึ้น GitHub
2. ใน Vercel เลือก **Add New → Project** และ Import Repository
3. เพิ่ม Environment Variables ทั้ง 4 ค่า:
   - `GOOGLE_SHEET_ID`
   - `DASHBOARD_USERNAME`
   - `DASHBOARD_PASSWORD_HASH`
   - `AUTH_SECRET`
4. กด Deploy

Vercel จะตรวจพบ Next.js และใช้ `npm run build` โดยอัตโนมัติ

## Deploy ด้วย Docker

สร้าง `.env.local` ให้ครบก่อน แล้วใช้:

```bash
docker compose up -d --build
```

เว็บไซต์จะทำงานที่พอร์ต `3000` ควรวางหลัง HTTPS reverse proxy เช่น Cloudflare หรือ Nginx ก่อนเปิดใช้งานจริง

## อัปโหลดขึ้น Public GitHub

```bash
git init
git add .
git commit -m "Initial secure project impact dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

## ความปลอดภัย

- Repository ไม่มีข้อมูลรายบุคคลและไม่มีค่าลับจริง
- อย่าใช้รหัสผ่าน `admin` ในระบบจริง เพราะเดาได้ง่ายมาก
- เปลี่ยนรหัสผ่านโดยสร้าง Hash ใหม่ แล้วแก้ `DASHBOARD_PASSWORD_HASH` บนระบบ Hosting
- Google Sheet ต้นทางไม่ควรเปิดสาธารณะ ควรเปลี่ยนเป็นการเข้าถึงแบบยืนยันตัวตนก่อนใช้ในวงกว้าง
- ระบบนี้เป็นบัญชีผู้ดูแลร่วมหนึ่งบัญชี หากต้องการหลายผู้ใช้ ประวัติการเข้าสู่ระบบ หรือกำหนดสิทธิ์รายคน ควรใช้ Identity Provider เช่น Google Workspace หรือ Cloudflare Access

## คำสั่งสำคัญ

| คำสั่ง | ความหมาย |
|---|---|
| `npm run dev` | เปิดระบบสำหรับพัฒนา |
| `npm run lint` | ตรวจมาตรฐานโค้ด |
| `npm run build` | สร้างเวอร์ชัน Production |
| `npm run start` | เปิด Production Server |
| `npm run create-password -- "..."` | สร้าง Password Hash และ Session Secret |
