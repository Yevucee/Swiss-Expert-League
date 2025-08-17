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

### Required Views
- `vw_chip_usage_roi` - Chip usage analysis
- `vw_manager_of_month_totals` - Monthly performance rankings
- `vw_manager_of_month_winners` - Monthly winners
- `league_snapshots` - Current league standings

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