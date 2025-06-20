import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, modules, userProgress, projects, blogPosts, achievements, userAchievements,
  type User, type InsertUser, type Module, type InsertModule,
  type UserProgress, type InsertUserProgress, type Project, type InsertProject,
  type BlogPost, type InsertBlogPost, type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement
} from "@shared/schema";
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getModules(): Promise<Module[]> {
    return await db.select().from(modules).orderBy(modules.order);
  }

  async getModule(id: number): Promise<Module | undefined> {
    const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
    return result[0];
  }

  async createModule(module: InsertModule): Promise<Module> {
    const result = await db.insert(modules).values(module).returning();
    return result[0];
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getModuleProgress(userId: number, moduleId: number): Promise<UserProgress | undefined> {
    const result = await db.select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)))
      .limit(1);
    return result[0];
  }

  async updateProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getModuleProgress(progress.userId, progress.moduleId);
    
    if (existing) {
      const result = await db.update(userProgress)
        .set({ ...progress, lastAccessed: new Date() })
        .where(and(eq(userProgress.userId, progress.userId), eq(userProgress.moduleId, progress.moduleId)))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userProgress)
        .values({ ...progress, lastAccessed: new Date() })
        .returning();
      return result[0];
    }
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(projects.createdAt);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const result = await db.update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getUserBlogPosts(userId: number): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.userId, userId))
      .orderBy(blogPosts.updatedAt);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return result[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const result = await db.update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return result[0];
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const existing = await db.select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userAchievement.userId),
        eq(userAchievements.achievementId, userAchievement.achievementId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(userAchievements).values(userAchievement).returning();
    return result[0];
  }
}