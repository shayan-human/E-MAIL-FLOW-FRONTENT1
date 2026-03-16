import { Composition, AbsoluteFill, useCurrentFrame, interpolate, registerRoot } from "remotion";

const COLORS = {
  background: "#0a0a0f",
  primary: "#3B82F6",
  secondary: "#60A5FA",
  cyan: "#67E8F9",
};

export function HeroBackground() {
  const frame = useCurrentFrame();
  const time = frame / 30;

  const particles = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    x: Math.random() * 1920,
    y: Math.random() * 1080,
    speed: 0.3 + Math.random() * 0.8,
    size: 1 + Math.random() * 3,
    opacity: 0.2 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 0.3,
  }));

  const rays = [
    { angle: -25, width: 80, delay: 0 },
    { angle: -30, width: 60, delay: 0.5 },
    { angle: -20, width: 100, delay: 1 },
    { angle: -35, width: 50, delay: 1.5 },
    { angle: -28, width: 70, delay: 2 },
  ];

  const pulseScale = interpolate(
    Math.sin(time * 0.8),
    [-1, 1],
    [0.8, 1.2]
  );

  const pulseOpacity = interpolate(
    Math.sin(time * 0.8),
    [-1, 1],
    [0.3, 0.6]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="rayGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0" />
            <stop offset="50%" stopColor={COLORS.primary} stopOpacity="0.15" />
            <stop offset="100%" stopColor={COLORS.cyan} stopOpacity="0" />
          </linearGradient>
          
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.4" />
            <stop offset="50%" stopColor={COLORS.primary} stopOpacity="0.1" />
            <stop offset="100%" stopColor={COLORS.background} stopOpacity="0" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {rays.map((ray, i) => {
          const offset = ((time * 0.3 + ray.delay) % 4) - 2;
          return (
            <rect
              key={`ray-${i}`}
              x={960 + offset * 200 - ray.width / 2}
              y={0}
              width={ray.width}
              height={1080}
              fill="url(#rayGradient)"
              style={{ opacity: 0.5 + Math.sin(time + i) * 0.2 }}
            />
          );
        })}

        <g transform="perspective(500) rotateX(60)" style={{ opacity: 0.06 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={540 + i * 60}
              x2={1920}
              y2={540 + i * 60}
              stroke={COLORS.primary}
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 70}
              y1={0}
              x2={i * 70}
              y2={1080}
              stroke={COLORS.primary}
              strokeWidth="1"
            />
          ))}
        </g>

        <ellipse
          cx={960}
          cy={540}
          rx={400 * pulseScale}
          ry={300 * pulseScale}
          fill="url(#centerGlow)"
          style={{ opacity: pulseOpacity }}
        />

        {particles.map((p) => {
          const yPos = ((p.y - p.speed * time * 60) % 1200) - 100;
          const xPos = p.x + Math.sin(time * p.drift + p.id) * 30;
          
          if (yPos < -50 || yPos > 1130) return null;
          
          return (
            <circle
              key={`particle-${p.id}`}
              cx={xPos}
              cy={yPos}
              r={p.size}
              fill={p.id % 3 === 0 ? COLORS.cyan : COLORS.primary}
              style={{ opacity: p.opacity * (1 - Math.abs(yPos - 540) / 600) }}
              filter="url(#glow)"
            />
          );
        })}

        <g>
          {Array.from({ length: 25 }).map((_, i) => {
            const yPos = ((i * 50 + 20 - time * 40) % 1100) - 50;
            const xStart = -100 + Math.sin(i * 0.5 + time * 0.2) * 100;
            const xEnd = 1920 + 100 - Math.sin(i * 0.5 + time * 0.2) * 100;
            const opacity = 0.15 + Math.sin(i + time) * 0.1;
            
            return (
              <line
                key={`stream-${i}`}
                x1={xStart + i * 80}
                y1={yPos}
                x2={xEnd + i * 80 - 200}
                y2={yPos - 30}
                stroke={i % 2 === 0 ? COLORS.primary : COLORS.cyan}
                strokeWidth="1"
                style={{ opacity }}
              />
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
}

const RemotionRoot = () => {
  return (
    <Composition
      id="HeroBackground"
      component={HeroBackground}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

registerRoot(RemotionRoot);

export default RemotionRoot;
