import { type Achievement } from "@shared/schema";

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export default function AchievementBadge({ achievement, isUnlocked }: AchievementBadgeProps) {
  return (
    <div className={`terminal-window rounded-lg p-4 text-center transition-all hover:shadow-lg ${
      isUnlocked ? "hover:shadow-green-400/20" : "opacity-50"
    }`}>
      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
        isUnlocked ? "bg-green-400 text-black" : "bg-gray-700 text-gray-400"
      }`}>
        <i className={`fas ${achievement.icon} text-lg`}></i>
      </div>
      <h4 className={`font-semibold text-sm mb-1 ${
        isUnlocked ? "text-green-400" : "text-gray-400"
      }`}>
        {achievement.title}
      </h4>
      <p className={`text-xs ${
        isUnlocked ? "text-gray-400" : "text-gray-500"
      }`}>
        {achievement.description}
      </p>
    </div>
  );
}
