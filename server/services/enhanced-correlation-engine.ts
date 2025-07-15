import type { OsintQuery } from '@shared/schema';
import { multiFactorAnalyzer, type CorrelationResult, type PatternAnalysis } from './multi-factor-analyzer';

export interface AdvancedCorrelation extends CorrelationResult {
  networkGraph: {
    nodes: { id: string; label: string; type: string; risk: number }[];
    edges: { source: string; target: string; weight: number; type: string }[];
  };
  temporalAnalysis: {
    timeline: { timestamp: string; event: string; correlation: string }[];
    patterns: { period: string; frequency: number; confidence: number }[];
  };
  riskAssessment: {
    criticalPaths: string[];
    vulnerabilityChains: string[];
    exposureMap: { [key: string]: number };
  };
}

export interface ThreatIntelligence {
  indicators: {
    iocs: string[];
    ttps: string[];
    campaigns: string[];
  };
  attribution: {
    groups: string[];
    confidence: number;
    evidence: string[];
  };
  prediction: {
    nextTargets: string[];
    timeframe: string;
    likelihood: number;
  };
}

export class EnhancedCorrelationEngine {
  async performDeepAnalysis(queries: OsintQuery[]): Promise<{
    correlations: AdvancedCorrelation[];
    threatIntel: ThreatIntelligence;
    recommendations: {
      immediate: string[];
      strategic: string[];
      preventive: string[];
    };
  }> {
    // Get base correlations from multi-factor analyzer
    const baseAnalysis = await multiFactorAnalyzer.analyzeQueries(queries);
    
    // Enhance correlations with advanced features
    const enhancedCorrelations = await this.enhanceCorrelations(baseAnalysis.correlations, queries);
    
    // Generate threat intelligence
    const threatIntel = await this.generateThreatIntelligence(queries, enhancedCorrelations);
    
    // Create strategic recommendations
    const recommendations = await this.generateStrategicRecommendations(
      enhancedCorrelations, 
      threatIntel, 
      baseAnalysis.patterns
    );

    return {
      correlations: enhancedCorrelations,
      threatIntel,
      recommendations
    };
  }

  private async enhanceCorrelations(
    baseCorrelations: CorrelationResult[], 
    queries: OsintQuery[]
  ): Promise<AdvancedCorrelation[]> {
    const enhanced: AdvancedCorrelation[] = [];

    for (const correlation of baseCorrelations) {
      const sourceQuery = queries.find(q => q.id === correlation.sourceQuery);
      const targetQuery = queries.find(q => q.id === correlation.targetQuery);
      
      if (!sourceQuery || !targetQuery) continue;

      // Build network graph
      const networkGraph = this.buildNetworkGraph(sourceQuery, targetQuery, correlation);
      
      // Temporal analysis
      const temporalAnalysis = this.analyzeTemporalPatterns(sourceQuery, targetQuery);
      
      // Risk assessment
      const riskAssessment = this.assessRiskPaths(sourceQuery, targetQuery, correlation);

      enhanced.push({
        ...correlation,
        networkGraph,
        temporalAnalysis,
        riskAssessment
      });
    }

    return enhanced;
  }

  private buildNetworkGraph(
    sourceQuery: OsintQuery, 
    targetQuery: OsintQuery, 
    correlation: CorrelationResult
  ) {
    const nodes = [
      {
        id: `query-${sourceQuery.id}`,
        label: sourceQuery.query,
        type: sourceQuery.toolType,
        risk: this.calculateNodeRisk(sourceQuery)
      },
      {
        id: `query-${targetQuery.id}`,
        label: targetQuery.query,
        type: targetQuery.toolType,
        risk: this.calculateNodeRisk(targetQuery)
      }
    ];

    const edges = [
      {
        source: `query-${sourceQuery.id}`,
        target: `query-${targetQuery.id}`,
        weight: correlation.confidence / 100,
        type: correlation.correlationType
      }
    ];

    // Add infrastructure nodes if correlation is infrastructure-based
    if (correlation.correlationType === 'infrastructure') {
      const infraNode = {
        id: 'shared-infrastructure',
        label: 'Shared Infrastructure',
        type: 'infrastructure',
        risk: correlation.impact === 'critical' ? 0.9 : 0.6
      };
      nodes.push(infraNode);
      
      edges.push(
        {
          source: `query-${sourceQuery.id}`,
          target: 'shared-infrastructure',
          weight: 0.8,
          type: 'hosts-on'
        },
        {
          source: `query-${targetQuery.id}`,
          target: 'shared-infrastructure',
          weight: 0.8,
          type: 'hosts-on'
        }
      );
    }

    return { nodes, edges };
  }

  private analyzeTemporalPatterns(sourceQuery: OsintQuery, targetQuery: OsintQuery) {
    const timeline = [
      {
        timestamp: sourceQuery.createdAt?.toISOString() || new Date().toISOString(),
        event: `Source query executed: ${sourceQuery.toolType}`,
        correlation: 'discovery'
      },
      {
        timestamp: targetQuery.createdAt?.toISOString() || new Date().toISOString(),
        event: `Target query executed: ${targetQuery.toolType}`,
        correlation: 'discovery'
      }
    ];

    const patterns = [
      {
        period: 'concurrent',
        frequency: this.calculateConcurrency(sourceQuery, targetQuery),
        confidence: 0.85
      },
      {
        period: 'sequential',
        frequency: this.calculateSequential(sourceQuery, targetQuery),
        confidence: 0.72
      }
    ];

    return { timeline, patterns };
  }

  private assessRiskPaths(
    sourceQuery: OsintQuery, 
    targetQuery: OsintQuery, 
    correlation: CorrelationResult
  ) {
    const criticalPaths = [];
    const vulnerabilityChains = [];
    const exposureMap: { [key: string]: number } = {};

    // Identify critical attack paths
    if (correlation.correlationType === 'infrastructure') {
      criticalPaths.push(`${sourceQuery.query} → Shared Infrastructure → ${targetQuery.query}`);
    }

    if (correlation.correlationType === 'vulnerability') {
      vulnerabilityChains.push(`Shared vulnerabilities between ${sourceQuery.query} and ${targetQuery.query}`);
    }

    // Calculate exposure scores
    exposureMap[sourceQuery.query] = this.calculateExposureScore(sourceQuery);
    exposureMap[targetQuery.query] = this.calculateExposureScore(targetQuery);

    return { criticalPaths, vulnerabilityChains, exposureMap };
  }

  private async generateThreatIntelligence(
    queries: OsintQuery[], 
    correlations: AdvancedCorrelation[]
  ): Promise<ThreatIntelligence> {
    // Extract indicators of compromise
    const iocs = this.extractIOCs(queries);
    
    // Identify tactics, techniques, and procedures
    const ttps = this.identifyTTPs(queries, correlations);
    
    // Detect campaign patterns
    const campaigns = this.detectCampaigns(correlations);

    // Attribution analysis
    const attribution = this.analyzeAttribution(iocs, ttps, campaigns);

    // Predictive analysis
    const prediction = this.generatePredictions(queries, correlations);

    return {
      indicators: { iocs, ttps, campaigns },
      attribution,
      prediction
    };
  }

  private extractIOCs(queries: OsintQuery[]): string[] {
    const iocs: string[] = [];
    
    for (const query of queries) {
      const result = query.result as any;
      
      // Extract IP addresses
      if (result?.ip) {
        iocs.push(`ip:${result.ip}`);
      }
      
      // Extract domains
      if (result?.domain) {
        iocs.push(`domain:${result.domain}`);
      }
      
      // Extract file hashes
      if (result?.hashes) {
        result.hashes.forEach((hash: string) => iocs.push(`hash:${hash}`));
      }
      
      // Extract suspicious URLs
      if (result?.urls) {
        result.urls.forEach((url: string) => {
          if (this.isSuspiciousURL(url)) {
            iocs.push(`url:${url}`);
          }
        });
      }
    }
    
    return [...new Set(iocs)]; // Remove duplicates
  }

  private identifyTTPs(queries: OsintQuery[], correlations: AdvancedCorrelation[]): string[] {
    const ttps: string[] = [];
    
    // Reconnaissance techniques
    const reconQueries = queries.filter(q => 
      ['domain_enumeration', 'subdomain_enumeration', 'port_scan'].includes(q.toolType)
    );
    if (reconQueries.length > 0) {
      ttps.push('T1595.002 - Active Scanning: Vulnerability Scanning');
      ttps.push('T1590.005 - Gather Victim Network Information: IP Addresses');
    }
    
    // Infrastructure correlations suggest supply chain attacks
    const infraCorrelations = correlations.filter(c => c.correlationType === 'infrastructure');
    if (infraCorrelations.length > 2) {
      ttps.push('T1195 - Supply Chain Compromise');
    }
    
    // Timing correlations suggest coordinated attacks
    const timingCorrelations = correlations.filter(c => c.correlationType === 'timing');
    if (timingCorrelations.length > 1) {
      ttps.push('T1102 - Web Service: Coordinated Campaign');
    }
    
    return ttps;
  }

  private detectCampaigns(correlations: AdvancedCorrelation[]): string[] {
    const campaigns: string[] = [];
    
    // High confidence infrastructure correlations suggest APT campaigns
    const highConfidenceInfra = correlations.filter(c => 
      c.correlationType === 'infrastructure' && c.confidence > 85
    );
    
    if (highConfidenceInfra.length > 2) {
      campaigns.push('APT-Infrastructure-Campaign');
    }
    
    // Multiple vulnerability correlations suggest exploit kit usage
    const vulnCorrelations = correlations.filter(c => c.correlationType === 'vulnerability');
    if (vulnCorrelations.length > 3) {
      campaigns.push('Exploit-Kit-Campaign');
    }
    
    return campaigns;
  }

  private analyzeAttribution(iocs: string[], ttps: string[], campaigns: string[]): ThreatIntelligence['attribution'] {
    let confidence = 0;
    const groups: string[] = [];
    const evidence: string[] = [];
    
    // Attribution based on TTP patterns
    if (ttps.includes('T1195 - Supply Chain Compromise')) {
      groups.push('APT29', 'APT40');
      confidence += 0.3;
      evidence.push('Supply chain compromise TTP detected');
    }
    
    if (ttps.includes('T1102 - Web Service: Coordinated Campaign')) {
      groups.push('APT1', 'Lazarus Group');
      confidence += 0.2;
      evidence.push('Coordinated campaign timing detected');
    }
    
    // Attribution based on infrastructure patterns
    if (campaigns.includes('APT-Infrastructure-Campaign')) {
      confidence += 0.4;
      evidence.push('Advanced infrastructure correlation patterns');
    }
    
    return {
      groups: [...new Set(groups)],
      confidence: Math.min(confidence, 0.95), // Cap at 95%
      evidence
    };
  }

  private generatePredictions(
    queries: OsintQuery[], 
    correlations: AdvancedCorrelation[]
  ): ThreatIntelligence['prediction'] {
    const nextTargets: string[] = [];
    let likelihood = 0;
    
    // Predict targets based on infrastructure correlations
    for (const correlation of correlations) {
      if (correlation.correlationType === 'infrastructure' && correlation.confidence > 80) {
        // Find other systems on the same infrastructure
        const sourceQuery = queries.find(q => q.id === correlation.sourceQuery);
        if (sourceQuery?.result) {
          const result = sourceQuery.result as any;
          if (result?.relatedDomains) {
            nextTargets.push(...result.relatedDomains);
          }
        }
        likelihood += 0.2;
      }
    }
    
    // Predict based on vulnerability patterns
    const vulnCorrelations = correlations.filter(c => c.correlationType === 'vulnerability');
    if (vulnCorrelations.length > 2) {
      nextTargets.push('Systems with similar software stacks');
      likelihood += 0.3;
    }
    
    return {
      nextTargets: [...new Set(nextTargets)].slice(0, 5), // Limit to top 5
      timeframe: likelihood > 0.6 ? '1-7 days' : '1-4 weeks',
      likelihood: Math.min(likelihood, 0.9)
    };
  }

  private async generateStrategicRecommendations(
    correlations: AdvancedCorrelation[],
    threatIntel: ThreatIntelligence,
    patterns: PatternAnalysis[]
  ) {
    const immediate: string[] = [];
    const strategic: string[] = [];
    const preventive: string[] = [];

    // Immediate actions based on critical correlations
    const criticalCorrelations = correlations.filter(c => c.impact === 'critical');
    if (criticalCorrelations.length > 0) {
      immediate.push('Isolate systems with critical infrastructure correlations');
      immediate.push('Implement emergency monitoring on correlated assets');
      immediate.push('Activate incident response procedures');
    }

    // Strategic recommendations based on threat intelligence
    if (threatIntel.attribution.confidence > 0.7) {
      strategic.push('Implement threat hunting based on identified APT TTPs');
      strategic.push('Enhance monitoring for campaign indicators');
      strategic.push('Review and update incident response playbooks');
    }

    // Preventive measures based on patterns
    const significantPatterns = patterns.filter(p => p.significance > 0.8);
    if (significantPatterns.length > 0) {
      preventive.push('Implement network segmentation to break correlation chains');
      preventive.push('Deploy deception technologies on high-risk assets');
      preventive.push('Establish continuous security monitoring programs');
    }

    return { immediate, strategic, preventive };
  }

  // Helper methods
  private calculateNodeRisk(query: OsintQuery): number {
    const result = query.result as any;
    let risk = 0.3; // Base risk
    
    if (result?.vulnerabilities?.length > 0) risk += 0.4;
    if (result?.openPorts?.length > 5) risk += 0.2;
    if (result?.exposedServices?.length > 0) risk += 0.3;
    
    return Math.min(risk, 1.0);
  }

  private calculateConcurrency(query1: OsintQuery, query2: OsintQuery): number {
    if (!query1.createdAt || !query2.createdAt) return 0;
    
    const timeDiff = Math.abs(
      query1.createdAt.getTime() - query2.createdAt.getTime()
    );
    
    // Consider concurrent if within 1 hour
    return timeDiff < 3600000 ? 1 : 0;
  }

  private calculateSequential(query1: OsintQuery, query2: OsintQuery): number {
    if (!query1.createdAt || !query2.createdAt) return 0;
    
    const timeDiff = query2.createdAt.getTime() - query1.createdAt.getTime();
    
    // Consider sequential if query2 follows query1 within 24 hours
    return timeDiff > 0 && timeDiff < 86400000 ? 1 : 0;
  }

  private calculateExposureScore(query: OsintQuery): number {
    const result = query.result as any;
    let exposure = 0;
    
    if (result?.publicExposure) exposure += 0.5;
    if (result?.vulnerabilities?.length > 0) exposure += 0.3;
    if (result?.misconfigurations?.length > 0) exposure += 0.2;
    
    return Math.min(exposure, 1.0);
  }

  private isSuspiciousURL(url: string): boolean {
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|t\.co/,
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,
      /[a-zA-Z0-9]{10,}\.tk|\.ml|\.ga/
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(url));
  }
}

export const enhancedCorrelationEngine = new EnhancedCorrelationEngine();