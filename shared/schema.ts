import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const osintQueries = pgTable("osint_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolType: text("tool_type").notNull(),
  query: text("query").notNull(),
  result: json("result"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const osintReports = pgTable("osint_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  queryIds: json("query_ids").$type<number[]>().notNull(),
  exportedAt: timestamp("exported_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOsintQuerySchema = createInsertSchema(osintQueries).pick({
  toolType: true,
  query: true,
  result: true,
  status: true,
});

export const insertOsintReportSchema = createInsertSchema(osintReports).pick({
  title: true,
  queryIds: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type OsintQuery = typeof osintQueries.$inferSelect;
export type InsertOsintQuery = z.infer<typeof insertOsintQuerySchema>;
export type OsintReport = typeof osintReports.$inferSelect;
export type InsertOsintReport = z.infer<typeof insertOsintReportSchema>;
