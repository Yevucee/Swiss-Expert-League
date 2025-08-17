import { Trophy } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b-2 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Swiss Expert League</h1>
                <p className="text-sm text-gray-600">Fantasy Premier League Dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Season 2024/25</div>
              <div className="text-xs text-gray-500">Live Updates</div>
            </div>
            <div className="w-8 h-6 bg-red-600 rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}