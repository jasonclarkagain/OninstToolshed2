import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brain, Shield, AlertTriangle, Clock, Target, FileText, TrendingUp } from "lucide-react";

export default function IntelligenceDashboard() {
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading } = useQuery({
    queryKey: ["/api/intelligence/analyze"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/intelligence/generate-report", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Intelligence Report Generated",
        description: "Comprehensive analysis has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/intelligence/analyze"] });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-600";
      case "high": return "bg-orange-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing intelligence data...</p>
        </div>
      </div>
    );
  }

  if (!report?.result) {
    return (
      <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
        <CardContent className="p-6">
          <div className="text-center">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Intelligence Data</h3>
            <p className="text-gray-400 mb-4">Run some OSINT tools to generate intelligence insights</p>
            <Button onClick={() => generateReportMutation.mutate()} className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const intelligence = report.result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Intelligence Dashboard</h1>
          <p className="text-gray-400">Automated analysis and documentation of gathered intelligence</p>
        </div>
        <Button
          onClick={() => generateReportMutation.mutate()}
          disabled={generateReportMutation.isPending}
          className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
        >
          {generateReportMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Refresh Analysis
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Risk Level</p>
                <p className={`text-lg font-bold ${getRiskColor(intelligence.riskAssessment.overallRisk)}`}>
                  {intelligence.riskAssessment.overallRisk.toUpperCase()}
                </p>
              </div>
              <Shield className="h-8 w-8 text-[hsl(207,90%,54%)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Insights</p>
                <p className="text-lg font-bold text-white">{intelligence.insights.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[hsl(207,90%,54%)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Critical Findings</p>
                <p className="text-lg font-bold text-red-400">
                  {intelligence.insights.filter((i: any) => i.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Related Entities</p>
                <p className="text-lg font-bold text-white">{intelligence.relatedEntities.length}</p>
              </div>
              <Target className="h-8 w-8 text-[hsl(207,90%,54%)]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Profile */}
      <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Target Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Primary Target</p>
              <p className="text-white font-mono">{intelligence.targetProfile.primaryTarget}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Type</p>
              <Badge className="bg-[hsl(207,90%,54%)]">{intelligence.targetProfile.type}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Aliases ({intelligence.targetProfile.aliases.length})</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {intelligence.targetProfile.aliases.slice(0, 5).map((alias: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {alias}
                  </Badge>
                ))}
                {intelligence.targetProfile.aliases.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{intelligence.targetProfile.aliases.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Activity</p>
              <p className="text-white text-sm">{new Date(intelligence.targetProfile.lastSeen).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
          <TabsTrigger value="insights" className="data-[state=active]:bg-[hsl(207,90%,54%)]">
            Insights
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-[hsl(207,90%,54%)]">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="entities" className="data-[state=active]:bg-[hsl(207,90%,54%)]">
            Related Entities
          </TabsTrigger>
          <TabsTrigger value="mitigations" className="data-[state=active]:bg-[hsl(207,90%,54%)]">
            Mitigations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {intelligence.insights.map((insight: any, index: number) => (
              <Card key={index} className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{insight.category}</CardTitle>
                    <Badge className={getSeverityColor(insight.severity)}>
                      {insight.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-3">{insight.finding}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Evidence:</p>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {insight.evidence.map((evidence: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Recommendations:</p>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-400">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </p>
                      <Progress value={insight.confidence * 100} className="w-16 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {intelligence.timeline.map((event: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                      <div className="w-2 h-2 bg-[hsl(207,90%,54%)] rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{event.event}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(event.timestamp).toLocaleString()} • {event.source}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${event.importance > 0.7 ? 'bg-red-400' : event.importance > 0.5 ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
            <CardHeader>
              <CardTitle className="text-white">Related Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligence.relatedEntities.map((entity: any, index: number) => (
                  <div key={index} className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-mono text-sm">{entity.entity}</p>
                      <Progress value={entity.confidence * 100} className="w-16 h-2" />
                    </div>
                    <p className="text-xs text-gray-400">{entity.relationship}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mitigations" className="space-y-4">
          <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Risk Mitigation Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Priority Actions</h4>
                  <ul className="space-y-2">
                    {intelligence.riskAssessment.mitigations.slice(0, 5).map((mitigation: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-red-400 mt-1">•</span>
                        <span className="text-gray-300">{mitigation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Risk Factors</h4>
                  <ul className="space-y-2">
                    {intelligence.riskAssessment.factors.map((factor: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span className="text-gray-300">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}