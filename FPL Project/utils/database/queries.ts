import { supabase } from '../supabase/client';

// Types for your database views - made more flexible
export interface ChipUsageRoi {
  entry_id: number;
  manager_name: string;
  team_name: string;
  gw: number;
  chip: string;
  points: number;
  gw_avg: number;
  roi_vs_league_avg: number;
}

export interface ManagerOfMonthTotal {
  entry_id: number;
  manager_name: string;
  team_name: string;
  month_utc: string;
  points?: number; // Make flexible for different column names
  total_points?: number;
  monthly_points?: number;
  rank?: number;
  [key: string]: any; // Allow other columns
}

export interface ManagerOfMonthWinner {
  month_utc: string;
  manager_name: string;
  team_name: string;
  points?: number;
  total_points?: number;
  monthly_points?: number;
  [key: string]: any; // Allow other columns
}

export interface LeagueSnapshot {
  entry_id: number;
  manager_name: string;
  team_name: string;
  rank: number;
  points: number;
  gw: number;
  created_at: string;
}

// Helper function to inspect table structure
export async function inspectTableColumns(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`Error inspecting ${tableName}:`, error);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`Available columns in ${tableName}:`, Object.keys(data[0]));
      console.log(`Sample data from ${tableName}:`, data[0]);
      return Object.keys(data[0]);
    }

    return null;
  } catch (error) {
    console.log(`Failed to inspect ${tableName}:`, error);
    return null;
  }
}

// Helper function to get available months from the database
export async function getAvailableMonths(): Promise<string[]> {
  try {
    console.log('Getting available months...');
    
    const { data, error } = await supabase
      .from('vw_manager_of_month_totals')
      .select('month_utc')
      .limit(50); // Get a reasonable sample

    if (error) {
      console.log('Error getting available months:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No month data found');
      return [];
    }

    // Extract unique months
    const months = [...new Set(data.map(row => row.month_utc))];
    console.log('Available months:', months);
    
    return months.sort().reverse(); // Most recent first
  } catch (error) {
    console.log('Failed to get available months:', error);
    return [];
  }
}

// Fetch chip usage ROI data
export async function fetchChipUsageRoi(): Promise<ChipUsageRoi[]> {
  try {
    const { data, error } = await supabase
      .from('vw_chip_usage_roi')
      .select('*')
      .order('roi_vs_league_avg', { ascending: false });

    if (error) {
      console.error('Error fetching chip usage ROI:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch chip usage ROI:', error);
    return [];
  }
}

// Fetch manager of month totals - fix timestamp issue
export async function fetchManagerOfMonthTotals(monthFilter?: string): Promise<ManagerOfMonthTotal[]> {
  try {
    console.log('Fetching manager of month totals...');
    
    // First, let's see what columns are available
    await inspectTableColumns('vw_manager_of_month_totals');
    
    // Get available months to see the format
    const availableMonths = await getAvailableMonths();
    
    let query = supabase.from('vw_manager_of_month_totals').select('*');
    
    // If we have available months, use the most recent one or find a match
    if (availableMonths.length > 0) {
      let targetMonth = availableMonths[0]; // Default to most recent
      
      if (monthFilter) {
        // Try to find a month that matches our filter
        const matchingMonth = availableMonths.find(month => 
          month.toLowerCase().includes(monthFilter.toLowerCase()) ||
          month.includes('2024-01') ||
          month.includes('january') ||
          month.includes('2024')
        );
        
        if (matchingMonth) {
          targetMonth = matchingMonth;
          console.log(`Using matching month: ${targetMonth}`);
        } else {
          console.log(`No match found for "${monthFilter}", using most recent: ${targetMonth}`);
        }
      }
      
      // Filter by the target month
      query = query.eq('month_utc', targetMonth);
      console.log(`Filtering by month_utc = "${targetMonth}"`);
    } else {
      console.log('No available months found, fetching all data');
    }
    
    // Execute the query with a reasonable limit
    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching manager of month totals:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No manager of month data found');
      return [];
    }

    console.log(`Found ${data.length} manager of month records`);
    console.log('Sample manager of month data:', data[0]);

    // Try to find a points column (could be named differently)
    const pointsColumn = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('points') || 
      key.toLowerCase().includes('total') ||
      key.toLowerCase().includes('score')
    );

    console.log('Found points column:', pointsColumn);

    // Sort by the points column we found, or fallback to entry_id
    const sortedData = data.sort((a, b) => {
      if (pointsColumn && a[pointsColumn] != null && b[pointsColumn] != null) {
        return b[pointsColumn] - a[pointsColumn]; // Descending
      }
      return 0;
    });

    // Add rank manually
    const dataWithRank = sortedData.map((item, index) => ({
      ...item,
      rank: index + 1,
      // Normalize the points field
      total_points: item[pointsColumn] || item.points || item.total_points || 0
    }));

    return dataWithRank;
  } catch (error) {
    console.error('Failed to fetch manager of month totals:', error);
    return [];
  }
}

// Fetch all manager of month winners - discover columns first
export async function fetchManagerOfMonthWinners(): Promise<ManagerOfMonthWinner[]> {
  try {
    console.log('Fetching manager of month winners...');
    
    // First, let's see what columns are available
    await inspectTableColumns('vw_manager_of_month_winners');
    
    const { data, error } = await supabase
      .from('vw_manager_of_month_winners')
      .select('*')
      .order('month_utc', { ascending: false })
      .limit(12); // Limit to avoid too much data

    if (error) {
      console.error('Error fetching manager of month winners:', error);
      return [];
    }

    if (data && data.length > 0) {
      console.log(`Found ${data.length} manager of month winners`);
      console.log('Sample manager of month winner data:', data[0]);
      
      // Find the points column
      const pointsColumn = Object.keys(data[0]).find(key => 
        key.toLowerCase().includes('points') || 
        key.toLowerCase().includes('total') ||
        key.toLowerCase().includes('score')
      );

      console.log('Found points column in winners:', pointsColumn);

      // Normalize the data
      const normalizedData = data.map(item => ({
        ...item,
        total_points: item[pointsColumn] || item.points || item.total_points || 0
      }));

      return normalizedData;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch manager of month winners:', error);
    return [];
  }
}

// Fetch current league standings - use league_snapshots
export async function fetchLeagueStandings() {
  try {
    // Get the most recent gameweek data from league_snapshots
    const { data, error } = await supabase
      .from('league_snapshots')
      .select('*')
      .order('gw', { ascending: false })
      .order('rank', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error fetching league standings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch league standings:', error);
    return [];
  }
}

// Since gameweek_stats table doesn't exist, we'll create this from league_snapshots
export async function fetchGameweekStats(gameweek: number) {
  try {
    // Get all data for the specific gameweek
    const { data, error } = await supabase
      .from('league_snapshots')
      .select('*')
      .eq('gw', gameweek)
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching gameweek data:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No data found for gameweek:', gameweek);
      return null;
    }

    console.log(`Found ${data.length} entries for gameweek ${gameweek}`);

    // Calculate gameweek stats from the data
    const sortedByPoints = [...data].sort((a, b) => b.points - a.points);
    const highestScore = sortedByPoints[0];

    // For movements, we'd need previous week data - for now, use placeholders
    return {
      highestScore: {
        points: highestScore?.points || 0,
        manager: highestScore?.manager_name || 'Unknown'
      },
      bestCaptain: {
        points: 0, // Would need captain data
        captain: 'Unknown',
        manager: 'Unknown'
      },
      biggestRise: {
        positions: 0, // Would need previous week comparison
        manager: 'Unknown'
      },
      biggestFall: {
        positions: 0, // Would need previous week comparison  
        manager: 'Unknown'
      }
    };

  } catch (error) {
    console.error('Failed to fetch gameweek stats:', error);
    return null;
  }
}

// Helper function to get the latest gameweek number
export async function getLatestGameweek(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('league_snapshots')
      .select('gw')
      .order('gw', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log('Could not get latest gameweek, using default 24');
      return 24;
    }

    console.log('Latest gameweek found:', data.gw);
    return data.gw;
  } catch (error) {
    console.error('Failed to get latest gameweek:', error);
    return 24;
  }
}

// Debug function to list all available tables
export async function listAvailableTables() {
  try {
    // This won't work with RLS, but we can try common table names
    const tablesToTry = [
      'vw_chip_usage_roi',
      'vw_manager_of_month_totals', 
      'vw_manager_of_month_winners',
      'league_snapshots',
      'managers',
      'league_data',
      'gameweek_data'
    ];

    for (const tableName of tablesToTry) {
      console.log(`\n--- Checking table: ${tableName} ---`);
      await inspectTableColumns(tableName);
    }
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}