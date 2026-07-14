import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../db";
import { sessions, users } from "../db/schema";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export const SESSION_COOKIE = "learnly_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const fromHex = (value: string) => {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) return new Uint8Array();
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
};

export const randomToken = (bytes = 32) => {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return toHex(value);
};

export async function hashPassword(password: string, saltHex = randomToken(16)) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations: 100_000 },
    passwordKey,
    256,
  );
  return { hash: toHex(new Uint8Array(bits)), salt: saltHex };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string) {
  const { hash } = await hashPassword(password, salt);
  if (hash.length !== expectedHash.length) return false;
  let difference = 0;
  for (let index = 0; index < hash.length; index += 1) {
    difference |= hash.charCodeAt(index) ^ expectedHash.charCodeAt(index);
  }
  return difference === 0;
}

export const readCookie = (request: Request, name: string) => {
  const cookies = request.headers.get("cookie") ?? "";
  for (const part of cookies.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
};

export const sessionCookie = (request: Request, token: string, maxAge = SESSION_SECONDS) => {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
};

export async function createSession(userId: string) {
  const db = getDb();
  const id = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  await db.insert(sessions).values({ id, userId, expiresAt });
  return id;
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const db = getDb();
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date().toISOString())))
    .limit(1);
  return user ?? null;
}
