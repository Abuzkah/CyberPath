import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ModuleCard from "@/components/roadmap/module-card";
import AchievementBadge from "@/components/roadmap/achievement-badge";
import ProjectTracker from "@/components/projects/project-tracker";
import MarkdownEditor from "@/components/blog/markdown-editor";
import GitHubSync from "@/components/github/github-sync";
import CyberLabSync from "@/components/lab/cyber-lab-sync";
import { useQuery } from "@tanstack/react-query";
import { useProgress } from "@/hooks/use-progress";
import { type Module, type Achievement, type UserAchievement } from "@shared/schema";
import { CURRENT_USER_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus, Pen, Github } from "lucide-react";

type TabType = "roadmap" | "projects" | "blog" | "github" | "lab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("roadmap");
  const { modules, getModuleProgress, isModuleUnlocked, overallProgress, moduleStats } = useProgress();

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: [`/api/achievements/${CURRENT_USER_ID}`],
  });

  const { data: projects = [] } = useQuery({
    queryKey: [`/api/projects/${CURRENT_USER_ID}`],
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: [`/api/blog/${CURRENT_USER_ID}`],
  });

  const renderMainContent = () => {
    switch (activeTab) {
      case "roadmap":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-green-400 mb-2">Interactive Roadmap Dashboard</h1>
              <p className="text-gray-400">Your personalized cybersecurity learning journey</p>
            </div>

            {/* Learning Path */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  progress={getModuleProgress(module.id)}
                  isUnlocked={isModuleUnlocked(module)}
                />
              ))}
            </div>

            {/* Achievement Badges */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                <i className="fas fa-trophy mr-3"></i>Achievement Badges
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={userAchievements.some(ua => ua.achievementId === achievement.id)}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <i className="fas fa-bolt mr-3"></i>Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => setActiveTab("projects")}
                  className="terminal-window h-24 flex items-center space-x-4 hover:shadow-lg hover:shadow-green-400/20 transition-all group bg-transparent border-0 justify-start"
                >
                  <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center text-black">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">Log New Project</h3>
                    <p className="text-sm text-gray-400">Document your latest achievement</p>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveTab("blog")}
                  className="terminal-window h-24 flex items-center space-x-4 hover:shadow-lg hover:shadow-blue-400/20 transition-all group bg-transparent border-0 justify-start"
                >
                  <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center text-white">
                    <Pen className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Write Blog Post</h3>
                    <p className="text-sm text-gray-400">Share your knowledge</p>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveTab("github")}
                  className="terminal-window h-24 flex items-center space-x-4 hover:shadow-lg hover:shadow-cyan-400/20 transition-all group bg-transparent border-0 justify-start"
                >
                  <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center text-black">
                    <Github className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Sync to GitHub</h3>
                    <p className="text-sm text-gray-400">Backup your progress</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        );
      case "projects":
        return <ProjectTracker />;
      case "blog":
        return <MarkdownEditor />;
      case "github":
        return <GitHubSync />;
      case "lab":
        return <CyberLabSync />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="flex h-screen pt-16">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          overallProgress={overallProgress}
          moduleStats={moduleStats}
          projectCount={projects.length}
          blogPostCount={blogPosts.length}
        />
        <main className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
