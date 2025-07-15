import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Activity,
  Radio,
  Eye,
  Globe,
  Clock,
  Bell,
  Filter,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface ThreatFeed {
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

interface IntelligenceAlert {
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

interface BehavioralPattern {
  id: string;
  pattern: string;
  frequency: number;
  timeframe: string;
  anomalyScore: number;
  description: string;
  indicators: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function RealTimeIntelligenceFeed() {
  const [activeTab, setActiveTab] = useState("feeds");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [isLiveUpdates, setIsLiveUpdates] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for intelligence data
  const { data: intelligenceData, isLoading } = useQuery({
    queryKey: ["/api/intelligence/feeds"],
    refetchInterval: isLiveUpdates ? 30000 : false, // Refresh every 30 seconds if live updates enabled
  });

  const refreshIntelligence = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/intelligence/refresh', {
        method: 'POST'
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intelligence/feeds"] });
      toast({
        title: "Intelligence Refreshed",
        description: "Latest threat intelligence data has been loaded",
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh intelligence feeds",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'virustotal': return Globe;
      case 'alienvault': return Shield;
      case 'misp': return Activity;
      default: return Radio;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'new_threat': return AlertTriangle;
      case 'infrastructure_change': return Activity;
      case 'vulnerability_discovered': return Shield;
      case 'attack_detected': return Zap;
      default: return Bell;
    }
  };

  const filteredFeeds = intelligenceData?.feeds?.filter((feed: ThreatFeed) => 
    filterSeverity === "all" || feed.severity === filterSeverity
  ) || [];

  const mockFeeds: ThreatFeed[] = [
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

  const mockAlerts: IntelligenceAlert[] = [
    {
      id: 'alert-1',
      title: 'Critical Threat Indicator Detected',
      description: 'Multiple queries match critical threat indicators from recent botnet activity',
      severity: 'critical',
      category: 'new_threat',
      timestamp: new Date().toISOString(),
      affectedAssets: ['185.220.101.32', 'example.com'],
      recommendations: [
        'Block all traffic to/from identified indicators',
        'Activate incident response procedures',
        'Implement enhanced monitoring'
      ],
      relatedFeeds: ['feed-1']
    },
    {
      id: 'alert-2',
      title: 'Unusual Infrastructure Reconnaissance',
      description: '15 domain enumeration queries detected in 24 hours',
      severity: 'warning',
      category: 'infrastructure_change',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      affectedAssets: ['*.example.com', '*.test.org'],
      recommendations: [
        'Review reconnaissance patterns for potential threats',
        'Implement additional monitoring on targeted domains',
        'Consider rate limiting and alerting mechanisms'
      ],
      relatedFeeds: []
    }
  ];

  const mockPatterns: BehavioralPattern[] = [
    {
      id: 'pattern-1',
      pattern: 'High-frequency reconnaissance bursts',
      frequency: 3,
      timeframe: '1 hour windows',
      anomalyScore: 0.85,
      description: 'Detected 3 periods of unusually high scanning activity',
      indicators: ['rapid_succession_scans', 'burst_pattern', 'potential_automation'],
      riskLevel: 'high'
    },
    {
      id: 'pattern-2',
      pattern: 'Vulnerability-focused scanning',
      frequency: 12,
      timeframe: 'Overall activity',
      anomalyScore: 0.72,
      description: '75% of activity focused on vulnerability scanning',
      indicators: ['vuln_hunting', 'exploit_research', 'weakness_identification'],
      riskLevel: 'medium'
    }
  ];

  const displayFeeds = filteredFeeds.length > 0 ? filteredFeeds : mockFeeds;
  const displayAlerts = intelligenceData?.alerts || mockAlerts;
  const displayPatterns = intelligenceData?.patterns || mockPatterns;

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Radio className="h-5 w-5 mr-2 text-green-400" />
          Real-Time Intelligence Feed
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600 text-white">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Badge variant="outline" className="text-white">
              {displayFeeds.length} Indicators
            </Badge>
            <Badge variant="outline" className="text-white">
              {displayAlerts.length} Alerts
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLiveUpdates(!isLiveUpdates)}
              className="text-white border-[hsl(215,14%,34%)]"
            >
              {isLiveUpdates ? (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Live
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Paused
                </>
              )}
            </Button>
            <Button
              onClick={() => refreshIntelligence.mutate()}
              disabled={refreshIntelligence.isPending}
              size="sm"
              className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
            >
              {refreshIntelligence.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="feeds" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Globe className="h-4 w-4 mr-2" />
              Threat Feeds
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feeds" className="space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filter by severity:</span>
                <div className="flex space-x-1">
                  {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
                    <Button
                      key={severity}
                      variant={filterSeverity === severity ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterSeverity(severity)}
                      className={`text-xs ${filterSeverity === severity 
                        ? 'bg-[hsl(207,90%,54%)]' 
                        : 'text-white border-[hsl(215,14%,34%)]'
                      }`}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {displayFeeds.map((feed) => {
                  const SourceIcon = getSourceIcon(feed.source);
                  return (
                    <div key={feed.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <SourceIcon className="h-4 w-4 text-blue-400" />
                          <span className="text-white text-sm font-medium">{feed.source.toUpperCase()}</span>
                          <Badge className={getSeverityColor(feed.severity)} variant="secondary">
                            {feed.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(feed.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-xs">Indicator:</span>
                          <code className="text-blue-300 text-sm bg-[hsl(217,32%,17%)] px-2 py-1 rounded">
                            {feed.indicator}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {feed.type.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-300 text-sm">{feed.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs">Confidence:</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-16 h-2 bg-[hsl(217,32%,17%)] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ width: `${feed.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-white">{(feed.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          
                          {feed.references.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 p-1"
                              onClick={() => window.open(feed.references[0], '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {feed.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {displayAlerts.map((alert) => {
                  const CategoryIcon = getCategoryIcon(alert.category);
                  return (
                    <div key={alert.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="h-4 w-4 text-orange-400" />
                          <h4 className="text-white font-medium">{alert.title}</h4>
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{alert.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Affected Assets:</span>
                          <div className="flex flex-wrap gap-1">
                            {alert.affectedAssets.map((asset, index) => (
                              <code key={index} className="text-blue-300 text-xs bg-[hsl(217,32%,17%)] px-2 py-1 rounded">
                                {asset}
                              </code>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Recommendations:</span>
                          <ul className="space-y-1">
                            {alert.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="text-xs text-gray-300 flex items-center">
                                <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-[hsl(215,14%,34%)] flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {alert.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {displayPatterns.map((pattern) => (
                  <div key={pattern.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-medium">{pattern.pattern}</h4>
                      <Badge className={getSeverityColor(pattern.riskLevel)}>
                        {pattern.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{pattern.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-gray-400">Frequency</span>
                        <div className="text-lg font-bold text-orange-400">{pattern.frequency}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Timeframe</span>
                        <div className="text-sm text-white">{pattern.timeframe}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Anomaly Score</span>
                        <div className="text-lg font-bold text-red-400">
                          {(pattern.anomalyScore * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Indicators:</span>
                      <div className="flex flex-wrap gap-1">
                        {pattern.indicators.map((indicator, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {indicator.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}