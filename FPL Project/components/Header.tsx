import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Header() {
  return (
    <header className="bg-white border-b-4 border-red-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <div className="text-white font-bold text-xl">+</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Swiss Expert League</h1>
              <p className="text-gray-600">Fantasy Premier League • Gameweek 24</p>
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1634813052369-3584119ccd2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMHN0YWRpdW18ZW58MXx8fHwxNzU1NDEyNjI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Football Stadium"
              className="w-24 h-16 object-cover rounded-lg opacity-20"
            />
          </div>
        </div>
      </div>
    </header>
  );
}