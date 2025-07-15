import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Network, Shield, Clock, Target, Activity, Play, CheckCircle } from "lucide-react";

export default function CorrelationTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  // Test different correlation scenarios
  const testScenarios = [
    {
      id: 'infrastructure',
      name: 'Infrastructure Correlation Test',
      description: 'Test correlation detection across shared hosting and SSL certificates',
      icon: Network,
      color: 'bg-blue-600'
    },
    {
      id: 'vulnerability',
      name: 'Vulnerability Pattern Test',
      description: 'Test detection of shared vulnerability patterns across targets',
      icon: Shield,
      color: 'bg-red-600'
    },
    {
      id: 'timing',
      name: 'Timing Correlation Test',
      description: 'Test detection of synchronized maintenance windows and patterns',
      icon: Clock,
      color: 'bg-yellow-600'
    },
    {
      id: 'geographic',
      name: 'Geographic Clustering Test',
      description: 'Test detection of geographic clustering and regional risks',
      icon: Target,
      color: 'bg-green-600'
    },
    {
      id: 'behavioral',
      name: 'Behavioral Pattern Test',
      description: 'Test detection of behavioral patterns in service configurations',
      icon: Activity,
      color: 'bg-purple-600'
    }
  ];

  const runCorrelationTest = useMutation({
    mutationFn: async (scenarioId: string) => {
      // Generate test data for the specific scenario
      const testData = await apiRequest(`/api/multi-factor/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          analysisType: 'correlation',
          timeRange: '24h',
          minConfidence: 70,
          testScenario: scenarioId
        })
      });
      
      return { scenarioId, results: testData };
    },
    onSuccess: (data) => {
      setTestResults(data);
      toast({
        title: "Correlation Test Complete",
        description: `${data.results.correlations?.length || 0} correlations detected`,
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: "Correlation test could not be completed",
        variant: "destructive",
      });
    },
  });

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
          Correlation Test Suite
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Test advanced correlation detection across different scenarios and patterns
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testScenarios.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <div key={scenario.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${scenario.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1">{scenario.name}</h4>
                      <p className="text-gray-400 text-xs mb-3">{scenario.description}</p>
                      <Button
                        size="sm"
                        onClick={() => runCorrelationTest.mutate(scenario.id)}
                        disabled={runCorrelationTest.isPending}
                        className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 w-full"
                      >
                        {runCorrelationTest.isPending && runCorrelationTest.variables === scenario.id ? (
                          <>
                            <Activity className="h-3 w-3 mr-1 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Run Test
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {testResults && (
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
              <h4 className="text-white font-medium mb-3">Test Results</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {testResults.results.correlations?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">Correlations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {testResults.results.patterns?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">Patterns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {testResults.results.overallRiskScore || 0}
                  </div>
                  <div className="text-xs text-gray-400">Risk Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {testResults.results.recommendations?.filter((r: any) => r.priority === 'immediate' || r.priority === 'high').length || 0}
                  </div>
                  <div className="text-xs text-gray-400">Priority Actions</div>
                </div>
              </div>

              {testResults.results.correlations && testResults.results.correlations.length > 0 && (
                <div>
                  <h5 className="text-white font-medium mb-2">Top Correlations</h5>
                  <div className="space-y-2">
                    {testResults.results.correlations.slice(0, 3).map((correlation: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[hsl(217,32%,17%)] rounded">
                        <div>
                          <span className="text-white text-sm">{correlation.description}</span>
                          <div className="text-xs text-gray-400 capitalize">
                            Type: {correlation.correlationType} • Confidence: {correlation.confidence}%
                          </div>
                        </div>
                        <Badge className={
                          correlation.impact === 'critical' ? 'bg-red-600' :
                          correlation.impact === 'high' ? 'bg-orange-600' :
                          correlation.impact === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                        }>
                          {correlation.impact.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <Badge className="bg-green-600 text-white">
                  ✓ Test Scenario: {testResults.scenarioId}
                </Badge>
              </div>
            </div>
          )}

          <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
            <h4 className="text-white font-medium mb-2">Available Data</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total Queries:</span>
                <span className="text-white ml-2">{queries?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-400">Analysis Ready:</span>
                <span className="text-green-400 ml-2">
                  {queries && queries.length > 0 ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}