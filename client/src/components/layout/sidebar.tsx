import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AI_TIPS } from "@/lib/constants";
import { Route, MapPin, FileText, Github, Upload, Bot, TrendingUp } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: "roadmap" | "projects" | "blog" | "github" | "lab") => void;
  overallProgress: number;
  moduleStats: string;
  projectCount: number;
  blogPostCount: number;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  overallProgress,
  moduleStats,
  projectCount,
  blogPostCount,
}: SidebarProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const handleGetNewTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % AI_TIPS.length);
  };

  const navigationItems = [
    { id: "roadmap", label: "Roadmap Dashboard", icon: Route, active: activeTab === "roadmap" },
    { id: "projects", label: "Project Tracker", icon: MapPin, active: activeTab === "projects" },
    { id: "blog", label: "Markdown Blog", icon: FileText, active: activeTab === "blog" },
    { id: "github", label: "GitHub Sync", icon: Github, active: activeTab === "github" },
    { id: "lab", label: "Cyber Lab Sync", icon: Upload, active: activeTab === "lab" },
  ];

  return (
    <aside className="w-80 bg-gray-900 border-r border-gray-700 overflow-y-auto">
      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                onClick={() => onTabChange(item.id as any)}
                className={`w-full justify-start font-medium ${
                  item.active
                    ? "bg-green-400 bg-opacity-20 text-green-400 border border-green-400"
                    : "bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                variant="ghost"
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Progress Overview */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-green-400 font-semibold mb-3 flex items-center">
          <TrendingUp className="mr-2 h-4 w-4" />
          Progress Overview
        </h3>
        <div className="space-y-3">
          <div className="bg-black rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span className="text-green-400">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Modules Completed</span>
              <span className="text-green-400">{moduleStats}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Projects Logged</span>
              <span className="text-cyan-400">{projectCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Blog Posts</span>
              <span className="text-yellow-400">{blogPostCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-blue-400 font-semibold mb-3 flex items-center">
          <Bot className="mr-2 h-4 w-4" />
          AI Assistant
        </h3>
        <div className="bg-black rounded-lg p-3 border border-blue-400 border-opacity-30">
          <div className="text-sm text-gray-300 mb-2">
            💡 <strong>Today's Tip:</strong>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {AI_TIPS[currentTipIndex]}
          </p>
          <Button
            onClick={handleGetNewTip}
            className="w-full bg-blue-400 bg-opacity-20 text-blue-400 text-sm hover:bg-opacity-30"
            variant="ghost"
          >
            Get New Tip
          </Button>
        </div>
      </div>
    </aside>
  );
}
