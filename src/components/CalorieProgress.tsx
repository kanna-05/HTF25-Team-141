import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CalorieProgressProps {
  consumed: number;
  goal: number;
}

const CalorieProgress = ({ consumed, goal }: CalorieProgressProps) => {
  const [progress, setProgress] = useState(0);
  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const isOverGoal = consumed > goal;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* SVG Circle Progress */}
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="16"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            stroke={isOverGoal ? "hsl(var(--destructive))" : "url(#gradient)"}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="shadow-glow"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center"
          >
            <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {consumed}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              of {goal} kcal
            </div>
            <div className={`text-lg font-semibold mt-3 ${isOverGoal ? 'text-destructive' : 'text-primary'}`}>
              {isOverGoal ? `+${consumed - goal}` : remaining} kcal {isOverGoal ? 'over' : 'left'}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="flex gap-8 mt-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{Math.round(percentage)}%</div>
          <div className="text-xs text-muted-foreground">Progress</div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalorieProgress;