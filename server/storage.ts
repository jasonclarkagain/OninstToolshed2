import { users, osintQueries, osintReports, toolConfigs, apiKeys, auditLogs, type User, type InsertUser, type OsintQuery, type InsertOsintQuery, type OsintReport, type InsertOsintReport, type ToolConfig, type InsertToolConfig, type ApiKey, type InsertApiKey, type AuditLog, type InsertAuditLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createOsintQuery(query: InsertOsintQuery): Promise<OsintQuery>;
  updateOsintQuery(id: number, updates: Partial<OsintQuery>): Promise<OsintQuery | undefined>;
  getOsintQuery(id: number): Promise<OsintQuery | undefined>;
  getUserQueries(userId?: number): Promise<OsintQuery[]>;
  
  createReport(report: InsertOsintReport): Promise<OsintReport>;
  getUserReports(userId?: number): Promise<OsintReport[]>;
  
  // Tool configuration management
  getToolConfig(userId: number, toolType: string): Promise<ToolConfig | undefined>;
  saveToolConfig(config: InsertToolConfig): Promise<ToolConfig>;
  
  // API key management
  getApiKey(userId: number, service: string): Promise<ApiKey | undefined>;
  saveApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  
  // Audit logging
  logAudit(audit: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return user;
  }

  async createOsintQuery(insertQuery: InsertOsintQuery): Promise<OsintQuery> {
    const [query] = await db
      .insert(osintQueries)
      .values({
        ...insertQuery,
        priority: insertQuery.priority || 'normal',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return query;
  }

  async updateOsintQuery(id: number, updates: Partial<OsintQuery>): Promise<OsintQuery | undefined> {
    const [query] = await db
      .update(osintQueries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(osintQueries.id, id))
      .returning();
    return query || undefined;
  }

  async getOsintQuery(id: number): Promise<OsintQuery | undefined> {
    const [query] = await db.select().from(osintQueries).where(eq(osintQueries.id, id));
    return query || undefined;
  }

  async getUserQueries(userId?: number): Promise<OsintQuery[]> {
    const query = db.select().from(osintQueries);
    
    if (userId) {
      query.where(eq(osintQueries.userId, userId));
    }
    
    return query.orderBy(desc(osintQueries.createdAt));
  }

  async createReport(insertReport: InsertOsintReport): Promise<OsintReport> {
    try {
      const [report] = await db
        .insert(osintReports)
        .values(insertReport)
        .returning();
      return report;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async getUserReports(userId?: number): Promise<OsintReport[]> {
    const query = db.select().from(osintReports);
    
    if (userId) {
      query.where(eq(osintReports.userId, userId));
    }
    
    return query.orderBy(desc(osintReports.exportedAt));
  }

  async getToolConfig(userId: number, toolType: string): Promise<ToolConfig | undefined> {
    const [config] = await db
      .select()
      .from(toolConfigs)
      .where(and(eq(toolConfigs.userId, userId), eq(toolConfigs.toolType, toolType)));
    return config || undefined;
  }

  async saveToolConfig(config: InsertToolConfig): Promise<ToolConfig> {
    const [savedConfig] = await db
      .insert(toolConfigs)
      .values({
        ...config,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return savedConfig;
  }

  async getApiKey(userId: number, service: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.service, service), eq(apiKeys.isActive, true)));
    return apiKey || undefined;
  }

  async saveApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [savedKey] = await db
      .insert(apiKeys)
      .values({
        ...apiKey,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return savedKey;
  }

  async logAudit(audit: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values({
        ...audit,
        timestamp: new Date()
      })
      .returning();
    return auditLog;
  }
}

export const storage = new DatabaseStorage();
