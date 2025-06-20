import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, Award } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "🏆 Achievement Unlocked!",
      description: `${achievement.title}: ${achievement.description}`,
      duration: 5000,
    });

    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss, toast]);

  return null;
}

export function useAchievementNotifications() {
  const { toast } = useToast();

  const showAchievementUnlocked = (achievement: Achievement) => {
    toast({
      title: "🏆 Achievement Unlocked!",
      description: `${achievement.title}: ${achievement.description}`,
      duration: 8000,
      className: "terminal-window border-yellow-400 bg-gray-900",
    });
  };

  const showModuleCompleted = (moduleName: string) => {
    toast({
      title: "⭐ Module Completed!",
      description: `Congratulations on completing ${moduleName}!`,
      duration: 4000,
      className: "terminal-window border-green-400 bg-gray-900",
    });
  };

  const showLevelUp = (newLevel: string) => {
    toast({
      title: "🚀 Level Up!",
      description: `You've reached ${newLevel} level!`,
      duration: 6000,
      className: "terminal-window border-blue-400 bg-gray-900",
    });
  };

  return {
    showAchievementUnlocked,
    showModuleCompleted,
    showLevelUp,
  };
}