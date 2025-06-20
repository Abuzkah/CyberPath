import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Github, Link, Upload, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface SyncItem {
  id: string;
  name: string;
  type: "markdown" | "script" | "report";
  size: string;
  selected: boolean;
}

export default function GitHubSync() {
  const [githubRepo, setGithubRepo] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();

  const [syncItems, setSyncItems] = useState<SyncItem[]>([
    { id: "1", name: "web-app-pentest-report.md", type: "report", size: "12.3 KB", selected: true },
    { id: "2", name: "sql-injection-walkthrough.md", type: "markdown", size: "8.7 KB", selected: true },
    { id: "3", name: "recon-script.sh", type: "script", size: "3.2 KB", selected: false },
    { id: "4", name: "vulnerability-scanner.py", type: "script", size: "15.6 KB", selected: true },
    { id: "5", name: "ctf-writeup-hackthebox.md", type: "markdown", size: "6.8 KB", selected: false },
  ]);

  const syncMutation = useMutation({
    mutationFn: async (data: { repository: string; files: SyncItem[] }) => {
      setSyncStatus("syncing");
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 500);

      try {
        const response = await apiRequest("POST", "/api/github/sync", data);
        const result = await response.json();
        
        clearInterval(progressInterval);
        setSyncProgress(100);
        
        setTimeout(() => {
          setSyncStatus("success");
          setSyncProgress(0);
        }, 500);
        
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setSyncStatus("error");
        setSyncProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({ 
        title: "Sync successful!", 
        description: data.message 
      });
    },
    onError: () => {
      toast({ 
        title: "Sync failed", 
        description: "Unable to sync files to GitHub",
        variant: "destructive" 
      });
    },
  });

  const handleItemToggle = (id: string) => {
    setSyncItems(items => 
      items.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSyncItems(items => 
      items.map(item => ({ ...item, selected: checked }))
    );
  };

  const handleSync = () => {
    if (!githubRepo.trim()) {
      toast({ 
        title: "Repository required", 
        description: "Please enter a GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    const selectedFiles = syncItems.filter(item => item.selected);
    if (selectedFiles.length === 0) {
      toast({ 
        title: "No files selected", 
        description: "Please select at least one file to sync",
        variant: "destructive"
      });
      return;
    }

    syncMutation.mutate({
      repository: githubRepo,
      files: selectedFiles
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "markdown":
        return <i className="fas fa-file-alt text-blue-400"></i>;
      case "script":
        return <i className="fas fa-file-code text-green-400"></i>;
      case "report":
        return <i className="fas fa-file-pdf text-red-400"></i>;
      default:
        return <i className="fas fa-file text-gray-400"></i>;
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <Clock className="h-5 w-5 text-blue-400 animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Github className="h-5 w-5 text-gray-400" />;
    }
  };

  const selectedCount = syncItems.filter(item => item.selected).length;
  const allSelected = selectedCount === syncItems.length;
  const someSelected = selectedCount > 0 && selectedCount < syncItems.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-400 mb-2">GitHub Integration</h1>
        <p className="text-gray-400">Sync your cybersecurity content to GitHub repositories</p>
      </div>

      {/* Connection Status */}
      <Card className="terminal-window border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-400">
            <Github className="mr-2 h-5 w-5" />
            GitHub Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Connected as user@cyberpath</span>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <Link className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repository Configuration */}
      <Card className="terminal-window border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-cyan-400">Repository Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Repository
              </label>
              <Input
                placeholder="https://github.com/username/cybersecurity-portfolio"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div className="text-sm text-gray-400">
              <i className="fas fa-info-circle mr-2"></i>
              Files will be organized automatically by type and date
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Selection */}
      <Card className="terminal-window border-gray-700 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-400">Content to Sync</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-green-400"
              />
              <span className="text-sm text-gray-400">Select All ({selectedCount} selected)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => handleItemToggle(item.id)}
                  className="data-[state=checked]:bg-green-400"
                />
                <div className="flex-1 flex items-center space-x-3">
                  <div className="text-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-sm text-gray-400">{item.size}</div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {item.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Progress */}
      {syncStatus === "syncing" && (
        <Card className="terminal-window border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="h-5 w-5 text-blue-400 animate-spin" />
              <span className="text-blue-400 font-medium">Syncing files to GitHub...</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
            <div className="text-sm text-gray-400 mt-2">
              Uploading {selectedCount} files ({syncProgress}% complete)
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Status */}
      {syncStatus !== "idle" && syncStatus !== "syncing" && (
        <Card className="terminal-window border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <span className={`font-medium ${
                syncStatus === "success" ? "text-green-400" : "text-red-400"
              }`}>
                {syncStatus === "success" 
                  ? "Files synced successfully!" 
                  : "Sync failed. Please try again."
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="ghost" className="text-gray-400">
          <i className="fas fa-history mr-2"></i>
          View Sync History
        </Button>
        <Button 
          onClick={handleSync}
          disabled={syncMutation.isPending || selectedCount === 0}
          className="bg-green-400 text-black hover:bg-green-500"
        >
          <Upload className="mr-2 h-4 w-4" />
          {syncMutation.isPending ? "Syncing..." : `Sync ${selectedCount} Files`}
        </Button>
      </div>
    </div>
  );
}
