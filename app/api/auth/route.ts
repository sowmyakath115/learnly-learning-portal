import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { sessions, users } from "../../../db/schema";
import {
  createSession,
  getSessionUser,
  hashPassword,
  readCookie,
  SESSION_COOKIE,
  sessionCookie,
  verifyPassword,
} from "../../../lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const id = (prefix: string) =>
  `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`}`;

const publicUser = (user: { id: string; name: string; email: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

async function respondWithSession(request: Request, user: { id: string; name: string; email: string }) {
  const token = await createSession(user.id);
  return Response.json(
    { user: publicUser(user) },
    { headers: { "Set-Cookie": sessionCookie(request, token) } },
  );
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    return Response.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check your session";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as {
      action?: "login" | "signup" | "demo" | "logout";
      name?: string;
      email?: string;
      password?: string;
    };
    const db = getDb();

    if (payload.action === "logout") {
      const token = readCookie(request, SESSION_COOKIE);
      if (token) await db.delete(sessions).where(eq(sessions.id, token));
      return Response.json(
        { user: null },
        { headers: { "Set-Cookie": sessionCookie(request, "", 0) } },
      );
    }

    if (payload.action === "demo") {
      const demoEmail = "demo.student@learnly.app";
      let [user] = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
      if (!user) {
        const password = await hashPassword(id("demo_secret"));
        await db.insert(users).values({
          id: "learnly-demo-student",
          name: "Demo Student",
          email: demoEmail,
          passwordHash: password.hash,
          passwordSalt: password.salt,
        }).onConflictDoNothing();
        [user] = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
      }
      if (!user) return Response.json({ error: "Unable to start demo session" }, { status: 500 });
      return respondWithSession(request, user);
    }

    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";
    if (!emailPattern.test(email)) {
      return Response.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    if (payload.action === "signup") {
      const name = payload.name?.trim() ?? "";
      if (name.length < 2) return Response.json({ error: "Enter your full name" }, { status: 400 });
      if (password.length < 8) return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing) return Response.json({ error: "An account with this email already exists" }, { status: 409 });

      const secured = await hashPassword(password);
      const [user] = await db.insert(users).values({
        id: id("student"),
        name,
        email,
        passwordHash: secured.hash,
        passwordSalt: secured.salt,
      }).returning();
      return respondWithSession(request, user);
    }

    if (payload.action === "login") {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const valid = user && await verifyPassword(password, user.passwordSalt, user.passwordHash);
      if (!user || !valid) return Response.json({ error: "Incorrect email or password" }, { status: 401 });
      return respondWithSession(request, user);
    }

    return Response.json({ error: "Unsupported authentication action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
