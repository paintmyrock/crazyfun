interface CharacterProps {
  animate: boolean;
  reduced: boolean;
}

export function Diglett({ animate, reduced }: CharacterProps) {
  return (
    <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
      {/* Dirt puff particles */}
      {animate && !reduced && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-600 rounded-full animate-[dirtPuff_0.5s_ease-out_forwards]"
              style={{
                animationDelay: `${i * 0.05}s`,
                left: `${(i - 2) * 8}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Diglett body */}
      <svg
        viewBox="0 0 80 80"
        className={`w-16 h-16 md:w-20 md:h-20 ${
          animate && !reduced
            ? "animate-[diglettPop_0.4s_ease-out_forwards]"
            : reduced && animate
            ? "animate-[fadeIn_0.3s_ease-out_forwards]"
            : ""
        }`}
        style={{ transformOrigin: "bottom center" }}
      >
        {/* Ground/hole */}
        <ellipse cx="40" cy="72" rx="30" ry="8" fill="#8B4513" />
        <ellipse cx="40" cy="72" rx="24" ry="6" fill="#5D3A1A" />

        {/* Body */}
        <ellipse cx="40" cy="50" rx="18" ry="25" fill="#D2691E" />

        {/* Nose */}
        <ellipse cx="40" cy="42" rx="8" ry="6" fill="#FFB6C1" />

        {/* Eyes */}
        <ellipse cx="32" cy="32" rx="4" ry="5" fill="#000" />
        <ellipse cx="48" cy="32" rx="4" ry="5" fill="#000" />
        <circle cx="33" cy="31" r="1.5" fill="#FFF" />
        <circle cx="49" cy="31" r="1.5" fill="#FFF" />
      </svg>
    </div>
  );
}

export function Magikarp({ animate, reduced }: CharacterProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Splash droplets */}
      {animate && !reduced && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full animate-[splash_0.5s_ease-out_forwards]"
              style={{
                animationDelay: `${0.3 + i * 0.05}s`,
                left: `${20 + (i % 3) * 25}%`,
                top: "60%",
              }}
            />
          ))}
        </div>
      )}

      {/* Magikarp body */}
      <svg
        viewBox="0 0 80 80"
        className={`w-16 h-16 md:w-20 md:h-20 ${
          animate && !reduced
            ? "animate-[magikarpDrop_0.5s_ease-out_forwards]"
            : reduced && animate
            ? "animate-[fadeIn_0.3s_ease-out_forwards]"
            : ""
        }`}
      >
        {/* Body */}
        <ellipse cx="40" cy="42" rx="22" ry="18" fill="#FF6B35" />

        {/* Scales pattern */}
        <path
          d="M25 35 Q30 40 25 45 M35 32 Q40 38 35 44 M45 32 Q50 38 45 44 M55 35 Q60 40 55 45"
          stroke="#E55A2B"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Top fin */}
        <path
          d="M40 24 L35 15 L40 18 L45 15 L40 24"
          fill="#FFD700"
        />

        {/* Tail */}
        <path
          d="M62 42 L75 30 L72 42 L75 54 L62 42"
          fill="#FFD700"
        />

        {/* Side fins */}
        <ellipse cx="28" cy="48" rx="6" ry="3" fill="#FFD700" transform="rotate(-30 28 48)" />

        {/* Eye */}
        <circle cx="28" cy="38" r="6" fill="#FFF" />
        <circle cx="28" cy="38" r="4" fill="#000" />
        <circle cx="27" cy="37" r="1.5" fill="#FFF" />

        {/* Mouth (derpy open mouth) */}
        <ellipse cx="18" cy="45" rx="4" ry="3" fill="#8B0000" />

        {/* Whiskers */}
        <path
          d="M18 40 Q10 35 5 38"
          stroke="#FF6B35"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M18 48 Q10 50 5 48"
          stroke="#FF6B35"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  );
}
