"use client";

import {
  BarChart3,
  Bell,
  Bookmark as BookmarkIcon,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  Home,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Bookmark = {
  id: string;
  videoId: string;
  name: string | null;
  timestamp: number;
  createdAt?: string;
};

type Progress = {
  videoId: string;
  position: number;
  duration: number;
  updatedAt?: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

type Lesson = {
  id: string;
  title: string;
  topic: string;
  duration: number;
  course: string;
  source: string;
  poster: string;
  progress: number;
  art: string;
};

const lessons: Lesson[] = [
  {
    id: "react-hooks",
    title: "React Hooks: State & Effects",
    topic: "Modern React · Lesson 7 of 10",
    duration: 1320,
    course: "React Foundations",
    source: "/react-hooks-lesson.mp4",
    poster: "/react-hooks-poster.png",
    progress: 68,
    art: "react",
  },
  {
    id: "javascript-essentials",
    title: "JavaScript Essentials",
    topic: "Variables & data types",
    duration: 1320,
    course: "Web Development Basics",
    source: "/react-hooks-lesson.mp4",
    poster: "/react-hooks-poster.png",
    progress: 62,
    art: "js",
  },
  {
    id: "css-flexbox",
    title: "CSS Flexbox",
    topic: "Building flexible layouts",
    duration: 1320,
    course: "Responsive Interfaces",
    source: "/react-hooks-lesson.mp4",
    poster: "/react-hooks-poster.png",
    progress: 71,
    art: "css",
  },
  {
    id: "typescript-basics",
    title: "TypeScript Basics",
    topic: "Types & interfaces",
    duration: 1320,
    course: "Type-safe Applications",
    source: "/react-hooks-lesson.mp4",
    poster: "/react-hooks-poster.png",
    progress: 83,
    art: "ts",
  },
];

const initialBookmarks: Bookmark[] = [
  { id: "seed-1", videoId: "react-hooks", name: "useState basics", timestamp: 122 },
  { id: "seed-2", videoId: "react-hooks", name: "Effect cleanup", timestamp: 645 },
  { id: "seed-3", videoId: "react-hooks", name: "Key takeaway", timestamp: 1110 },
];

const formatTime = (seconds: number) => {
  const value = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(value / 60);
  return `${String(minutes).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function AuthScreen({ onAuthenticated }: { onAuthenticated: (student: Student) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const authenticate = async (action: "login" | "signup" | "demo") => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, name, email, password }),
      });
      const data = await response.json() as { user?: Student; error?: string };
      if (!response.ok || !data.user) throw new Error(data.error || "Unable to sign in");
      onAuthenticated(data.user);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void authenticate(mode);
  };

  const changeMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setError(null);
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-brand"><LogoMark /><span>Learnly</span></div>
        <div className="auth-story-copy">
          <p className="auth-kicker"><Sparkles size={15} /> Learn with momentum</p>
          <h1>Every great skill starts with one focused lesson.</h1>
          <p>Watch, bookmark the moments that matter, and return exactly where you left off.</p>
        </div>
        <div className="auth-preview-card">
          <div className="auth-video-mini"><Play size={22} fill="currentColor" /><span>10:45</span></div>
          <div><strong>React Hooks: State & Effects</strong><span>Resume from your saved bookmark</span></div>
          <BookmarkIcon size={20} />
        </div>
        <div className="auth-feature-row">
          <span><BookmarkIcon size={16} /> Timestamp bookmarks</span>
          <span><BarChart3 size={16} /> Progress tracking</span>
          <span><ShieldCheck size={16} /> Protected lessons</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-icon"><GraduationCap size={25} /></div>
          <p className="section-label">Student portal</p>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="auth-subtitle">{mode === "login" ? "Sign in to continue your learning journey." : "Start saving lessons, bookmarks and progress."}</p>

          <div className="auth-tabs" role="tablist" aria-label="Authentication options">
            <button className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")} role="tab" aria-selected={mode === "login"}><LogIn size={16} /> Log in</button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")} role="tab" aria-selected={mode === "signup"}><UserPlus size={16} /> Sign up</button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === "signup" && (
              <label><span>Full name</span><div><UserPlus size={17} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Sowmya Kathari" autoComplete="name" required minLength={2} /></div></label>
            )}
            <label><span>Email address</span><div><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="student@example.com" autoComplete="email" required /></div></label>
            <label><span>Password</span><div><LockKeyhole size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} /></div></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>
              <span>{submitting ? "Please wait…" : mode === "login" ? "Continue learning" : "Create student account"}</span>
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="auth-divider"><span>or explore instantly</span></div>
          <button className="demo-button" onClick={() => void authenticate("demo")} disabled={submitting}><Play size={16} fill="currentColor" /> Enter demo portal</button>
          <p className="auth-security"><ShieldCheck size={14} /> Passwords are salted and securely hashed. Sessions use an HTTP-only cookie.</p>
        </div>
      </section>
    </main>
  );
}

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <span />
      <span />
      <Sparkles size={13} strokeWidth={2.4} />
    </span>
  );
}

function Sidebar({ open, close }: { open: boolean; close: () => void }) {
  const nav = [
    { label: "Overview", icon: Home, active: true },
    { label: "My Courses", icon: BookOpen },
    { label: "Bookmarks", icon: BookmarkIcon },
    { label: "Progress", icon: BarChart3 },
  ];

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand"><LogoMark /><span>Learnly</span></div>
      <button className="sidebar-close icon-button" onClick={close} aria-label="Close navigation"><X /></button>
      <nav aria-label="Primary navigation">
        {nav.map(({ label, icon: Icon, active }) => (
          <button className={`nav-item ${active ? "active" : ""}`} key={label} onClick={close}>
            <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="streak-card">
        <div className="streak-label"><Flame size={18} /> Study streak</div>
        <strong>12 <span>days</span></strong>
        <p>Keep showing up. You&apos;re on a roll!</p>
        <div className="streak-art"><Flame size={64} fill="currentColor" /></div>
      </div>
    </aside>
  );
}

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  const [activeLesson, setActiveLesson] = useState(lessons[0]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [currentTime, setCurrentTime] = useState(734);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(activeLesson.duration);
  const [formOpen, setFormOpen] = useState(false);
  const [bookmarkName, setBookmarkName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watermarkIndex, setWatermarkIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [recentProgress, setRecentProgress] = useState<Record<string, Progress>>({});

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/auth")
      .then(async (response) => {
        const data = await response.json() as { user?: Student | null };
        if (active) setStudent(response.ok ? data.user ?? null : null);
      })
      .catch(() => {
        if (active) setStudent(null);
      });
    return () => { active = false; };
  }, []);

  const loadLearningState = useCallback(async (videoId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/learning?videoId=${encodeURIComponent(videoId)}`);
      if (response.status === 401) {
        setStudent(null);
        return;
      }
      if (!response.ok) throw new Error("Unable to load learning state");
      const data = (await response.json()) as { bookmarks: Bookmark[]; progress: Progress | null };
      setBookmarks(data.bookmarks ?? []);
      const position = Math.min(data.progress?.position ?? 0, activeLesson.duration - 1);
      setCurrentTime(position);
      if (videoRef.current) videoRef.current.currentTime = position;
    } catch {
      setBookmarks(videoId === "react-hooks" ? initialBookmarks : []);
    } finally {
      setLoading(false);
    }
  }, [activeLesson.duration]);

  useEffect(() => {
    if (!student) return;
    const frame = window.requestAnimationFrame(() => {
      void loadLearningState(activeLesson.id);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeLesson.id, loadLearningState, student]);

  useEffect(() => {
    if (!student) return;
    let active = true;
    void fetch("/api/learning?recent=1")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as { progress?: Progress[] };
        if (!active) return;
        setRecentProgress(Object.fromEntries((data.progress ?? []).map((item) => [item.videoId, item])));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [student]);

  useEffect(() => {
    const interval = window.setInterval(() => setWatermarkIndex((index) => (index + 1) % 4), 14000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const pauseForPrivacy = () => {
      if (document.hidden || !document.hasFocus()) {
        videoRef.current?.pause();
        setPlaying(false);
        setPrivacyVisible(true);
      }
    };
    const restore = () => {
      if (!document.hidden && document.hasFocus()) setPrivacyVisible(false);
    };
    const blockContext = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest(".player-shell")) event.preventDefault();
    };
    const shortcutGuard = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen") {
        videoRef.current?.pause();
        setPlaying(false);
        setPrivacyVisible(true);
        showNotice("Playback paused to protect learning content");
      }
    };
    document.addEventListener("visibilitychange", pauseForPrivacy);
    window.addEventListener("blur", pauseForPrivacy);
    window.addEventListener("focus", restore);
    window.addEventListener("keyup", shortcutGuard);
    document.addEventListener("contextmenu", blockContext);
    return () => {
      document.removeEventListener("visibilitychange", pauseForPrivacy);
      window.removeEventListener("blur", pauseForPrivacy);
      window.removeEventListener("focus", restore);
      window.removeEventListener("keyup", shortcutGuard);
      document.removeEventListener("contextmenu", blockContext);
    };
  }, [showNotice]);

  const saveProgress = useCallback((position: number, total: number) => {
    setRecentProgress((items) => ({
      ...items,
      [activeLesson.id]: {
        videoId: activeLesson.id,
        position,
        duration: total,
        updatedAt: new Date().toISOString(),
      },
    }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "progress", videoId: activeLesson.id, position, duration: total }),
      }).catch(() => undefined);
    }, 500);
  }, [activeLesson.id]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        showNotice("Select play once the lesson has loaded");
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const seekTo = (time: number, autoplay = true) => {
    const safeTime = Math.min(time, Math.max(0, duration - 0.25));
    setCurrentTime(safeTime);
    if (videoRef.current) {
      videoRef.current.currentTime = safeTime;
      if (autoplay) {
        void videoRef.current.play().then(() => setPlaying(true)).catch(() => undefined);
      }
    }
    saveProgress(safeTime, duration);
  };

  const addBookmark = async (event: FormEvent) => {
    event.preventDefault();
    if (editId) {
      const current = bookmarks.find((bookmark) => bookmark.id === editId);
      if (!current) return;
      const nextName = bookmarkName.trim() || null;
      setBookmarks((items) => items.map((item) => item.id === editId ? { ...item, name: nextName } : item));
      void fetch("/api/learning", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name: nextName }),
      }).catch(() => undefined);
      showNotice("Bookmark updated");
    } else {
      const optimistic: Bookmark = {
        id: createId(),
        videoId: activeLesson.id,
        name: bookmarkName.trim() || null,
        timestamp: Math.round(currentTime),
      };
      setBookmarks((items) => [...items, optimistic].sort((a, b) => a.timestamp - b.timestamp));
      try {
        const response = await fetch("/api/learning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bookmark", ...optimistic }),
        });
        if (response.ok) {
          const data = (await response.json()) as { bookmark: Bookmark };
          setBookmarks((items) => items.map((item) => item.id === optimistic.id ? data.bookmark : item));
        }
      } catch {
        // The optimistic bookmark remains available for this session.
      }
      showNotice(`Bookmark saved at ${formatTime(currentTime)}`);
    }
    setBookmarkName("");
    setEditId(null);
    setFormOpen(false);
  };

  const openEdit = (bookmark: Bookmark) => {
    setEditId(bookmark.id);
    setBookmarkName(bookmark.name ?? "");
    setFormOpen(true);
    setMenuId(null);
  };

  const deleteBookmark = (id: string) => {
    setBookmarks((items) => items.filter((item) => item.id !== id));
    setMenuId(null);
    void fetch(`/api/learning?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => undefined);
    showNotice("Bookmark deleted");
  };

  const progressPercent = useMemo(() => Math.min(100, Math.round((currentTime / Math.max(duration, 1)) * 100)), [currentTime, duration]);
  const sortedBookmarks = useMemo(() => [...bookmarks].sort((a, b) => a.timestamp - b.timestamp), [bookmarks]);
  const recentLessons = useMemo(() => lessons
    .filter((lesson) => lesson.id !== activeLesson.id)
    .sort((first, second) => {
      const firstTime = recentProgress[first.id]?.updatedAt ?? "";
      const secondTime = recentProgress[second.id]?.updatedAt ?? "";
      return secondTime.localeCompare(firstTime);
    })
    .slice(0, 3), [activeLesson.id, recentProgress]);

  const switchLesson = (lesson: Lesson) => {
    videoRef.current?.pause();
    setPlaying(false);
    setActiveLesson(lesson);
    setCurrentTime(0);
    setDuration(lesson.duration);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const signOut = async () => {
    videoRef.current?.pause();
    setPlaying(false);
    setProfileOpen(false);
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => undefined);
    setStudent(null);
  };

  if (student === undefined) {
    return <main className="auth-loading"><LogoMark /><strong>Learnly</strong><span>Preparing your learning space…</span></main>;
  }

  if (student === null) return <AuthScreen onAuthenticated={setStudent} />;

  const firstName = student.name.split(/\s+/)[0] || "Student";
  const initials = student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ST";

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} close={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div className="welcome">
            <p className="eyebrow">Tuesday, July 14</p>
            <h1>Good afternoon, {firstName}</h1>
            <span>Ready to keep your momentum going?</span>
          </div>
          <label className="search-box">
            <Search size={20} />
            <input aria-label="Search lessons" placeholder="Search lessons, topics or courses" />
            <kbd>⌘ K</kbd>
          </label>
          <button className="notification icon-button" aria-label="Notifications"><Bell size={20} /><span /></button>
          <div className="profile-wrap">
            <button className="avatar" onClick={() => setProfileOpen((open) => !open)} aria-label={`${student.name} profile`} aria-expanded={profileOpen}>{initials}</button>
            {profileOpen && (
              <div className="profile-menu">
                <div><strong>{student.name}</strong><span>{student.email}</span></div>
                <button onClick={() => void signOut()}><LogOut size={16} /> Log out</button>
              </div>
            )}
          </div>
        </header>

        <section className="learning-grid" aria-label="Current learning">
          <article className="lesson-card">
            <div className="lesson-heading">
              <div>
                <p className="section-label">Current lesson</p>
                <h2>{activeLesson.title}</h2>
                <span>{activeLesson.topic}</span>
              </div>
              <span className="lesson-duration"><Clock3 size={16} /> {formatTime(activeLesson.duration)}</span>
            </div>

            <div className="player-shell">
              <video
                ref={videoRef}
                src={activeLesson.source}
                poster={activeLesson.poster}
                preload="metadata"
                playsInline
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onLoadedMetadata={(event) => {
                  const natural = event.currentTarget.duration;
                  const total = Number.isFinite(natural) && natural > 0 ? natural : activeLesson.duration;
                  setDuration(total);
                  event.currentTarget.currentTime = Math.min(currentTime, Math.max(total - 0.25, 0));
                }}
                onTimeUpdate={(event) => {
                  const time = event.currentTarget.currentTime;
                  setCurrentTime(time);
                  saveProgress(time, event.currentTarget.duration || duration);
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
              <div className={`learner-watermark position-${watermarkIndex}`}>{student.name} · Learnly</div>
              {privacyVisible && (
                <button className="privacy-overlay" onClick={() => setPrivacyVisible(false)}>
                  <ShieldCheck size={30} />
                  <strong>Learning content protected</strong>
                  <span>Return to the lesson to continue watching</span>
                </button>
              )}
              <button className="center-play" onClick={togglePlayback} aria-label={playing ? "Pause lesson" : "Play lesson"}>
                {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
              </button>
              <div className="custom-controls">
                <input
                  type="range"
                  min="0"
                  max={Math.max(duration, 1)}
                  step="0.1"
                  value={Math.min(currentTime, duration)}
                  onChange={(event) => seekTo(Number(event.target.value), false)}
                  style={{ "--played": `${progressPercent}%` } as React.CSSProperties}
                  aria-label="Lesson progress"
                />
                <div className="control-row">
                  <button onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
                  <span>{formatTime(currentTime)} <i>/</i> {formatTime(duration)}</span>
                  <span className="protected-badge"><ShieldCheck size={15} /> Protected viewing</span>
                </div>
              </div>
            </div>

            <div className="lesson-footer">
              <div className="progress-summary">
                <div><span>Course progress</span><strong>{Math.max(activeLesson.progress, progressPercent)}%</strong></div>
                <div className="progress-track"><span style={{ width: `${Math.max(activeLesson.progress, progressPercent)}%` }} /></div>
              </div>
              <button className="primary-button" onClick={() => void togglePlayback()}>{playing ? "Pause lesson" : "Continue learning"}<ChevronRight size={19} /></button>
            </div>
          </article>

          <aside className="right-rail">
            <section className="bookmarks-card card">
              <div className="card-title-row">
                <div><p className="section-label">Jump back in</p><h2>Your bookmarks</h2></div>
                <span className="title-icon"><BookmarkIcon size={19} /></span>
              </div>

              <div className="bookmark-list" aria-live="polite">
                {loading && <div className="bookmark-skeleton" />}
                {!loading && sortedBookmarks.length === 0 && (
                  <div className="empty-bookmarks"><BookmarkIcon size={26} /><strong>No bookmarks yet</strong><span>Save a moment you want to revisit.</span></div>
                )}
                {!loading && sortedBookmarks.map((bookmark) => (
                  <div className="bookmark-row" key={bookmark.id}>
                    <button className="bookmark-main" onClick={() => seekTo(bookmark.timestamp)} aria-label={`Play from ${formatTime(bookmark.timestamp)}`}>
                      <span className="timestamp">{formatTime(bookmark.timestamp)}</span>
                      <span className="bookmark-copy"><strong>{bookmark.name || "Untitled moment"}</strong><small>Resume from here</small></span>
                      <span className="row-play"><Play size={15} fill="currentColor" /></span>
                    </button>
                    <button className="more-button" onClick={() => setMenuId(menuId === bookmark.id ? null : bookmark.id)} aria-label="Bookmark actions"><MoreVertical size={18} /></button>
                    {menuId === bookmark.id && (
                      <div className="bookmark-menu">
                        <button onClick={() => openEdit(bookmark)}><Pencil size={15} /> Edit title</button>
                        <button className="danger" onClick={() => deleteBookmark(bookmark.id)}><Trash2 size={15} /> Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {formOpen ? (
                <form className="bookmark-form" onSubmit={addBookmark}>
                  <div className="form-heading"><strong>{editId ? "Edit bookmark" : "Save this moment"}</strong><span>{editId ? "Keep the same timestamp" : `Current time ${formatTime(currentTime)}`}</span></div>
                  <input autoFocus value={bookmarkName} onChange={(event) => setBookmarkName(event.target.value)} placeholder="Bookmark name (optional)" maxLength={70} aria-label="Bookmark name" />
                  <div className="form-actions">
                    <button type="button" onClick={() => { setFormOpen(false); setEditId(null); setBookmarkName(""); }}>Cancel</button>
                    <button type="submit"><Check size={16} /> {editId ? "Save" : "Add bookmark"}</button>
                  </div>
                </form>
              ) : (
                <button className="add-bookmark" onClick={() => setFormOpen(true)}><Plus size={19} /> Add bookmark <span>{formatTime(currentTime)}</span></button>
              )}
            </section>

            <section className="course-card card">
              <div className="course-art"><span>⚛</span></div>
              <div className="course-copy"><p className="section-label">In progress</p><h3>{activeLesson.course}</h3><span>7 of 10 lessons</span><div className="lesson-dots">{Array.from({ length: 10 }).map((_, index) => <i className={index < 7 ? "done" : ""} key={index} />)}</div></div>
              <div className="progress-ring" style={{ "--progress": "70%" } as React.CSSProperties}><strong>70%</strong></div>
            </section>

            <section className="protection-note">
              <ShieldCheck size={19} />
              <div><strong>Protected lesson</strong><span>Watermarked and privacy-aware playback</span></div>
            </section>
          </aside>
        </section>

        <section className="continue-section">
          <div className="section-header"><div><p className="section-label">Recently watched</p><h2>Continue where you left off</h2></div><button>View all <ChevronRight size={17} /></button></div>
          <div className="course-grid">
            {recentLessons.map((lesson) => {
              const saved = recentProgress[lesson.id];
              const savedPercent = saved ? Math.min(100, Math.round((saved.position / Math.max(saved.duration, 1)) * 100)) : lesson.progress;
              return (
                <button className="continue-card" key={lesson.id} onClick={() => switchLesson(lesson)}>
                  <div className={`mini-art ${lesson.art}`}><span>{lesson.art === "js" ? "JS" : lesson.art === "css" ? "◇" : lesson.art === "react" ? "⚛" : "TS"}</span></div>
                  <div className="continue-copy"><strong>{lesson.title}</strong><span>{saved ? `${savedPercent}% watched · Resume at ${formatTime(saved.position)}` : lesson.topic}</span><div className="mini-progress"><i style={{ width: `${savedPercent}%` }} /></div></div>
                  <span className="mini-play"><Play size={15} fill="currentColor" /></span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="experience-note">
          <Sparkles size={17} />
          <span>Tip: add a bookmark whenever a concept clicks. You can create as many as you need for each lesson.</span>
        </footer>
      </main>

      {notice && <div className="toast"><Check size={17} /> {notice}</div>}
    </div>
  );
}
