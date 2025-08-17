import { useState, useEffect } from 'react';
import {
  fetchChipUsageRoi,
  fetchManagerOfMonthTotals,
  fetchManagerOfMonthWinners,
  fetchLeagueStandings,
  fetchGameweekStats,
  getLatestGameweek,
  getAvailableMonths,
  listAvailableTables,
  ChipUsageRoi,
  ManagerOfMonthTotal,
  ManagerOfMonthWinner
} from '../utils/database/queries';

export function useLeagueData() {
  const [chipUsageRoi, setChipUsageRoi] = useState<ChipUsageRoi[]>([]);
  const [managerOfMonthTotals, setManagerOfMonthTotals] = useState<ManagerOfMonthTotal[]>([]);
  const [managerOfMonthWinners, setManagerOfMonthWinners] = useState<ManagerOfMonthWinner[]>([]);
  const [leagueStandings, setLeagueStandings] = useState([]);
  const [gameweekStats, setGameweekStats] = useState(null);
  const [latestGameweek, setLatestGameweek] = useState(24);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        console.log('=== Starting Swiss Expert League Data Load ===');
        
        // Debug: List all available tables (only in development)
        if (process.env.NODE_ENV !== 'production') {
          await listAvailableTables();
        }

        // Get latest gameweek first
        console.log('\n🔄 Getting latest gameweek...');
        const currentGw = await getLatestGameweek();
        setLatestGameweek(currentGw);
        console.log('✓ Latest gameweek:', currentGw);

        // Get available months
        console.log('\n🔄 Getting available months...');
        const months = await getAvailableMonths();
        setAvailableMonths(months);
        console.log('✓ Available months:', months.length > 0 ? months : 'none found');

        // Fetch all data with individual error handling
        console.log('\n🔄 Fetching all data sources...');

        // Chip Usage ROI
        console.log('\n1️⃣ Fetching Chip Usage ROI...');
        try {
          const chipRoiData = await fetchChipUsageRoi();
          setChipUsageRoi(chipRoiData);
          console.log(`✅ Chip ROI: ${chipRoiData.length} items loaded`);
        } catch (err) {
          console.log('❌ Chip ROI failed:', err);
        }

        // Manager of Month Totals - don't pass specific month, let it auto-discover
        console.log('\n2️⃣ Fetching Manager of Month Totals...');
        try {
          const monthTotalsData = await fetchManagerOfMonthTotals(); // No month filter
          setManagerOfMonthTotals(monthTotalsData);
          console.log(`✅ Month Totals: ${monthTotalsData.length} items loaded`);
        } catch (err) {
          console.log('❌ Month Totals failed:', err);
        }

        // Manager of Month Winners
        console.log('\n3️⃣ Fetching Manager of Month Winners...');
        try {
          const monthWinnersData = await fetchManagerOfMonthWinners();
          setManagerOfMonthWinners(monthWinnersData);
          console.log(`✅ Month Winners: ${monthWinnersData.length} items loaded`);
        } catch (err) {
          console.log('❌ Month Winners failed:', err);
        }

        // League Standings
        console.log('\n4️⃣ Fetching League Standings...');
        try {
          const standingsData = await fetchLeagueStandings();
          setLeagueStandings(standingsData);
          console.log(`✅ League Standings: ${standingsData.length} items loaded`);
        } catch (err) {
          console.log('❌ League Standings failed:', err);
        }

        // Gameweek Stats
        console.log('\n5️⃣ Fetching Gameweek Stats...');
        try {
          const gameweekData = await fetchGameweekStats(currentGw);
          setGameweekStats(gameweekData);
          console.log(`✅ Gameweek Stats: ${gameweekData ? 'loaded' : 'no data'}`);
        } catch (err) {
          console.log('❌ Gameweek Stats failed:', err);
        }

        console.log('\n🏁 === Data Load Complete ===');

      } catch (err) {
        console.error('💥 Unexpected error loading league data:', err);
        setError('Unexpected error occurred while loading data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Helper to get current month winner
  const currentMonthWinner = managerOfMonthWinners.length > 0 ? managerOfMonthWinners[0] : null;

  // Helper to get best chip ROI
  const bestChipRoi = chipUsageRoi.length > 0 ? chipUsageRoi[0] : null;

  // Check if we have any data
  const hasData = chipUsageRoi.length > 0 || 
                  managerOfMonthTotals.length > 0 || 
                  managerOfMonthWinners.length > 0 || 
                  leagueStandings.length > 0;

  // Debug info for console
  useEffect(() => {
    if (!loading) {
      console.log('\n📊 === Final Data Status ===');
      console.log('✨ Has Data:', hasData);
      console.log('🎯 Chip Usage ROI:', chipUsageRoi.length);
      console.log('🏆 Month Totals:', managerOfMonthTotals.length);
      console.log('👑 Month Winners:', managerOfMonthWinners.length);
      console.log('📋 League Standings:', leagueStandings.length);
      console.log('📈 Gameweek Stats:', gameweekStats ? 'available' : 'null');
      console.log('🗓️ Available Months:', availableMonths.length);
      console.log('🥇 Current Month Winner:', currentMonthWinner?.manager_name || 'none');
      console.log('💰 Best Chip ROI:', bestChipRoi?.manager_name || 'none');
      console.log('========================\n');
    }
  }, [loading, hasData, chipUsageRoi.length, managerOfMonthTotals.length, managerOfMonthWinners.length, leagueStandings.length, gameweekStats, availableMonths.length, currentMonthWinner, bestChipRoi]);

  return {
    chipUsageRoi,
    managerOfMonthTotals,
    managerOfMonthWinners,
    currentMonthWinner,
    bestChipRoi,
    leagueStandings,
    gameweekStats,
    latestGameweek,
    availableMonths,
    loading,
    error: hasData ? null : error, // Don't show error if we have some data
    hasData,
    // Refresh function
    refresh: () => {
      window.location.reload();
    }
  };
}