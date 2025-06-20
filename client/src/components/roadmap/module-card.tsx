import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Activity } from "lucide-react";
import { type Module, type UserProgress } from "@shared/schema";

interface ModuleCardProps {
  module: Module;
  progress?: UserProgress;
  isUnlocked: boolean;
}

export default function ModuleCard({ module, progress, isUnlocked }: ModuleCardProps) {
  const progressPercentage = progress?.progress || 0;
  const isCompleted = progress?.completed || false;
  const isInProgress = progressPercentage > 0 && !isCompleted;

  const getStatusColor = () => {
    if (isCompleted) return "text-green-400";
    if (isInProgress) return "text-blue-400";
    return "text-gray-500";
  };

  const getStatusText = () => {
    if (isCompleted) return "Completed";
    if (isInProgress) return "In Progress";
    if (!isUnlocked) return "Locked";
    return "Not Started";
  };

  const getProgressBarColor = () => {
    if (isCompleted) return "bg-green-400";
    if (isInProgress) return "bg-blue-400";
    return "bg-gray-700";
  };

  const getStatusIcon = () => {
    if (isCompleted) return <Check className="h-4 w-4 text-black" />;
    if (isInProgress) return <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />;
    if (!isUnlocked) return <Lock className="h-4 w-4 text-gray-500" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`terminal-window rounded-xl p-6 transition-all hover:shadow-lg ${
      isCompleted ? "hover:shadow-green-400/20" : 
      isInProgress ? "hover:shadow-blue-400/20" : 
      "hover:shadow-gray-500/20"
    } ${!isUnlocked ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isCompleted ? "bg-green-400 text-black" :
            isInProgress ? "bg-blue-400 text-white" :
            "bg-gray-700 text-gray-400"
          }`}>
            <i className={`fas ${module.icon} text-lg`}></i>
          </div>
          <div>
            <h3 className="font-semibold text-white">{module.title}</h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted ? "bg-green-400" :
          isInProgress ? "bg-gray-800" :
          "bg-gray-800"
        }`}>
          {getStatusIcon()}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className={getStatusColor()}>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressBarColor()} ${isCompleted ? 'progress-bar-glow' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-300">
          {module.description}
        </div>
        <div className="flex flex-wrap gap-2">
          {module.tools.map((tool) => (
            <Badge key={tool} variant="secondary" className="px-2 py-1 bg-gray-800 text-cyan-400 text-xs">
              {tool}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          className={`flex-1 font-medium ${
            isCompleted ? "bg-green-400 text-black hover:bg-green-500" :
            isInProgress ? "bg-blue-400 text-white hover:bg-blue-500" :
            !isUnlocked ? "bg-gray-700 text-gray-500 cursor-not-allowed" :
            "bg-blue-400 text-white hover:bg-blue-500"
          }`}
          disabled={!isUnlocked}
        >
          {isCompleted ? "Review" : isInProgress ? "Continue" : !isUnlocked ? "Locked" : "Start"}
        </Button>
        <Button
          variant="secondary"
          className="px-4 bg-gray-800 text-gray-300 hover:bg-gray-700"
          disabled={!isUnlocked}
        >
          <i className="fas fa-folder"></i>
        </Button>
      </div>
    </div>
  );
}
