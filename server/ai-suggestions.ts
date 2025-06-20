import { storage } from "./storage";
import type { Module, UserProgress, Project, BlogPost } from "@shared/schema";

export interface AISuggestion {
  id: string;
  type: "module" | "tool" | "challenge" | "resource";
  title: string;
  description: string;
  reason: string;
  priority: "high" | "medium" | "low";
  category: string;
  estimatedTime?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export class AIRecommendationEngine {
  private toolSuggestions = [
    { name: "Metasploit", category: "Exploit Development", description: "Framework for developing and executing exploits" },
    { name: "Wireshark", category: "Network Analysis", description: "Network protocol analyzer for packet inspection" },
    { name: "John the Ripper", category: "Password Cracking", description: "Fast password cracker for various hash types" },
    { name: "Gobuster", category: "Web Enumeration", description: "Directory and file brute-forcer for web applications" },
    { name: "Responder", category: "Network Attacks", description: "LLMNR, NBT-NS and MDNS poisoner" },
    { name: "Empire", category: "Post-Exploitation", description: "PowerShell and Python post-exploitation framework" },
    { name: "CrackMapExec", category: "Active Directory", description: "Tool for Active Directory environments assessment" },
    { name: "Impacket", category: "Network Protocols", description: "Collection of Python classes for network protocols" }
  ];

  private challengeSuggestions = [
    { name: "HackTheBox", difficulty: "intermediate", category: "CTF", description: "Real-world penetration testing labs" },
    { name: "TryHackMe", difficulty: "beginner", category: "Learning", description: "Guided cybersecurity challenges" },
    { name: "VulnHub", difficulty: "intermediate", category: "VM Labs", description: "Vulnerable virtual machines for practice" },
    { name: "OverTheWire", difficulty: "beginner", category: "Wargames", description: "Security wargames and challenges" },
    { name: "PentesterLab", difficulty: "intermediate", category: "Web Security", description: "Web application security exercises" },
    { name: "Cybrary", difficulty: "beginner", category: "Training", description: "Free cybersecurity training platform" }
  ];

  async generateSuggestions(userId: number): Promise<AISuggestion[]> {
    const userProgress = await storage.getUserProgress(userId);
    const modules = await storage.getModules();
    const projects = await storage.getUserProjects(userId);
    const blogPosts = await storage.getUserBlogPosts(userId);

    const suggestions: AISuggestion[] = [];

    // Analyze completed modules and suggest next steps
    const completedModules = userProgress.filter(p => p.completed);
    const availableModules = modules.filter(m => 
      !completedModules.some(cm => cm.moduleId === m.id) &&
      this.isModuleUnlocked(m, completedModules, modules)
    );

    // Suggest next modules
    availableModules.slice(0, 2).forEach(module => {
      suggestions.push({
        id: `module-${module.id}`,
        type: "module",
        title: `Start ${module.title}`,
        description: module.description,
        reason: this.getModuleReason(module, completedModules),
        priority: "high",
        category: module.title,
        estimatedTime: "2-4 weeks",
        difficulty: this.getModuleDifficulty(module)
      });
    });

    // Suggest tools based on completed modules
    const toolSuggestions = this.getToolSuggestions(completedModules, modules);
    suggestions.push(...toolSuggestions.slice(0, 3));

    // Suggest challenges based on experience level
    const challengeSuggestions = this.getChallengeSuggestions(completedModules, projects);
    suggestions.push(...challengeSuggestions.slice(0, 2));

    // Suggest documentation improvements
    if (projects.length > blogPosts.length) {
      suggestions.push({
        id: "blog-documentation",
        type: "resource",
        title: "Document Your Projects",
        description: "Create detailed writeups for your recent penetration testing projects",
        reason: `You have ${projects.length} projects but only ${blogPosts.length} blog posts. Documentation helps solidify learning.`,
        priority: "medium",
        category: "Documentation",
        estimatedTime: "1-2 hours",
        difficulty: "beginner"
      });
    }

    // Suggest advanced techniques based on progress
    if (completedModules.length >= 3) {
      suggestions.push({
        id: "advanced-techniques",
        type: "challenge",
        title: "Advanced Exploitation Techniques",
        description: "Explore buffer overflow exploitation and shellcode development",
        reason: "Based on your progress in multiple modules, you're ready for advanced exploitation",
        priority: "medium",
        category: "Advanced",
        estimatedTime: "3-6 weeks",
        difficulty: "advanced"
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private isModuleUnlocked(module: Module, completedProgress: UserProgress[], allModules: Module[]): boolean {
    if (!module.prerequisiteModules || module.prerequisiteModules.length === 0) {
      return true;
    }

    return module.prerequisiteModules.every(prereqId => 
      completedProgress.some(cp => cp.moduleId === prereqId)
    );
  }

  private getModuleReason(module: Module, completedModules: UserProgress[]): string {
    if (completedModules.length === 0) {
      return "Perfect starting point for your cybersecurity journey";
    }

    if (module.prerequisiteModules && module.prerequisiteModules.length > 0) {
      return `You've completed the prerequisites. Ready for the next challenge!`;
    }

    return `Build on your existing knowledge with this complementary module`;
  }

  private getModuleDifficulty(module: Module): "beginner" | "intermediate" | "advanced" {
    const beginnerModules = ["Reconnaissance"];
    const advancedModules = ["Exploit Development", "Active Directory Attacks"];
    
    if (beginnerModules.includes(module.title)) return "beginner";
    if (advancedModules.includes(module.title)) return "advanced";
    return "intermediate";
  }

  private getToolSuggestions(completedModules: UserProgress[], allModules: Module[]): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    completedModules.forEach(progress => {
      const module = allModules.find(m => m.id === progress.moduleId);
      if (!module) return;

      const relevantTools = this.toolSuggestions.filter(tool => 
        this.isToolRelevantToModule(tool, module)
      );

      relevantTools.forEach(tool => {
        suggestions.push({
          id: `tool-${tool.name.toLowerCase()}`,
          type: "tool",
          title: `Master ${tool.name}`,
          description: tool.description,
          reason: `Perfect complement to your ${module.title} knowledge`,
          priority: "medium",
          category: tool.category,
          estimatedTime: "1-2 weeks",
          difficulty: "intermediate"
        });
      });
    });

    return suggestions;
  }

  private isToolRelevantToModule(tool: any, module: Module): boolean {
    const moduleToolMap: { [key: string]: string[] } = {
      "Reconnaissance": ["Network Analysis", "Web Enumeration"],
      "Web Application Hacking": ["Web Enumeration"],
      "Exploit Development": ["Exploit Development"],
      "Active Directory Attacks": ["Active Directory", "Network Attacks", "Post-Exploitation"],
      "Bluetooth Hacking": ["Network Analysis"],
      "Capture The Flag": ["Password Cracking", "Network Protocols"]
    };

    const relevantCategories = moduleToolMap[module.title] || [];
    return relevantCategories.includes(tool.category);
  }

  private getChallengeSuggestions(completedModules: UserProgress[], projects: Project[]): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const experienceLevel = this.calculateExperienceLevel(completedModules, projects);

    const relevantChallenges = this.challengeSuggestions.filter(challenge => 
      challenge.difficulty === experienceLevel || 
      (experienceLevel === "advanced" && challenge.difficulty === "intermediate")
    );

    relevantChallenges.forEach(challenge => {
      suggestions.push({
        id: `challenge-${challenge.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: "challenge",
        title: `Try ${challenge.name}`,
        description: challenge.description,
        reason: `Matches your current skill level (${experienceLevel})`,
        priority: "medium",
        category: challenge.category,
        estimatedTime: "Ongoing",
        difficulty: challenge.difficulty as any
      });
    });

    return suggestions;
  }

  private calculateExperienceLevel(completedModules: UserProgress[], projects: Project[]): "beginner" | "intermediate" | "advanced" {
    const score = completedModules.length * 2 + projects.length;
    
    if (score >= 10) return "advanced";
    if (score >= 5) return "intermediate";
    return "beginner";
  }
}

export const aiEngine = new AIRecommendationEngine();