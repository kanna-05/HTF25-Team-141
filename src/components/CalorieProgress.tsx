import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface CalorieProgressProps {
  consumed: number;
  goal: number;
}

const CalorieProgress = ({ consumed, goal }: CalorieProgressProps) => {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const isOverGoal = consumed > goal;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-card rounded-3xl p-8 shadow-glass"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Circular Progress Ring */}
        <div className="w-48 h-48">
          <CircularProgressbar
            value={percentage}
            text={`${Math.round(percentage)}%`}
            styles={buildStyles({
              pathColor: isOverGoal ? `hsl(var(--destructive))` : `hsl(var(--primary))`,
              textColor: `hsl(var(--foreground))`,
              trailColor: `hsl(var(--muted))`,
              textSize: "18px",
              pathTransitionDuration: 0.8,
            })}
          />
        </div>

        {/* Calorie Stats */}
        <div className="text-center space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-semibold tracking-wide"
          >
            {consumed} <span className="text-muted-foreground text-xl">/ {goal}</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-sm tracking-wide ${isOverGoal ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {isOverGoal ? `${consumed - goal} over goal` : `${remaining} calories remaining`}
          </motion.p>
        </div>

        {/* Achievement Badge */}
        {consumed >= goal && !isOverGoal && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="px-4 py-2 gradient-primary rounded-full text-white text-sm font-medium shadow-glow tracking-wide"
          >
            🎉 Goal Achieved!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CalorieProgress;
