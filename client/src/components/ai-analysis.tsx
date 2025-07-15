import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  MessageSquare, 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Target,
  FileText,
  Zap,
  Search
} from "lucide-react";

interface AIInsight {
  id: string;
  type: 'vulnerability' | 'pattern' | 'recommendation' | 'correlation' | 'threat';
  confidence: number;
  title: string;
  description: string;
  evidence: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  relatedQueries: number[];
  timestamp: string;
}

interface NaturalLanguageQuery {
  id: string;
  query: string;
  interpretation: string;
  suggestedActions: string[];
  results: any[];
  timestamp: string;
}

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [nlQueries, setNlQueries] = useState<NaturalLanguageQuery[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { toast } = useToast();

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  // Initialize AI analysis
  useEffect(() => {
    if (queries && queries.length > 0) {
      generateAIInsights();
      initializeChatHistory();
    }
  }, [queries]);

  const generateAIInsights = () => {
    if (!queries) return;

    const sampleInsights: AIInsight[] = [
      {
        id: '1',
        type: 'vulnerability',
        confidence: 95,
        title: 'Critical Vulnerability Pattern Detected',
        description: 'AI analysis has identified a pattern of critical vulnerabilities across multiple scanned domains that share similar infrastructure.',
        evidence: [
          'CVE-2024-0001 found on 3 different domains',
          'Same hosting provider detected',
          'Similar web application stack identified'
        ],
        impact: 'critical',
        recommendations: [
          'Immediately patch all affected systems',
          'Implement network segmentation',
          'Review infrastructure security policies'
        ],
        relatedQueries: [1, 2, 3],
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'pattern',
        confidence: 87,
        title: 'Reconnaissance Pattern Analysis',
        description: 'Detected coordinated reconnaissance activity targeting your infrastructure. AI correlates multiple scanning attempts.',
        evidence: [
          'Sequential subdomain enumeration detected',
          'Port scanning from multiple source IPs',
          'Consistent timing patterns identified'
        ],
        impact: 'high',
        recommendations: [
          'Enhance monitoring and alerting',
          'Implement rate limiting',
          'Review access logs for anomalies'
        ],
        relatedQueries: [4, 5, 6],
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        type: 'correlation',
        confidence: 78,
        title: 'Cross-Domain Security Correlation',
        description: 'AI identified security misconfigurations that correlate across multiple domains in your organization.',
        evidence: [
          'Similar SSL certificate issues',
          'Consistent DMARC policy gaps',
          'Repeated DNS configuration patterns'
        ],
        impact: 'medium',
        recommendations: [
          'Standardize security configurations',
          'Implement automated compliance checking',
          'Review DNS and certificate management'
        ],
        relatedQueries: [7, 8],
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    setInsights(sampleInsights);
  };

  const initializeChatHistory = () => {
    const initialHistory = [
      {
        type: 'ai',
        message: 'Hello! I\'m your AI security analyst. I can help you analyze OSINT data, correlate findings, and provide security recommendations. Try asking me something like "What are the most critical vulnerabilities found?" or "Analyze the recent domain enumeration results".',
        timestamp: new Date().toISOString()
      }
    ];
    setChatHistory(initialHistory);
  };

  const aiChatMutation = useMutation({
    mutationFn: async (message: string) => {
      setIsAnalyzing(true);
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI response based on common queries
      let response = "I'm analyzing your request...";
      
      if (message.toLowerCase().includes('vulnerabilities') || message.toLowerCase().includes('critical')) {
        response = `Based on my analysis of your recent scans, I've identified ${Math.floor(Math.random() * 5) + 1} critical vulnerabilities. The most concerning is CVE-2024-0001 with a CVSS score of 9.8. This affects ${Math.floor(Math.random() * 3) + 1} of your scanned domains. I recommend immediate patching and implementing a WAF as a temporary mitigation.`;
      } else if (message.toLowerCase().includes('domain') || message.toLowerCase().includes('enumerate')) {
        response = `Your domain enumeration revealed ${Math.floor(Math.random() * 20) + 10} subdomains. Of these, ${Math.floor(Math.random() * 5) + 1} appear to be development or staging environments that may be inadvertently exposed. I recommend reviewing access controls for staging.example.com, dev.example.com, and api-staging.example.com.`;
      } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('scan')) {
        response = `Network scan analysis shows ${Math.floor(Math.random() * 10) + 5} open ports across your infrastructure. Ports 22, 80, and 443 are expected, but I've detected port 8080 and 3389 which may indicate development services or RDP access. Consider restricting these to internal networks only.`;
      } else if (message.toLowerCase().includes('pattern') || message.toLowerCase().includes('correlation')) {
        response = `I've detected several interesting patterns in your data: 1) Multiple domains using the same SSL certificate issuer with similar expiration dates, 2) Consistent web server versions suggesting centralized management, 3) Similar DNS configuration patterns. This indicates good infrastructure standardization but also means any security issues may affect multiple assets.`;
      } else if (message.toLowerCase().includes('recommendation') || message.toLowerCase().includes('fix')) {
        response = `Based on comprehensive analysis, my top recommendations are: 1) Update all web servers to patch CVE-2024-0001 (Critical), 2) Implement proper access controls for staging environments, 3) Enable HSTS headers across all domains, 4) Review and update DNS security policies, 5) Implement automated security scanning in your CI/CD pipeline.`;
      } else {
        response = `I understand you're asking about "${message}". Let me analyze your OSINT data to provide insights. I can help with vulnerability analysis, pattern recognition, security recommendations, threat correlation, and risk assessment. Could you be more specific about what aspect you'd like me to focus on?`;
      }
      
      return { response };
    },
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        {
          type: 'user',
          message: chatMessage,
          timestamp: new Date().toISOString()
        },
        {
          type: 'ai',
          message: data.response,
          timestamp: new Date().toISOString()
        }
      ]);
      setChatMessage("");
      setIsAnalyzing(false);
    },
    onError: () => {
      toast({
        title: "AI Analysis Failed",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  const handleChatSubmit = () => {
    if (!chatMessage.trim() || isAnalyzing) return;
    aiChatMutation.mutate(chatMessage);
  };

  const runFullAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate comprehensive analysis
    setTimeout(() => {
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'recommendation',
        confidence: 92,
        title: 'Comprehensive Security Analysis Complete',
        description: 'AI has completed a full analysis of all available OSINT data and identified several security improvement opportunities.',
        evidence: [
          `Analyzed ${queries?.length || 0} OSINT queries`,
          'Cross-referenced with threat intelligence feeds',
          'Applied machine learning risk assessment models'
        ],
        impact: 'high',
        recommendations: [
          'Prioritize patching of 3 critical vulnerabilities',
          'Implement additional monitoring for 5 exposed services',
          'Review security configurations for 8 domains',
          'Update incident response procedures based on findings'
        ],
        relatedQueries: queries?.map((q: any) => q.id) || [],
        timestamp: new Date().toISOString()
      };

      setInsights(prev => [newInsight, ...prev]);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Comprehensive AI analysis has been completed and new insights are available.",
      });
    }, 3000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'vulnerability': return <Shield className="h-5 w-5 text-red-400" />;
      case 'pattern': return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'recommendation': return <Lightbulb className="h-5 w-5 text-yellow-400" />;
      case 'correlation': return <Target className="h-5 w-5 text-purple-400" />;
      case 'threat': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default: return <Brain className="h-5 w-5 text-green-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-600';
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
          <Brain className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          AI-Powered Security Analysis
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-600 text-white">
            <Zap className="h-3 w-3 mr-1" />
            AI Active
          </Badge>
          <Badge className="bg-blue-600 text-white">
            {insights.length} Insights
          </Badge>
          <Badge className="bg-purple-600 text-white">
            {queries?.length || 0} Data Points
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="natural" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Search className="h-4 w-4 mr-2" />
              Natural Query
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Brain className="h-4 w-4 mr-2" />
              Deep Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 h-96 overflow-y-auto">
              <div className="space-y-4">
                {chatHistory.map((message, idx) => (
                  <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-[hsl(207,90%,54%)] text-white' 
                        : 'bg-[hsl(217,32%,17%)] border border-[hsl(215,14%,34%)] text-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="bg-[hsl(217,32%,17%)] border border-[hsl(215,14%,34%)] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                        <span className="text-gray-200 text-sm">AI is analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <div className="flex space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask me about your security data... (e.g., 'What are the most critical vulnerabilities?')"
                  className="flex-1 bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  disabled={isAnalyzing}
                />
                <Button 
                  onClick={handleChatSubmit}
                  disabled={!chatMessage.trim() || isAnalyzing}
                  className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                >
                  Send
                </Button>
              </div>
              
              <div className="mt-3">
                <p className="text-gray-400 text-xs mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What are the most critical vulnerabilities?",
                    "Analyze recent domain enumeration results",
                    "Show me security patterns in the data",
                    "What should I prioritize for fixing?"
                  ].map((suggestion, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="cursor-pointer hover:bg-[hsl(207,90%,54%)] text-xs"
                      onClick={() => setChatMessage(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">AI-Generated Security Insights</h4>
              <Button 
                onClick={runFullAnalysis}
                disabled={isAnalyzing}
                className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
              >
                {isAnalyzing ? "Analyzing..." : "Run Full Analysis"}
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {insights.map((insight) => (
                <div key={insight.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <h5 className="text-white font-medium">{insight.title}</h5>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h6 className="text-white text-sm font-medium mb-1">Evidence:</h6>
                      <ul className="text-gray-300 text-xs space-y-1">
                        {insight.evidence.map((evidence, idx) => (
                          <li key={idx}>• {evidence}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="text-white text-sm font-medium mb-1">Recommendations:</h6>
                      <ul className="text-gray-300 text-xs space-y-1">
                        {insight.recommendations.map((rec, idx) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        Related to {insight.relatedQueries.length} queries
                      </span>
                      <span>{new Date(insight.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="natural" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Natural Language Security Queries</h4>
              <p className="text-gray-300 text-sm mb-4">
                Ask questions in plain English and let AI interpret and execute the appropriate security analysis.
              </p>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Example: 'Find all domains with SSL certificate issues from the last week' or 'Show me high-severity vulnerabilities that have available exploits'"
                  className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                  rows={3}
                />
                
                <div className="flex space-x-3">
                  <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                    <Search className="h-4 w-4 mr-2" />
                    Interpret & Execute
                  </Button>
                  <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Save Query
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Example Natural Language Queries</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Find all critical vulnerabilities discovered in the last 24 hours",
                  "Show me domains with weak SSL configurations",
                  "List all subdomains that might be development environments",
                  "Identify services running on non-standard ports",
                  "Find correlations between vulnerability scans and domain enumerations",
                  "Show me the most commonly found vulnerability types"
                ].map((example, idx) => (
                  <div key={idx} className="border border-[hsl(215,14%,34%)] rounded p-3 cursor-pointer hover:bg-[hsl(217,32%,17%)]">
                    <p className="text-gray-300 text-sm">"{example}"</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Analysis Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Analysis Depth</label>
                    <select className="w-full bg-[hsl(217,32%,17%)] border border-[hsl(215,14%,34%)] rounded p-2 text-white">
                      <option>Surface Analysis</option>
                      <option>Deep Analysis</option>
                      <option>Comprehensive Analysis</option>
                      <option>Expert Analysis</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Focus Areas</label>
                    <div className="space-y-2">
                      {['Vulnerability Assessment', 'Pattern Recognition', 'Threat Correlation', 'Risk Prioritization'].map((area, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-gray-300 text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">AI Model Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Vulnerability Detection</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Pattern Recognition</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Threat Intelligence</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Risk Modeling</span>
                    <Badge className="bg-yellow-600">Learning</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">98.5%</div>
                  <div className="text-xs text-gray-400">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">1.2s</div>
                  <div className="text-xs text-gray-400">Avg Analysis Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">847</div>
                  <div className="text-xs text-gray-400">Patterns Learned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">15</div>
                  <div className="text-xs text-gray-400">False Positives</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}