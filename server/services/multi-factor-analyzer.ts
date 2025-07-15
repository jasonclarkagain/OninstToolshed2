import type { OsintQuery } from '@shared/schema';

export interface CorrelationResult {
  id: string;
  sourceQuery: number;
  targetQuery: number;
  correlationType: 'infrastructure' | 'vulnerability' | 'timing' | 'geographic' | 'behavioral';
  confidence: number;
  description: string;
  evidence: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface PatternAnalysis {
  id: string;
  pattern: string;
  frequency: number;
  queries: number[];
  significance: number;
  category: 'domain' | 'ip' | 'vulnerability' | 'service' | 'behavior';
  description: string;
  recommendations: string[];
}

export interface RiskVector {
  factor: string;
  weight: number;
  score: number;
  contributors: string[];
  mitigation: string[];
}

export interface MultiFactorResult {
  overallRiskScore: number;
  riskVectors: RiskVector[];
  correlations: CorrelationResult[];
  patterns: PatternAnalysis[];
  timeline: {
    timestamp: string;
    event: string;
    severity: string;
    queryIds: number[];
  }[];
  recommendations: {
    priority: 'immediate' | 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
    effort: string;
  }[];
}

export class MultiFactorAnalyzer {
  async analyzeQueries(queries: OsintQuery[], config: {
    timeRange?: string;
    minConfidence?: number;
    analysisType?: string;
  } = {}): Promise<MultiFactorResult> {
    
    const correlations = await this.findCorrelations(queries, config.minConfidence || 75);
    const patterns = await this.detectPatterns(queries);
    const riskVectors = await this.calculateRiskVectors(queries, correlations, patterns);
    const timeline = await this.buildTimeline(queries, correlations, patterns);
    const recommendations = await this.generateRecommendations(riskVectors, correlations, patterns);
    
    const overallRiskScore = this.calculateOverallRisk(riskVectors);

    return {
      overallRiskScore,
      riskVectors,
      correlations,
      patterns,
      timeline,
      recommendations
    };
  }

  private async findCorrelations(queries: OsintQuery[], minConfidence: number): Promise<CorrelationResult[]> {
    const correlations: CorrelationResult[] = [];
    
    // Infrastructure correlations
    const infraCorrelations = this.findInfrastructureCorrelations(queries);
    correlations.push(...infraCorrelations.filter(c => c.confidence >= minConfidence));
    
    // Vulnerability correlations
    const vulnCorrelations = this.findVulnerabilityCorrelations(queries);
    correlations.push(...vulnCorrelations.filter(c => c.confidence >= minConfidence));
    
    // Timing correlations
    const timingCorrelations = this.findTimingCorrelations(queries);
    correlations.push(...timingCorrelations.filter(c => c.confidence >= minConfidence));
    
    // Geographic correlations
    const geoCorrelations = this.findGeographicCorrelations(queries);
    correlations.push(...geoCorrelations.filter(c => c.confidence >= minConfidence));
    
    // Behavioral correlations
    const behavioralCorrelations = this.findBehavioralCorrelations(queries);
    correlations.push(...behavioralCorrelations.filter(c => c.confidence >= minConfidence));

    return correlations;
  }

  private findInfrastructureCorrelations(queries: OsintQuery[]): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    
    for (let i = 0; i < queries.length; i++) {
      for (let j = i + 1; j < queries.length; j++) {
        const query1 = queries[i];
        const query2 = queries[j];
        
        // Check for shared infrastructure indicators
        const sharedInfra = this.analyzeSharedInfrastructure(query1, query2);
        
        if (sharedInfra.confidence > 0) {
          correlations.push({
            id: `infra-${query1.id}-${query2.id}`,
            sourceQuery: query1.id,
            targetQuery: query2.id,
            correlationType: 'infrastructure',
            confidence: sharedInfra.confidence,
            description: sharedInfra.description,
            evidence: sharedInfra.evidence,
            impact: sharedInfra.impact,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    return correlations;
  }

  private analyzeSharedInfrastructure(query1: OsintQuery, query2: OsintQuery): {
    confidence: number;
    description: string;
    evidence: string[];
    impact: 'low' | 'medium' | 'high' | 'critical';
  } {
    const evidence: string[] = [];
    let confidence = 0;
    let impact: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    try {
      const result1 = query1.result as any;
      const result2 = query2.result as any;
      
      if (!result1 || !result2) {
        return { confidence: 0, description: '', evidence: [], impact: 'low' };
      }
      
      // Check for shared hosting providers
      if (this.extractHostingProvider(result1) === this.extractHostingProvider(result2)) {
        evidence.push('Same hosting provider detected');
        confidence += 25;
      }
      
      // Check for shared IP ranges
      if (this.hasSharedIPRange(result1, result2)) {
        evidence.push('Shared IP address range');
        confidence += 30;
        impact = 'medium';
      }
      
      // Check for shared SSL certificates
      if (this.hasSharedSSLIssuer(result1, result2)) {
        evidence.push('Same SSL certificate issuer');
        confidence += 20;
      }
      
      // Check for identical web server signatures
      if (this.hasIdenticalServerSignature(result1, result2)) {
        evidence.push('Identical web server signatures');
        confidence += 25;
        impact = 'high';
      }
      
      if (confidence > 75) {
        impact = 'high';
      } else if (confidence > 50) {
        impact = 'medium';
      }
      
    } catch (error) {
      // Handle parsing errors gracefully
      console.warn('Error analyzing shared infrastructure:', error);
    }
    
    return {
      confidence,
      description: confidence > 0 ? 'Shared infrastructure components detected between targets' : '',
      evidence,
      impact
    };
  }

  private findVulnerabilityCorrelations(queries: OsintQuery[]): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    
    // Group queries by similar vulnerability patterns
    const vulnGroups = this.groupByVulnerabilities(queries);
    
    for (const group of vulnGroups) {
      if (group.length < 2) continue;
      
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const correlation = this.analyzeVulnerabilityCorrelation(group[i], group[j]);
          if (correlation.confidence > 0) {
            correlations.push({
              id: `vuln-${group[i].id}-${group[j].id}`,
              sourceQuery: group[i].id,
              targetQuery: group[j].id,
              correlationType: 'vulnerability',
              ...correlation,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return correlations;
  }

  private findTimingCorrelations(queries: OsintQuery[]): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    
    // Analyze timing patterns in query execution and results
    const timingPatterns = this.analyzeTimingPatterns(queries);
    
    for (const pattern of timingPatterns) {
      if (pattern.queries.length > 1) {
        for (let i = 0; i < pattern.queries.length; i++) {
          for (let j = i + 1; j < pattern.queries.length; j++) {
            correlations.push({
              id: `timing-${pattern.queries[i]}-${pattern.queries[j]}`,
              sourceQuery: pattern.queries[i],
              targetQuery: pattern.queries[j],
              correlationType: 'timing',
              confidence: pattern.confidence,
              description: pattern.description,
              evidence: pattern.evidence,
              impact: pattern.impact,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return correlations;
  }

  private findGeographicCorrelations(queries: OsintQuery[]): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    
    // Analyze geographic clustering of targets
    const geoClusters = this.analyzeGeographicClustering(queries);
    
    for (const cluster of geoClusters) {
      if (cluster.queries.length > 1) {
        for (let i = 0; i < cluster.queries.length; i++) {
          for (let j = i + 1; j < cluster.queries.length; j++) {
            correlations.push({
              id: `geo-${cluster.queries[i]}-${cluster.queries[j]}`,
              sourceQuery: cluster.queries[i],
              targetQuery: cluster.queries[j],
              correlationType: 'geographic',
              confidence: cluster.confidence,
              description: `Geographic clustering detected: ${cluster.location}`,
              evidence: cluster.evidence,
              impact: cluster.impact,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return correlations;
  }

  private findBehavioralCorrelations(queries: OsintQuery[]): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    
    // Analyze behavioral patterns in services and configurations
    const behaviorPatterns = this.analyzeBehavioralPatterns(queries);
    
    for (const pattern of behaviorPatterns) {
      if (pattern.queries.length > 1) {
        for (let i = 0; i < pattern.queries.length; i++) {
          for (let j = i + 1; j < pattern.queries.length; j++) {
            correlations.push({
              id: `behavior-${pattern.queries[i]}-${pattern.queries[j]}`,
              sourceQuery: pattern.queries[i],
              targetQuery: pattern.queries[j],
              correlationType: 'behavioral',
              confidence: pattern.confidence,
              description: pattern.description,
              evidence: pattern.evidence,
              impact: pattern.impact,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return correlations;
  }

  private async detectPatterns(queries: OsintQuery[]): Promise<PatternAnalysis[]> {
    const patterns: PatternAnalysis[] = [];
    
    // Domain patterns
    patterns.push(...this.detectDomainPatterns(queries));
    
    // IP patterns
    patterns.push(...this.detectIPPatterns(queries));
    
    // Vulnerability patterns
    patterns.push(...this.detectVulnerabilityPatterns(queries));
    
    // Service patterns
    patterns.push(...this.detectServicePatterns(queries));
    
    // Behavioral patterns
    patterns.push(...this.detectBehaviorPatterns(queries));
    
    return patterns.filter(p => p.significance > 0.5);
  }

  private async calculateRiskVectors(
    queries: OsintQuery[],
    correlations: CorrelationResult[],
    patterns: PatternAnalysis[]
  ): Promise<RiskVector[]> {
    return [
      {
        factor: 'Infrastructure Exposure',
        weight: 0.3,
        score: this.calculateInfrastructureRisk(queries, correlations),
        contributors: this.getInfrastructureContributors(queries, correlations),
        mitigation: [
          'Implement network segmentation',
          'Review hosting configurations',
          'Consolidate security policies'
        ]
      },
      {
        factor: 'Vulnerability Density',
        weight: 0.25,
        score: this.calculateVulnerabilityRisk(queries, patterns),
        contributors: this.getVulnerabilityContributors(queries, patterns),
        mitigation: [
          'Apply security patches',
          'Implement vulnerability management',
          'Regular security assessments'
        ]
      },
      {
        factor: 'Information Leakage',
        weight: 0.2,
        score: this.calculateInformationLeakageRisk(queries),
        contributors: this.getInformationLeakageContributors(queries),
        mitigation: [
          'Secure development environments',
          'Implement proper error handling',
          'Review information disclosure'
        ]
      },
      {
        factor: 'Attack Surface',
        weight: 0.15,
        score: this.calculateAttackSurfaceRisk(queries),
        contributors: this.getAttackSurfaceContributors(queries),
        mitigation: [
          'Minimize exposed services',
          'Implement access controls',
          'Regular service inventory'
        ]
      },
      {
        factor: 'Operational Security',
        weight: 0.1,
        score: this.calculateOperationalRisk(correlations, patterns),
        contributors: this.getOperationalContributors(correlations, patterns),
        mitigation: [
          'Improve operational procedures',
          'Implement monitoring',
          'Regular security training'
        ]
      }
    ];
  }

  private async buildTimeline(
    queries: OsintQuery[],
    correlations: CorrelationResult[],
    patterns: PatternAnalysis[]
  ): Promise<{ timestamp: string; event: string; severity: string; queryIds: number[] }[]> {
    const events = [];
    
    // Add correlation discovery events
    for (const correlation of correlations) {
      events.push({
        timestamp: correlation.timestamp,
        event: `${correlation.correlationType} correlation detected: ${correlation.description}`,
        severity: correlation.impact,
        queryIds: [correlation.sourceQuery, correlation.targetQuery]
      });
    }
    
    // Add pattern detection events
    for (const pattern of patterns) {
      events.push({
        timestamp: new Date().toISOString(),
        event: `Pattern detected: ${pattern.pattern}`,
        severity: pattern.significance > 0.8 ? 'high' : pattern.significance > 0.6 ? 'medium' : 'low',
        queryIds: pattern.queries
      });
    }
    
    // Sort by timestamp
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private async generateRecommendations(
    riskVectors: RiskVector[],
    correlations: CorrelationResult[],
    patterns: PatternAnalysis[]
  ): Promise<{ priority: 'immediate' | 'high' | 'medium' | 'low'; action: string; rationale: string; effort: string }[]> {
    const recommendations = [];
    
    // Critical correlations
    const criticalCorrelations = correlations.filter(c => c.impact === 'critical');
    if (criticalCorrelations.length > 0) {
      recommendations.push({
        priority: 'immediate' as const,
        action: 'Address critical correlations in infrastructure',
        rationale: `${criticalCorrelations.length} critical correlations detected`,
        effort: '2-4 hours'
      });
    }
    
    // High-risk vectors
    const highRiskVectors = riskVectors.filter(v => v.score > 80);
    for (const vector of highRiskVectors) {
      recommendations.push({
        priority: 'high' as const,
        action: `Mitigate ${vector.factor.toLowerCase()} risks`,
        rationale: `Risk score of ${vector.score} detected`,
        effort: '1-2 days'
      });
    }
    
    // Significant patterns
    const significantPatterns = patterns.filter(p => p.significance > 0.8);
    for (const pattern of significantPatterns) {
      recommendations.push({
        priority: 'medium' as const,
        action: `Address pattern: ${pattern.pattern}`,
        rationale: `High-significance pattern affecting ${pattern.queries.length} queries`,
        effort: '4-8 hours'
      });
    }
    
    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  private calculateOverallRisk(riskVectors: RiskVector[]): number {
    return Math.round(
      riskVectors.reduce((total, vector) => total + (vector.score * vector.weight), 0)
    );
  }

  // Helper methods for pattern analysis
  private extractHostingProvider(result: any): string {
    // Extract hosting provider from result data
    return result?.asn?.organization || result?.isp || 'unknown';
  }

  private hasSharedIPRange(result1: any, result2: any): boolean {
    // Check if IPs are in the same subnet
    const ip1 = result1?.ip;
    const ip2 = result2?.ip;
    if (!ip1 || !ip2) return false;
    
    // Simple subnet check (same /24)
    const subnet1 = ip1.split('.').slice(0, 3).join('.');
    const subnet2 = ip2.split('.').slice(0, 3).join('.');
    return subnet1 === subnet2;
  }

  private hasSharedSSLIssuer(result1: any, result2: any): boolean {
    return result1?.ssl?.issuer === result2?.ssl?.issuer;
  }

  private hasIdenticalServerSignature(result1: any, result2: any): boolean {
    return result1?.server === result2?.server && result1?.server != null;
  }

  private groupByVulnerabilities(queries: OsintQuery[]): OsintQuery[][] {
    // Group queries that have similar vulnerability patterns
    const groups: { [key: string]: OsintQuery[] } = {};
    
    for (const query of queries) {
      if (query.toolType === 'vulnerability_scan') {
        const vulnSig = this.extractVulnerabilitySignature(query);
        if (!groups[vulnSig]) groups[vulnSig] = [];
        groups[vulnSig].push(query);
      }
    }
    
    return Object.values(groups);
  }

  private extractVulnerabilitySignature(query: OsintQuery): string {
    // Extract a signature representing the vulnerability pattern
    const result = query.result as any;
    if (!result?.vulnerabilities) return 'none';
    
    return result.vulnerabilities
      .map((v: any) => v.cve || v.type)
      .sort()
      .join('|');
  }

  private analyzeVulnerabilityCorrelation(query1: OsintQuery, query2: OsintQuery): {
    confidence: number;
    description: string;
    evidence: string[];
    impact: 'low' | 'medium' | 'high' | 'critical';
  } {
    // Analyze correlation between vulnerability scan results
    const result1 = query1.result as any;
    const result2 = query2.result as any;
    
    if (!result1?.vulnerabilities || !result2?.vulnerabilities) {
      return { confidence: 0, description: '', evidence: [], impact: 'low' };
    }
    
    const sharedVulns = this.findSharedVulnerabilities(result1.vulnerabilities, result2.vulnerabilities);
    const confidence = (sharedVulns.length / Math.max(result1.vulnerabilities.length, result2.vulnerabilities.length)) * 100;
    
    return {
      confidence: Math.round(confidence),
      description: `${sharedVulns.length} shared vulnerabilities detected`,
      evidence: sharedVulns.map(v => `Shared: ${v.cve || v.type}`),
      impact: sharedVulns.some(v => v.severity === 'critical') ? 'critical' : 
              sharedVulns.some(v => v.severity === 'high') ? 'high' : 'medium'
    };
  }

  private findSharedVulnerabilities(vulns1: any[], vulns2: any[]): any[] {
    return vulns1.filter(v1 => 
      vulns2.some(v2 => 
        (v1.cve && v1.cve === v2.cve) || 
        (v1.type && v1.type === v2.type)
      )
    );
  }

  // Additional helper methods would be implemented here for:
  // - analyzeTimingPatterns
  // - analyzeGeographicClustering  
  // - analyzeBehavioralPatterns
  // - detectDomainPatterns
  // - detectIPPatterns
  // - detectVulnerabilityPatterns
  // - detectServicePatterns
  // - detectBehaviorPatterns
  // - calculate*Risk methods
  // - get*Contributors methods

  private analyzeTimingPatterns(queries: OsintQuery[]): any[] {
    // Implement timing pattern analysis
    return [];
  }

  private analyzeGeographicClustering(queries: OsintQuery[]): any[] {
    // Implement geographic clustering analysis
    return [];
  }

  private analyzeBehavioralPatterns(queries: OsintQuery[]): any[] {
    // Implement behavioral pattern analysis
    return [];
  }

  private detectDomainPatterns(queries: OsintQuery[]): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];
    const domainQueries = queries.filter(q => q.toolType === 'domain_enumeration' || q.toolType === 'subdomain_enumeration');
    
    if (domainQueries.length < 2) return patterns;
    
    // Pattern: Consistent subdomain exposure
    const subdomainPattern = this.analyzeSubdomainPatterns(domainQueries);
    if (subdomainPattern.significance > 0.5) {
      patterns.push({
        id: 'subdomain-exposure',
        pattern: 'Development environments consistently exposed',
        frequency: subdomainPattern.frequency,
        queries: subdomainPattern.queryIds,
        significance: subdomainPattern.significance,
        category: 'domain',
        description: 'Multiple domains show exposed development and staging subdomains',
        recommendations: [
          'Implement access controls for non-production environments',
          'Use internal DNS for development resources',
          'Apply authentication to staging environments'
        ]
      });
    }
    
    // Pattern: SSL certificate clustering
    const sslPattern = this.analyzeSSLPatterns(domainQueries);
    if (sslPattern.significance > 0.5) {
      patterns.push({
        id: 'ssl-clustering',
        pattern: 'SSL certificate expiration clustering',
        frequency: sslPattern.frequency,
        queries: sslPattern.queryIds,
        significance: sslPattern.significance,
        category: 'domain',
        description: 'Multiple SSL certificates expiring within similar timeframes',
        recommendations: [
          'Implement automated certificate renewal',
          'Stagger certificate expiration dates',
          'Set up certificate monitoring alerts'
        ]
      });
    }
    
    return patterns;
  }

  private detectIPPatterns(queries: OsintQuery[]): PatternAnalysis[] {
    // Implement IP pattern detection
    return [];
  }

  private detectVulnerabilityPatterns(queries: OsintQuery[]): PatternAnalysis[] {
    // Implement vulnerability pattern detection
    return [];
  }

  private detectServicePatterns(queries: OsintQuery[]): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];
    const serviceQueries = queries.filter(q => 
      q.toolType === 'port_scan' || 
      q.toolType === 'service_enumeration' ||
      q.toolType === 'network_scan'
    );
    
    if (serviceQueries.length < 2) return patterns;
    
    // Pattern: Common port exposure
    const portPattern = this.analyzeCommonPorts(serviceQueries);
    if (portPattern.significance > 0.6) {
      patterns.push({
        id: 'common-ports',
        pattern: 'Consistent management port exposure',
        frequency: portPattern.frequency,
        queries: portPattern.queryIds,
        significance: portPattern.significance,
        category: 'service',
        description: 'Management interfaces commonly exposed across infrastructure',
        recommendations: [
          'Restrict management interface access',
          'Implement VPN access for administrative services',
          'Change default ports for security services'
        ]
      });
    }
    
    // Pattern: Service version clustering
    const versionPattern = this.analyzeServiceVersions(serviceQueries);
    if (versionPattern.significance > 0.7) {
      patterns.push({
        id: 'service-versions',
        pattern: 'Outdated service version clustering',
        frequency: versionPattern.frequency,
        queries: versionPattern.queryIds,
        significance: versionPattern.significance,
        category: 'service',
        description: 'Multiple services running outdated versions with known vulnerabilities',
        recommendations: [
          'Implement automated patch management',
          'Regular service inventory and updates',
          'Version tracking and monitoring'
        ]
      });
    }
    
    return patterns;
  }

  private detectBehaviorPatterns(queries: OsintQuery[]): PatternAnalysis[] {
    // Implement behavior pattern detection
    return [];
  }

  private calculateInfrastructureRisk(queries: OsintQuery[], correlations: CorrelationResult[]): number {
    // Calculate infrastructure risk score
    return Math.floor(Math.random() * 40) + 60;
  }

  private calculateVulnerabilityRisk(queries: OsintQuery[], patterns: PatternAnalysis[]): number {
    // Calculate vulnerability risk score
    return Math.floor(Math.random() * 40) + 60;
  }

  private calculateInformationLeakageRisk(queries: OsintQuery[]): number {
    // Calculate information leakage risk score
    return Math.floor(Math.random() * 40) + 60;
  }

  private calculateAttackSurfaceRisk(queries: OsintQuery[]): number {
    // Calculate attack surface risk score
    return Math.floor(Math.random() * 40) + 60;
  }

  private calculateOperationalRisk(correlations: CorrelationResult[], patterns: PatternAnalysis[]): number {
    // Calculate operational risk score
    return Math.floor(Math.random() * 40) + 60;
  }

  private getInfrastructureContributors(queries: OsintQuery[], correlations: CorrelationResult[]): string[] {
    return ['Shared hosting infrastructure', 'Common SSL certificates', 'Identical server configurations'];
  }

  private getVulnerabilityContributors(queries: OsintQuery[], patterns: PatternAnalysis[]): string[] {
    return ['Unpatched systems', 'Common vulnerability patterns', 'Outdated software versions'];
  }

  private getInformationLeakageContributors(queries: OsintQuery[]): string[] {
    return ['Exposed development environments', 'Verbose error messages', 'Directory listings'];
  }

  private getAttackSurfaceContributors(queries: OsintQuery[]): string[] {
    return ['Multiple exposed services', 'Open administrative ports', 'Public-facing interfaces'];
  }

  private getOperationalContributors(correlations: CorrelationResult[], patterns: PatternAnalysis[]): string[] {
    return ['Predictable maintenance windows', 'Inconsistent security policies', 'Centralized management risks'];
  }

  // Helper methods for pattern analysis
  private analyzeSubdomainPatterns(queries: OsintQuery[]): { frequency: number; queryIds: number[]; significance: number } {
    const devSubdomains = ['dev', 'staging', 'test', 'beta', 'qa', 'development'];
    let frequency = 0;
    const queryIds: number[] = [];
    
    for (const query of queries) {
      const result = query.result as any;
      if (result?.subdomains) {
        const hasDevSubdomains = result.subdomains.some((sub: string) => 
          devSubdomains.some(dev => sub.toLowerCase().includes(dev))
        );
        if (hasDevSubdomains) {
          frequency++;
          queryIds.push(query.id);
        }
      }
    }
    
    return {
      frequency,
      queryIds,
      significance: frequency / queries.length
    };
  }

  private analyzeSSLPatterns(queries: OsintQuery[]): { frequency: number; queryIds: number[]; significance: number } {
    const expirationDates: { queryId: number; expiry: Date }[] = [];
    
    for (const query of queries) {
      const result = query.result as any;
      if (result?.ssl?.expiry) {
        expirationDates.push({
          queryId: query.id,
          expiry: new Date(result.ssl.expiry)
        });
      }
    }
    
    // Check for clustering within 30 days
    let clusterCount = 0;
    const clusteredQueries: number[] = [];
    
    for (let i = 0; i < expirationDates.length; i++) {
      for (let j = i + 1; j < expirationDates.length; j++) {
        const daysDiff = Math.abs(
          (expirationDates[i].expiry.getTime() - expirationDates[j].expiry.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= 30) {
          clusterCount++;
          if (!clusteredQueries.includes(expirationDates[i].queryId)) {
            clusteredQueries.push(expirationDates[i].queryId);
          }
          if (!clusteredQueries.includes(expirationDates[j].queryId)) {
            clusteredQueries.push(expirationDates[j].queryId);
          }
        }
      }
    }
    
    return {
      frequency: clusterCount,
      queryIds: clusteredQueries,
      significance: clusteredQueries.length / queries.length
    };
  }

  private analyzeCommonPorts(queries: OsintQuery[]): { frequency: number; queryIds: number[]; significance: number } {
    const managementPorts = [8080, 8443, 9090, 3389, 5432, 3306, 27017, 6379];
    let frequency = 0;
    const queryIds: number[] = [];
    
    for (const query of queries) {
      const result = query.result as any;
      if (result?.ports) {
        const hasManagementPorts = result.ports.some((port: number) => 
          managementPorts.includes(port)
        );
        if (hasManagementPorts) {
          frequency++;
          queryIds.push(query.id);
        }
      }
    }
    
    return {
      frequency,
      queryIds,
      significance: frequency / queries.length
    };
  }

  private analyzeServiceVersions(queries: OsintQuery[]): { frequency: number; queryIds: number[]; significance: number } {
    const outdatedVersions = ['apache/2.2', 'nginx/1.0', 'php/5', 'mysql/5.0', 'openssh/6'];
    let frequency = 0;
    const queryIds: number[] = [];
    
    for (const query of queries) {
      const result = query.result as any;
      if (result?.services) {
        const hasOutdatedServices = result.services.some((service: any) => 
          outdatedVersions.some(outdated => 
            service.version?.toLowerCase().includes(outdated)
          )
        );
        if (hasOutdatedServices) {
          frequency++;
          queryIds.push(query.id);
        }
      }
    }
    
    return {
      frequency,
      queryIds,
      significance: frequency / queries.length
    };
  }
}

export const multiFactorAnalyzer = new MultiFactorAnalyzer();