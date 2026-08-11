# แดชบอร์ดผลลัพธ์ผู้เข้าร่วมโครงการ Super AI Engineer

แดชบอร์ดภาษาไทยสำหรับติดตามเส้นทางของผู้เข้าร่วมโครงการ โดยดึงข้อมูลล่าสุดจาก Google Sheets และแสดงทั้งภาพรวมเชิงนโยบายกับรายละเอียดรายบุคคล

## ความสามารถหลัก

- สรุปสถานะ 4 กลุ่ม: ทำงาน, เรียน, เรียนและทำงาน, ว่างงาน
- จำแนกรูปแบบการทำงาน Track, Season, ภาคส่วน และช่วงรายได้
- ค้นหาและกรองข้อมูลรายบุคคล
- แสดงข้อมูลติดต่อ ผลงาน และหลักฐานแบบกดเปิดลิงก์ได้
- อ่านข้อมูลใหม่จาก Google Sheets อัตโนมัติทุก 60 วินาที
- รองรับหน้าจอคอมพิวเตอร์ แท็บเล็ต และโทรศัพท์

## ข้อกำหนด

- Node.js `>=22.13.0`
- Google Sheet ที่เปิดให้เซิร์ฟเวอร์อ่านข้อมูลได้
- ชื่อชีทตามที่กำหนดใน `app/api/participants/route.ts`

## เริ่มต้นใช้งาน

1. ติดตั้งแพ็กเกจ

   ```bash
   npm install
   ```

2. คัดลอก `.env.example` เป็น `.env.local`

   ```bash
   cp .env.example .env.local
   ```

3. ใส่รหัส Google Sheet ใน `.env.local`

   ```env
   GOOGLE_SHEET_ID=YOUR_GOOGLE_SHEET_ID
   ```

   รหัสชีทคือข้อความระหว่าง `/d/` และ `/edit` ใน URL ของ Google Sheets

4. เปิดเซิร์ฟเวอร์สำหรับพัฒนา

   ```bash
   npm run dev
   ```

5. ตรวจโค้ด

   ```bash
   npm run lint
   ```

## อัปโหลดขึ้น GitHub

หลังแตกไฟล์ ZIP ให้เปิดโฟลเดอร์นี้ใน Terminal แล้วใช้คำสั่ง:

```bash
git init
git add .
git commit -m "Initial project impact dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

หรือสร้าง Repository บน GitHub แล้วใช้เมนู **Add file → Upload files** เพื่ออัปโหลดไฟล์ทั้งหมดในโฟลเดอร์ที่แตกออกมา

## การนำเว็บไซต์ขึ้นใช้งาน

GitHub ใช้เก็บซอร์สโค้ดเท่านั้น แดชบอร์ดนี้มี API ฝั่งเซิร์ฟเวอร์ จึงต้องนำไป Deploy บนบริการที่รองรับ Node.js หรือ Cloudflare Workers และตั้งค่า `GOOGLE_SHEET_ID` ใน Environment Variables ของบริการนั้นด้วย

## ความปลอดภัยของข้อมูล

Repository นี้ไม่ได้บรรจุข้อมูลรายบุคคลหรือรหัส Google Sheet จริง อย่างไรก็ตาม แดชบอร์ดจะแสดงอีเมล เบอร์โทร และที่อยู่จากชีทเมื่อเปิดรายละเอียดรายบุคคล จึงควร:

- จำกัดสิทธิ์เว็บไซต์ให้เฉพาะผู้มีหน้าที่ใช้งาน
- ไม่ commit ไฟล์ `.env.local`
- หลีกเลี่ยงการเปิด Google Sheet แบบสาธารณะ
- ใช้บัญชีบริการหรือระบบยืนยันตัวตนก่อนใช้งานจริงในวงกว้าง

## เทคโนโลยี

- React / Next.js
- Vinext / Vite
- Cloudflare Worker runtime
- Tailwind CSS
- Noto Sans Thai
