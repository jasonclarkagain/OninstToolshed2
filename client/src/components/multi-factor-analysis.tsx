import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Network, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  Shield,
  Activity,
  Brain,
  Layers,
  GitMerge,
  BarChart3,
  Zap,
  Eye,
  Search,
  Clock
} from "lucide-react";

interface CorrelationResult {
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

interface PatternAnalysis {
  id: string;
  pattern: string;
  frequency: number;
  queries: number[];
  significance: number;
  category: 'domain' | 'ip' | 'vulnerability' | 'service' | 'behavior';
  description: string;
  recommendations: string[];
}

interface RiskVector {
  factor: string;
  weight: number;
  score: number;
  contributors: string[];
  mitigation: string[];
}

interface MultiFactorResult {
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

export default function MultiFactorAnalysis() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [timeRange, setTimeRange] = useState("24h");
  const [analysisResults, setAnalysisResults] = useState<MultiFactorResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [correlationFilters, setCorrelationFilters] = useState({
    minConfidence: 75,
    types: ['infrastructure', 'vulnerability', 'timing', 'geographic', 'behavioral']
  });

  const { toast } = useToast();

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  const multiFactorAnalysisMutation = useMutation({
    mutationFn: async (config: any) => {
      setIsAnalyzing(true);
      
      // Simulate multi-factor analysis processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: MultiFactorResult = {
        overallRiskScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
        riskVectors: [
          {
            factor: 'Infrastructure Exposure',
            weight: 0.3,
            score: 85,
            contributors: ['Open ports on critical services', 'Unpatched web servers', 'Exposed admin interfaces'],
            mitigation: ['Implement network segmentation', 'Update server software', 'Restrict admin access']
          },
          {
            factor: 'Vulnerability Density',
            weight: 0.25,
            score: 72,
            contributors: ['3 critical CVEs identified', 'Outdated SSL configurations', 'Missing security headers'],
            mitigation: ['Apply security patches', 'Update SSL/TLS configuration', 'Implement CSP headers']
          },
          {
            factor: 'Information Leakage',
            weight: 0.2,
            score: 68,
            contributors: ['Exposed development environments', 'Verbose error messages', 'Directory listings enabled'],
            mitigation: ['Secure staging environments', 'Implement custom error pages', 'Disable directory browsing']
          },
          {
            factor: 'Geographic Risk',
            weight: 0.15,
            score: 45,
            contributors: ['Services hosted in multiple regions', 'Inconsistent data protection laws'],
            mitigation: ['Implement geo-blocking', 'Review data sovereignty requirements']
          },
          {
            factor: 'Temporal Patterns',
            weight: 0.1,
            score: 62,
            contributors: ['Irregular maintenance windows', 'Predictable backup schedules'],
            mitigation: ['Randomize maintenance timing', 'Implement security monitoring']
          }
        ],
        correlations: [
          {
            id: 'corr-1',
            sourceQuery: 1,
            targetQuery: 3,
            correlationType: 'infrastructure',
            confidence: 92,
            description: 'Same hosting provider detected across multiple domains with similar vulnerability patterns',
            evidence: [
              'Identical server fingerprints',
              'Same SSL certificate issuer',
              'Consistent response headers',
              'Similar directory structures'
            ],
            impact: 'high',
            timestamp: new Date().toISOString()
          },
          {
            id: 'corr-2',
            sourceQuery: 2,
            targetQuery: 4,
            correlationType: 'vulnerability',
            confidence: 87,
            description: 'Cross-domain vulnerability correlation suggests systematic security gaps',
            evidence: [
              'Same Apache version across domains',
              'Identical PHP configuration',
              'Common vulnerable plugins',
              'Similar patch levels'
            ],
            impact: 'critical',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'corr-3',
            sourceQuery: 5,
            targetQuery: 6,
            correlationType: 'timing',
            confidence: 78,
            description: 'Synchronized maintenance windows create predictable attack windows',
            evidence: [
              'Consistent downtime patterns',
              'Scheduled update cycles',
              'Backup window overlaps'
            ],
            impact: 'medium',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 'corr-4',
            sourceQuery: 7,
            targetQuery: 8,
            correlationType: 'geographic',
            confidence: 83,
            description: 'Geographic clustering of services may indicate shared infrastructure risks',
            evidence: [
              'Same data center location',
              'Shared network ranges',
              'Common ISP provider'
            ],
            impact: 'medium',
            timestamp: new Date(Date.now() - 10800000).toISOString()
          }
        ],
        patterns: [
          {
            id: 'pattern-1',
            pattern: 'Subdomain enumeration reveals staging environments',
            frequency: 12,
            queries: [1, 3, 5, 7],
            significance: 0.85,
            category: 'domain',
            description: 'Development and staging subdomains consistently exposed across multiple domains',
            recommendations: [
              'Implement proper access controls for non-production environments',
              'Use internal DNS for development resources',
              'Apply authentication to staging environments'
            ]
          },
          {
            id: 'pattern-2',
            pattern: 'Consistent port 8080 exposure',
            frequency: 8,
            queries: [2, 4, 6],
            significance: 0.72,
            category: 'service',
            description: 'Management interfaces commonly exposed on port 8080 across infrastructure',
            recommendations: [
              'Restrict management interface access',
              'Implement VPN access for administrative services',
              'Change default ports for security services'
            ]
          },
          {
            id: 'pattern-3',
            pattern: 'SSL certificate expiration clustering',
            frequency: 6,
            queries: [1, 2, 3, 4, 5, 6],
            significance: 0.68,
            category: 'vulnerability',
            description: 'Multiple SSL certificates expiring within the same time window',
            recommendations: [
              'Implement automated certificate renewal',
              'Stagger certificate expiration dates',
              'Set up certificate monitoring alerts'
            ]
          }
        ],
        timeline: [
          {
            timestamp: new Date().toISOString(),
            event: 'Critical vulnerability pattern detected across 4 domains',
            severity: 'critical',
            queryIds: [1, 2, 3, 4]
          },
          {
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            event: 'Infrastructure correlation identified',
            severity: 'high',
            queryIds: [1, 3]
          },
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            event: 'Staging environment exposure pattern confirmed',
            severity: 'medium',
            queryIds: [1, 3, 5, 7]
          },
          {
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            event: 'Geographic risk clustering analysis completed',
            severity: 'low',
            queryIds: [7, 8]
          }
        ],
        recommendations: [
          {
            priority: 'immediate',
            action: 'Patch critical vulnerabilities identified in correlation analysis',
            rationale: 'Multiple systems share the same critical vulnerabilities, amplifying risk',
            effort: '2-4 hours'
          },
          {
            priority: 'high',
            action: 'Implement network segmentation between correlated systems',
            rationale: 'Shared infrastructure increases lateral movement risk',
            effort: '1-2 days'
          },
          {
            priority: 'high',
            action: 'Secure exposed staging and development environments',
            rationale: 'Pattern analysis shows consistent exposure of non-production systems',
            effort: '4-8 hours'
          },
          {
            priority: 'medium',
            action: 'Randomize maintenance windows across correlated systems',
            rationale: 'Synchronized downtime creates predictable attack windows',
            effort: '2-3 hours'
          },
          {
            priority: 'low',
            action: 'Review geographic distribution of critical services',
            rationale: 'Geographic clustering may create availability risks',
            effort: '1-2 hours'
          }
        ]
      };
      
      return mockAnalysis;
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      setIsAnalyzing(false);
      toast({
        title: "Multi-Factor Analysis Complete",
        description: `Analysis identified ${data.correlations.length} correlations and ${data.patterns.length} patterns`,
      });
    },
    onError: () => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Multi-factor analysis could not be completed",
        variant: "destructive",
      });
    },
  });

  const runAnalysis = () => {
    multiFactorAnalysisMutation.mutate({
      type: analysisType,
      timeRange,
      filters: correlationFilters
    });
  };

  const getCorrelationIcon = (type: string) => {
    switch (type) {
      case 'infrastructure': return <Network className="h-4 w-4" />;
      case 'vulnerability': return <Shield className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'geographic': return <Target className="h-4 w-4" />;
      case 'behavioral': return <Activity className="h-4 w-4" />;
      default: return <GitMerge className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Layers className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Multi-Factor Analysis & Correlation
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-blue-600 text-white">
            <Brain className="h-3 w-3 mr-1" />
            Advanced Analytics
          </Badge>
          <Badge className="bg-purple-600 text-white">
            {queries?.length || 0} Data Points
          </Badge>
          {analysisResults && (
            <Badge className="bg-orange-600 text-white">
              Risk Score: {analysisResults.overallRiskScore}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="analysis" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="correlations" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <GitMerge className="h-4 w-4 mr-2" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Target className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Analysis Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Analysis Type</label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="correlation">Correlation Focus</SelectItem>
                      <SelectItem value="pattern">Pattern Detection</SelectItem>
                      <SelectItem value="risk">Risk Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Min Confidence</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={correlationFilters.minConfidence}
                    onChange={(e) => setCorrelationFilters(prev => ({
                      ...prev,
                      minConfidence: parseInt(e.target.value) || 75
                    }))}
                    className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
              </div>

              <Button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Multi-Factor Analysis
                  </>
                )}
              </Button>
            </div>

            {analysisResults && (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-4">Risk Assessment Overview</h4>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white">Overall Risk Score</span>
                      <span className="text-white font-bold">{analysisResults.overallRiskScore}/100</span>
                    </div>
                    <Progress 
                      value={analysisResults.overallRiskScore} 
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-3">
                    {analysisResults.riskVectors.map((vector, idx) => (
                      <div key={idx} className="border border-[hsl(215,14%,34%)] rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{vector.factor}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-300 text-sm">Weight: {(vector.weight * 100).toFixed(0)}%</span>
                            <span className="text-white font-bold">{vector.score}</span>
                          </div>
                        </div>
                        <Progress value={vector.score} className="h-2 mb-2" />
                        <div className="text-xs text-gray-400">
                          Contributors: {vector.contributors.slice(0, 2).join(', ')}
                          {vector.contributors.length > 2 && ` +${vector.contributors.length - 2} more`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{analysisResults.correlations.length}</div>
                    <div className="text-sm text-gray-400">Correlations Found</div>
                  </div>
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{analysisResults.patterns.length}</div>
                    <div className="text-sm text-gray-400">Patterns Detected</div>
                  </div>
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {analysisResults.recommendations.filter(r => r.priority === 'immediate' || r.priority === 'high').length}
                    </div>
                    <div className="text-sm text-gray-400">Priority Actions</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="correlations" className="space-y-4">
            {analysisResults ? (
              <div className="space-y-4">
                {analysisResults.correlations.map((correlation) => (
                  <div key={correlation.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCorrelationIcon(correlation.correlationType)}
                        <h5 className="text-white font-medium">{correlation.description}</h5>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          correlation.impact === 'critical' ? 'bg-red-600' :
                          correlation.impact === 'high' ? 'bg-orange-600' :
                          correlation.impact === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                        }>
                          {correlation.impact.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {correlation.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-300 text-sm">Type: </span>
                        <span className="text-white text-sm capitalize">{correlation.correlationType}</span>
                      </div>
                      <div>
                        <span className="text-gray-300 text-sm">Queries: </span>
                        <span className="text-white text-sm">#{correlation.sourceQuery} ↔ #{correlation.targetQuery}</span>
                      </div>
                      <div>
                        <span className="text-gray-300 text-sm">Evidence:</span>
                        <ul className="text-gray-300 text-xs mt-1 space-y-1 ml-4">
                          {correlation.evidence.map((evidence, idx) => (
                            <li key={idx}>• {evidence}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(correlation.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <GitMerge className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No correlation analysis available</p>
                <p className="text-gray-400 text-sm">Run multi-factor analysis to detect correlations</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            {analysisResults ? (
              <div className="space-y-4">
                {analysisResults.patterns.map((pattern) => (
                  <div key={pattern.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-white font-medium">{pattern.pattern}</h5>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-600">
                          {pattern.category}
                        </Badge>
                        <Badge variant="outline">
                          {(pattern.significance * 100).toFixed(0)}% significance
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{pattern.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Frequency:</span>
                        <span className="text-white">{pattern.frequency} occurrences</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Affected Queries:</span>
                        <span className="text-white">{pattern.queries.length} queries</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-300 text-sm">Recommendations:</span>
                        <ul className="text-gray-300 text-xs mt-1 space-y-1 ml-4">
                          {pattern.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No pattern analysis available</p>
                <p className="text-gray-400 text-sm">Run multi-factor analysis to detect patterns</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {analysisResults ? (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Analysis Timeline</h4>
                <div className="space-y-3">
                  {analysisResults.timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start space-x-3 border-l-2 border-[hsl(215,14%,34%)] pl-4">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)} bg-current`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-white text-sm">{event.event}</p>
                          <span className={`text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-400 text-xs">
                            Queries: {event.queryIds.join(', ')}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No timeline data available</p>
                <p className="text-gray-400 text-sm">Run multi-factor analysis to generate timeline</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysisResults ? (
              <div className="space-y-4">
                {analysisResults.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-white font-medium">{rec.action}</h5>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {rec.effort}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">{rec.rationale}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Estimated effort: {rec.effort}</span>
                      <Button size="sm" className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                        <Target className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No recommendations available</p>
                <p className="text-gray-400 text-sm">Run multi-factor analysis to get recommendations</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}