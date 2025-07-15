import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Network,
  Eye,
  Zap,
  Brain,
  GitMerge,
  Clock,
  Users,
  Activity
} from "lucide-react";

interface ThreatIntelData {
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
  recommendations: {
    immediate: string[];
    strategic: string[];
    preventive: string[];
  };
}

export default function ThreatIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [threatData, setThreatData] = useState<ThreatIntelData | null>(null);
  const { toast } = useToast();

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  const generateThreatIntel = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/threat-intelligence/analyze', {
        method: 'POST',
        body: JSON.stringify({ comprehensive: true })
      });
      return response;
    },
    onSuccess: (data) => {
      setThreatData(data);
      toast({
        title: "Threat Intelligence Generated",
        description: `Analysis complete with ${data.indicators.iocs.length} IOCs detected`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Threat intelligence analysis could not be completed",
        variant: "destructive",
      });
    },
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-red-400";
    if (confidence >= 0.6) return "text-orange-400";
    if (confidence >= 0.4) return "text-yellow-400";
    return "text-green-400";
  };

  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 0.7) return "bg-red-600";
    if (likelihood >= 0.5) return "bg-orange-600";
    if (likelihood >= 0.3) return "bg-yellow-600";
    return "bg-green-600";
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Shield className="h-5 w-5 mr-2 text-red-400" />
          Threat Intelligence Dashboard
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge className="bg-red-600 text-white">
              <Eye className="h-3 w-3 mr-1" />
              Advanced CTI
            </Badge>
            <Badge className="bg-purple-600 text-white">
              {queries?.length || 0} Data Sources
            </Badge>
          </div>
          <Button
            onClick={() => generateThreatIntel.mutate()}
            disabled={generateThreatIntel.isPending}
            className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
          >
            {generateThreatIntel.isPending ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Intelligence
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="indicators" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Target className="h-4 w-4 mr-2" />
              Indicators
            </TabsTrigger>
            <TabsTrigger value="attribution" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Users className="h-4 w-4 mr-2" />
              Attribution
            </TabsTrigger>
            <TabsTrigger value="prediction" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Clock className="h-4 w-4 mr-2" />
              Prediction
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Zap className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {threatData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{threatData.indicators.iocs.length}</div>
                    <div className="text-sm text-gray-400">IOCs Detected</div>
                  </div>
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{threatData.indicators.ttps.length}</div>
                    <div className="text-sm text-gray-400">TTPs Identified</div>
                  </div>
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{threatData.attribution.groups.length}</div>
                    <div className="text-sm text-gray-400">Threat Groups</div>
                  </div>
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{threatData.prediction.nextTargets.length}</div>
                    <div className="text-sm text-gray-400">Predicted Targets</div>
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Threat Assessment</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white">Attribution Confidence</span>
                        <span className={`font-bold ${getConfidenceColor(threatData.attribution.confidence)}`}>
                          {(threatData.attribution.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={threatData.attribution.confidence * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white">Attack Likelihood</span>
                        <span className={`font-bold ${getConfidenceColor(threatData.prediction.likelihood)}`}>
                          {(threatData.prediction.likelihood * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={threatData.prediction.likelihood * 100} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Campaign Activity</h4>
                  <div className="space-y-2">
                    {threatData.indicators.campaigns.map((campaign, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[hsl(217,32%,17%)] rounded">
                        <span className="text-white">{campaign}</span>
                        <Badge className="bg-red-600">Active</Badge>
                      </div>
                    ))}
                    {threatData.indicators.campaigns.length === 0 && (
                      <p className="text-gray-400 text-sm">No active campaigns detected</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No threat intelligence data available</p>
                <p className="text-gray-400 text-sm">Generate intelligence analysis to view insights</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="indicators" className="space-y-4">
            {threatData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Indicators of Compromise (IOCs)</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {threatData.indicators.iocs.map((ioc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[hsl(217,32%,17%)] rounded">
                        <span className="text-white font-mono text-sm">{ioc}</span>
                        <Badge variant="outline" className="text-xs">
                          {ioc.split(':')[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Tactics, Techniques & Procedures (TTPs)</h4>
                  <div className="space-y-2">
                    {threatData.indicators.ttps.map((ttp, idx) => (
                      <div key={idx} className="p-3 bg-[hsl(217,32%,17%)] rounded">
                        <span className="text-white text-sm">{ttp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No indicators available</p>
                <p className="text-gray-400 text-sm">Generate threat intelligence to view IOCs and TTPs</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attribution" className="space-y-4">
            {threatData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Threat Actor Attribution</h4>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white">Confidence Level</span>
                      <span className={`font-bold ${getConfidenceColor(threatData.attribution.confidence)}`}>
                        {(threatData.attribution.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={threatData.attribution.confidence * 100} className="h-3" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-white font-medium mb-2">Suspected Groups</h5>
                      <div className="flex flex-wrap gap-2">
                        {threatData.attribution.groups.map((group, idx) => (
                          <Badge key={idx} className="bg-red-600 text-white">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-white font-medium mb-2">Evidence</h5>
                      <div className="space-y-2">
                        {threatData.attribution.evidence.map((evidence, idx) => (
                          <div key={idx} className="p-2 bg-[hsl(217,32%,17%)] rounded">
                            <span className="text-gray-300 text-sm">• {evidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No attribution data available</p>
                <p className="text-gray-400 text-sm">Generate threat intelligence to analyze threat actors</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4">
            {threatData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Predictive Analysis</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-400">
                        {threatData.prediction.timeframe}
                      </div>
                      <div className="text-xs text-gray-400">Predicted Timeframe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-400">
                        {(threatData.prediction.likelihood * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">Attack Likelihood</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-2">Predicted Next Targets</h5>
                    <div className="space-y-2">
                      {threatData.prediction.nextTargets.map((target, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-[hsl(217,32%,17%)] rounded">
                          <span className="text-white text-sm">{target}</span>
                          <Badge className={getLikelihoodColor(threatData.prediction.likelihood)}>
                            High Risk
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No prediction data available</p>
                <p className="text-gray-400 text-sm">Generate threat intelligence for predictive analysis</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {threatData ? (
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Immediate Actions</h4>
                  <div className="space-y-2">
                    {threatData.recommendations.immediate.map((action, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-900/20 border border-red-600/30 rounded">
                        <span className="text-white text-sm">{action}</span>
                        <Badge className="bg-red-600">Critical</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Strategic Recommendations</h4>
                  <div className="space-y-2">
                    {threatData.recommendations.strategic.map((action, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-orange-900/20 border border-orange-600/30 rounded">
                        <span className="text-white text-sm">{action}</span>
                        <Badge className="bg-orange-600">High</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Preventive Measures</h4>
                  <div className="space-y-2">
                    {threatData.recommendations.preventive.map((action, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-600/30 rounded">
                        <span className="text-white text-sm">{action}</span>
                        <Badge className="bg-blue-600">Medium</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white">No action recommendations available</p>
                <p className="text-gray-400 text-sm">Generate threat intelligence to get actionable recommendations</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}