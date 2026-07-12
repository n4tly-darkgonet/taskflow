import { useMemo } from "react";

const COLORS = ["#4b3fd6", "#8b7fff", "#ffd97a", "#ff9d5c", "#4ecdc4", "#ff6b81"];

// Renders a one-time burst of falling confetti pieces. Each piece gets
// randomized position, color, size, timing, and drift so the burst
// looks natural rather than mechanical/repeated.
export default function Confetti({ pieceCount = 60 }) {
  const pieces = useMemo(() => {
    return Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.25,
      duration: 1.1 + Math.random() * 0.7,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 140,
      width: 6 + Math.random() * 6,
    }));
  }, [pieceCount]);

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.width}px`,
            height: `${p.width * 0.4}px`,
            "--drift": `${p.drift}px`,
            "--rotate": `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}