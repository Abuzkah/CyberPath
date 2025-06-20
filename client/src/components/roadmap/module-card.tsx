import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Activity, Play, RotateCcw } from "lucide-react";
import { type Module, type UserProgress } from "@shared/schema";
import { useAchievementNotifications } from "@/components/notifications/achievement-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CURRENT_USER_ID } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface ModuleCardProps {
  module: Module;
  progress?: UserProgress;
  isUnlocked: boolean;
}

export default function ModuleCard({ module, progress, isUnlocked }: ModuleCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const progressPercentage = progress?.progress || 0;
  const isCompleted = progress?.completed || false;
  const isInProgress = progressPercentage > 0 && !isCompleted;
  const { showModuleCompleted, showAchievementUnlocked } = useAchievementNotifications();
  const { toast } = useToast();

  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: { progress: number; completed: boolean }) => {
      const response = await apiRequest("POST", "/api/progress", {
        userId: CURRENT_USER_ID,
        moduleId: module.id,
        ...newProgress
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${CURRENT_USER_ID}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/ai/suggestions/${CURRENT_USER_ID}`] });
      
      if (data.completed && !isCompleted) {
        showModuleCompleted(module.title);
        checkForAchievements();
      }
      setIsUpdating(false);
    },
    onError: () => {
      toast({ title: "Failed to update progress", variant: "destructive" });
      setIsUpdating(false);
    }
  });

  const checkForAchievements = async () => {
    try {
      const response = await apiRequest("POST", `/api/achievements/check/${CURRENT_USER_ID}`, {
        action: "complete_module",
        data: { moduleId: module.id }
      });
      const result = await response.json();
      
      result.achievements?.forEach((achievement: any) => {
        showAchievementUnlocked(achievement);
      });
    } catch (error) {
      console.error("Failed to check achievements:", error);
    }
  };

  const handleModuleAction = () => {
    if (!isUnlocked) return;
    
    setIsUpdating(true);
    
    if (isCompleted) {
      // Review mode - reset progress to allow retaking
      updateProgressMutation.mutate({ progress: 0, completed: false });
    } else if (isInProgress) {
      // Continue - mark as completed
      updateProgressMutation.mutate({ progress: 100, completed: true });
    } else {
      // Start - set to 25% progress
      updateProgressMutation.mutate({ progress: 25, completed: false });
    }
  };

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
    <div className={`terminal-window rounded-xl p-6 transition-all hover:shadow-lg module-card-hover ${
      isCompleted ? "hover:shadow-green-400/20 cyber-pulse" : 
      isInProgress ? "hover:shadow-blue-400/20" : 
      "hover:shadow-gray-500/20"
    } ${!isUnlocked ? "opacity-60" : ""} ${isUpdating ? "loading-matrix" : ""}`}>
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
          onClick={handleModuleAction}
          disabled={!isUnlocked || isUpdating}
          className={`flex-1 font-medium transition-all ${
            isCompleted ? "bg-green-400 text-black hover:bg-green-500" :
            isInProgress ? "bg-blue-400 text-white hover:bg-blue-500" :
            !isUnlocked ? "bg-gray-700 text-gray-500 cursor-not-allowed" :
            "bg-blue-400 text-white hover:bg-blue-500"
          }`}
        >
          {isUpdating ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </div>
          ) : (
            <div className="flex items-center">
              {isCompleted ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Review
                </>
              ) : isInProgress ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Complete
                </>
              ) : !isUnlocked ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Locked
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </div>
          )}
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
