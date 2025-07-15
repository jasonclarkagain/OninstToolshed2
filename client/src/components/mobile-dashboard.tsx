import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useMobile } from "@/hooks/use-mobile";
import { 
  Smartphone, 
  Activity, 
  Shield, 
  Search,
  Bell,
  Target,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap
} from "lucide-react";

interface MobileAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface QuickAction {
  id: string;
  name: string;
  icon: any;
  description: string;
  action: string;
}

export default function MobileDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [alerts, setAlerts] = useState<MobileAlert[]>([]);
  const [quickActions] = useState<QuickAction[]>([
    {
      id: '1',
      name: 'Quick Scan',
      icon: Search,
      description: 'Run a fast domain scan',
      action: 'scan'
    },
    {
      id: '2',
      name: 'Check Status',
      icon: Activity,
      description: 'View system status',
      action: 'status'
    },
    {
      id: '3',
      name: 'View Alerts',
      icon: Bell,
      description: 'Check security alerts',
      action: 'alerts'
    },
    {
      id: '4',
      name: 'Emergency Stop',
      icon: AlertTriangle,
      description: 'Stop all running scans',
      action: 'stop'
    }
  ]);

  const isMobile = useMobile();

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
    refetchInterval: 30000, // More frequent updates for mobile
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/osint/reports"],
  });

  // Generate mobile-optimized alerts
  useEffect(() => {
    const generateAlerts = () => {
      const mobileAlerts: MobileAlert[] = [
        {
          id: '1',
          type: 'critical',
          title: 'Critical Vulnerability Detected',
          message: 'CVE-2024-0001 found on 3 domains',
          timestamp: new Date().toISOString(),
          acknowledged: false
        },
        {
          id: '2',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'System memory at 85%',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          acknowledged: false
        },
        {
          id: '3',
          type: 'info',
          title: 'Scan Complete',
          message: 'Domain enumeration finished',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          acknowledged: true
        }
      ];
      
      setAlerts(mobileAlerts);
    };

    generateAlerts();
    const interval = setInterval(generateAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      case 'info': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const executeQuickAction = (action: string) => {
    switch (action) {
      case 'scan':
        // Trigger quick scan
        break;
      case 'status':
        setActiveTab('status');
        break;
      case 'alerts':
        setActiveTab('alerts');
        break;
      case 'stop':
        // Emergency stop
        break;
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Smartphone className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Mobile Security Dashboard
        </CardTitle>
        <div className="flex items-center space-x-2 flex-wrap">
          <Badge className="bg-green-600 text-white">
            {isMobile ? 'Mobile' : 'Desktop'} View
          </Badge>
          <Badge className="bg-blue-600 text-white">
            {queries?.length || 0} Operations
          </Badge>
          <Badge className={alerts.filter(a => !a.acknowledged).length > 0 ? "bg-red-600" : "bg-gray-600"}>
            {alerts.filter(a => !a.acknowledged).length} Alerts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} bg-[hsl(215,25%,27%)]`}>
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Activity className="h-4 w-4 mr-1" />
              {isMobile ? '' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Bell className="h-4 w-4 mr-1" />
              {isMobile ? '' : 'Alerts'}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="status" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
                  <Shield className="h-4 w-4 mr-2" />
                  Status
                </TabsTrigger>
                <TabsTrigger value="actions" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
                  <Zap className="h-4 w-4 mr-2" />
                  Actions
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Quick Stats - Mobile Optimized */}
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3`}>
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">{queries?.length || 0}</div>
                <div className="text-xs text-gray-400">Total Scans</div>
              </div>
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-400">
                  {alerts.filter(a => a.type === 'critical').length}
                </div>
                <div className="text-xs text-gray-400">Critical</div>
              </div>
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {alerts.filter(a => a.type === 'warning').length}
                </div>
                <div className="text-xs text-gray-400">Warnings</div>
              </div>
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-400">{reports?.length || 0}</div>
                <div className="text-xs text-gray-400">Reports</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Quick Actions</h4>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3`}>
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={action.id}
                      onClick={() => executeQuickAction(action.action)}
                      className="bg-[hsl(217,32%,17%)] border border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(207,90%,54%)] h-auto p-3 flex-col"
                    >
                      <IconComponent className="h-5 w-5 mb-1" />
                      <span className="text-xs">{action.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity - Mobile Optimized */}
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {queries?.slice(0, 5).map((query: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between border-b border-[hsl(215,14%,34%)] pb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{query.query}</p>
                      <p className="text-gray-400 text-xs">
                        {query.toolType.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {query.status}
                      </Badge>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(query.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health - Compact */}
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">System Health</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">CPU Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-white text-sm">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Memory</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="text-white text-sm">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Network</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                    <span className="text-white text-sm">28%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Security Alerts</h4>
              <Badge className="bg-red-600 text-white">
                {alerts.filter(a => !a.acknowledged).length} Unread
              </Badge>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className={`bg-[hsl(215,25%,27%)] rounded-lg p-3 border-l-4 ${
                  alert.type === 'critical' ? 'border-l-red-500' : 
                  alert.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                } ${alert.acknowledged ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getAlertColor(alert.type)}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        {!alert.acknowledged && (
                          <Badge variant="outline" className="text-xs">NEW</Badge>
                        )}
                      </div>
                      <h5 className="text-white font-medium text-sm mb-1">{alert.title}</h5>
                      <p className="text-gray-300 text-xs mb-2">{alert.message}</p>
                      <p className="text-gray-400 text-xs">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-xs"
                      >
                        ACK
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {alerts.length === 0 && (
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6 text-center">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-white">No active alerts</p>
                <p className="text-gray-400 text-sm">System is running normally</p>
              </div>
            )}
          </TabsContent>

          {!isMobile && (
            <>
              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Tool Status</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Domain Enumeration', status: 'active' },
                        { name: 'Vulnerability Scanner', status: 'active' },
                        { name: 'Network Analysis', status: 'active' },
                        { name: 'Kali Linux VM', status: 'active' },
                        { name: 'AI Analysis', status: 'learning' },
                        { name: 'Report Generator', status: 'idle' }
                      ].map((tool, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">{tool.name}</span>
                          <Badge className={
                            tool.status === 'active' ? 'bg-green-600' :
                            tool.status === 'learning' ? 'bg-yellow-600' : 'bg-gray-600'
                          }>
                            {tool.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">99.2%</div>
                        <div className="text-xs text-gray-400">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">1.8s</div>
                        <div className="text-xs text-gray-400">Avg Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">97.5%</div>
                        <div className="text-xs text-gray-400">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Emergency Shutdown', icon: AlertTriangle, color: 'bg-red-600' },
                    { name: 'Restart Services', icon: Activity, color: 'bg-yellow-600' },
                    { name: 'Clear Cache', icon: Zap, color: 'bg-blue-600' },
                    { name: 'Export Logs', icon: TrendingUp, color: 'bg-green-600' },
                    { name: 'System Backup', icon: Shield, color: 'bg-purple-600' },
                    { name: 'Health Check', icon: Target, color: 'bg-gray-600' }
                  ].map((action, idx) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={idx}
                        className={`${action.color} hover:opacity-80 h-20 flex-col`}
                      >
                        <IconComponent className="h-6 w-6 mb-2" />
                        <span className="text-sm">{action.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}