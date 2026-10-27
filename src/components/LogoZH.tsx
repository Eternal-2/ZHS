import React from 'react';

interface LogoZHProps {
  size?: number;
  className?: string;
  withContainer?: boolean;
}

export const LogoZH: React.FC<LogoZHProps> = ({ size = 88, className = '', withContainer = true }) => {
  const content = (
    <svg
      width={withContainer ? size * 0.72 : size}
      height={withContainer ? size * 0.72 : size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm select-none"
    >
      <defs>
        {/* Warm Orange Gradient for the Z */}
        <linearGradient id="zhOrangeZ" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FFA654" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#D9531E" />
        </linearGradient>

        {/* 3D Depth Shadow for Z */}
        <linearGradient id="zhDepthZ" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>

        {/* Amber Peach Gradient for H */}
        <linearGradient id="zhAmberH" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="60%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Emerald / Teal connecting cord */}
        <linearGradient id="zhTealCord" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 3D Extrusion Shadow for Letter Z */}
      <path
        d="M20 28 L56 28 L35 62 L58 62 L56 70 L16 70 L38 36 L20 36 Z"
        fill="url(#zhDepthZ)"
        transform="translate(2, 3)"
        opacity="0.85"
      />

      {/* Main Stylized Letter Z */}
      <path
        d="M22 26 C22 24 24 22 27 22 L56 22 C59 22 60 25 58 28 L38 60 L60 60 C62 60 64 62 64 65 L63 68 C63 71 61 73 58 73 L24 73 C21 73 20 70 22 67 L42 34 L25 34 C23 34 22 32 22 29 Z"
        fill="url(#zhOrangeZ)"
        filter="url(#softGlow)"
      />

      {/* 3D Extrusion for Letter H */}
      <path
        d="M58 24 L68 24 L68 44 L80 44 L80 24 L90 24 L90 72 L80 72 L80 52 L68 52 L68 72 L58 72 Z"
        fill="url(#zhDepthZ)"
        transform="translate(2, 3)"
        opacity="0.8"
      />

      {/* Main Stylized Letter H */}
      <path
        d="M60 22 L70 22 L70 42 L80 42 L80 22 L90 22 L90 72 L80 72 L80 50 L70 50 L70 72 L60 72 Z"
        fill="url(#zhAmberH)"
        filter="url(#softGlow)"
      />

      {/* Interlocking Teal Cord / Trail / Connection */}
      <path
        d="M32 20 Q 48 10, 62 25 T 50 55 T 72 78"
        stroke="url(#zhTealCord)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        filter="drop-shadow(0 2px 3px rgba(4,120,87,0.4))"
      />

      {/* Decorative Network Nodes on the Cord */}
      <circle cx="34" cy="18" r="3" fill="#EF4444" />
      <circle cx="48" cy="14" r="2.8" fill="#FBBF24" />
      <circle cx="58" cy="36" r="3" fill="#38BDF8" />
      <circle cx="72" cy="78" r="3.2" fill="#10B981" />
    </svg>
  );

  if (!withContainer) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{content}</div>;
  }

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`bg-white rounded-2xl shadow-xl flex items-center justify-center p-2.5 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-slate-100/50 ${className}`}
    >
      {content}
    </div>
  );
};
