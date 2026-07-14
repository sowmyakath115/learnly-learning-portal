# Learnly Learning Portal

Learnly is a responsive learning dashboard where students can watch lessons, save multiple timestamped bookmarks per video, and resume from the exact bookmarked moment. The interface follows the **Bright Momentum Bento** direction: a high-energy indigo workspace with compact progress cards and clear learning actions.

## Live Demo

https://learnly-portal.sowmyakatari115.chatgpt.site

## Features

- Custom 22-minute educational video lesson with accessible playback controls
- Multiple bookmarks per video with an optional name and exact timestamp
- One-click resume from any saved timestamp
- Edit and delete bookmark actions
- Persistent bookmarks and watch progress through a D1-backed API
- Continue Watching and student-specific recently viewed courses
- Login, signup, logout, and one-click demo access
- Salted PBKDF2 password hashing and HTTP-only session cookies
- Responsive desktop, tablet, and mobile layouts
- Personalized moving watermark and protected-viewing deterrents
- Friendly empty, loading, success, and error states

## Technology

- React 19 with TypeScript
- Vinext (Next-compatible routing on Cloudflare Workers)
- Cloudflare D1 and Drizzle ORM
- CSS with responsive media queries and motion preferences
- Lucide React icons

## Local Setup

Prerequisites: Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm run db:generate
npm run build
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/learning?videoId=...` | List bookmarks and fetch saved progress |
| `GET` | `/api/learning?recent=1` | Fetch recently watched lessons |
| `POST` | `/api/learning` | Create a bookmark or save watch progress |
| `PATCH` | `/api/learning` | Rename a bookmark |
| `DELETE` | `/api/learning?id=...` | Delete a bookmark |
| `GET` | `/api/auth` | Restore the current student session |
| `POST` | `/api/auth` | Sign up, log in, enter demo mode, or log out |

Student passwords are never stored directly. They are salted and hashed with PBKDF2-SHA-256, while seven-day sessions are stored in D1 and delivered through HTTP-only, SameSite cookies. Bookmark and progress routes reject unauthenticated requests and scope every query to the active student ID.

## Screenshot Protection Approach

Browsers cannot guarantee screenshot blocking because operating-system capture tools run outside the webpage. Learnly uses practical deterrents:

- a personalized watermark that moves around the player
- automatic pause and a privacy shield when the page loses visibility or focus
- Print Screen key detection with a visible protection notice
- disabled picture-in-picture, download, remote playback, and player context menu
- `controlsList` media restrictions and a protected-viewing indicator

These measures discourage casual capture and make leaked content attributable, but they cannot prevent every OS-level screenshot, screen recording, or external camera.

## Project Structure

```text
app/page.tsx                 Learning dashboard and video interactions
app/globals.css              Bright Momentum Bento visual system
app/api/auth/route.ts        Student authentication API
app/api/learning/route.ts    Bookmark and progress API
lib/auth.ts                  Password hashing and session helpers
db/schema.ts                 D1/Drizzle data model
drizzle/                     Generated SQL migrations
public/                      Lesson video and poster assets
```
