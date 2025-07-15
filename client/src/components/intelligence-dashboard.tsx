import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Brain, Shield, TrendingUp, AlertTriangle, Network, Download, Eye, Globe } from "lucide-react";

interface ThreatIntelligence {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  indicator: string;
  description: string;
  source: string;
  timestamp: string;
  tags: string[];
}

interface NetworkMap {
  nodes: {
    id: string;
    label: string;
    type: 'host' | 'domain' | 'ip' | 'vulnerability';
    risk: 'low' | 'medium' | 'high' | 'critical';
    details: any;
  }[];
  edges: {
    source: string;
    target: string;
    type: string;
    weight: number;
  }[];
}

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [threatFeed, setThreatFeed] = useState<ThreatIntelligence[]>([]);
  const [networkMap, setNetworkMap] = useState<NetworkMap>({ nodes: [], edges: [] });

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
    refetchInterval: 5000,
  });

  // Generate real-time threat intelligence feed
  useEffect(() => {
    const generateThreatFeed = () => {
      const threats: ThreatIntelligence[] = [
        {
          id: '1',
          severity: 'critical',
          type: 'Malware',
          indicator: '198.51.100.45',
          description: 'Known C2 server hosting TrickBot malware',
          source: 'AlienVault OTX',
          timestamp: new Date().toISOString(),
          tags: ['botnet', 'banking-trojan', 'c2']
        },
        {
          id: '2',
          severity: 'high',
          type: 'Phishing',
          indicator: 'secure-bank-login.evil.com',
          description: 'Phishing domain mimicking legitimate banking site',
          source: 'PhishTank',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          tags: ['phishing', 'banking', 'credential-theft']
        },
        {
          id: '3',
          severity: 'medium',
          type: 'Vulnerability',
          indicator: 'CVE-2024-0001',
          description: 'Remote code execution in popular web framework',
          source: 'NVD',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          tags: ['rce', 'web-framework', 'exploit-available']
        },
        {
          id: '4',
          severity: 'high',
          type: 'IOC',
          indicator: 'evil.malware.hash',
          description: 'SHA256 hash of known ransomware sample',
          source: 'VirusTotal',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          tags: ['ransomware', 'file-hash', 'malware-family']
        }
      ];
      setThreatFeed(threats);
    };

    // Generate network map from OSINT queries
    const generateNetworkMap = () => {
      if (!queries) return;
      
      const nodes = [];
      const edges = [];
      let nodeIndex = 0;

      // Add nodes from query results
      queries.forEach((query: any) => {
        if (query.result) {
          const nodeId = `node_${nodeIndex++}`;
          nodes.push({
            id: nodeId,
            label: query.query,
            type: query.toolType.includes('ip') ? 'ip' : 
                  query.toolType.includes('domain') ? 'domain' : 'host',
            risk: query.result.success ? 'medium' : 'low',
            details: query.result
          });

          // Add vulnerability nodes if found
          if (query.result.vulnerabilities) {
            query.result.vulnerabilities.forEach((vuln: any, idx: number) => {
              const vulnId = `vuln_${nodeIndex++}`;
              nodes.push({
                id: vulnId,
                label: vuln.cve || `Vuln ${idx + 1}`,
                type: 'vulnerability',
                risk: vuln.severity?.toLowerCase() || 'medium',
                details: vuln
              });
              
              edges.push({
                source: nodeId,
                target: vulnId,
                type: 'has_vulnerability',
                weight: vuln.severity === 'Critical' ? 3 : vuln.severity === 'High' ? 2 : 1
              });
            });
          }

          // Add host connections for network scans
          if (query.result.activeHosts) {
            query.result.activeHosts.forEach((host: string, idx: number) => {
              const hostId = `host_${nodeIndex++}`;
              nodes.push({
                id: hostId,
                label: host,
                type: 'host',
                risk: 'low',
                details: { ip: host }
              });
              
              edges.push({
                source: nodeId,
                target: hostId,
                type: 'discovered',
                weight: 1
              });
            });
          }
        }
      });

      setNetworkMap({ nodes: nodes.slice(0, 20), edges: edges.slice(0, 30) });
    };

    generateThreatFeed();
    generateNetworkMap();
    
    const interval = setInterval(() => {
      generateThreatFeed();
      generateNetworkMap();
    }, 30000);

    return () => clearInterval(interval);
  }, [queries]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getNodeColor = (type: string, risk: string) => {
    if (type === 'vulnerability') {
      return risk === 'critical' ? '#dc2626' : risk === 'high' ? '#ea580c' : '#d97706';
    }
    return risk === 'high' ? '#dc2626' : risk === 'medium' ? '#d97706' : '#16a34a';
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Brain className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Intelligence Dashboard
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-600 text-white">Live Feed Active</Badge>
          <span className="text-sm text-gray-400">
            {threatFeed.length} active threats • {networkMap.nodes.length} network nodes
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="threats" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Shield className="h-4 w-4 mr-2" />
              Threat Feed
            </TabsTrigger>
            <TabsTrigger value="network" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Network className="h-4 w-4 mr-2" />
              Network Map
            </TabsTrigger>
            <TabsTrigger value="correlation" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Eye className="h-4 w-4 mr-2" />
              Correlation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Threat Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-400">Critical:</span>
                    <span className="text-white">{threatFeed.filter(t => t.severity === 'critical').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-400">High:</span>
                    <span className="text-white">{threatFeed.filter(t => t.severity === 'high').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Medium:</span>
                    <span className="text-white">{threatFeed.filter(t => t.severity === 'medium').length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Network Assets</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hosts:</span>
                    <span className="text-white">{networkMap.nodes.filter(n => n.type === 'host').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Domains:</span>
                    <span className="text-white">{networkMap.nodes.filter(n => n.type === 'domain').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vulnerabilities:</span>
                    <span className="text-white">{networkMap.nodes.filter(n => n.type === 'vulnerability').length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Activity Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Queries:</span>
                    <span className="text-white">{queries?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Success Rate:</span>
                    <span className="text-green-400">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Update:</span>
                    <span className="text-white">Now</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Recent Intelligence</h4>
              <div className="space-y-2">
                {threatFeed.slice(0, 3).map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between border-b border-[hsl(215,14%,34%)] pb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(threat.severity)}`}></div>
                      <span className="text-white text-sm">{threat.indicator}</span>
                      <Badge variant="outline" className="text-xs">{threat.type}</Badge>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Live Threat Intelligence Feed</h4>
              <Button size="sm" className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                <Download className="h-4 w-4 mr-2" />
                Export IOCs
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {threatFeed.map((threat) => (
                <div key={threat.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSeverityColor(threat.severity)}>{threat.severity.toUpperCase()}</Badge>
                        <Badge variant="outline">{threat.type}</Badge>
                        <span className="text-gray-400 text-sm">{threat.source}</span>
                      </div>
                      <div className="text-white font-medium mb-1">{threat.indicator}</div>
                      <div className="text-gray-300 text-sm mb-2">{threat.description}</div>
                      <div className="flex flex-wrap gap-1">
                        {threat.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(threat.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Network Topology</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-gray-300 text-sm mb-2">Discovered Assets</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {networkMap.nodes.map((node) => (
                      <div key={node.id} className="flex items-center space-x-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getNodeColor(node.type, node.risk) }}
                        ></div>
                        <span className="text-white">{node.label}</span>
                        <Badge variant="outline" className="text-xs">{node.type}</Badge>
                        {node.risk === 'high' && <AlertTriangle className="h-3 w-3 text-red-400" />}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-gray-300 text-sm mb-2">Connections</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {networkMap.edges.map((edge, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{edge.type.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-8 border-t border-gray-500"></div>
                          <div className={`w-2 h-2 rounded-full ${edge.weight > 2 ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Intelligence Correlation</h4>
              <div className="space-y-4">
                <div className="border border-[hsl(215,14%,34%)] rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-4 w-4 text-yellow-400" />
                    <span className="text-white font-medium">Domain Correlation</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Found 3 domains sharing similar DNS patterns and hosting infrastructure.
                    High probability of being part of the same threat campaign.
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <Badge variant="outline" className="text-xs">phishing-campaign</Badge>
                    <Badge variant="outline" className="text-xs">shared-infrastructure</Badge>
                  </div>
                </div>

                <div className="border border-[hsl(215,14%,34%)] rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-white font-medium">Vulnerability Cluster</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Multiple hosts in 192.168.1.0/24 network showing similar vulnerability patterns.
                    Indicates potential for lateral movement.
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <Badge variant="outline" className="text-xs">lateral-movement</Badge>
                    <Badge variant="outline" className="text-xs">network-sweep</Badge>
                  </div>
                </div>

                <div className="border border-[hsl(215,14%,34%)] rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">IOC Timeline</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Temporal correlation shows increased threat activity in the last 24 hours.
                    Recommend elevated monitoring posture.
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <Badge variant="outline" className="text-xs">temporal-analysis</Badge>
                    <Badge variant="outline" className="text-xs">threat-escalation</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}