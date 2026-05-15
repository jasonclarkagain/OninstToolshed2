import OpenAI from 'openai';
import type { OsintQuery } from '@shared/schema';
import { storage } from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ThreatFeed {
  id: string;
  source: 'virustotal' | 'alienvault' | 'misp' | 'custom';
  type: 'ioc' | 'vulnerability' | 'malware' | 'phishing';
  indicator: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  tags: string[];
  references: string[];
}

export interface IntelligenceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'new_threat' | 'infrastructure_change' | 'vulnerability_discovered' | 'attack_detected';
  timestamp: string;
  affectedAssets: string[];
  recommendations: string[];
  relatedFeeds: string[];
}

export interface BehavioralPattern {
  id: string;
  pattern: string;
  frequency: number;
  timeframe: string;
  anomalyScore: number;
  description: string;
  indicators: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class RealTimeIntelligenceService {
  private feeds: ThreatFeed[] = [];
  private alerts: IntelligenceAlert[] = [];
  private behavioralPatterns: BehavioralPattern[] = [];

  async initializeFeeds(): Promise<void> {
    // Simulate real-time threat intelligence feeds
    this.feeds = [
      {
        id: 'feed-1',
        source: 'virustotal',
        type: 'ioc',
        indicator: '185.220.101.32',
        confidence: 0.95,
        severity: 'critical',
        description: 'Known malicious IP associated with Emotet botnet',
        timestamp: new Date().toISOString(),
        tags: ['emotet', 'botnet', 'malware'],
        references: ['https://virustotal.com/gui/ip-address/185.220.101.32']
      },
      {
        id: 'feed-2',
        source: 'misp',
        type: 'vulnerability',
        indicator: 'CVE-2024-0001',
        confidence: 0.88,
        severity: 'high',
        description: 'Critical RCE vulnerability in Apache Struts',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        tags: ['apache', 'struts', 'rce'],
        references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-0001']
      },
      {
        id: 'feed-3',
        source: 'alienvault',
        type: 'phishing',
        indicator: 'secure-banking-update.com',
        confidence: 0.92,
        severity: 'high',
        description: 'Phishing domain impersonating major bank',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        tags: ['phishing', 'banking', 'social-engineering'],
        references: ['https://otx.alienvault.com/indicator/domain/secure-banking-update.com']
      }
    ];
  }

  async enrichWithThreatIntelligence(query: OsintQuery): Promise<{
    enrichedData: any;
    matchingFeeds: ThreatFeed[];
    riskScore: number;
    recommendations: string[];
  }> {
    const result = query.result as any;
    const matchingFeeds: ThreatFeed[] = [];
    
    // Check for IOC matches
    if (result?.ip) {
      const ipMatches = this.feeds.filter(feed => 
        feed.indicator === result.ip || feed.indicator.includes(result.ip)
      );
      matchingFeeds.push(...ipMatches);
    }
    
    if (result?.domain) {
      const domainMatches = this.feeds.filter(feed => 
        feed.indicator === result.domain || feed.indicator.includes(result.domain)
      );
      matchingFeeds.push(...domainMatches);
    }

    if (result?.vulnerabilities) {
      for (const vuln of result.vulnerabilities) {
        const vulnMatches = this.feeds.filter(feed => 
          feed.indicator === vuln.id || feed.description.includes(vuln.id)
        );
        matchingFeeds.push(...vulnMatches);
      }
    }

    // Calculate risk score
    let riskScore = 0;
    matchingFeeds.forEach(feed => {
      switch (feed.severity) {
        case 'critical': riskScore += 4; break;
        case 'high': riskScore += 3; break;
        case 'medium': riskScore += 2; break;
        case 'low': riskScore += 1; break;
      }
    });
    riskScore = Math.min(10, riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(matchingFeeds, riskScore);

    return {
      enrichedData: {
        ...result,
        threatIntelligence: {
          matches: matchingFeeds.length,
          highestSeverity: matchingFeeds.length > 0 
            ? matchingFeeds.reduce((max, feed) => 
                this.getSeverityScore(feed.severity) > this.getSeverityScore(max) ? feed.severity : max, 'low'
              ) 
            : 'none',
          sources: [...new Set(matchingFeeds.map(f => f.source))],
          lastUpdated: new Date().toISOString()
        }
      },
      matchingFeeds,
      riskScore,
      recommendations
    };
  }

  async analyzeUserBehavior(queries: OsintQuery[]): Promise<BehavioralPattern[]> {
    if (queries.length < 5) {
      return []; // Need sufficient data for behavioral analysis
    }

    const patterns: BehavioralPattern[] = [];

    // Analyze query frequency patterns
    const timeWindows = this.groupQueriesByTimeWindow(queries, 3600000); // 1 hour windows
    const avgFrequency = timeWindows.reduce((sum, window) => sum + window.length, 0) / timeWindows.length;
    
    const highActivityWindows = timeWindows.filter(window => window.length > avgFrequency * 2);
    
    if (highActivityWindows.length > 0) {
      patterns.push({
        id: `pattern-${Date.now()}`,
        pattern: 'High-frequency reconnaissance bursts',
        frequency: highActivityWindows.length,
        timeframe: '1 hour windows',
        anomalyScore: Math.min(1, highActivityWindows.length / timeWindows.length * 2),
        description: `Detected ${highActivityWindows.length} periods of unusually high scanning activity`,
        indicators: ['rapid_succession_scans', 'burst_pattern', 'potential_automation'],
        riskLevel: highActivityWindows.length > 3 ? 'high' : 'medium'
      });
    }

    // Analyze target diversity
    const uniqueTargets = new Set(queries.map(q => q.query)).size;
    const targetDiversityRatio = uniqueTargets / queries.length;
    
    if (targetDiversityRatio < 0.3) {
      patterns.push({
        id: `pattern-${Date.now() + 1}`,
        pattern: 'Focused target reconnaissance',
        frequency: queries.length - uniqueTargets,
        timeframe: 'Overall activity',
        anomalyScore: 1 - targetDiversityRatio,
        description: `High concentration on ${uniqueTargets} unique targets with ${queries.length} total queries`,
        indicators: ['target_fixation', 'deep_reconnaissance', 'persistent_monitoring'],
        riskLevel: targetDiversityRatio < 0.2 ? 'critical' : 'high'
      });
    }

    // Analyze tool usage patterns
    const toolUsage = queries.reduce((acc, q) => {
      acc[q.toolType] = (acc[q.toolType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vulnScanRatio = (toolUsage.vulnerability_scan || 0) / queries.length;
    if (vulnScanRatio > 0.6) {
      patterns.push({
        id: `pattern-${Date.now() + 2}`,
        pattern: 'Vulnerability-focused scanning',
        frequency: toolUsage.vulnerability_scan || 0,
        timeframe: 'Overall activity',
        anomalyScore: vulnScanRatio,
        description: `${Math.round(vulnScanRatio * 100)}% of activity focused on vulnerability scanning`,
        indicators: ['vuln_hunting', 'exploit_research', 'weakness_identification'],
        riskLevel: vulnScanRatio > 0.8 ? 'critical' : 'high'
      });
    }

    return patterns;
  }

  async generateIntelligenceAlerts(queries: OsintQuery[]): Promise<IntelligenceAlert[]> {
    const alerts: IntelligenceAlert[] = [];
    const recentQueries = queries.filter(q => 
      q.createdAt && q.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // Check for new threat indicators
    for (const query of recentQueries) {
      const enrichment = await this.enrichWithThreatIntelligence(query);
      
      if (enrichment.matchingFeeds.length > 0) {
        const criticalFeeds = enrichment.matchingFeeds.filter(f => f.severity === 'critical');
        
        if (criticalFeeds.length > 0) {
          alerts.push({
            id: `alert-${Date.now()}-${query.id}`,
            title: 'Critical Threat Indicator Detected',
            description: `Query "${query.query}" matches ${criticalFeeds.length} critical threat indicators`,
            severity: 'critical',
            category: 'new_threat',
            timestamp: new Date().toISOString(),
            affectedAssets: [query.query],
            recommendations: enrichment.recommendations,
            relatedFeeds: criticalFeeds.map(f => f.id)
          });
        }
      }
    }

    // Check for infrastructure changes
    const domainQueries = recentQueries.filter(q => q.toolType === 'domain_enumeration');
    if (domainQueries.length > 5) {
      alerts.push({
        id: `alert-infra-${Date.now()}`,
        title: 'Unusual Infrastructure Reconnaissance',
        description: `${domainQueries.length} domain enumeration queries detected in 24 hours`,
        severity: 'warning',
        category: 'infrastructure_change',
        timestamp: new Date().toISOString(),
        affectedAssets: domainQueries.map(q => q.query),
        recommendations: [
          'Review reconnaissance patterns for potential threats',
          'Implement additional monitoring on targeted domains',
          'Consider rate limiting and alerting mechanisms'
        ],
        relatedFeeds: []
      });
    }

    return alerts;
  }

  async generatePredictiveInsights(queries: OsintQuery[]): Promise<{
    insights: string[];
    predictions: {
      category: string;
      prediction: string;
      confidence: number;
      timeframe: string;
      evidence: string[];
    }[];
    recommendations: string[];
  }> {
    const prompt = `
    Analyze the following OSINT reconnaissance data and provide predictive security insights:
    
    Query Data:
    - Total queries: ${queries.length}
    - Tool types used: ${[...new Set(queries.map(q => q.toolType))].join(', ')}
    - Time range: ${queries.length > 0 ? 'Recent activity' : 'No data'}
    
    Provide analysis in JSON format:
    {
      "insights": ["insight1", "insight2", "insight3"],
      "predictions": [
        {
          "category": "vulnerability_exposure",
          "prediction": "specific prediction",
          "confidence": 0.0-1.0,
          "timeframe": "1-7 days|1-4 weeks|1-3 months",
          "evidence": ["evidence1", "evidence2"]
        }
      ],
      "recommendations": ["rec1", "rec2", "rec3"]
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a cybersecurity threat intelligence analyst." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Predictive insights generation error:', error);
      return {
        insights: ['Unable to generate insights at this time'],
        predictions: [],
        recommendations: ['Ensure sufficient data for analysis']
      };
    }
  }

  private groupQueriesByTimeWindow(queries: OsintQuery[], windowSizeMs: number): OsintQuery[][] {
    const windows: OsintQuery[][] = [];
    const sortedQueries = queries
      .filter(q => q.createdAt)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());

    if (sortedQueries.length === 0) return windows;

    let currentWindow: OsintQuery[] = [];
    let windowStart = sortedQueries[0].createdAt!.getTime();

    for (const query of sortedQueries) {
      const queryTime = query.createdAt!.getTime();
      
      if (queryTime - windowStart > windowSizeMs) {
        if (currentWindow.length > 0) {
          windows.push(currentWindow);
        }
        currentWindow = [query];
        windowStart = queryTime;
      } else {
        currentWindow.push(query);
      }
    }

    if (currentWindow.length > 0) {
      windows.push(currentWindow);
    }

    return windows;
  }

  private getSeverityScore(severity: string): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private generateRecommendations(feeds: ThreatFeed[], riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 8) {
      recommendations.push('IMMEDIATE ACTION: Isolate affected systems');
      recommendations.push('Block all traffic to/from identified indicators');
      recommendations.push('Activate incident response procedures');
    } else if (riskScore >= 5) {
      recommendations.push('Implement enhanced monitoring');
      recommendations.push('Review access controls for affected assets');
      recommendations.push('Consider threat hunting activities');
    } else if (riskScore >= 2) {
      recommendations.push('Add indicators to watchlists');
      recommendations.push('Review security policies');
      recommendations.push('Increase logging and alerting');
    }

    const malwareFeeds = feeds.filter(f => f.type === 'malware');
    if (malwareFeeds.length > 0) {
      recommendations.push('Update antivirus signatures');
      recommendations.push('Scan for similar malware variants');
    }

    const vulnFeeds = feeds.filter(f => f.type === 'vulnerability');
    if (vulnFeeds.length > 0) {
      recommendations.push('Prioritize patching for identified vulnerabilities');
      recommendations.push('Assess patch deployment timeline');
    }

    return recommendations;
  }

  // Getters for external access
  getFeeds(): ThreatFeed[] {
    return this.feeds;
  }

  getAlerts(): IntelligenceAlert[] {
    return this.alerts;
  }

  getBehavioralPatterns(): BehavioralPattern[] {
    return this.behavioralPatterns;
  }

  async updateBehavioralPatterns(queries: OsintQuery[]): Promise<void> {
    this.behavioralPatterns = await this.analyzeUserBehavior(queries);
  }

  async updateAlerts(queries: OsintQuery[]): Promise<void> {
    const newAlerts = await this.generateIntelligenceAlerts(queries);
    this.alerts = [...this.alerts, ...newAlerts].slice(-50); // Keep last 50 alerts
  }
}

export const realTimeIntelligence = new RealTimeIntelligenceService();