import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Radar, Zap, Network, Shield, Eye, Target, Server, Globe, Database, Lock } from "lucide-react";

export default function AdvancedReconScanner() {
  const [target, setTarget] = useState("");
  const [scanProfile, setScanProfile] = useState("comprehensive");
  const [customOptions, setCustomOptions] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([
    "network-discovery",
    "port-scanning",
    "service-enumeration",
    "vulnerability-assessment",
    "osint-gathering"
  ]);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scanModules = [
    { id: "network-discovery", name: "Network Discovery", icon: Network, description: "Advanced network topology mapping" },
    { id: "port-scanning", name: "Port Scanning", icon: Server, description: "Comprehensive port analysis" },
    { id: "service-enumeration", name: "Service Enumeration", icon: Database, description: "Deep service fingerprinting" },
    { id: "vulnerability-assessment", name: "Vulnerability Assessment", icon: Shield, description: "CVE database scanning" },
    { id: "osint-gathering", name: "OSINT Gathering", icon: Eye, description: "Open source intelligence" },
    { id: "ssl-analysis", name: "SSL/TLS Analysis", icon: Lock, description: "Certificate and cipher analysis" },
    { id: "dns-enumeration", name: "DNS Enumeration", icon: Globe, description: "Advanced DNS reconnaissance" },
    { id: "web-analysis", name: "Web Analysis", icon: Target, description: "Web application scanning" }
  ];

  const mutation = useMutation({
    mutationFn: async ({ target, scanProfile, selectedModules, customOptions }: { 
      target: string; 
      scanProfile: string; 
      selectedModules: string[]; 
      customOptions: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/advanced-recon", {
        target,
        scanProfile,
        selectedModules,
        customOptions,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      setProgress(100);
      setCurrentPhase("Complete");
      toast({
        title: "Advanced Reconnaissance Complete",
        description: `Scanned ${target} with ${selectedModules.length} modules`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/osint/queries"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() || selectedModules.length === 0) return;
    setProgress(0);
    setCurrentPhase("Initializing...");
    mutation.mutate({ target: target.trim(), scanProfile, selectedModules, customOptions });
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-600";
      case "high": return "bg-orange-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Radar className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Advanced Reconnaissance Scanner
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Enterprise-grade network discovery and security assessment platform</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="configure" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="configure" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Configure</TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Modules</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target" className="text-gray-300">Target (IP/Domain/Network)</Label>
                  <Input
                    id="target"
                    type="text"
                    placeholder="example.com or 192.168.1.0/24"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="scanProfile" className="text-gray-300">Scan Profile</Label>
                  <Select value={scanProfile} onValueChange={setScanProfile}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stealth">Stealth (Slow, Evasive)</SelectItem>
                      <SelectItem value="normal">Normal (Balanced)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Fast, Noisy)</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive (All Techniques)</SelectItem>
                      <SelectItem value="custom">Custom Configuration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="customOptions" className="text-gray-300">Custom Options</Label>
                <Textarea
                  id="customOptions"
                  placeholder="--timing 4 --script vuln --max-rate 1000"
                  value={customOptions}
                  onChange={(e) => setCustomOptions(e.target.value)}
                  className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {selectedModules.length} of {scanModules.length} modules selected
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending || !target.trim() || selectedModules.length === 0}
                  className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Reconnaissance
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="modules" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanModules.map((module) => {
                const Icon = module.icon;
                return (
                  <div key={module.id} className="flex items-center space-x-3 p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <Checkbox
                      id={module.id}
                      checked={selectedModules.includes(module.id)}
                      onCheckedChange={() => toggleModule(module.id)}
                    />
                    <Icon className="h-5 w-5 text-[hsl(207,90%,54%)]" />
                    <div className="flex-1">
                      <label htmlFor={module.id} className="text-white font-medium cursor-pointer">
                        {module.name}
                      </label>
                      <p className="text-xs text-gray-400">{module.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedModules(scanModules.map(m => m.id))}
                className="text-white border-gray-600"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedModules([])}
                className="text-white border-gray-600"
              >
                Clear All
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {mutation.isPending && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Phase</span>
                  <span className="text-white">{currentPhase}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-gray-400">
                  This may take several minutes depending on target size and selected modules
                </div>
              </div>
            )}
            
            {results && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Hosts Found</div>
                    <div className="text-xl font-bold text-white">{results.summary?.hostsFound || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Open Ports</div>
                    <div className="text-xl font-bold text-white">{results.summary?.openPorts || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Vulnerabilities</div>
                    <div className="text-xl font-bold text-red-400">{results.summary?.vulnerabilities || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Services</div>
                    <div className="text-xl font-bold text-white">{results.summary?.services || 0}</div>
                  </div>
                </div>
                
                {/* Network Topology */}
                {results.networkTopology && (
                  <div className="p-4 bg-[hsl(215,25%,27%)] rounded-lg">
                    <h3 className="text-white font-medium mb-3">Network Topology</h3>
                    <div className="space-y-2">
                      {results.networkTopology.subnets?.map((subnet: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-[hsl(222,47%,11%)] rounded">
                          <span className="text-white font-mono">{subnet.network}</span>
                          <Badge className="bg-[hsl(207,90%,54%)]">{subnet.hostCount} hosts</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Discovered Hosts */}
                {results.hosts && results.hosts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Discovered Hosts</h3>
                    {results.hosts.map((host: any, index: number) => (
                      <div key={index} className="p-4 bg-[hsl(215,25%,27%)] rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-white font-mono">{host.ip}</div>
                            {host.hostname && <div className="text-sm text-gray-400">{host.hostname}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={host.status === 'up' ? 'bg-green-600' : 'bg-red-600'}>
                              {host.status}
                            </Badge>
                            {host.os && <Badge variant="outline">{host.os}</Badge>}
                          </div>
                        </div>
                        
                        {host.ports && host.ports.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-400 mb-2">Open Ports</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {host.ports.map((port: any, portIndex: number) => (
                                <div key={portIndex} className="p-2 bg-[hsl(222,47%,11%)] rounded text-sm">
                                  <div className="text-white font-mono">{port.port}/{port.protocol}</div>
                                  <div className="text-xs text-gray-400">{port.service}</div>
                                  {port.version && <div className="text-xs text-gray-500">{port.version}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {host.vulnerabilities && host.vulnerabilities.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-400 mb-2">Vulnerabilities</div>
                            <div className="space-y-1">
                              {host.vulnerabilities.map((vuln: any, vulnIndex: number) => (
                                <div key={vulnIndex} className="flex items-center justify-between p-2 bg-red-900/20 border border-red-500/30 rounded">
                                  <div>
                                    <div className="text-white text-sm">{vuln.id}</div>
                                    <div className="text-xs text-gray-400">{vuln.description}</div>
                                  </div>
                                  <Badge className={getSeverityColor(vuln.severity)}>
                                    {vuln.severity}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* OSINT Results */}
                {results.osintData && (
                  <div className="p-4 bg-[hsl(215,25%,27%)] rounded-lg">
                    <h3 className="text-white font-medium mb-3">OSINT Intelligence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.osintData.domains && (
                        <div>
                          <div className="text-sm text-gray-400 mb-2">Related Domains</div>
                          <div className="space-y-1">
                            {results.osintData.domains.map((domain: string, index: number) => (
                              <div key={index} className="text-sm text-white font-mono">{domain}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {results.osintData.emails && (
                        <div>
                          <div className="text-sm text-gray-400 mb-2">Email Addresses</div>
                          <div className="space-y-1">
                            {results.osintData.emails.map((email: string, index: number) => (
                              <div key={index} className="text-sm text-white font-mono">{email}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}