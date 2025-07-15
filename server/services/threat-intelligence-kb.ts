import OpenAI from 'openai';
import type { OsintQuery } from '@shared/schema';
import { storage } from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  origin: string;
  motivation: string;
  sophistication: 'low' | 'medium' | 'high' | 'advanced';
  firstSeen: string;
  lastActivity: string;
  tactics: string[];
  techniques: string[];
  procedures: string[];
  targetSectors: string[];
  targetRegions: string[];
  indicators: {
    ips: string[];
    domains: string[];
    hashes: string[];
    emails: string[];
  };
  campaigns: string[];
  tools: string[];
  confidence: number;
  references: string[];
}

export interface ThreatCampaign {
  id: string;
  name: string;
  description: string;
  actor: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'suspected';
  targets: string[];
  objectives: string[];
  techniques: string[];
  indicators: {
    ips: string[];
    domains: string[];
    hashes: string[];
    urls: string[];
  };
  timeline: Array<{
    date: string;
    event: string;
    description: string;
    evidence: string[];
  }>;
  impact: {
    scope: 'limited' | 'moderate' | 'widespread' | 'global';
    severity: 'low' | 'medium' | 'high' | 'critical';
    sectors: string[];
    countries: string[];
  };
  mitigation: string[];
  confidence: number;
  references: string[];
}

export interface VulnerabilityIntel {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore: number;
  vector: string;
  publishedDate: string;
  modifiedDate: string;
  affectedProducts: Array<{
    vendor: string;
    product: string;
    versions: string[];
  }>;
  exploitability: {
    availableExploits: boolean;
    exploitMaturity: 'proof_of_concept' | 'functional' | 'high' | 'not_defined';
    publicExploits: string[];
    inTheWild: boolean;
  };
  threatContext: {
    exploitedBy: string[];
    campaigns: string[];
    malwareFamilies: string[];
  };
  mitigations: string[];
  patches: Array<{
    vendor: string;
    url: string;
    releaseDate: string;
    description: string;
  }>;
  references: string[];
}

export interface IoC {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file';
  value: string;
  context: {
    malwareFamily?: string;
    threatActor?: string;
    campaign?: string;
    firstSeen: string;
    lastSeen: string;
    confidence: number;
    tlp: 'white' | 'green' | 'amber' | 'red';
  };
  behavior: {
    purpose: string[];
    techniques: string[];
    impact: string;
  };
  attributes: Record<string, any>;
  relationships: Array<{
    type: 'related_to' | 'part_of' | 'communicates_with' | 'downloads_from';
    target: string;
    confidence: number;
  }>;
  sources: Array<{
    name: string;
    reliability: number;
    url?: string;
    timestamp: string;
  }>;
  tags: string[];
  status: 'active' | 'inactive' | 'unknown';
}

export interface KnowledgeEntry {
  id: string;
  type: 'actor' | 'campaign' | 'vulnerability' | 'ioc' | 'technique' | 'tool';
  title: string;
  content: string;
  summary: string;
  tags: string[];
  confidence: number;
  sources: string[];
  created: string;
  modified: string;
  relatedEntries: string[];
  metadata: Record<string, any>;
}

export class ThreatIntelligenceKB {
  private actors: ThreatActor[] = [];
  private campaigns: ThreatCampaign[] = [];
  private vulnerabilities: VulnerabilityIntel[] = [];
  private iocs: IoC[] = [];
  private knowledgeEntries: KnowledgeEntry[] = [];

  async initializeKnowledgeBase(): Promise<void> {
    // Initialize with sample data
    this.actors = [
      {
        id: 'apt29',
        name: 'APT29',
        aliases: ['Cozy Bear', 'The Dukes', 'Yttrium'],
        description: 'Advanced persistent threat group believed to be associated with Russian intelligence services',
        origin: 'Russia',
        motivation: 'Espionage, Intelligence gathering',
        sophistication: 'advanced',
        firstSeen: '2008-01-01',
        lastActivity: '2024-01-15',
        tactics: ['Initial Access', 'Persistence', 'Privilege Escalation', 'Defense Evasion'],
        techniques: ['T1566.001', 'T1078', 'T1055', 'T1027'],
        procedures: ['Spear-phishing emails', 'Living off the land techniques', 'Supply chain attacks'],
        targetSectors: ['Government', 'Healthcare', 'Technology', 'Energy'],
        targetRegions: ['North America', 'Europe', 'Asia'],
        indicators: {
          ips: ['185.86.151.11', '94.156.35.24'],
          domains: ['health-update.org', 'security-center.info'],
          hashes: ['a1b2c3d4e5f6...', 'f6e5d4c3b2a1...'],
          emails: ['support@health-update.org']
        },
        campaigns: ['SolarWinds', 'COVID-19 Vaccine Research'],
        tools: ['HAMMERTOSS', 'CHOPSTICK', 'CozyDuke'],
        confidence: 0.95,
        references: [
          'https://attack.mitre.org/groups/G0016/',
          'https://www.fireeye.com/blog/threat-research/2020/12/evasive-attacker-leverages-solarwinds-supply-chain-compromises-with-sunburst-backdoor.html'
        ]
      },
      {
        id: 'apt28',
        name: 'APT28',
        aliases: ['Fancy Bear', 'Sofacy', 'Strontium'],
        description: 'Russian military intelligence cyber unit focused on espionage and influence operations',
        origin: 'Russia',
        motivation: 'Espionage, Political influence',
        sophistication: 'advanced',
        firstSeen: '2007-01-01',
        lastActivity: '2024-01-10',
        tactics: ['Initial Access', 'Execution', 'Persistence', 'Command and Control'],
        techniques: ['T1566.002', 'T1059.003', 'T1547.001', 'T1071.001'],
        procedures: ['Zero-day exploits', 'Credential harvesting', 'Infrastructure hijacking'],
        targetSectors: ['Government', 'Military', 'Media', 'Civil society'],
        targetRegions: ['Europe', 'North America', 'Eastern Europe'],
        indicators: {
          ips: ['185.141.25.168', '45.32.137.94'],
          domains: ['mail-google.org', 'accounts-google.org'],
          hashes: ['b4d3e2f1a0c9...', 'c9a0f1e2d3b4...'],
          emails: ['noreply@mail-google.org']
        },
        campaigns: ['DNC Hack', 'Olympic Destroyer', 'VPNFilter'],
        tools: ['X-Agent', 'Downdelph', 'GAMEFISH'],
        confidence: 0.92,
        references: [
          'https://attack.mitre.org/groups/G0007/',
          'https://www.crowdstrike.com/blog/bears-midst-intrusion-democratic-national-committee/'
        ]
      }
    ];

    this.campaigns = [
      {
        id: 'solarwinds',
        name: 'SolarWinds Supply Chain Attack',
        description: 'Sophisticated supply chain compromise affecting thousands of organizations worldwide',
        actor: 'apt29',
        startDate: '2019-09-01',
        endDate: '2020-12-13',
        status: 'inactive',
        targets: ['US Government agencies', 'Fortune 500 companies', 'Technology companies'],
        objectives: ['Long-term espionage', 'Intelligence gathering', 'Network reconnaissance'],
        techniques: ['T1195.002', 'T1078.004', 'T1055.001', 'T1027.002'],
        indicators: {
          ips: ['13.59.205.66', '54.193.127.66'],
          domains: ['avsvmcloud.com', 'digitalcollege.org'],
          hashes: ['292327e5c94afa352cc5a02ca273df543749bb5ccd69dfa051d', 'ce77d116a074dab7a22a0fd4f2c1ab475f16eec42e1ded3c0b0aa8211fe858d6'],
          urls: ['https://avsvmcloud.com/updates', 'https://digitalcollege.org/api/v1/']
        },
        timeline: [
          {
            date: '2019-09-01',
            event: 'Initial compromise',
            description: 'Attackers gain access to SolarWinds development environment',
            evidence: ['Network logs', 'Build system artifacts']
          },
          {
            date: '2020-03-01',
            event: 'Malicious update distribution',
            description: 'SUNBURST backdoor distributed via legitimate software updates',
            evidence: ['Signed binaries', 'Update metadata']
          },
          {
            date: '2020-12-13',
            event: 'Public disclosure',
            description: 'FireEye discovers and reports the campaign',
            evidence: ['Security research', 'Victim notifications']
          }
        ],
        impact: {
          scope: 'global',
          severity: 'critical',
          sectors: ['Government', 'Technology', 'Telecommunications', 'Consulting'],
          countries: ['US', 'UK', 'Canada', 'Mexico', 'Belgium', 'Spain', 'UAE', 'Israel']
        },
        mitigation: [
          'Immediately update SolarWinds Orion software',
          'Isolate and rebuild affected systems',
          'Hunt for SUNBURST and TEARDROP indicators',
          'Review network traffic for C2 communications'
        ],
        confidence: 0.98,
        references: [
          'https://www.fireeye.com/blog/threat-research/2020/12/evasive-attacker-leverages-solarwinds-supply-chain-compromises-with-sunburst-backdoor.html',
          'https://www.cisa.gov/news/2020/12/13/cisa-issues-emergency-directive-mitigate-compromise-solarwinds-orion-network'
        ]
      }
    ];

    this.vulnerabilities = [
      {
        id: 'cve-2021-44228',
        cveId: 'CVE-2021-44228',
        title: 'Apache Log4j2 Remote Code Execution',
        description: 'Remote code execution vulnerability in Apache Log4j2 JNDI lookup feature',
        severity: 'critical',
        cvssScore: 10.0,
        vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
        publishedDate: '2021-12-10',
        modifiedDate: '2021-12-15',
        affectedProducts: [
          {
            vendor: 'Apache',
            product: 'Log4j',
            versions: ['2.0-beta9 through 2.15.0']
          }
        ],
        exploitability: {
          availableExploits: true,
          exploitMaturity: 'functional',
          publicExploits: [
            'https://github.com/kozmer/log4j-shell-poc',
            'https://github.com/christophetd/log4shell-vulnerable-app'
          ],
          inTheWild: true
        },
        threatContext: {
          exploitedBy: ['apt28', 'apt29', 'ransomware-groups'],
          campaigns: ['log4shell-exploitation'],
          malwareFamilies: ['Kinsing', 'Mirai', 'Muhstik']
        },
        mitigations: [
          'Upgrade to Log4j 2.17.1 or later',
          'Set system property log4j2.formatMsgNoLookups=true',
          'Remove JndiLookup class from classpath',
          'Apply WAF rules to block exploitation attempts'
        ],
        patches: [
          {
            vendor: 'Apache',
            url: 'https://logging.apache.org/log4j/2.x/security.html',
            releaseDate: '2021-12-14',
            description: 'Log4j 2.17.1 security release'
          }
        ],
        references: [
          'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
          'https://www.lunasec.io/docs/blog/log4j-zero-day/'
        ]
      }
    ];

    this.iocs = [
      {
        id: 'ioc-1',
        type: 'domain',
        value: 'avsvmcloud.com',
        context: {
          malwareFamily: 'SUNBURST',
          threatActor: 'apt29',
          campaign: 'solarwinds',
          firstSeen: '2020-02-01',
          lastSeen: '2020-12-13',
          confidence: 0.95,
          tlp: 'white'
        },
        behavior: {
          purpose: ['Command and Control', 'Data exfiltration'],
          techniques: ['T1071.001', 'T1041'],
          impact: 'Critical infrastructure compromise'
        },
        attributes: {
          registrar: 'GoDaddy',
          nameservers: ['ns1.godaddy.com', 'ns2.godaddy.com'],
          whoisData: {
            registrant: 'Domains By Proxy',
            registrationDate: '2018-11-19',
            expirationDate: '2021-11-19'
          }
        },
        relationships: [
          {
            type: 'communicates_with',
            target: '13.59.205.66',
            confidence: 0.9
          }
        ],
        sources: [
          {
            name: 'FireEye',
            reliability: 0.95,
            url: 'https://www.fireeye.com/blog/threat-research/2020/12/evasive-attacker-leverages-solarwinds-supply-chain-compromises-with-sunburst-backdoor.html',
            timestamp: '2020-12-13T00:00:00Z'
          }
        ],
        tags: ['solarwinds', 'apt29', 'supply-chain', 'c2'],
        status: 'inactive'
      }
    ];

    this.knowledgeEntries = [
      {
        id: 'entry-1',
        type: 'technique',
        title: 'Supply Chain Compromise (T1195)',
        content: 'Adversaries may manipulate products or product delivery mechanisms prior to receipt by a final consumer for the purpose of data or system compromise...',
        summary: 'Technique involving compromise of software supply chain to deliver malicious code',
        tags: ['mitre-attack', 'initial-access', 'supply-chain'],
        confidence: 0.9,
        sources: ['MITRE ATT&CK', 'Security research'],
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-15T00:00:00Z',
        relatedEntries: ['solarwinds', 'apt29'],
        metadata: {
          mitreId: 'T1195',
          tactics: ['Initial Access'],
          platforms: ['Windows', 'macOS', 'Linux']
        }
      }
    ];
  }

  async searchKnowledgeBase(query: string, filters?: {
    type?: string[];
    tags?: string[];
    confidence?: number;
    dateRange?: { start: string; end: string };
  }): Promise<{
    actors: ThreatActor[];
    campaigns: ThreatCampaign[];
    vulnerabilities: VulnerabilityIntel[];
    iocs: IoC[];
    entries: KnowledgeEntry[];
    totalResults: number;
  }> {
    const searchLower = query.toLowerCase();
    
    // Search actors
    let actors = this.actors.filter(actor => 
      actor.name.toLowerCase().includes(searchLower) ||
      actor.aliases.some(alias => alias.toLowerCase().includes(searchLower)) ||
      actor.description.toLowerCase().includes(searchLower) ||
      actor.targetSectors.some(sector => sector.toLowerCase().includes(searchLower))
    );

    // Search campaigns
    let campaigns = this.campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(searchLower) ||
      campaign.description.toLowerCase().includes(searchLower) ||
      campaign.targets.some(target => target.toLowerCase().includes(searchLower))
    );

    // Search vulnerabilities
    let vulnerabilities = this.vulnerabilities.filter(vuln =>
      vuln.cveId.toLowerCase().includes(searchLower) ||
      vuln.title.toLowerCase().includes(searchLower) ||
      vuln.description.toLowerCase().includes(searchLower)
    );

    // Search IoCs
    let iocs = this.iocs.filter(ioc =>
      ioc.value.toLowerCase().includes(searchLower) ||
      ioc.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      (ioc.context.malwareFamily?.toLowerCase().includes(searchLower)) ||
      (ioc.context.threatActor?.toLowerCase().includes(searchLower))
    );

    // Search knowledge entries
    let entries = this.knowledgeEntries.filter(entry =>
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.summary.toLowerCase().includes(searchLower) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );

    // Apply filters
    if (filters) {
      if (filters.type) {
        actors = filters.type.includes('actor') ? actors : [];
        campaigns = filters.type.includes('campaign') ? campaigns : [];
        vulnerabilities = filters.type.includes('vulnerability') ? vulnerabilities : [];
        iocs = filters.type.includes('ioc') ? iocs : [];
        entries = entries.filter(entry => filters.type!.includes(entry.type));
      }

      if (filters.confidence) {
        actors = actors.filter(actor => actor.confidence >= filters.confidence!);
        campaigns = campaigns.filter(campaign => campaign.confidence >= filters.confidence!);
        iocs = iocs.filter(ioc => ioc.context.confidence >= filters.confidence!);
        entries = entries.filter(entry => entry.confidence >= filters.confidence!);
      }

      if (filters.tags) {
        iocs = iocs.filter(ioc => 
          filters.tags!.some(tag => ioc.tags.includes(tag))
        );
        entries = entries.filter(entry => 
          filters.tags!.some(tag => entry.tags.includes(tag))
        );
      }
    }

    const totalResults = actors.length + campaigns.length + vulnerabilities.length + iocs.length + entries.length;

    return {
      actors,
      campaigns,
      vulnerabilities,
      iocs,
      entries,
      totalResults
    };
  }

  async generateIntelligenceReport(entityId: string, entityType: string): Promise<{
    report: string;
    relatedEntities: string[];
    riskAssessment: {
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      factors: string[];
      recommendations: string[];
    };
    timeline: Array<{
      date: string;
      event: string;
      source: string;
    }>;
  }> {
    let entity: any = null;
    
    switch (entityType) {
      case 'actor':
        entity = this.actors.find(a => a.id === entityId);
        break;
      case 'campaign':
        entity = this.campaigns.find(c => c.id === entityId);
        break;
      case 'vulnerability':
        entity = this.vulnerabilities.find(v => v.id === entityId);
        break;
      case 'ioc':
        entity = this.iocs.find(i => i.id === entityId);
        break;
    }

    if (!entity) {
      throw new Error(`Entity ${entityId} of type ${entityType} not found`);
    }

    // Generate comprehensive report using AI
    const prompt = `
    Generate a comprehensive threat intelligence report for the following entity:
    Type: ${entityType}
    Data: ${JSON.stringify(entity, null, 2)}
    
    Provide analysis in JSON format:
    {
      "report": "Detailed narrative report with threat analysis",
      "relatedEntities": ["entity1", "entity2"],
      "riskAssessment": {
        "riskLevel": "low|medium|high|critical",
        "factors": ["factor1", "factor2"],
        "recommendations": ["rec1", "rec2"]
      },
      "timeline": [
        {
          "date": "YYYY-MM-DD",
          "event": "Event description",
          "source": "Source name"
        }
      ]
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a threat intelligence analyst generating comprehensive security reports." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Report generation error:', error);
      return {
        report: `Intelligence report for ${entity.name || entity.value || entityId}`,
        relatedEntities: [],
        riskAssessment: {
          riskLevel: 'medium',
          factors: ['Insufficient data for automated analysis'],
          recommendations: ['Manual review required']
        },
        timeline: []
      };
    }
  }

  async correlateIndicators(iocValue: string): Promise<{
    directMatches: IoC[];
    relatedIndicators: IoC[];
    threatContext: {
      actors: ThreatActor[];
      campaigns: ThreatCampaign[];
      malwareFamilies: string[];
    };
    riskScore: number;
    recommendations: string[];
  }> {
    // Find direct matches
    const directMatches = this.iocs.filter(ioc => 
      ioc.value === iocValue || 
      ioc.relationships.some(rel => rel.target === iocValue)
    );

    // Find related indicators
    const relatedIndicators: IoC[] = [];
    for (const match of directMatches) {
      // Find indicators from same campaign/actor
      const related = this.iocs.filter(ioc =>
        ioc.id !== match.id &&
        (ioc.context.campaign === match.context.campaign ||
         ioc.context.threatActor === match.context.threatActor ||
         ioc.context.malwareFamily === match.context.malwareFamily)
      );
      relatedIndicators.push(...related);
    }

    // Get threat context
    const actorIds = [...new Set(directMatches.map(ioc => ioc.context.threatActor).filter(Boolean))];
    const campaignIds = [...new Set(directMatches.map(ioc => ioc.context.campaign).filter(Boolean))];
    const malwareFamilies = [...new Set(directMatches.map(ioc => ioc.context.malwareFamily).filter(Boolean))];

    const actors = this.actors.filter(actor => actorIds.includes(actor.id));
    const campaigns = this.campaigns.filter(campaign => campaignIds.includes(campaign.id));

    // Calculate risk score
    let riskScore = 0;
    directMatches.forEach(ioc => {
      riskScore += ioc.context.confidence;
      if (ioc.status === 'active') riskScore += 0.2;
      if (ioc.context.tlp === 'red') riskScore += 0.3;
    });
    riskScore = Math.min(1, riskScore / directMatches.length);

    // Generate recommendations
    const recommendations = [
      'Block indicator across all security controls',
      'Hunt for related indicators in environment',
      'Review logs for historical connections'
    ];

    if (actors.length > 0) {
      recommendations.push(`Monitor for TTPs associated with ${actors[0].name}`);
    }

    return {
      directMatches,
      relatedIndicators: [...new Set(relatedIndicators)],
      threatContext: {
        actors,
        campaigns,
        malwareFamilies
      },
      riskScore,
      recommendations
    };
  }

  async addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'created' | 'modified'>): Promise<KnowledgeEntry> {
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    this.knowledgeEntries.push(newEntry);
    return newEntry;
  }

  async updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry | null> {
    const index = this.knowledgeEntries.findIndex(entry => entry.id === id);
    if (index === -1) return null;

    this.knowledgeEntries[index] = {
      ...this.knowledgeEntries[index],
      ...updates,
      modified: new Date().toISOString()
    };

    return this.knowledgeEntries[index];
  }

  // Getter methods
  getActors(): ThreatActor[] { return this.actors; }
  getCampaigns(): ThreatCampaign[] { return this.campaigns; }
  getVulnerabilities(): VulnerabilityIntel[] { return this.vulnerabilities; }
  getIoCs(): IoC[] { return this.iocs; }
  getKnowledgeEntries(): KnowledgeEntry[] { return this.knowledgeEntries; }

  async getEntityById(id: string, type: string): Promise<any> {
    switch (type) {
      case 'actor':
        return this.actors.find(a => a.id === id);
      case 'campaign':
        return this.campaigns.find(c => c.id === id);
      case 'vulnerability':
        return this.vulnerabilities.find(v => v.id === id);
      case 'ioc':
        return this.iocs.find(i => i.id === id);
      case 'entry':
        return this.knowledgeEntries.find(e => e.id === id);
      default:
        return null;
    }
  }

  async getStatistics(): Promise<{
    totalEntries: number;
    byType: Record<string, number>;
    recentActivity: Array<{
      date: string;
      additions: number;
      modifications: number;
    }>;
    confidenceDistribution: Record<string, number>;
  }> {
    const totalEntries = this.actors.length + this.campaigns.length + 
                        this.vulnerabilities.length + this.iocs.length + 
                        this.knowledgeEntries.length;

    const byType = {
      actors: this.actors.length,
      campaigns: this.campaigns.length,
      vulnerabilities: this.vulnerabilities.length,
      iocs: this.iocs.length,
      entries: this.knowledgeEntries.length
    };

    // Mock recent activity (in real implementation, this would come from audit logs)
    const recentActivity = [
      { date: '2024-01-15', additions: 12, modifications: 5 },
      { date: '2024-01-14', additions: 8, modifications: 3 },
      { date: '2024-01-13', additions: 15, modifications: 7 }
    ];

    // Calculate confidence distribution
    const allConfidenceScores = [
      ...this.actors.map(a => a.confidence),
      ...this.campaigns.map(c => c.confidence),
      ...this.iocs.map(i => i.context.confidence),
      ...this.knowledgeEntries.map(e => e.confidence)
    ];

    const confidenceDistribution = {
      high: allConfidenceScores.filter(c => c >= 0.8).length,
      medium: allConfidenceScores.filter(c => c >= 0.6 && c < 0.8).length,
      low: allConfidenceScores.filter(c => c < 0.6).length
    };

    return {
      totalEntries,
      byType,
      recentActivity,
      confidenceDistribution
    };
  }
}

export const threatIntelligenceKB = new ThreatIntelligenceKB();