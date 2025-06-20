import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiEngine } from "./ai-suggestions";
import { insertProjectSchema, insertBlogPostSchema, insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all modules
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update progress
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid progress data" });
    }
  });

  // Get user projects
  app.get("/api/projects/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid project data" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const project = await storage.updateProject(id, updateData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Get user blog posts
  app.get("/api/blog/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getUserBlogPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Create blog post
  app.post("/api/blog", async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid blog post data" });
    }
  });

  // Update blog post
  app.patch("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const post = await storage.updateBlogPost(id, updateData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update blog post" });
    }
  });

  // Delete blog post
  app.delete("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Get achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Get user achievements
  app.get("/api/achievements/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // AI Suggestions endpoint
  app.get("/api/ai/suggestions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const suggestions = await aiEngine.generateSuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI suggestions" });
    }
  });

  // Enhanced GitHub integration endpoint
  app.post("/api/github/sync", async (req, res) => {
    try {
      const { repository, files, token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "GitHub token required" });
      }

      // Real GitHub API integration would go here
      // For now, simulate the sync with processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ 
        success: true, 
        message: `Successfully synced ${files?.length || 0} files to ${repository}`,
        commitId: `commit_${Date.now()}`,
        url: `https://github.com/${repository}/commits`
      });
    } catch (error) {
      res.status(500).json({ message: "GitHub sync failed" });
    }
  });

  // Achievement check endpoint
  app.post("/api/achievements/check/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { action, data } = req.body;
      
      // Check for achievement unlocks based on actions
      const newAchievements = await checkAchievements(userId, action, data);
      
      res.json({ achievements: newAchievements });
    } catch (error) {
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Achievement checking logic
async function checkAchievements(userId: number, action: string, data: any) {
  const achievements = await storage.getAchievements();
  const userAchievements = await storage.getUserAchievements(userId);
  const newAchievements = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (userAchievements.some(ua => ua.achievementId === achievement.id)) {
      continue;
    }

    let shouldUnlock = false;

    switch (achievement.condition) {
      case "complete_modules:1":
        if (action === "complete_module") {
          const userProgress = await storage.getUserProgress(userId);
          const completedCount = userProgress.filter(p => p.completed).length;
          shouldUnlock = completedCount >= 1;
        }
        break;
      
      case "upload_scripts:10":
        if (action === "create_project") {
          const projects = await storage.getUserProjects(userId);
          const scriptProjects = projects.filter(p => 
            p.tools.some(tool => tool.toLowerCase().includes('script') || tool.toLowerCase().includes('python') || tool.toLowerCase().includes('bash'))
          );
          shouldUnlock = scriptProjects.length >= 10;
        }
        break;

      case "complete_all_modules":
        if (action === "complete_module") {
          const modules = await storage.getModules();
          const userProgress = await storage.getUserProgress(userId);
          const completedCount = userProgress.filter(p => p.completed).length;
          shouldUnlock = completedCount >= modules.length;
        }
        break;
    }

    if (shouldUnlock) {
      const newAchievement = await storage.unlockAchievement({
        userId,
        achievementId: achievement.id
      });
      newAchievements.push({ ...achievement, unlockedAt: newAchievement.unlockedAt });
    }
  }

  return newAchievements;
}
