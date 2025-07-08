'use client';

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[calc(100vh-150px)] w-full items-center justify-center">
      <svg
        width="60"
        height="60"
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading"
        className="text-primary"
      >
        <style>
          {`
            .spinner-bar-loader {
              animation: spinner-fade-loader 1.2s linear infinite;
              fill: currentColor;
            }
            @keyframes spinner-fade-loader {
              0% { opacity: 1; }
              100% { opacity: 0.15; }
            }
          `}
        </style>
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            className="spinner-bar-loader"
            x="36.5"
            y="5"
            width="7"
            height="18"
            rx="3.5"
            ry="3.5"
            transform={`rotate(${i * 30} 40 40)`}
            style={{ animationDelay: `${(i * 0.1) - 1.1}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
