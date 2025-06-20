import { useQuery } from "@tanstack/react-query";
import { type UserProgress, type Module } from "@shared/schema";
import { CURRENT_USER_ID } from "@/lib/constants";

export function useProgress() {
  const { data: progressData = [] } = useQuery<UserProgress[]>({
    queryKey: [`/api/progress/${CURRENT_USER_ID}`],
  });

  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });

  const getModuleProgress = (moduleId: number) => {
    return progressData.find(p => p.moduleId === moduleId);
  };

  const isModuleUnlocked = (module: Module) => {
    if (!module.prerequisiteModules || module.prerequisiteModules.length === 0) {
      return true;
    }
    
    return module.prerequisiteModules.every(prereqId => {
      const prereqProgress = getModuleProgress(prereqId);
      return prereqProgress?.completed || false;
    });
  };

  const overallProgress = () => {
    const completedModules = progressData.filter(p => p.completed).length;
    const totalModules = modules.length;
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  };

  const moduleStats = () => {
    const completed = progressData.filter(p => p.completed).length;
    const total = modules.length;
    return `${completed}/${total}`;
  };

  return {
    progressData,
    modules,
    getModuleProgress,
    isModuleUnlocked,
    overallProgress: overallProgress(),
    moduleStats: moduleStats(),
  };
}
