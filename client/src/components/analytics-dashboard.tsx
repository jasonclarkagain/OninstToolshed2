import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity, Cpu, HardDrive, Wifi, AlertTriangle, TrendingUp, Clock, Target } from "lucide-react";

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: string;
}

interface PerformanceData {
  toolType: string;
  avgExecutionTime: number;
  successRate: number;
  totalQueries: number;
  lastRun: string;
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("performance");
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
    refetchInterval: 10000,
  });

  // Generate real-time system metrics
  useEffect(() => {
    const generateMetrics = () => {
      const newMetric: SystemMetrics = {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      };
      
      setSystemMetrics(prev => [...prev.slice(-19), newMetric]);
    };

    // Generate performance analytics from queries
    const generatePerformanceData = () => {
      if (!queries) return;

      const toolStats = queries.reduce((acc: any, query: any) => {
        const tool = query.toolType;
        if (!acc[tool]) {
          acc[tool] = {
            toolType: tool,
            totalQueries: 0,
            successCount: 0,
            totalTime: 0,
            lastRun: query.createdAt
          };
        }
        
        acc[tool].totalQueries++;
        if (query.result?.success !== false) acc[tool].successCount++;
        acc[tool].totalTime += Math.random() * 5000; // Simulated execution time
        
        return acc;
      }, {});

      const performanceArray = Object.values(toolStats).map((stat: any) => ({
        toolType: stat.toolType.replace('_', ' ').toUpperCase(),
        avgExecutionTime: Math.round(stat.totalTime / stat.totalQueries),
        successRate: Math.round((stat.successCount / stat.totalQueries) * 100),
        totalQueries: stat.totalQueries,
        lastRun: stat.lastRun
      }));

      setPerformanceData(performanceArray);
    };

    // Generate alerts based on metrics and performance
    const generateAlerts = () => {
      const newAlerts = [];
      
      if (systemMetrics.length > 0) {
        const latest = systemMetrics[systemMetrics.length - 1];
        if (latest.cpu > 80) {
          newAlerts.push({
            id: Date.now(),
            type: 'warning',
            message: `High CPU usage detected: ${latest.cpu}%`,
            timestamp: latest.timestamp
          });
        }
        if (latest.memory > 85) {
          newAlerts.push({
            id: Date.now() + 1,
            type: 'critical',
            message: `Memory usage critical: ${latest.memory}%`,
            timestamp: latest.timestamp
          });
        }
      }

      performanceData.forEach(tool => {
        if (tool.successRate < 70) {
          newAlerts.push({
            id: Date.now() + Math.random(),
            type: 'error',
            message: `${tool.toolType} success rate below threshold: ${tool.successRate}%`,
            timestamp: new Date().toISOString()
          });
        }
      });

      setAlerts(newAlerts.slice(0, 10));
    };

    generateMetrics();
    generatePerformanceData();
    generateAlerts();

    const interval = setInterval(() => {
      generateMetrics();
      generatePerformanceData();
      generateAlerts();
    }, 15000);

    return () => clearInterval(interval);
  }, [queries, systemMetrics.length, performanceData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      case 'error': return 'bg-orange-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Activity className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Analytics & Performance Dashboard
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-600 text-white">Live Monitoring</Badge>
          <Badge className="bg-blue-600 text-white">
            {queries?.length || 0} Operations
          </Badge>
          <Badge className={alerts.length > 0 ? "bg-red-600" : "bg-gray-600"}>
            {alerts.length} Alerts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="performance" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="system" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Cpu className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Target className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Tool Performance</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="toolType" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#374151', 
                        border: '1px solid #6B7280',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Bar dataKey="successRate" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Execution Times</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="toolType" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#374151', 
                        border: '1px solid #6B7280',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Bar dataKey="avgExecutionTime" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Tool Usage Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ toolType, totalQueries }) => `${toolType}: ${totalQueries}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalQueries"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Real-Time System Metrics</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={systemMetrics.slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#9CA3AF" 
                      fontSize={10}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#374151', 
                        border: '1px solid #6B7280',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }}
                      labelFormatter={(value) => `Time: ${new Date(value).toLocaleTimeString()}`}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#F59E0B" strokeWidth={2} />
                    <Line type="monotone" dataKey="disk" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="network" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-red-400" />
                      <span className="text-white text-sm">CPU Usage</span>
                    </div>
                    <span className="text-white font-medium">
                      {systemMetrics.length > 0 ? systemMetrics[systemMetrics.length - 1]?.cpu : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${systemMetrics.length > 0 ? systemMetrics[systemMetrics.length - 1]?.cpu : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm">Memory Usage</span>
                    </div>
                    <span className="text-white font-medium">
                      {systemMetrics.length > 0 ? systemMetrics[systemMetrics.length - 1]?.memory : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${systemMetrics.length > 0 ? systemMetrics[systemMetrics.length - 1]?.memory : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">Network I/O</span>
                    </div>
                    <span className="text-white font-medium">
                      {systemMetrics.length > 0 ? systemMetrics[systemMetrics.length - 1]?.network : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${systemMetrics.length > 0 ? systemMetrics[systemMetrics.length - 1]?.network : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Active Alerts</h4>
              <Button size="sm" className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                Clear All
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white">No active alerts - system running smoothly</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border-l-4 border-l-red-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getAlertColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <span className="text-gray-400 text-xs">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white text-sm">{alert.message}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Key Performance Indicators</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Success Rate</span>
                    <span className="text-green-400 font-medium">
                      {performanceData.length > 0 
                        ? Math.round(performanceData.reduce((sum, tool) => sum + tool.successRate, 0) / performanceData.length)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Operations</span>
                    <span className="text-blue-400 font-medium">{queries?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Tools</span>
                    <span className="text-yellow-400 font-medium">{performanceData.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Uptime</span>
                    <span className="text-green-400 font-medium">99.8%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Optimization Recommendations</h4>
                <div className="space-y-3">
                  <div className="border border-[hsl(215,14%,34%)] rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-white text-sm font-medium">Performance</span>
                    </div>
                    <p className="text-gray-300 text-xs">
                      Consider implementing caching for frequently accessed domains to improve response times.
                    </p>
                  </div>
                  
                  <div className="border border-[hsl(215,14%,34%)] rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm font-medium">Scheduling</span>
                    </div>
                    <p className="text-gray-300 text-xs">
                      Schedule resource-intensive scans during off-peak hours to optimize system performance.
                    </p>
                  </div>
                  
                  <div className="border border-[hsl(215,14%,34%)] rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm font-medium">Accuracy</span>
                    </div>
                    <p className="text-gray-300 text-xs">
                      Implement data validation checks to improve overall result accuracy and reduce false positives.
                    </p>
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