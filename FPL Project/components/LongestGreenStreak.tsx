import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TrendingUp, Zap, Flame, Target, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { longestGreenStreaks } from "../constants/mockData";

function StreakIcon({ streak }: { streak: number }) {
  if (streak >= 7) return <Flame className="w-4 h-4 text-red-500" />;
  if (streak >= 5) return <Zap className="w-4 h-4 text-orange-500" />;
  if (streak >= 3) return <TrendingUp className="w-4 h-4 text-green-500" />;
  return <Target className="w-4 h-4 text-gray-400" />;
}

function StreakBadge({ streak, type }: { streak: number; type: 'current' | 'best' }) {
  const getColor = (streakValue: number) => {
    if (streakValue >= 7) return type === 'current' ? 'bg-red-500' : 'bg-red-100 text-red-700';
    if (streakValue >= 5) return type === 'current' ? 'bg-orange-500' : 'bg-orange-100 text-orange-700';
    if (streakValue >= 3) return type === 'current' ? 'bg-green-500' : 'bg-green-100 text-green-700';
    return type === 'current' ? 'bg-gray-400' : 'bg-gray-100 text-gray-600';
  };

  return (
    <Badge 
      className={`${getColor(streak)} ${type === 'current' ? 'text-white' : ''}`}
    >
      {streak}
    </Badge>
  );
}

export function LongestGreenStreak() {
  const topStreakManager = longestGreenStreaks.reduce((best, current) => 
    current.current_streak > best.current_streak ? current : best
  );

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Longest Green Streak</h2>
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <p className="text-sm text-green-800">
            <strong>Green Streak</strong> = consecutive gameweeks with rank improvement or maintaining top 3 position.
            Current leader: <strong>{topStreakManager.manager_name}</strong> with {topStreakManager.current_streak} weeks!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Streak Leader Highlight */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-red-500" />
                Current Streak Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{topStreakManager.manager_name}</h3>
                  <p className="text-gray-600 mb-4">{topStreakManager.team_name}</p>
                  <div className="flex justify-center items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{topStreakManager.current_streak}</div>
                      <div className="text-sm text-gray-500">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{topStreakManager.streak_points}</div>
                      <div className="text-sm text-gray-500">Streak Points</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* All-Time Best Streak */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              All-Time Best
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">
                {longestGreenStreaks.reduce((best, current) => 
                  current.best_streak > best.best_streak ? current : best
                ).manager_name}
              </h3>
              <p className="text-gray-600 mb-4">Record Holder</p>
              <div className="text-3xl font-bold text-orange-600">
                {Math.max(...longestGreenStreaks.map(m => m.best_streak))} weeks
              </div>
              <div className="text-sm text-gray-500">Best Ever Streak</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Streak Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Streak Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manager</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Current Streak</TableHead>
                <TableHead className="text-center">Best Streak</TableHead>
                <TableHead className="text-right">Streak Points</TableHead>
                <TableHead className="w-16">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {longestGreenStreaks
                .sort((a, b) => b.current_streak - a.current_streak)
                .map((manager, index) => (
                <motion.tr
                  key={manager.manager_name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={manager.current_streak === topStreakManager.current_streak ? 'bg-green-50' : ''}
                >
                  <TableCell className="font-medium">{manager.manager_name}</TableCell>
                  <TableCell>{manager.team_name}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <StreakIcon streak={manager.current_streak} />
                      <StreakBadge streak={manager.current_streak} type="current" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <StreakBadge streak={manager.best_streak} type="best" />
                  </TableCell>
                  <TableCell className="text-right font-medium">{manager.streak_points}</TableCell>
                  <TableCell>
                    {manager.current_streak >= 7 && (
                      <span className="text-red-500 text-xs">🔥 Hot</span>
                    )}
                    {manager.current_streak >= 3 && manager.current_streak < 7 && (
                      <span className="text-green-500 text-xs">📈 Rising</span>
                    )}
                    {manager.current_streak === 0 && (
                      <span className="text-gray-400 text-xs">💤 Cold</span>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}