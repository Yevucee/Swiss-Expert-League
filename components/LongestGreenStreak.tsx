import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function LongestGreenStreak() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Longest Green Streak</h2>
        </div>
        <Badge variant="outline" className="text-xs">Demo Data</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {greenStreakData.map((manager, index) => (
          <motion.div
            key={manager.manager}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden ${
              index === 0 
                ? 'border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' 
                : index === 1
                ? 'border border-green-300'
                : ''
            }`}>
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <Trophy className="w-4 h-4 text-green-600" />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${
                    manager.currentStreak > 0 ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className="truncate">{manager.manager}</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <div className={`text-2xl font-bold ${
                      manager.currentStreak > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {manager.currentStreak}
                    </div>
                    <p className="text-xs text-gray-500">Current Streak</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Best:</span>
                      <span className="font-medium">{manager.bestStreak}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Points:</span>
                      <span className="font-medium">{manager.streakPoints}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 truncate">
                    {manager.teamName}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Green streak = consecutive gameweeks finishing above average
        </p>
      </div>
    </section>
  );
}
