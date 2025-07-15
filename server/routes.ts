import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { osintService } from "./services/osint";
import { governmentDataService } from "./services/government-data-service";
import { proxyService } from "./services/proxy-service";

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

  // Advanced reconnaissance endpoint
  app.post("/api/osint/advanced-recon", async (req, res) => {
    try {
      const { target, scanProfile, selectedModules, customOptions } = z.object({
        target: z.string().min(1),
        scanProfile: z.string(),
        selectedModules: z.array(z.string()),
        customOptions: z.string().optional().default("")
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'advanced_recon',
        query: target,
        status: 'pending'
      });

      const result = await osintService.performAdvancedRecon(target, scanProfile, selectedModules, customOptions);
      
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

  // People search endpoint
  app.post("/api/osint/people-search", async (req, res) => {
    try {
      const { firstName, lastName, location, age, email, phone, selectedEngines, includeLexisNexis } = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        location: z.string().optional(),
        age: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        selectedEngines: z.array(z.string()),
        includeLexisNexis: z.boolean().default(false)
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'people_search',
        query: `${firstName} ${lastName}`.trim(),
        status: 'pending'
      });

      // Simulate people search results
      const result = {
        totalResults: Math.floor(Math.random() * 20) + 5,
        sourcesUsed: selectedEngines.length,
        lexisNexisResults: includeLexisNexis,
        confidence: Math.floor(Math.random() * 30) + 70,
        primaryResults: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
          fullName: `${firstName || 'John'} ${lastName || 'Doe'}`,
          age: Math.floor(Math.random() * 40) + 25,
          confidence: Math.floor(Math.random() * 30) + 70,
          addresses: [{
            street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
            city: 'Springfield',
            state: 'NY',
            zip: '12345',
            current: true
          }],
          phones: [{
            number: '(555) 123-4567',
            type: 'Mobile',
            current: true
          }],
          emails: [email || 'john.doe@email.com'],
          relatives: [{
            name: 'Jane Doe',
            relationship: 'Spouse'
          }],
          sources: selectedEngines.slice(0, 3)
        }))
      };
      
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

  // Geospatial intelligence endpoint
  app.post("/api/osint/geospatial-intelligence", async (req, res) => {
    try {
      const { address, coordinates, searchRadius, useProxy, proxyRegion, selectedSources } = z.object({
        address: z.string().optional(),
        coordinates: z.object({
          lat: z.string(),
          lng: z.string()
        }).nullable().optional(),
        searchRadius: z.number(),
        useProxy: z.boolean(),
        proxyRegion: z.string(),
        selectedSources: z.array(z.string())
      }).parse(req.body);

      const query = await storage.createOsintQuery({
        toolType: 'geospatial_intelligence',
        query: address || `${coordinates?.lat},${coordinates?.lng}`,
        status: 'pending'
      });

      // Gather data from selected sources
      const result: any = {
        totalRecords: 0,
        sourcesUsed: selectedSources.length,
        searchRadius,
        proxyUsed: useProxy
      };

      if (selectedSources.includes('census')) {
        result.censusData = await governmentDataService.getCensusData(address || '', searchRadius, proxyRegion);
        result.totalRecords += 1;
      }

      if (selectedSources.includes('voter-rolls')) {
        result.voterData = await governmentDataService.getVoterRecords(address || '', searchRadius, proxyRegion);
        result.totalRecords += result.voterData.length;
      }

      if (selectedSources.includes('sex-offender-registry')) {
        result.sexOffenderData = await governmentDataService.getSexOffenderRecords(address || '', searchRadius, proxyRegion);
        result.totalRecords += result.sexOffenderData.length;
      }

      if (selectedSources.includes('prison-search')) {
        result.prisonData = await governmentDataService.getPrisonRecords('Sample Name', proxyRegion);
        result.totalRecords += result.prisonData.length;
      }

      if (selectedSources.includes('ancestry')) {
        result.genealogyData = await governmentDataService.getGenealogicalRecords('Sample Name', proxyRegion);
        result.totalRecords += result.genealogyData.length;
      }

      if (selectedSources.includes('missing-persons')) {
        result.missingPersonsData = await governmentDataService.getMissingPersonRecords('Sample Name', proxyRegion);
        result.totalRecords += result.missingPersonsData.length;
      }

      if (selectedSources.includes('no-fly-list')) {
        result.noFlyListData = await governmentDataService.checkNoFlyListIndicators('Sample Name', proxyRegion);
      }

      // Add map data
      result.mapData = {
        markers: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, i) => ({
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          type: ['census', 'voter', 'property'][i % 3],
          title: `Location ${i + 1}`
        }))
      };
      
      await storage.updateOsintQuery(query.id, {
        result: result,
        status: 'completed',
        completedAt: new Date()
      });

      res.json({ queryId: query.id, result, mapData: result.mapData });
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
