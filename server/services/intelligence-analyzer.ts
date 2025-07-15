import { OsintQuery } from "@shared/schema";

export interface IntelligenceInsight {
  category: string;
  confidence: number;
  finding: string;
  evidence: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  relatedFindings: string[];
}

export interface IntelligenceReport {
  summary: string;
  targetProfile: {
    type: 'domain' | 'ip' | 'person' | 'organization' | 'mixed';
    primaryTarget: string;
    aliases: string[];
    lastSeen: string;
  };
  insights: IntelligenceInsight[];
  timeline: {
    timestamp: string;
    event: string;
    source: string;
    importance: number;
  }[];
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigations: string[];
  };
  relatedEntities: {
    entity: string;
    relationship: string;
    confidence: number;
  }[];
}

export class IntelligenceAnalyzer {
  async analyzeQueries(queries: OsintQuery[]): Promise<IntelligenceReport> {
    const targetProfile = this.extractTargetProfile(queries);
    const insights = this.generateInsights(queries);
    const timeline = this.buildTimeline(queries);
    const riskAssessment = this.assessRisk(insights);
    const relatedEntities = this.findRelatedEntities(queries);
    
    return {
      summary: this.generateSummary(queries, insights),
      targetProfile,
      insights,
      timeline,
      riskAssessment,
      relatedEntities
    };
  }

  private extractTargetProfile(queries: OsintQuery[]): IntelligenceReport['targetProfile'] {
    const targets = new Set<string>();
    const aliases = new Set<string>();
    let primaryTarget = '';
    let targetType: 'domain' | 'ip' | 'person' | 'organization' | 'mixed' = 'mixed';
    let lastSeen = '';

    for (const query of queries) {
      targets.add(query.query);
      
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any;
        
        // Extract aliases and related identifiers
        if (result.domain) aliases.add(result.domain);
        if (result.ip) aliases.add(result.ip);
        if (result.hostname) aliases.add(result.hostname);
        if (result.username) aliases.add(result.username);
        if (result.email) aliases.add(result.email);
        if (result.essid) aliases.add(result.essid);
        if (result.bssid) aliases.add(result.bssid);
        
        // Determine target type
        if (this.isIP(query.query)) targetType = targetType === 'mixed' ? 'ip' : targetType;
        else if (this.isDomain(query.query)) targetType = targetType === 'mixed' ? 'domain' : targetType;
        else if (this.isEmail(query.query)) targetType = targetType === 'mixed' ? 'person' : targetType;
        
        // Update last seen
        if (query.completedAt && query.completedAt > lastSeen) {
          lastSeen = query.completedAt.toISOString();
        }
      }
    }

    // Determine primary target (most queried)
    const queryCount = new Map<string, number>();
    queries.forEach(q => queryCount.set(q.query, (queryCount.get(q.query) || 0) + 1));
    primaryTarget = Array.from(queryCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      type: targetType,
      primaryTarget,
      aliases: Array.from(aliases),
      lastSeen
    };
  }

  private generateInsights(queries: OsintQuery[]): IntelligenceInsight[] {
    const insights: IntelligenceInsight[] = [];
    
    // Network security insights
    const networkFindings = this.analyzeNetworkSecurity(queries);
    insights.push(...networkFindings);
    
    // WiFi security insights
    const wifiFindings = this.analyzeWifiSecurity(queries);
    insights.push(...wifiFindings);
    
    // Password security insights
    const passwordFindings = this.analyzePasswordSecurity(queries);
    insights.push(...passwordFindings);
    
    // Domain and infrastructure insights
    const infrastructureFindings = this.analyzeInfrastructure(queries);
    insights.push(...infrastructureFindings);
    
    // Social engineering insights
    const socialFindings = this.analyzeSocialFootprint(queries);
    insights.push(...socialFindings);
    
    return insights;
  }

  private analyzeNetworkSecurity(queries: OsintQuery[]): IntelligenceInsight[] {
    const insights: IntelligenceInsight[] = [];
    
    const nmapQueries = queries.filter(q => q.toolType === 'nmap-scan');
    const vulnQueries = queries.filter(q => q.toolType === 'vulnerability-scanner');
    
    for (const query of nmapQueries) {
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any;
        
        if (result.hosts) {
          for (const host of result.hosts) {
            if (host.openPorts && host.openPorts.length > 0) {
              const highRiskPorts = host.openPorts.filter((port: any) => 
                ['22', '23', '21', '3389', '445', '139'].includes(port.port)
              );
              
              if (highRiskPorts.length > 0) {
                insights.push({
                  category: 'Network Security',
                  confidence: 0.9,
                  finding: `High-risk services detected on ${host.ip}`,
                  evidence: highRiskPorts.map((port: any) => `${port.port}/${port.protocol} (${port.service})`),
                  severity: 'high',
                  recommendations: [
                    'Restrict access to administrative services',
                    'Use VPN for remote access',
                    'Enable strong authentication'
                  ],
                  relatedFindings: [`Open ports on ${host.ip}`]
                });
              }
            }
          }
        }
      }
    }
    
    return insights;
  }

  private analyzeWifiSecurity(queries: OsintQuery[]): IntelligenceInsight[] {
    const insights: IntelligenceInsight[] = [];
    
    const wifiQueries = queries.filter(q => q.toolType.includes('wifi'));
    
    for (const query of wifiQueries) {
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any;
        
        if (result.networks) {
          for (const network of result.networks) {
            if (network.security === 'WEP' || network.security === 'open') {
              insights.push({
                category: 'WiFi Security',
                confidence: 0.95,
                finding: `Weak WiFi security detected: ${network.essid}`,
                evidence: [`Security: ${network.security}`, `BSSID: ${network.bssid}`],
                severity: network.security === 'open' ? 'critical' : 'high',
                recommendations: [
                  'Upgrade to WPA3 security',
                  'Use strong pre-shared keys',
                  'Enable MAC address filtering'
                ],
                relatedFindings: [`Network: ${network.essid}`]
              });
            }
            
            if (network.wps) {
              insights.push({
                category: 'WiFi Security',
                confidence: 0.8,
                finding: `WPS enabled on ${network.essid}`,
                evidence: [`WPS Status: Enabled`, `BSSID: ${network.bssid}`],
                severity: 'medium',
                recommendations: [
                  'Disable WPS functionality',
                  'Use strong WPA2/WPA3 passwords'
                ],
                relatedFindings: [`Network: ${network.essid}`]
              });
            }
          }
        }
        
        if (result.success && result.password) {
          insights.push({
            category: 'WiFi Security',
            confidence: 0.99,
            finding: `WiFi password successfully cracked`,
            evidence: [`Password: ${result.password}`, `Network: ${result.essid}`],
            severity: 'critical',
            recommendations: [
              'Change WiFi password immediately',
              'Use complex passwords (20+ characters)',
              'Enable network monitoring'
            ],
            relatedFindings: [`Cracked network: ${result.essid}`]
          });
        }
      }
    }
    
    return insights;
  }

  private analyzePasswordSecurity(queries: OsintQuery[]): IntelligenceInsight[] {
    const insights: IntelligenceInsight[] = [];
    
    const passwordQueries = queries.filter(q => q.toolType === 'password-crack');
    
    for (const query of passwordQueries) {
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any;
        
        if (result.success && result.password) {
          insights.push({
            category: 'Password Security',
            confidence: 0.95,
            finding: `Password successfully cracked`,
            evidence: [`Password: ${result.password}`, `Method: ${result.method}`],
            severity: 'critical',
            recommendations: [
              'Change password immediately',
              'Use unique passwords for each account',
              'Enable two-factor authentication'
            ],
            relatedFindings: [`Cracked hash`]
          });
        }
        
        if (result.hashInfo) {
          const complexity = result.hashInfo.complexity;
          if (complexity === 'weak' || complexity === 'very weak') {
            insights.push({
              category: 'Password Security',
              confidence: 0.8,
              finding: `Weak password hashing detected`,
              evidence: [`Hash type: ${result.hashInfo.type}`, `Complexity: ${complexity}`],
              severity: 'high',
              recommendations: [
                'Use stronger hashing algorithms (bcrypt, scrypt)',
                'Implement proper salt generation',
                'Increase iteration counts'
              ],
              relatedFindings: [`Hash analysis`]
            });
          }
        }
      }
    }
    
    return insights;
  }

  private analyzeInfrastructure(queries: OsintQuery[]): IntelligenceInsight[] {
    const insights: IntelligenceInsight[] = [];
    
    const domainQueries = queries.filter(q => q.toolType === 'domain-enumeration');
    const ipQueries = queries.filter(q => q.toolType === 'ip-analysis');
    const whoisQueries = queries.filter(q => q.toolType === 'whois-lookup');
    
    // Analyze domain infrastructure
    for (const query of domainQueries) {
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any;
        
        if (result.subdomains && result.subdomains.length > 10) {
          insights.push({
            category: 'Infrastructure',
            confidence: 0.7,
            finding: `Large subdomain footprint detected`,
            evidence: [`${result.subdomains.length} subdomains found`],
            severity: 'medium',
            recommendations: [
              'Review subdomain necessity',
              'Implement subdomain monitoring',
              'Secure unused subdomains'
            ],
            relatedFindings: [`Domain: ${result.domain}`]
          });
        }
      }
    }
    
    return insights;
  }

  private analyzeSocialFootprint(queries: OsintQuery[]): IntelligenceInsight[] {
    const insights: IntelligenceInsight[] = [];
    
    const usernameQueries = queries.filter(q => q.toolType === 'username-checker');
    const emailQueries = queries.filter(q => q.toolType === 'email-validator');
    
    // Analyze username presence
    for (const query of usernameQueries) {
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any;
        
        if (result.platforms) {
          const foundPlatforms = Object.keys(result.platforms).filter(
            platform => result.platforms[platform].status === 'taken'
          );
          
          if (foundPlatforms.length > 5) {
            insights.push({
              category: 'Social Footprint',
              confidence: 0.8,
              finding: `Extensive social media presence`,
              evidence: [`Found on ${foundPlatforms.length} platforms`],
              severity: 'medium',
              recommendations: [
                'Review privacy settings',
                'Limit information exposure',
                'Monitor account activity'
              ],
              relatedFindings: [`Username: ${result.username}`]
            });
          }
        }
      }
    }
    
    return insights;
  }

  private buildTimeline(queries: OsintQuery[]): IntelligenceReport['timeline'] {
    return queries
      .filter(q => q.completedAt)
      .map(q => ({
        timestamp: q.completedAt!.toISOString(),
        event: `${q.toolType} query completed: ${q.query}`,
        source: q.toolType,
        importance: this.calculateImportance(q)
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private assessRisk(insights: IntelligenceInsight[]): IntelligenceReport['riskAssessment'] {
    const criticalCount = insights.filter(i => i.severity === 'critical').length;
    const highCount = insights.filter(i => i.severity === 'high').length;
    const mediumCount = insights.filter(i => i.severity === 'medium').length;
    
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (criticalCount > 0) overallRisk = 'critical';
    else if (highCount > 2) overallRisk = 'high';
    else if (highCount > 0 || mediumCount > 3) overallRisk = 'medium';
    
    const factors = insights
      .filter(i => i.severity === 'critical' || i.severity === 'high')
      .map(i => i.finding);
    
    const mitigations = [
      ...new Set(
        insights
          .filter(i => i.severity === 'critical' || i.severity === 'high')
          .flatMap(i => i.recommendations)
      )
    ];
    
    return {
      overallRisk,
      factors,
      mitigations
    };
  }

  private findRelatedEntities(queries: OsintQuery[]): IntelligenceReport['relatedEntities'] {
    const entities = new Map<string, { relationship: string; confidence: number }>();
    
    for (const query of queries) {
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any;
        
        // Extract related entities from results
        if (result.domain && result.ip) {
          entities.set(result.ip, { relationship: 'resolves_to', confidence: 0.9 });
        }
        
        if (result.subdomains) {
          result.subdomains.forEach((subdomain: string) => {
            entities.set(subdomain, { relationship: 'subdomain_of', confidence: 0.8 });
          });
        }
        
        if (result.nameservers) {
          result.nameservers.forEach((ns: string) => {
            entities.set(ns, { relationship: 'nameserver_for', confidence: 0.7 });
          });
        }
      }
    }
    
    return Array.from(entities.entries()).map(([entity, data]) => ({
      entity,
      relationship: data.relationship,
      confidence: data.confidence
    }));
  }

  private generateSummary(queries: OsintQuery[], insights: IntelligenceInsight[]): string {
    const criticalFindings = insights.filter(i => i.severity === 'critical').length;
    const highFindings = insights.filter(i => i.severity === 'high').length;
    const toolsUsed = new Set(queries.map(q => q.toolType)).size;
    
    return `Intelligence analysis of ${queries.length} queries using ${toolsUsed} different tools revealed ${criticalFindings} critical and ${highFindings} high-severity findings. Key areas of concern include network security, WiFi vulnerabilities, and password weaknesses.`;
  }

  private calculateImportance(query: OsintQuery): number {
    const severityWeights = {
      'critical': 1.0,
      'high': 0.8,
      'medium': 0.6,
      'low': 0.4
    };
    
    if (query.result && typeof query.result === 'object') {
      const result = query.result as any;
      if (result.success || result.vulnerabilities?.length > 0) {
        return 0.9;
      }
    }
    
    return 0.5;
  }

  private isIP(str: string): boolean {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(str);
  }

  private isDomain(str: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(str);
  }

  private isEmail(str: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }
}

export const intelligenceAnalyzer = new IntelligenceAnalyzer();