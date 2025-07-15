import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wifi, Shield, AlertTriangle, Search, Target } from "lucide-react";

export default function WifiSecurity() {
  const [target, setTarget] = useState("");
  const [toolType, setToolType] = useState("monitor");
  const [interface, setInterface] = useState("wlan0");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, toolType, interface: wifiInterface }: { 
      target: string; 
      toolType: string; 
      interface: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/wifi-security", {
        target,
        toolType,
        interface: wifiInterface,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "WiFi Security Scan Complete",
        description: `${toolType} operation completed successfully`,
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
    mutation.mutate({ target, toolType, interface });
  };

  const getSecurityLevel = (security: string) => {
    switch (security?.toLowerCase()) {
      case "wep":
        return { color: "bg-red-600", text: "Very Weak" };
      case "wpa":
        return { color: "bg-orange-600", text: "Weak" };
      case "wpa2":
        return { color: "bg-yellow-600", text: "Moderate" };
      case "wpa3":
        return { color: "bg-green-600", text: "Strong" };
      case "open":
        return { color: "bg-red-700", text: "Open" };
      default:
        return { color: "bg-gray-600", text: "Unknown" };
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Wifi className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            WiFi Security Tools
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Advanced wireless security assessment and monitoring tools</p>
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Requires monitor mode capable wireless adapter - Educational use only</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="interface" className="text-gray-300">Wireless Interface</Label>
              <Select value={interface} onValueChange={setInterface}>
                <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wlan0">wlan0</SelectItem>
                  <SelectItem value="wlan1">wlan1</SelectItem>
                  <SelectItem value="wlan0mon">wlan0mon</SelectItem>
                  <SelectItem value="mon0">mon0</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="toolType" className="text-gray-300">Tool Type</Label>
              <Select value={toolType} onValueChange={setToolType}>
                <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monitor">Monitor Mode</SelectItem>
                  <SelectItem value="airodump">Airodump-ng Scan</SelectItem>
                  <SelectItem value="aireplay">Aireplay-ng Attack</SelectItem>
                  <SelectItem value="aircrack">Aircrack-ng Crack</SelectItem>
                  <SelectItem value="reaver">Reaver WPS Attack</SelectItem>
                  <SelectItem value="wash">Wash WPS Scan</SelectItem>
                  <SelectItem value="kismet">Kismet Passive Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target" className="text-gray-300">Target (BSSID/ESSID)</Label>
              <Input
                id="target"
                type="text"
                placeholder="00:11:22:33:44:55 or MyWiFi"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Execute Tool
                </>
              )}
            </Button>
            <div className="text-sm text-gray-400">
              {toolType === "monitor" && "Sets up monitor mode"}
              {toolType === "airodump" && "Scans for access points"}
              {toolType === "aircrack" && "Attempts password cracking"}
              {toolType === "reaver" && "WPS brute force attack"}
            </div>
          </div>
        </form>

        {results && (
          <div className="mt-4 space-y-3">
            {results.networks && results.networks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Detected Networks</h4>
                {results.networks.map((network: any, index: number) => (
                  <div key={index} className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{network.essid || 'Hidden'}</span>
                          <Badge className={getSecurityLevel(network.security).color}>
                            {network.security || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{network.bssid}</div>
                        <div className="flex gap-4 text-xs mt-1">
                          <span className="text-gray-400">Channel: <span className="text-white">{network.channel}</span></span>
                          <span className="text-gray-400">Power: <span className="text-white">{network.power} dBm</span></span>
                          <span className="text-gray-400">Clients: <span className="text-white">{network.clients || 0}</span></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Quality</div>
                        <div className="text-sm text-white">{network.quality || 'Unknown'}</div>
                      </div>
                    </div>
                    
                    {network.wps && (
                      <div className="mt-2 p-2 bg-[hsl(222,47%,11%)] rounded text-sm">
                        <span className="text-yellow-400">WPS Enabled</span>
                        {network.wpsLocked && <span className="text-red-400 ml-2">Locked</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {results.handshakes && results.handshakes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Captured Handshakes</h4>
                {results.handshakes.map((handshake: any, index: number) => (
                  <div key={index} className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">{handshake.essid}</div>
                        <div className="text-xs text-gray-400 font-mono">{handshake.bssid}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 text-sm">Complete</div>
                        <div className="text-xs text-gray-400">{handshake.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {results.crackResult && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Crack Result</div>
                {results.crackResult.success ? (
                  <div className="text-green-400">
                    Password found: <span className="font-mono bg-[hsl(222,47%,11%)] px-2 py-1 rounded">{results.crackResult.password}</span>
                  </div>
                ) : (
                  <div className="text-red-400">Password not found in wordlist</div>
                )}
              </div>
            )}
            
            {results.commandOutput && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Command Output</div>
                <pre className="text-xs text-gray-300 bg-[hsl(222,47%,11%)] p-2 rounded overflow-x-auto">
                  {results.commandOutput}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}