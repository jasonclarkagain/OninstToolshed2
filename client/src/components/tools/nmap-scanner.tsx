import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Radar, Play, Shield, AlertCircle } from "lucide-react";

export default function NmapScanner() {
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState("syn");
  const [ports, setPorts] = useState("1-1000");
  const [options, setOptions] = useState("");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, scanType, ports, options }: { 
      target: string; 
      scanType: string; 
      ports: string; 
      options: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/nmap-scan", {
        target,
        scanType,
        ports,
        options,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "Nmap Scan Complete",
        description: `Scanned ${target} - Found ${data.result.openPorts?.length || 0} open ports`,
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
    if (!target.trim()) return;
    mutation.mutate({ target: target.trim(), scanType, ports, options });
  };

  const getPortStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case "open":
        return "bg-green-600";
      case "closed":
        return "bg-red-600";
      case "filtered":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const getServiceRisk = (service: string) => {
    const highRisk = ["ssh", "ftp", "telnet", "rlogin", "mysql", "postgresql", "mongodb"];
    const mediumRisk = ["http", "https", "smtp", "pop3", "imap"];
    
    if (highRisk.includes(service?.toLowerCase())) return "high";
    if (mediumRisk.includes(service?.toLowerCase())) return "medium";
    return "low";
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Radar className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Nmap Network Scanner
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Advanced network discovery and security auditing with Nmap</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target" className="text-gray-300">Target Host/Network</Label>
              <Input
                id="target"
                type="text"
                placeholder="192.168.1.1 or 192.168.1.0/24"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="scanType" className="text-gray-300">Scan Type</Label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="syn">SYN Scan (-sS)</SelectItem>
                  <SelectItem value="connect">Connect Scan (-sT)</SelectItem>
                  <SelectItem value="udp">UDP Scan (-sU)</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive (-A)</SelectItem>
                  <SelectItem value="ping">Ping Scan (-sn)</SelectItem>
                  <SelectItem value="stealth">Stealth (-sS -T2)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (-A -T4)</SelectItem>
                  <SelectItem value="version">Version Detection (-sV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ports" className="text-gray-300">Port Range</Label>
              <Input
                id="ports"
                type="text"
                placeholder="1-1000 or 22,80,443"
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="options" className="text-gray-300">Additional Options</Label>
              <Input
                id="options"
                type="text"
                placeholder="-O --script vuln"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              type="submit"
              disabled={mutation.isPending || !target.trim()}
              className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
            <div className="text-sm text-gray-400">
              {scanType === "syn" && "Fast, stealthy port scan"}
              {scanType === "comprehensive" && "OS detection, version detection, script scanning"}
              {scanType === "stealth" && "Slow, evasive scan"}
            </div>
          </div>
        </form>

        {results && (
          <div className="mt-4 space-y-3">
            {results.hosts && results.hosts.length > 0 && (
              <div className="space-y-2">
                {results.hosts.map((host: any, hostIndex: number) => (
                  <div key={hostIndex} className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-white font-medium">{host.ip}</div>
                        {host.hostname && (
                          <div className="text-sm text-gray-400">{host.hostname}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={host.status === 'up' ? 'bg-green-600' : 'bg-red-600'}>
                            {host.status}
                          </Badge>
                          {host.os && (
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {host.os}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        {host.openPorts?.length || 0} open ports
                      </div>
                    </div>
                    
                    {host.openPorts && host.openPorts.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-white">Open Ports</div>
                        <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                          {host.openPorts.map((port: any, portIndex: number) => (
                            <div key={portIndex} className="p-2 bg-[hsl(222,47%,11%)] rounded text-sm">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-mono">{port.port}/{port.protocol}</span>
                                  <Badge className={getPortStateColor(port.state)}>
                                    {port.state}
                                  </Badge>
                                  {port.service && (
                                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                                      {port.service}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {getServiceRisk(port.service) === 'high' && (
                                    <AlertCircle className="h-3 w-3 text-red-400" />
                                  )}
                                  {port.version && (
                                    <span className="text-xs text-gray-400">{port.version}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {results.vulnerabilities && results.vulnerabilities.length > 0 && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Detected Vulnerabilities</div>
                <div className="space-y-1">
                  {results.vulnerabilities.map((vuln: any, index: number) => (
                    <div key={index} className="p-2 bg-red-900/20 border border-red-500/30 rounded text-sm">
                      <div className="text-red-400 font-medium">{vuln.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{vuln.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.scanStats && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Scan Statistics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Elapsed Time: <span className="text-white">{results.scanStats.elapsed}</span></div>
                  <div className="text-gray-400">Hosts Scanned: <span className="text-white">{results.scanStats.hostsScanned}</span></div>
                  <div className="text-gray-400">Ports Scanned: <span className="text-white">{results.scanStats.portsScanned}</span></div>
                  <div className="text-gray-400">Hosts Up: <span className="text-white">{results.scanStats.hostsUp}</span></div>
                </div>
              </div>
            )}
            
            {results.rawOutput && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Raw Nmap Output</div>
                <Textarea
                  value={results.rawOutput}
                  readOnly
                  className="bg-[hsl(222,47%,11%)] border-none text-gray-300 font-mono text-xs"
                  rows={8}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}