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

export function createWaitlistEntry({
  email,
  name = "",
  source = "landing",
  userAgent = "",
  now = new Date(),
}) {
  const normalizedEmail = normalizeWaitlistEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  return {
    createdAt: now.toISOString(),
    email: normalizedEmail,
    name: String(name ?? "").trim(),
    source,
    userAgent,
  };
}

export async function postWaitlistWebhook({
  webhookUrl,
  secret = "",
  entry,
  fetchImpl = fetch,
}) {
  if (!webhookUrl) {
    return { ok: false, reason: "missing-webhook" };
  }

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      secret,
      ...entry,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    return {
      ok: false,
      reason: data?.error ?? `Webhook failed with status ${response.status}`,
    };
  }

  return {
    ok: true,
    alreadyJoined: Boolean(data?.alreadyJoined),
  };
}

export async function addWaitlistEmail({
  filePath,
  email,
  name = "",
  source = "landing",
  userAgent = "",
  now = new Date(),
}) {
  const entry = createWaitlistEntry({ email, name, source, userAgent, now });
  if (!entry) {
    return { ok: false, reason: "invalid-email" };
  }

  await mkdir(dirname(filePath), { recursive: true });

  const existing = await readFile(filePath, "utf8").catch((error) => {
    if (error?.code === "ENOENT") return "";
    throw error;
  });
  const alreadyJoined = existing.toLowerCase().includes(`"${entry.email}"`);

  if (!alreadyJoined && existing.length === 0) {
    await appendFile(filePath, "createdAt,email,name,source,userAgent\n", "utf8");
  }

  if (!alreadyJoined) {
    await appendFile(
      filePath,
      `${waitlistEntryToCsv(entry)}\n`,
      "utf8",
    );
  }

  return { ok: true, email: entry.email, alreadyJoined };
}
