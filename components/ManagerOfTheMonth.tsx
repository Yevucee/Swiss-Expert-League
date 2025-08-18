import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Trophy, Crown, Star, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import useLeagueData from "../hooks/useLeagueData";
import { managerOfMonthTotals as mockData, currentMonthWinner as mockWinner } from "../constants/mockData";

function FireworkParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
      initial={{ opacity: 1, scale: 0 }}
      animate={{
        opacity: [1, 0.8, 0],
        scale: [0, 1, 0],
        x: [0, Math.random() * 60 - 30],
        y: [0, Math.random() * 60 - 30],
      }}
      transition={{
        duration: 1,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

function AnimatedTrophy() {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -5, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Trophy className="w-6 h-6 text-yellow-500" />
      
      {/* Smaller sparkles around trophy */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${12 + Math.cos((i * Math.PI) / 2) * 15}px`,
            top: `${12 + Math.sin((i * Math.PI) / 2) * 15}px`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <Star className="w-2 h-2 text-yellow-400" />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Helper function to format month display
function formatMonthDisplay(monthUtc?: string): string {
  if (!monthUtc) return "January 2024";
  
  try {
    // Try to parse different possible formats
    let date: Date;
    
    if (monthUtc.includes('T') || monthUtc.includes(' ')) {
      // Full timestamp format
      date = new Date(monthUtc);
    } else if (monthUtc.match(/^\d{4}-\d{2}$/)) {
      // YYYY-MM format
      date = new Date(monthUtc + '-01');
    } else {
      // Fallback
      date = new Date(monthUtc);
    }
    
    if (isNaN(date.getTime())) {
      return monthUtc; // Return as-is if can't parse
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (error) {
    console.log('Error formatting month:', error);
    return monthUtc || "Recent Month";
  }
}

export function ManagerOfTheMonth() {
  const { managerOfMonthTotals, currentMonthWinner, availableMonths, hasData } = useLeagueData();
  
  // Use real data if available, fallback to mock data
  const displayData = hasData && managerOfMonthTotals.length > 0 ? managerOfMonthTotals : mockData;
  const displayWinner = hasData && currentMonthWinner ? currentMonthWinner : mockWinner;
  
  // Get winner data - first in list or the currentMonthWinner
  const winner = displayData.length > 0 ? displayData[0] : displayWinner;
  
  // Get the month to display
  const monthToDisplay = hasData && availableMonths.length > 0 
    ? formatMonthDisplay(availableMonths[0])
    : formatMonthDisplay(winner?.month_utc) || "January 2024";

  return (
    <section className="relative">
      <div className="flex items-center gap-3 mb-4">
        <AnimatedTrophy />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manager of the Month</h2>
          <p className="text-sm text-gray-600">{monthToDisplay}</p>
        </div>
        {!hasData && (
          <Badge variant="outline" className="ml-auto text-xs">Demo Data</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compact Winner Card */}
        <motion.div
          className="relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 relative overflow-hidden">
            {/* Fewer fireworks */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <FireworkParticle key={i} delay={i * 0.2} />
              ))}
            </div>
            
            <CardHeader className="text-center relative pb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-2"
              >
                <Crown className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <CardTitle className="text-lg text-gray-900">🏆 Monthly Champion</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {winner?.manager_name || 'Loading...'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {winner?.team_name || 'Loading...'}
                </p>
                <div className="flex justify-center items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-600">
                    {winner?.total_points || winner?.points || 0}
                  </span>
                  <span className="text-sm text-gray-500">points</span>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Best performing manager in {monthToDisplay.split(' ')[0]}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compact Monthly Top 3 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-4 h-4 text-yellow-600" />
              {monthToDisplay.split(' ')[0]} Top 3
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {displayData.slice(0, 3).map((manager, index) => (
                <motion.div
                  key={manager.entry_id || index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    (manager.rank || index + 1) === 1 ? 'bg-yellow-50' : 
                    (manager.rank || index + 1) === 2 ? 'bg-gray-50' : 'bg-orange-50'
                  }`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {(manager.rank || index + 1) === 1 && <Crown className="w-4 h-4 text-yellow-600" />}
                      {(manager.rank || index + 1) === 2 && <Trophy className="w-4 h-4 text-gray-400" />}
                      {(manager.rank || index + 1) === 3 && <Trophy className="w-4 h-4 text-amber-600" />}
                      <span className="font-medium text-sm">{manager.rank || index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{manager.manager_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{manager.team_name || 'Unknown Team'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">
                      {manager.total_points || manager.points || 0}
                    </div>
                    {(manager.rank || index + 1) === 1 && (
                      <Badge className="bg-yellow-500 text-white text-xs">Winner</Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
