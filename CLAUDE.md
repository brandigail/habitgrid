# HabitGrid: Minimalist Habit Tracker

Read the portfolio-root `CLAUDE.md` first for global rules. This file is the brief for this project.

## What it is
A tiny, fast PWA for daily habits. Tick habits off, watch your 365-day heatmap fill in, keep streaks alive and get gentle reminders.

## Stack
React, Vite, TypeScript strict, Tailwind CSS, IndexedDB via `idb` (or Dexie), vite-plugin-pwa. No backend required. Hosted on Netlify. No Supabase, no Vercel, no Gemini/OpenAI.

## MVP (build first)
1. Habits CRUD with categories, colours and daily check-in (tap to toggle today, backfill past days).
2. 365-day heatmap per habit and overall, built as an SVG/CSS grid component.
3. Streak engine (current and longest) with unit tests, plus a stats summary.

## Phase 2
Reminder notifications (Notification API / periodic reminders where supported), Weekly-target habits (3x per week), Data export/import JSON, Optional Neon sync.

## Data model (put in `types/`)
```ts
export interface Habit { id: string; name: string; category: string; color: string; createdAt: string; archivedAt: string | null }
export interface Completion { habitId: string; date: string } // date = YYYY-MM-DD in local time
export interface Settings { reminderTime: string | null; theme: 'light' | 'dark' | 'system' }
```

## Rules specific to this project
- Use local-date strings (YYYY-MM-DD), never UTC timestamps, for completions to avoid timezone streak bugs.
- Performance budget: initial JS under ~100 kB gzipped; check with Lighthouse and report the load time.
- Notifications require permission and are only best-effort on mobile PWAs; state limits in the README.
- Seed a year of realistic completion data.
- Seed realistic demo data so the app looks alive on first load without sign-up.

## Start here
1. Scaffold Vite + Tailwind + vite-plugin-pwa, commit.
2. Write `types/`, storage layer and streak logic with tests first.
3. Work through `PLAN.md` from step 2.
