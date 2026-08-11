import { pbkdf2Sync, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : "";
const password = args.find((arg, index) => index !== outputIndex && index !== outputIndex + 1 && !arg.startsWith("--")) ?? process.env.DASHBOARD_PASSWORD;
if (!password) {
  console.error('Usage: npm run create-password -- "YOUR_PASSWORD"');
  console.error('Optional: --output .env.local (also set GOOGLE_SHEET_ID and DASHBOARD_USERNAME)');
  process.exit(1);
}

const iterations = 210_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const passwordHash = `pbkdf2-sha256$${iterations}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
const authSecret = randomBytes(32).toString("base64url");
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

if (outputPath) {
  const username = process.env.DASHBOARD_USERNAME?.trim() || "admin";
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim() || "YOUR_GOOGLE_SHEET_ID";
  const contents = [
    `GOOGLE_SHEET_ID=${quote(sheetId)}`,
    `DASHBOARD_USERNAME=${quote(username)}`,
    `DASHBOARD_PASSWORD_HASH=${quote(passwordHash)}`,
    `AUTH_SECRET=${quote(authSecret)}`,
    "",
  ].join("\n");
  const destination = resolve(outputPath);
  writeFileSync(destination, contents, { encoding: "utf8", flag: "wx", mode: 0o600 });
  console.log(`Created private environment file: ${destination}`);
} else {
  console.log(`DASHBOARD_PASSWORD_HASH=${passwordHash}`);
  console.log(`AUTH_SECRET=${authSecret}`);
}
