# uoCalendar

A bilingual (English / French) calendar for uOttawa students: classes, work shifts and personal events in one place, with campus events suggested in your free time.

## Run it on your computer

1. Install **Node.js LTS** (version 22.12 or newer) from nodejs.org, and **VS Code**.
2. Get the code and install its libraries:
   ```
   git clone https://github.com/mithegr8/uocal.git
   cd uocal
   npm install
   ```
3. Start the app, then open http://localhost:5173
   ```
   npm run dev
   ```
   Keep that terminal open while you work. Use a second terminal for Git.

**Windows PowerShell:** if `npm` says "running scripts is disabled on this system", run this once:
```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## How we work

- Nobody pushes to `main`. Each task from the plan gets its own branch, named after it (e.g. `B1.1-free-slots`), and a pull request that Aminata approves.
- Lane A (screens) owns `src/components/`, `src/pages/`, `src/i18n/`. Lane B (data and services) owns `src/lib/`, `src/data/`, `supabase/`. `src/App.tsx`, `src/types.ts` and `package.json` are shared: agree before changing them.
- **Bilingual from day one:** every word the user sees comes from `src/i18n/en.ts` and `src/i18n/fr.ts`, never typed into a component. Saved data uses codes (`LEC`, `LAB`, `TUT`); the screen shows the label in the chosen language.
- Never commit passwords or API keys. They go in a `.env` file, which Git ignores.

## Where things are

| Folder / file | What it holds |
| --- | --- |
| `src/types.ts` | The shapes of our data (Student, Calendar, CalendarEvent…) |
| `src/components/` | The screens: week, month and agenda views, sidebar, forms |
| `src/i18n/` | All the words, in English and French, and the language switch |
| `src/lib/` | Date and repeat helpers (no display) |
| `src/data/sample.ts` | Sample data until the database is ready |

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the app locally |
| `npm run build` | Checks types and builds the finished website |
| `npx oxlint src` | Looks for likely mistakes |
