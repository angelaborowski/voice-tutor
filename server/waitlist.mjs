import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeWaitlistEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : "";
}

export function escapeCsvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function waitlistEntryToCsv(entry) {
  return [
    entry.createdAt,
    entry.email,
    entry.name,
    entry.source,
    entry.userAgent,
  ].map(escapeCsvValue).join(",");
}

export async function addWaitlistEmail({
  filePath,
  email,
  name = "",
  source = "landing",
  userAgent = "",
  now = new Date(),
}) {
  const normalizedEmail = normalizeWaitlistEmail(email);
  if (!normalizedEmail) {
    return { ok: false, reason: "invalid-email" };
  }

  await mkdir(dirname(filePath), { recursive: true });

  const existing = await readFile(filePath, "utf8").catch((error) => {
    if (error?.code === "ENOENT") return "";
    throw error;
  });
  const alreadyJoined = existing.toLowerCase().includes(`"${normalizedEmail}"`);

  if (!alreadyJoined && existing.length === 0) {
    await appendFile(filePath, "createdAt,email,name,source,userAgent\n", "utf8");
  }

  if (!alreadyJoined) {
    await appendFile(
      filePath,
      `${waitlistEntryToCsv({
        createdAt: now.toISOString(),
        email: normalizedEmail,
        name: String(name ?? "").trim(),
        source,
        userAgent,
      })}\n`,
      "utf8",
    );
  }

  return { ok: true, email: normalizedEmail, alreadyJoined };
}
