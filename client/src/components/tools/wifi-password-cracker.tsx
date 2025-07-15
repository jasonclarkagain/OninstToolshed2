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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wifi, Zap, AlertTriangle, Target, Key, Shield } from "lucide-react";

export default function WifiPasswordCracker() {
  const [target, setTarget] = useState("");
  const [interface, setInterface] = useState("wlan0");
  const [attackType, setAttackType] = useState("dictionary");
  const [wordlist, setWordlist] = useState("rockyou.txt");
  const [customWordlist, setCustomWordlist] = useState("");
  const [handshakeFile, setHandshakeFile] = useState("");
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, interface: wifiInterface, attackType, wordlist, customWordlist, handshakeFile }: { 
      target: string; 
      interface: string; 
      attackType: string; 
      wordlist: string; 
      customWordlist: string; 
      handshakeFile: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/wifi-crack", {
        target,
        interface: wifiInterface,
        attackType,
        wordlist,
        customWordlist,
        handshakeFile,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      setProgress(100);
      setIsRunning(false);
      toast({
        title: "WiFi Password Cracking Complete",
        description: data.result.success ? "Password found!" : "Password not cracked",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/osint/queries"] });
    },
    onError: (error) => {
      setIsRunning(false);
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
    setProgress(0);
    setIsRunning(true);
    mutation.mutate({ target: target.trim(), interface, attackType, wordlist, customWordlist, handshakeFile });
  };

  const getAttackDescription = (type: string) => {
    switch (type) {
      case "dictionary":
        return "Uses wordlist to crack WPA/WPA2 handshakes";
      case "brute":
        return "Exhaustive brute force attack";
      case "hybrid":
        return "Dictionary + rules/mutations";
      case "wps":
        return "WPS PIN brute force with Reaver";
      case "pmkid":
        return "PMKID hashcat attack (no handshake needed)";
      case "evil_twin":
        return "Evil twin captive portal attack";
      default:
        return "";
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Wifi className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            All-in-One WiFi Password Cracker
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Complete WiFi security testing suite with Aircrack-ng, Hashcat, and Reaver</p>
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Requires monitor mode WiFi adapter - Only test networks you own or have permission to test</span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attack" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="attack" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Attack</TabsTrigger>
            <TabsTrigger value="capture" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Capture</TabsTrigger>
            <TabsTrigger value="crack" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Crack</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attack" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target" className="text-gray-300">Target Network (BSSID/ESSID)</Label>
                  <Input
                    id="target"
                    type="text"
                    placeholder="00:11:22:33:44:55 or MyWiFi"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="interface" className="text-gray-300">WiFi Interface</Label>
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
              </div>
              
              <div>
                <Label htmlFor="attackType" className="text-gray-300">Attack Method</Label>
                <Select value={attackType} onValueChange={setAttackType}>
                  <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dictionary">Dictionary Attack</SelectItem>
                    <SelectItem value="brute">Brute Force</SelectItem>
                    <SelectItem value="hybrid">Hybrid Attack</SelectItem>
                    <SelectItem value="wps">WPS PIN Attack</SelectItem>
                    <SelectItem value="pmkid">PMKID Attack</SelectItem>
                    <SelectItem value="evil_twin">Evil Twin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">{getAttackDescription(attackType)}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wordlist" className="text-gray-300">Wordlist</Label>
                  <Select value={wordlist} onValueChange={setWordlist}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rockyou.txt">RockYou (14M passwords)</SelectItem>
                      <SelectItem value="common-wifi.txt">Common WiFi Passwords</SelectItem>
                      <SelectItem value="digits.txt">Digit Combinations</SelectItem>
                      <SelectItem value="custom">Custom Wordlist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="handshakeFile" className="text-gray-300">Handshake File (optional)</Label>
                  <Input
                    id="handshakeFile"
                    type="text"
                    placeholder="handshake.cap"
                    value={handshakeFile}
                    onChange={(e) => setHandshakeFile(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              {wordlist === "custom" && (
                <div>
                  <Label htmlFor="customWordlist" className="text-gray-300">Custom Wordlist</Label>
                  <Textarea
                    id="customWordlist"
                    placeholder="password123&#10;admin123&#10;password&#10;..."
                    value={customWordlist}
                    onChange={(e) => setCustomWordlist(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                    rows={4}
                  />
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  disabled={isRunning || !target.trim()}
                  className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cracking...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Attack
                    </>
                  )}
                </Button>
                <div className="text-sm text-gray-400">
                  {attackType === "wps" && "Requires WPS enabled"}
                  {attackType === "pmkid" && "No handshake required"}
                  {attackType === "evil_twin" && "Creates rogue access point"}
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="capture" className="space-y-4">
            <div className="p-4 bg-[hsl(215,25%,27%)] rounded-lg">
              <h3 className="text-white font-medium mb-2">Handshake Capture Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                  <Target className="h-4 w-4 mr-2" />
                  Start Airodump-ng
                </Button>
                <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                  <Zap className="h-4 w-4 mr-2" />
                  Deauth Attack
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="crack" className="space-y-4">
            <div className="p-4 bg-[hsl(215,25%,27%)] rounded-lg">
              <h3 className="text-white font-medium mb-2">Offline Cracking Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                  <Key className="h-4 w-4 mr-2" />
                  Aircrack-ng
                </Button>
                <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Hashcat
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {isRunning && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Attack Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-gray-400">
              {attackType === "dictionary" && "Testing passwords from wordlist..."}
              {attackType === "wps" && "Brute forcing WPS PIN..."}
              {attackType === "pmkid" && "Cracking PMKID hash..."}
            </div>
          </div>
        )}

        {results && (
          <div className="mt-4 space-y-3">
            {results.success ? (
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">Password Cracked!</span>
                </div>
                <div className="text-white font-mono bg-[hsl(222,47%,11%)] p-2 rounded">
                  {results.password}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Method: {results.method} • Time: {results.timeElapsed} • Network: {results.essid}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 font-medium">Password Not Found</div>
                <div className="text-sm text-gray-400 mt-1">
                  Tried {results.attempts} passwords in {results.timeElapsed}
                </div>
              </div>
            )}
            
            {results.networkInfo && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Network Information</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">ESSID: <span className="text-white">{results.networkInfo.essid}</span></div>
                  <div className="text-gray-400">BSSID: <span className="text-white font-mono">{results.networkInfo.bssid}</span></div>
                  <div className="text-gray-400">Channel: <span className="text-white">{results.networkInfo.channel}</span></div>
                  <div className="text-gray-400">Security: <span className="text-white">{results.networkInfo.security}</span></div>
                  <div className="text-gray-400">Signal: <span className="text-white">{results.networkInfo.signal} dBm</span></div>
                  <div className="text-gray-400">WPS: <span className="text-white">{results.networkInfo.wps ? 'Enabled' : 'Disabled'}</span></div>
                </div>
              </div>
            )}
            
            {results.handshakeInfo && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Handshake Information</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">File: <span className="text-white">{results.handshakeInfo.file}</span></div>
                  <div className="text-gray-400">Quality: <span className="text-white">{results.handshakeInfo.quality}</span></div>
                  <div className="text-gray-400">Captured: <span className="text-white">{results.handshakeInfo.timestamp}</span></div>
                  <div className="text-gray-400">Client: <span className="text-white font-mono">{results.handshakeInfo.client}</span></div>
                </div>
              </div>
            )}
            
            {results.attackStats && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Attack Statistics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Speed: <span className="text-white">{results.attackStats.speed}/s</span></div>
                  <div className="text-gray-400">Keyspace: <span className="text-white">{results.attackStats.keyspace}</span></div>
                  <div className="text-gray-400">Progress: <span className="text-white">{results.attackStats.progress}%</span></div>
                  <div className="text-gray-400">ETA: <span className="text-white">{results.attackStats.eta}</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}