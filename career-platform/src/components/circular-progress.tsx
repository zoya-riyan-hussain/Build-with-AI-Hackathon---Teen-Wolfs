export function CircularProgress({ 
  value, 
  size = 120, 
  strokeWidth = 12, 
  color = "hsl(var(--accent))",
  trackColor = "hsl(var(--muted))"
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tracking-tighter text-foreground">{value}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Match</span>
      </div>
    </div>
  );
}