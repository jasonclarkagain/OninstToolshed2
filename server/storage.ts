import { users, osintQueries, osintReports, type User, type InsertUser, type OsintQuery, type InsertOsintQuery, type OsintReport, type InsertOsintReport } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private osintQueries: Map<number, OsintQuery>;
  private osintReports: Map<number, OsintReport>;
  private currentUserId: number;
  private currentQueryId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.osintQueries = new Map();
    this.osintReports = new Map();
    this.currentUserId = 1;
    this.currentQueryId = 1;
    this.currentReportId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createOsintQuery(insertQuery: InsertOsintQuery): Promise<OsintQuery> {
    const id = this.currentQueryId++;
    const query: OsintQuery = {
      ...insertQuery,
      id,
      userId: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.osintQueries.set(id, query);
    return query;
  }

  async updateOsintQuery(id: number, updates: Partial<OsintQuery>): Promise<OsintQuery | undefined> {
    const query = this.osintQueries.get(id);
    if (!query) return undefined;
    
    const updatedQuery = { ...query, ...updates };
    this.osintQueries.set(id, updatedQuery);
    return updatedQuery;
  }

  async getOsintQuery(id: number): Promise<OsintQuery | undefined> {
    return this.osintQueries.get(id);
  }

  async getUserQueries(userId?: number): Promise<OsintQuery[]> {
    return Array.from(this.osintQueries.values())
      .filter(query => userId ? query.userId === userId : true)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createReport(insertReport: InsertOsintReport): Promise<OsintReport> {
    const id = this.currentReportId++;
    const report: OsintReport = {
      ...insertReport,
      id,
      userId: null,
      exportedAt: new Date(),
    };
    this.osintReports.set(id, report);
    return report;
  }

  async getUserReports(userId?: number): Promise<OsintReport[]> {
    return Array.from(this.osintReports.values())
      .filter(report => userId ? report.userId === userId : true)
      .sort((a, b) => (b.exportedAt?.getTime() || 0) - (a.exportedAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
