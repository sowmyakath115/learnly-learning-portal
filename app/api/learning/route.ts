import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookmarks, watchProgress } from "../../../db/schema";
import { getSessionUser } from "../../../lib/auth";

const seedBookmarks = [
  { id: "seed-1", name: "useState basics", timestamp: 122 },
  { id: "seed-2", name: "Effect cleanup", timestamp: 645 },
  { id: "seed-3", name: "Key takeaway", timestamp: 1110 },
];

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
    const userId = user.id;
    const db = getDb();

    if (url.searchParams.get("recent") === "1") {
      const progress = await db.select().from(watchProgress)
        .where(eq(watchProgress.userId, userId))
        .orderBy(desc(watchProgress.updatedAt));
      return Response.json({ progress });
    }

    const videoId = url.searchParams.get("videoId")?.trim();
    if (!videoId) return Response.json({ error: "videoId is required" }, { status: 400 });

    let rows = await db.select().from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.videoId, videoId)))
      .orderBy(asc(bookmarks.timestamp));

    if (rows.length === 0 && videoId === "react-hooks") {
      await db.insert(bookmarks).values(seedBookmarks.map((item) => ({
        ...item,
        id: `${userId}:${item.id}`,
        userId,
        videoId,
      }))).onConflictDoNothing();
      rows = await db.select().from(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.videoId, videoId)))
        .orderBy(asc(bookmarks.timestamp));
    }

    const [progress] = await db.select().from(watchProgress)
      .where(and(eq(watchProgress.userId, userId), eq(watchProgress.videoId, videoId)))
      .limit(1);

    return Response.json({ bookmarks: rows, progress: progress ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load learning state";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
    const userId = user.id;
    const payload = await request.json() as {
      action?: "bookmark" | "progress";
      id?: string;
      videoId?: string;
      name?: string | null;
      timestamp?: number;
      position?: number;
      duration?: number;
    };
    if (!payload.videoId) return Response.json({ error: "videoId is required" }, { status: 400 });

    const db = getDb();
    if (payload.action === "progress") {
      const position = Math.max(0, Math.round(payload.position ?? 0));
      const duration = Math.max(0, Math.round(payload.duration ?? 0));
      await db.insert(watchProgress).values({ userId, videoId: payload.videoId, position, duration })
        .onConflictDoUpdate({
          target: [watchProgress.userId, watchProgress.videoId],
          set: { position, duration, updatedAt: new Date().toISOString() },
        });
      return Response.json({ progress: { videoId: payload.videoId, position, duration } });
    }

    const timestamp = Math.max(0, Math.round(payload.timestamp ?? 0));
    const id = payload.id || createId();
    const [bookmark] = await db.insert(bookmarks).values({
      id,
      userId,
      videoId: payload.videoId,
      name: payload.name?.trim() || null,
      timestamp,
    }).returning();
    return Response.json({ bookmark }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save learning state";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
    const userId = user.id;
    const payload = await request.json() as { id?: string; name?: string | null };
    if (!payload.id) return Response.json({ error: "id is required" }, { status: 400 });
    const db = getDb();
    const [bookmark] = await db.update(bookmarks)
      .set({ name: payload.name?.trim() || null })
      .where(and(eq(bookmarks.id, payload.id), eq(bookmarks.userId, userId)))
      .returning();
    if (!bookmark) return Response.json({ error: "Bookmark not found" }, { status: 404 });
    return Response.json({ bookmark });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update bookmark";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
    const userId = user.id;
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });
    const db = getDb();
    await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete bookmark";
    return Response.json({ error: message }, { status: 500 });
  }
}
