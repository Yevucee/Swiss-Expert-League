# 🏆 Swiss Expert League Dashboard

A live web dashboard for the Swiss Expert League Fantasy Premier League private mini-league. Built with React, TypeScript, Tailwind CSS, and Supabase.

![Dashboard Preview](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Swiss+Expert+League+Dashboard)

## ✨ Features

- **Live League Table** - Real-time standings and rankings
- **Gameweek Snapshots** - Highest scores, best captains, biggest movers
- **Manager of the Month** - Animated monthly champion with trophy effects
- **Chip Usage ROI Analysis** - Performance analysis of Fantasy Premier League chips
- **Longest Green Streak** - Track consecutive good performances
- **Swiss Design Identity** - Clean red/white color palette inspired by the Swiss flag
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Auto-refreshes during gameweeks

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/swiss-expert-league-dashboard.git
   cd swiss-expert-league-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The dashboard expects these Supabase views/tables:

### Production project: **FPL 2** (`bxkcrzyuiddzqgnflhfw`)

**Recommended:** run `npm run sync:fpl` so **`league_snapshots`** is populated. The app prefers that table for the full per-gameweek timeline (streaks, highest GW, movers, captain in GW cards). The sync also fills **`managers`**, **`gw_scores`**, **`captain_scores`** (when picks are enabled), and **`fpl_gameweeks`**, which power **chip ROI** and **manager of the month**.

If `league_snapshots` is empty, the app falls back to **`league_standings`** (wide `gw1_points` … `gw38_points`).

### Required views (FPL 2)
- `vw_chip_usage_roi` — from `gw_scores` + `managers` (chips must be present: use `FPL_FETCH_PICKS=1`)
- `vw_manager_of_month_totals` / `vw_manager_of_month_winners` — use **`fpl_gameweeks.deadline_time`** for calendar month (see `supabase/schema/fpl2_views_manager_of_month.sql`)

### FPL → Supabase sync (backfill and weekly updates)

1. In the **Supabase SQL Editor**, run in order for **FPL 2** (skip any object that already exists):
   - `supabase/schema/league_snapshots.sql`
   - `supabase/schema/fpl_gameweeks.sql`
   - `supabase/schema/gw_scores_upsert_support.sql` — unique `(entry_id, gw)` on `gw_scores` and `(entry_id, gameweek)` on `captain_scores` for idempotent upserts
   - `supabase/schema/fpl2_views_manager_of_month.sql` — replaces MOTM views to group by **deadline month** (not `created_at`)
   - If you use **`gw_scores`** + **`update_league_standings`**: run **`supabase/schema/update_league_standings_season_counters.sql`** so `weeks_first`, `weeks_last`, and `gw_wins` stay in sync (dashboard reads them from `league_standings`).

   **Greenfield / snapshot-only chip+MOTM:** you can instead use `supabase/schema/views_from_snapshots.sql` after snapshots exist (FPL 2 already has `vw_chip_usage_roi` on `gw_scores`).

2. From **Project Settings → API**, copy the **service role** key (server only; never expose in the browser).

3. Run the sync (replace IDs and URL):

   ```bash
   export FPL_LEAGUE_ID=your_classic_league_id
   export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   export FPL_FETCH_PICKS=1
   npm run sync:fpl
   ```

   Optional:

   - `FPL_FETCH_PICKS=0` — faster; **no** captain/chip in DB (chip ROI and best-captain cards stay thin).
   - `FPL_DELAY_MS=400` — throttle if FPL returns 429.
   - `FPL_MAX_GW=25` — only sync through that gameweek.

4. **Automated sync (GitHub Actions):** workflow **`.github/workflows/sync-fpl.yml`** runs **twice daily** (UTC) and on **manual dispatch** (Actions tab → “Sync FPL data to Supabase” → Run workflow).

   Configure in the repo:

   | Name | Type | Value |
   |------|------|--------|
   | `FPL_LEAGUE_ID` | **Secret** | Your FPL classic league ID (numeric) |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Supabase service role key (never use in frontend) |
   | `NEXT_PUBLIC_SUPABASE_URL` | **Variable** | Same as for Pages deploy, e.g. `https://bxkcrzyuiddzqgnflhfw.supabase.co` |

   The workflow uses `npm ci`, sets `FPL_FETCH_PICKS=1` and `FPL_DELAY_MS=400`. Edit the `cron` in the workflow file if you want a different schedule.

The script upserts **`league_snapshots`**, **`managers`**, **`gw_scores`** (sets `created_at` to the GW **deadline** when known, for any legacy logic), **`captain_scores`** when picks succeed, **`fpl_gameweeks`**, and optionally logs if `fpl_gameweeks` / `league_snapshots` are missing.

**Verify after a run:**

```sql
select count(*) from league_snapshots;
select count(*) from gw_scores;
select count(*) from fpl_gameweeks;
select * from vw_manager_of_month_winners order by month_utc desc limit 3;
```

### Cursor: Supabase MCP (read-only inspection)

This repo uses **hosted Supabase**. Project ref is in `utils/supabase/info.tsx` (`projectId`). MCP config: **`.cursor/mcp.json`** — `read_only=true`, features `database`, `debugging`, `docs`. If production uses a different project, change `project_ref` in that file to match **Project Settings → General** (or the hostname in `NEXT_PUBLIC_SUPABASE_URL`).

**Your steps:** reload MCP or restart Cursor → complete Supabase OAuth when prompted → run the test prompt below in chat.

**Test prompt (copy-paste):**

```
Using the Supabase MCP server, confirm read-only mode, list tables in the public schema, and show whether these exist: league_standings, league_standings_new, gw_scores, managers, vw_chip_usage_roi, vw_manager_of_month_totals, vw_manager_of_month_winners. Do not run destructive SQL.
```

**Pre-connection checks (repo-only, not a substitute for MCP):**

- **FPL 2:** expect `league_standings` / `league_standings_new`, `managers`, `gw_scores`, and the `vw_*` views above. The repo’s `npm run sync:fpl` path targets `league_snapshots` + optional `fpl_gameweeks` for greenfield setups; use that if you migrate to the snapshot model.
- If live `league_snapshots` lacks columns expected by the views (`active_chip`, captain columns), view creation or queries may fail—align with `supabase/schema/league_snapshots.sql`.
- RLS: schema SQL grants **anon SELECT** only; the FPL sync must use the **service role** (`npm run sync:fpl`).
- This repo has **no** `supabase/migrations/` folder; verify migration history in the Supabase dashboard after MCP connects.
- **After MCP works:** ask the agent to compare live `information_schema` / policies to `supabase/schema/*.sql` and report gaps (no destructive SQL).

### Auto-Discovery
The system automatically discovers your database structure and logs available columns to the console. Check the browser developer tools for detailed information about your database schema.

## 🎛️ Configuration

### Database Integration
The app uses a 3-layer architecture:
- **Frontend Components** - React components with TypeScript
- **Custom Hook** - `useLeagueData.ts` manages all data fetching
- **Database Queries** - `queries.ts` handles Supabase connections
- **Supabase Client** - `client.ts` manages database connection

### Mock Data Fallback
If the database is unavailable, the app falls back to mock data to ensure a smooth user experience. Look for yellow status banners indicating demo mode.

## 📁 Project Structure

```
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── Header.tsx         # Main navigation header
│   ├── LeagueTable.tsx    # Live league standings
│   ├── ManagerOfTheMonth.tsx # Monthly champion display
│   ├── ChipUsageRoi.tsx   # Chip analysis component
│   └── ...                # Other dashboard components
├── hooks/
│   └── useLeagueData.ts   # Main data fetching hook
├── utils/
│   ├── database/
│   │   └── queries.ts     # Database query functions
│   └── supabase/
│       ├── client.ts      # Supabase client setup
│       └── info.tsx       # Project configuration
├── constants/
│   └── mockData.ts        # Fallback demo data
├── styles/
│   └── globals.css        # Tailwind CSS + custom styling
└── supabase/
    └── functions/
        └── server/        # Edge function setup
```

## 🎨 Design System

- **Colors**: Swiss-inspired red/white palette
- **Typography**: Clean, professional fonts with proper hierarchy
- **Components**: Shadcn UI components for consistency
- **Animations**: Subtle Motion animations for enhanced UX
- **Responsive**: Mobile-first design approach

## 🔧 Development

### Adding New Components
1. Create component in `/components/`
2. Import in `App.tsx`
3. Add any new data requirements to `useLeagueData.ts`

### Database Integration
1. Add new query functions to `/utils/database/queries.ts`
2. Update types and interfaces
3. Modify `useLeagueData.ts` to fetch new data
4. Use the data in components

### Styling Guidelines
- Use Tailwind CSS classes
- Follow the existing color palette
- Maintain responsive design patterns
- Use semantic HTML elements

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Swiss Expert League

This dashboard is built for the Swiss Expert League, a private Fantasy Premier League mini-league featuring competitive managers from Switzerland and beyond.

---

**Built with ❤️ for Fantasy Premier League enthusiasts**