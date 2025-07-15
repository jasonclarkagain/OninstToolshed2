import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  Network, 
  TrendingUp, 
  Map, 
  Activity, 
  Layers,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  AlertTriangle,
  Target
} from "lucide-react";

interface NetworkNode {
  id: string;
  label: string;
  type: string;
  risk: number;
  x?: number;
  y?: number;
  connections: string[];
}

interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

interface VisualizationData {
  networkTopology: {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
  };
  riskHeatmap: {
    regions: Array<{
      id: string;
      name: string;
      riskLevel: number;
      threatCount: number;
      coordinates: [number, number];
    }>;
  };
  timelineData: Array<{
    timestamp: string;
    events: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  }>;
  attackPaths: Array<{
    id: string;
    path: string[];
    probability: number;
    impact: string;
    steps: Array<{
      node: string;
      action: string;
      difficulty: number;
    }>;
  }>;
}

export default function AdvancedVisualization() {
  const [activeTab, setActiveTab] = useState("network");
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  // Generate visualization data based on queries
  useEffect(() => {
    if (queries && queries.length > 0) {
      generateVisualizationData(queries);
    }
  }, [queries]);

  const generateVisualizationData = (queryData: any[]) => {
    // Generate network topology
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    
    queryData.forEach((query, index) => {
      const node: NetworkNode = {
        id: `node-${query.id}`,
        label: query.query || `Query ${query.id}`,
        type: query.toolType,
        risk: calculateRiskScore(query),
        x: Math.random() * 800 + 100,
        y: Math.random() * 600 + 100,
        connections: []
      };
      nodes.push(node);

      // Create edges based on query relationships
      if (index > 0) {
        const prevNode = nodes[index - 1];
        if (areRelated(query, queryData[index - 1])) {
          edges.push({
            source: prevNode.id,
            target: node.id,
            weight: 0.7,
            type: 'temporal'
          });
          node.connections.push(prevNode.id);
          prevNode.connections.push(node.id);
        }
      }
    });

    // Generate risk heatmap data
    const riskRegions = [
      { id: 'us-east', name: 'US East', riskLevel: 0.3, threatCount: 12, coordinates: [-74, 40.7] as [number, number] },
      { id: 'eu-west', name: 'EU West', riskLevel: 0.6, threatCount: 8, coordinates: [2.3, 48.9] as [number, number] },
      { id: 'asia-pac', name: 'Asia Pacific', riskLevel: 0.8, threatCount: 24, coordinates: [139.7, 35.7] as [number, number] },
      { id: 'russia', name: 'Russia', riskLevel: 0.9, threatCount: 18, coordinates: [37.6, 55.8] as [number, number] }
    ];

    // Generate timeline data
    const timelineData = generateTimelineData(queryData);

    // Generate attack paths
    const attackPaths = generateAttackPaths(nodes, edges);

    setVisualizationData({
      networkTopology: { nodes, edges },
      riskHeatmap: { regions: riskRegions },
      timelineData,
      attackPaths
    });
  };

  const calculateRiskScore = (query: any): number => {
    let risk = 0.2; // Base risk
    
    const result = query.result || {};
    if (result.vulnerabilities?.length > 0) risk += 0.4;
    if (result.openPorts?.length > 10) risk += 0.3;
    if (result.exposedServices?.length > 0) risk += 0.2;
    
    return Math.min(risk, 1.0);
  };

  const areRelated = (query1: any, query2: any): boolean => {
    // Simple relationship logic - same target or similar tool types
    return query1.query === query2.query || 
           query1.toolType === query2.toolType ||
           (query1.query && query2.query && 
            query1.query.includes(query2.query.split('.').slice(-2).join('.')));
  };

  const generateTimelineData = (queryData: any[]) => {
    const timeline = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayQueries = queryData.filter(q => 
        q.createdAt && new Date(q.createdAt).toDateString() === date.toDateString()
      );
      
      const events = dayQueries.map(q => ({
        type: q.toolType,
        severity: calculateSeverity(q),
        description: `${q.toolType.replace('_', ' ')} on ${q.query}`
      }));
      
      timeline.push({
        timestamp: date.toISOString(),
        events
      });
    }
    
    return timeline.reverse();
  };

  const calculateSeverity = (query: any): string => {
    const result = query.result || {};
    if (result.vulnerabilities?.some((v: any) => v.severity === 'critical')) return 'critical';
    if (result.vulnerabilities?.some((v: any) => v.severity === 'high')) return 'high';
    if (result.vulnerabilities?.length > 0) return 'medium';
    return 'low';
  };

  const generateAttackPaths = (nodes: NetworkNode[], edges: NetworkEdge[]) => {
    const paths = [];
    
    // Generate sample attack paths based on network topology
    const highRiskNodes = nodes.filter(n => n.risk > 0.6);
    
    for (let i = 0; i < Math.min(3, highRiskNodes.length); i++) {
      const startNode = highRiskNodes[i];
      const connectedNodes = edges
        .filter(e => e.source === startNode.id || e.target === startNode.id)
        .map(e => e.source === startNode.id ? e.target : e.source);
      
      if (connectedNodes.length > 0) {
        const path = [startNode.id, ...connectedNodes.slice(0, 2)];
        paths.push({
          id: `path-${i}`,
          path,
          probability: 0.3 + (startNode.risk * 0.5),
          impact: startNode.risk > 0.8 ? 'critical' : 'high',
          steps: path.map((nodeId, stepIndex) => ({
            node: nodeId,
            action: stepIndex === 0 ? 'Initial Access' : stepIndex === 1 ? 'Lateral Movement' : 'Privilege Escalation',
            difficulty: Math.random() * 5 + 1
          }))
        });
      }
    }
    
    return paths;
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.8) return 'bg-red-600';
    if (risk >= 0.6) return 'bg-orange-600';
    if (risk >= 0.4) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Layers className="h-5 w-5 mr-2 text-purple-400" />
          Advanced Visualization
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-600 text-white">
            <Eye className="h-3 w-3 mr-1" />
            3D Analytics
          </Badge>
          <Badge className="bg-blue-600 text-white">
            Real-time
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="network" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Network className="h-4 w-4 mr-2" />
              Network
            </TabsTrigger>
            <TabsTrigger value="risk-map" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Map className="h-4 w-4 mr-2" />
              Risk Map
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <LineChart className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="attack-paths" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Target className="h-4 w-4 mr-2" />
              Attack Paths
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network" className="space-y-4">
            {visualizationData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 min-h-[400px] relative">
                  <h4 className="text-white font-medium mb-4">Network Topology</h4>
                  
                  {/* SVG Network Visualization */}
                  <svg width="100%" height="350" className="border border-[hsl(215,14%,34%)] rounded">
                    {/* Render edges */}
                    {visualizationData.networkTopology.edges.map((edge, index) => {
                      const sourceNode = visualizationData.networkTopology.nodes.find(n => n.id === edge.source);
                      const targetNode = visualizationData.networkTopology.nodes.find(n => n.id === edge.target);
                      
                      if (!sourceNode || !targetNode) return null;
                      
                      return (
                        <line
                          key={index}
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="#60a5fa"
                          strokeWidth={edge.weight * 3}
                          opacity={0.6}
                        />
                      );
                    })}
                    
                    {/* Render nodes */}
                    {visualizationData.networkTopology.nodes.map((node) => (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={8 + node.risk * 12}
                          fill={node.risk > 0.7 ? '#dc2626' : node.risk > 0.4 ? '#ea580c' : '#16a34a'}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedNode(node)}
                        />
                        <text
                          x={node.x}
                          y={node.y + 25}
                          fill="#ffffff"
                          fontSize="10"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          {node.label.substring(0, 10)}...
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Node Details */}
                {selectedNode && (
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Node Details</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Label:</span>
                        <p className="text-white">{selectedNode.label}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Type:</span>
                        <p className="text-white">{selectedNode.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Risk Score:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={selectedNode.risk * 100} className="flex-1 h-2" />
                          <span className="text-white text-sm">{(selectedNode.risk * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Connections:</span>
                        <p className="text-white">{selectedNode.connections.length}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white">No network data available</p>
                <p className="text-gray-400 text-sm">Run some OSINT queries to generate network topology</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risk-map" className="space-y-4">
            {visualizationData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Global Risk Heatmap</h4>
                  
                  {/* Simplified world map with risk indicators */}
                  <div className="relative bg-[hsl(217,32%,17%)] rounded-lg h-64 overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 800 400">
                      {/* World map background */}
                      <rect width="800" height="400" fill="#1e293b" />
                      
                      {/* Risk regions */}
                      {visualizationData.riskHeatmap.regions.map((region, index) => (
                        <g key={region.id}>
                          <circle
                            cx={400 + region.coordinates[0]}
                            cy={200 + region.coordinates[1] * 2}
                            r={20 + region.riskLevel * 30}
                            fill={region.riskLevel > 0.7 ? '#dc2626' : region.riskLevel > 0.4 ? '#ea580c' : '#16a34a'}
                            opacity={0.7}
                            className="animate-pulse"
                          />
                          <text
                            x={400 + region.coordinates[0]}
                            y={200 + region.coordinates[1] * 2 + 50}
                            fill="#ffffff"
                            fontSize="12"
                            textAnchor="middle"
                          >
                            {region.name}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visualizationData.riskHeatmap.regions.map((region) => (
                    <div key={region.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-medium">{region.name}</h5>
                        <Badge className={getRiskColor(region.riskLevel)}>
                          {(region.riskLevel * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Threat Count:</span>
                          <span className="text-white text-sm">{region.threatCount}</span>
                        </div>
                        <Progress value={region.riskLevel * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white">No risk map data available</p>
                <p className="text-gray-400 text-sm">Geographic risk analysis will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {visualizationData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Security Timeline</h4>
                  
                  <div className="space-y-4">
                    {visualizationData.timelineData.map((day, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-white font-medium">
                            {new Date(day.timestamp).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {day.events.length} events
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {day.events.slice(0, 3).map((event, eventIndex) => (
                            <div key={eventIndex} className="flex items-center space-x-2 text-sm">
                              <div className={`w-2 h-2 rounded-full ${getRiskColor(0.5)}`}></div>
                              <span className={getSeverityColor(event.severity)}>
                                {event.severity.toUpperCase()}
                              </span>
                              <span className="text-gray-300">{event.description}</span>
                            </div>
                          ))}
                          
                          {day.events.length > 3 && (
                            <div className="text-xs text-gray-400 ml-4">
                              +{day.events.length - 3} more events
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white">No timeline data available</p>
                <p className="text-gray-400 text-sm">Security events timeline will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attack-paths" className="space-y-4">
            {visualizationData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Potential Attack Paths</h4>
                  
                  <div className="space-y-4">
                    {visualizationData.attackPaths.map((path) => (
                      <div key={path.id} className="border border-[hsl(215,14%,34%)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-white font-medium">Attack Path {path.id.split('-')[1]}</h5>
                          <div className="flex items-center space-x-2">
                            <Badge className={path.impact === 'critical' ? 'bg-red-600' : 'bg-orange-600'}>
                              {path.impact}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {(path.probability * 100).toFixed(0)}% probability
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {path.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                {stepIndex + 1}
                              </div>
                              <div className="flex-1">
                                <span className="text-white text-sm">{step.action}</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-400">Difficulty:</span>
                                  <Progress value={step.difficulty * 20} className="w-20 h-1" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white">No attack path data available</p>
                <p className="text-gray-400 text-sm">Attack path analysis will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}