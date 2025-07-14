import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { osintService } from "./services/osint";

export async function registerRoutes(app: Express): Promise<Server> {
  // Domain enumeration endpoint
  app.post("/api/osint/domain-enumeration", async (req, res) => {
    try {
      const { domain, scanType } = z.object({
        domain: z.string().min(1),
        scanType: z.enum(['full', 'quick', 'passive']).default('full')
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'domain_enumeration',
        query: domain,
        status: 'pending'
      });

      // Start enumeration
      const result = await osintService.enumerateDomain(domain, scanType);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // IP analysis endpoint
  app.post("/api/osint/ip-analysis", async (req, res) => {
    try {
      const { ip } = z.object({
        ip: z.string().min(1)
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'ip_analysis',
        query: ip,
        status: 'pending'
      });

      const result = await osintService.analyzeIp(ip);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // WHOIS lookup endpoint
  app.post("/api/osint/whois", async (req, res) => {
    try {
      const { domain } = z.object({
        domain: z.string().min(1)
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'whois',
        query: domain,
        status: 'pending'
      });

      const result = await osintService.performWhoisLookup(domain);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Username checker endpoint
  app.post("/api/osint/username-check", async (req, res) => {
    try {
      const { username } = z.object({
        username: z.string().min(1)
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'username_check',
        query: username,
        status: 'pending'
      });

      const result = await osintService.checkUsername(username);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Email validation endpoint
  app.post("/api/osint/email-validation", async (req, res) => {
    try {
      const { email } = z.object({
        email: z.string().email()
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'email_validation',
        query: email,
        status: 'pending'
      });

      const result = await osintService.validateEmail(email);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Hash analysis endpoint
  app.post("/api/osint/hash-analysis", async (req, res) => {
    try {
      const { hash } = z.object({
        hash: z.string().min(1)
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'hash_analysis',
        query: hash,
        status: 'pending'
      });

      const result = await osintService.analyzeHash(hash);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Base64 encoding endpoint
  app.post("/api/osint/base64-encode", async (req, res) => {
    try {
      const { text } = z.object({
        text: z.string()
      }).parse(req.body);

      const encoded = osintService.encodeBase64(text);
      res.json({ encoded });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Base64 decoding endpoint
  app.post("/api/osint/base64-decode", async (req, res) => {
    try {
      const { encoded } = z.object({
        encoded: z.string()
      }).parse(req.body);

      const decoded = osintService.decodeBase64(encoded);
      res.json({ decoded });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // URL analysis endpoint
  app.post("/api/osint/url-analysis", async (req, res) => {
    try {
      const { url } = z.object({
        url: z.string().url()
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'url_analysis',
        query: url,
        status: 'pending'
      });

      const result = await osintService.analyzeUrl(url);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Google dorking endpoint
  app.post("/api/osint/google-dork", async (req, res) => {
    try {
      const { site, fileType, searchTerms } = z.object({
        site: z.string().optional(),
        fileType: z.string().optional(),
        searchTerms: z.string().optional()
      }).parse(req.body);

      const dork = osintService.generateGoogleDork(site, fileType, searchTerms);
      res.json({ dork });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Network tools endpoint
  app.post("/api/osint/network-tool", async (req, res) => {
    try {
      const { tool, target } = z.object({
        tool: z.enum(['ping', 'traceroute', 'port_scan']),
        target: z.string().min(1)
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: `network_${tool}`,
        query: target,
        status: 'pending'
      });

      const result = await osintService.runNetworkTool(tool, target);
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get all queries
  app.get("/api/osint/queries", async (req, res) => {
    try {
      const queries = await storage.getUserQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get specific query
  app.get("/api/osint/queries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const query = await storage.getOsintQuery(id);
      
      if (!query) {
        return res.status(404).json({ error: 'Query not found' });
      }
      
      res.json(query);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Export report
  app.post("/api/osint/export-report", async (req, res) => {
    try {
      const { title, queryIds } = z.object({
        title: z.string().min(1),
        queryIds: z.array(z.number())
      }).parse(req.body);

      const report = await storage.createReport({
        title,
        queryIds
      });

      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get reports
  app.get("/api/osint/reports", async (req, res) => {
    try {
      const reports = await storage.getUserReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
