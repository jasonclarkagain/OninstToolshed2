import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table with enhanced security fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).unique(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  usernameIdx: index("username_idx").on(table.username),
  emailIdx: index("email_idx").on(table.email),
}));

// OSINT queries with detailed tracking
export const osintQueries = pgTable("osint_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolType: varchar("tool_type", { length: 50 }).notNull(),
  query: text("query").notNull(),
  result: json("result"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  priority: varchar("priority", { length: 10 }).notNull().default("normal"),
  executionTime: integer("execution_time"), // in milliseconds
  errorMessage: text("error_message"),
  metadata: json("metadata"), // Store additional context
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  toolTypeIdx: index("tool_type_idx").on(table.toolType),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

// OSINT reports with versioning
export const osintReports = pgTable("osint_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  queryIds: json("query_ids").$type<number[]>().notNull(),
  format: varchar("format", { length: 20 }).notNull().default("json"),
  isPublic: boolean("is_public").notNull().default(false),
  version: integer("version").notNull().default(1),
  tags: json("tags").$type<string[]>(),
  exportedAt: timestamp("exported_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("report_user_id_idx").on(table.userId),
  titleIdx: index("title_idx").on(table.title),
  isPublicIdx: index("is_public_idx").on(table.isPublic),
}));

// Tool configurations for different OSINT tools
export const toolConfigs = pgTable("tool_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolType: varchar("tool_type", { length: 50 }).notNull(),
  config: json("config").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userToolIdx: index("user_tool_idx").on(table.userId, table.toolType),
}));

// API keys and external service configurations
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  service: varchar("service", { length: 50 }).notNull(),
  keyName: varchar("key_name", { length: 100 }).notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userServiceIdx: index("user_service_idx").on(table.userId, table.service),
}));

// Audit log for security tracking
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: integer("resource_id"),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  userIdIdx: index("audit_user_id_idx").on(table.userId),
  actionIdx: index("audit_action_idx").on(table.action),
  timestampIdx: index("audit_timestamp_idx").on(table.timestamp),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  queries: many(osintQueries),
  reports: many(osintReports),
  toolConfigs: many(toolConfigs),
  apiKeys: many(apiKeys),
  auditLogs: many(auditLogs),
}));

export const osintQueriesRelations = relations(osintQueries, ({ one }) => ({
  user: one(users, { fields: [osintQueries.userId], references: [users.id] }),
}));

export const osintReportsRelations = relations(osintReports, ({ one }) => ({
  user: one(users, { fields: [osintReports.userId], references: [users.id] }),
}));

export const toolConfigsRelations = relations(toolConfigs, ({ one }) => ({
  user: one(users, { fields: [toolConfigs.userId], references: [users.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertOsintQuerySchema = createInsertSchema(osintQueries).pick({
  toolType: true,
  query: true,
  result: true,
  status: true,
  priority: true,
  metadata: true,
});

export const insertOsintReportSchema = createInsertSchema(osintReports).pick({
  title: true,
  description: true,
  queryIds: true,
  format: true,
  isPublic: true,
  tags: true,
}).extend({
  queryIds: z.array(z.number()).default([]),
  format: z.string().default('json'),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

export const insertToolConfigSchema = createInsertSchema(toolConfigs).pick({
  toolType: true,
  config: true,
  isDefault: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  service: true,
  keyName: true,
  encryptedKey: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  action: true,
  resourceType: true,
  resourceId: true,
  details: true,
  ipAddress: true,
  userAgent: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type OsintQuery = typeof osintQueries.$inferSelect;
export type InsertOsintQuery = z.infer<typeof insertOsintQuerySchema>;
export type OsintReport = typeof osintReports.$inferSelect;
export type InsertOsintReport = z.infer<typeof insertOsintReportSchema>;
export type ToolConfig = typeof toolConfigs.$inferSelect;
export type InsertToolConfig = z.infer<typeof insertToolConfigSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
