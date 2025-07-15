import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  User, 
  Send, 
  TrendingUp, 
  Brain, 
  Zap,
  MessageSquare,
  Clock,
  AlertTriangle,
  Target,
  Activity,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    queryExecuted?: boolean;
    toolsUsed?: string[];
    analysisType?: string;
    confidence?: number;
  };
}

interface TrendPrediction {
  id: string;
  category: 'vulnerability' | 'attack_pattern' | 'infrastructure' | 'threat_actor' | 'geographic';
  title: string;
  description: string;
  likelihood: number;
  timeframe: string;
  evidence: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  confidence: number;
  trendData: {
    historical: { date: string; value: number }[];
    projected: { date: string; value: number; confidence: number }[];
  };
}

interface ChatbotResponse {
  message: string;
  actionTaken?: {
    type: 'query_executed' | 'analysis_performed' | 'trend_predicted' | 'report_generated';
    details: any;
  };
  suggestions?: string[];
  trends?: TrendPrediction[];
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI security assistant. I can help you run OSINT scans, analyze security trends, and provide threat intelligence insights. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [trends, setTrends] = useState<TrendPrediction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      return response as ChatbotResponse;
    },
    onSuccess: (response) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputMessage,
        timestamp: new Date()
      };

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          queryExecuted: !!response.actionTaken,
          analysisType: response.actionTaken?.type,
          confidence: 0.85
        }
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      
      // Update trends if provided
      if (response.trends && response.trends.length > 0) {
        setTrends(response.trends);
        setActiveTab("trends");
      }

      // Show success notification for actions
      if (response.actionTaken) {
        toast({
          title: "Action Completed",
          description: `${response.actionTaken.type.replace('_', ' ')} executed successfully`,
        });
      }

      setInputMessage("");
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: "Failed to send message to AI assistant",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessage.mutate(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vulnerability': return AlertTriangle;
      case 'attack_pattern': return Target;
      case 'infrastructure': return Activity;
      default: return TrendingUp;
    }
  };

  const quickSuggestions = [
    "Scan example.com for vulnerabilities",
    "Show me recent security trends",
    "Analyze my scan results for patterns",
    "What are the current threat predictions?",
    "Run a comprehensive security assessment",
    "Generate a security report"
  ];

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-white">
          <Brain className="h-5 w-5 mr-2 text-blue-400" />
          AI Security Assistant
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-600 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Badge className="bg-green-600 text-white">
            <Activity className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mb-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends ({trends.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col px-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-[hsl(207,90%,54%)] text-white' 
                        : 'bg-[hsl(215,25%,27%)] text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.metadata?.queryExecuted && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Action
                          </Badge>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {sendMessage.isPending && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-[hsl(215,25%,27%)] text-white px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            <div className="mt-4 mb-4">
              <p className="text-xs text-gray-400 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(207,90%,54%)]"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="flex items-center space-x-2 bg-[hsl(215,25%,27%)] rounded-lg p-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about security..."
                className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus-visible:ring-0"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessage.isPending}
                className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="flex-1 px-4">
            <ScrollArea className="h-full">
              {trends.length > 0 ? (
                <div className="space-y-4">
                  {trends.map((trend) => {
                    const IconComponent = getCategoryIcon(trend.category);
                    return (
                      <div key={trend.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-5 w-5 text-orange-400" />
                            <h4 className="text-white font-medium">{trend.title}</h4>
                          </div>
                          <Badge className={getImpactColor(trend.impact)}>
                            {trend.impact.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">{trend.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-gray-400">Likelihood</span>
                            <div className="text-lg font-bold text-orange-400">
                              {(trend.likelihood * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">Timeframe</span>
                            <div className="text-lg font-bold text-blue-400">
                              {trend.timeframe}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-xs text-gray-400 mb-1 block">Evidence</span>
                          <ul className="space-y-1">
                            {trend.evidence.slice(0, 2).map((evidence, idx) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-center">
                                <ChevronRight className="h-3 w-3 mr-1" />
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-xs text-gray-400 mb-1 block">Recommendations</span>
                          <ul className="space-y-1">
                            {trend.recommendations.slice(0, 2).map((rec, idx) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-center">
                                <ChevronRight className="h-3 w-3 mr-1" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[hsl(215,14%,34%)] flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Confidence: {(trend.confidence * 100).toFixed(0)}%
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {trend.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">No Trends Available</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Ask me to analyze trends to see predictive insights
                  </p>
                  <Button
                    onClick={() => handleSuggestionClick("Show me recent security trends")}
                    className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                  >
                    Analyze Trends
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}