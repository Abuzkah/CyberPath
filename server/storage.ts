import {
  users, modules, userProgress, projects, blogPosts, achievements, userAchievements,
  type User, type InsertUser, type Module, type InsertModule,
  type UserProgress, type InsertUserProgress, type Project, type InsertProject,
  type BlogPost, type InsertBlogPost, type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Modules
  getModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  
  // User Progress
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getModuleProgress(userId: number, moduleId: number): Promise<UserProgress | undefined>;
  updateProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Projects
  getUserProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Blog Posts
  getUserBlogPosts(userId: number): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private modules: Map<number, Module> = new Map();
  private userProgress: Map<string, UserProgress> = new Map(); // key: `${userId}-${moduleId}`
  private projects: Map<number, Project> = new Map();
  private blogPosts: Map<number, BlogPost> = new Map();
  private achievements: Map<number, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map(); // key: `${userId}-${achievementId}`
  
  private currentUserId = 1;
  private currentModuleId = 1;
  private currentProgressId = 1;
  private currentProjectId = 1;
  private currentBlogPostId = 1;
  private currentAchievementId = 1;
  private currentUserAchievementId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = { 
      id: 1, 
      username: "user@cyberpath", 
      email: "user@cyberpath.com", 
      githubToken: null,
      createdAt: new Date() 
    };
    this.users.set(1, defaultUser);

    // Create modules
    const moduleData: InsertModule[] = [
      {
        title: "Reconnaissance",
        description: "Master the art of information gathering, OSINT techniques, and network scanning fundamentals.",
        icon: "fa-search",
        tools: ["Nmap", "Shodan", "theHarvester"],
        order: 1,
        prerequisiteModules: null
      },
      {
        title: "Web Application Hacking",
        description: "Learn to identify and exploit web vulnerabilities including SQL injection, XSS, and authentication bypasses.",
        icon: "fa-globe",
        tools: ["Burp Suite", "OWASP ZAP", "SQLmap"],
        order: 2,
        prerequisiteModules: [1]
      },
      {
        title: "Exploit Development",
        description: "Deep dive into buffer overflows, shellcode development, and advanced exploitation techniques.",
        icon: "fa-bug",
        tools: ["GDB", "Metasploit", "IDA Pro"],
        order: 3,
        prerequisiteModules: [1, 2]
      },
      {
        title: "Active Directory Attacks",
        description: "Master domain enumeration, privilege escalation, and lateral movement in AD environments.",
        icon: "fa-network-wired",
        tools: ["BloodHound", "Mimikatz", "PowerView"],
        order: 4,
        prerequisiteModules: [1, 2]
      },
      {
        title: "Bluetooth Hacking",
        description: "Learn Bluetooth protocol vulnerabilities, BLE attacks, and wireless exploitation techniques.",
        icon: "fa-bluetooth",
        tools: ["Bluez", "Ubertooth", "HackRF"],
        order: 5,
        prerequisiteModules: [1]
      },
      {
        title: "Capture The Flag",
        description: "Apply your skills in competitive CTF challenges and advanced problem-solving scenarios.",
        icon: "fa-flag",
        tools: ["pwntools", "Wireshark", "John"],
        order: 6,
        prerequisiteModules: [1, 2, 3]
      }
    ];

    moduleData.forEach((module, index) => {
      const moduleEntity: Module = { 
        ...module, 
        id: index + 1,
        prerequisiteModules: module.prerequisiteModules || null
      };
      this.modules.set(index + 1, moduleEntity);
    });

    // Create sample progress
    this.userProgress.set("1-1", {
      id: 1,
      userId: 1,
      moduleId: 1,
      completed: true,
      progress: 100,
      lastAccessed: new Date()
    });

    this.userProgress.set("1-2", {
      id: 2,
      userId: 1,
      moduleId: 2,
      completed: false,
      progress: 75,
      lastAccessed: new Date()
    });

    // Create achievements
    const achievementData: InsertAchievement[] = [
      {
        title: "Recon Master",
        description: "Completed all reconnaissance modules",
        icon: "fa-search",
        condition: "complete_modules:1"
      },
      {
        title: "Script Kiddie",
        description: "Uploaded 10 custom scripts",
        icon: "fa-code",
        condition: "upload_scripts:10"
      },
      {
        title: "Defender",
        description: "Complete 5 defensive challenges",
        icon: "fa-shield-alt",
        condition: "complete_defensive:5"
      },
      {
        title: "Bug Hunter",
        description: "Find 25 vulnerabilities",
        icon: "fa-bug",
        condition: "find_vulns:25"
      },
      {
        title: "Streak",
        description: "30 day learning streak",
        icon: "fa-fire",
        condition: "learning_streak:30"
      },
      {
        title: "Elite",
        description: "Complete all modules",
        icon: "fa-crown",
        condition: "complete_all_modules"
      }
    ];

    achievementData.forEach((achievement, index) => {
      this.achievements.set(index + 1, { ...achievement, id: index + 1 });
    });

    // Unlock first achievement
    this.userAchievements.set("1-1", {
      id: 1,
      userId: 1,
      achievementId: 1,
      unlockedAt: new Date()
    });

    this.currentUserId = 2;
    this.currentModuleId = 7;
    this.currentAchievementId = 7;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      githubToken: insertUser.githubToken || null
    };
    this.users.set(id, user);
    return user;
  }

  // Modules
  async getModules(): Promise<Module[]> {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    const module: Module = { 
      ...insertModule, 
      id,
      prerequisiteModules: insertModule.prerequisiteModules || null
    };
    this.modules.set(id, module);
    return module;
  }

  // User Progress
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getModuleProgress(userId: number, moduleId: number): Promise<UserProgress | undefined> {
    return this.userProgress.get(`${userId}-${moduleId}`);
  }

  async updateProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const key = `${insertProgress.userId}-${insertProgress.moduleId}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated: UserProgress = {
        ...existing,
        ...insertProgress,
        lastAccessed: new Date()
      };
      this.userProgress.set(key, updated);
      return updated;
    } else {
      const id = this.currentProgressId++;
      const progress: UserProgress = {
        ...insertProgress,
        id,
        completed: insertProgress.completed || false,
        progress: insertProgress.progress || 0,
        lastAccessed: new Date()
      };
      this.userProgress.set(key, progress);
      return progress;
    }
  }

  // Projects
  async getUserProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      ...insertProject,
      id,
      moduleId: insertProject.moduleId || null,
      result: insertProject.result || null,
      files: insertProject.files || null,
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error(`Project with id ${id} not found`);
    }
    const updated: Project = { ...existing, ...updateData };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }

  // Blog Posts
  async getUserBlogPosts(userId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const now = new Date();
    const post: BlogPost = {
      ...insertPost,
      id,
      published: insertPost.published || false,
      createdAt: now,
      updatedAt: now
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: number, updateData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existing = this.blogPosts.get(id);
    if (!existing) {
      throw new Error(`Blog post with id ${id} not found`);
    }
    const updated: BlogPost = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.blogPosts.set(id, updated);
    return updated;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async unlockAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const key = `${insertUserAchievement.userId}-${insertUserAchievement.achievementId}`;
    if (this.userAchievements.has(key)) {
      return this.userAchievements.get(key)!;
    }
    
    const id = this.currentUserAchievementId++;
    const userAchievement: UserAchievement = {
      ...insertUserAchievement,
      id,
      unlockedAt: new Date()
    };
    this.userAchievements.set(key, userAchievement);
    return userAchievement;
  }
}

export const storage = new MemStorage();
