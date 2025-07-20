import React from 'react';

export function FancyLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 dark:bg-black/40 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Main spinner */}
        <svg className="animate-spin h-16 w-16 text-blue-500 drop-shadow-lg" viewBox="0 0 50 50">
          <circle
            className="opacity-20"
            cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M25 5a20 20 0 0 1 20 20h-6a14 14 0 0 0-14-14V5z"
          />
        </svg>
        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute block w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-green-400 opacity-80 animate-sparkle"
              style={{
                left: `${40 + 30 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                top: `${40 + 30 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>
        <div className="mt-6 text-lg font-semibold text-blue-700 dark:text-blue-300 animate-pulse">Loading...</div>
      </div>
    </div>
  );
}

// Add this to your global CSS if not present:
// @keyframes sparkle {
//   0% { transform: scale(0.5) translateY(0); opacity: 0.7; }
//   50% { transform: scale(1.2) translateY(-10px); opacity: 1; }
//   100% { transform: scale(0.5) translateY(0); opacity: 0; }
// }
// .animate-sparkle { animation: sparkle 1.2s ease-in-out forwards; } 