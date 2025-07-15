import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Target, Zap, Shield, AlertTriangle, Code } from "lucide-react";

export default function MetasploitInterface() {
  const [target, setTarget] = useState("");
  const [exploitModule, setExploitModule] = useState("");
  const [payload, setPayload] = useState("");
  const [options, setOptions] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, exploitModule, payload, options, sessionId }: { 
      target: string; 
      exploitModule: string; 
      payload: string; 
      options: string; 
      sessionId: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/metasploit", {
        target,
        exploitModule,
        payload,
        options,
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "Metasploit Operation Complete",
        description: data.result.success ? "Exploit executed successfully" : "Operation completed",
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
    mutation.mutate({ target: target.trim(), exploitModule, payload, options, sessionId });
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
        <CardTitle className="flex items-center text-white">
          <Terminal className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Metasploit Framework Interface
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="exploit" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="exploit" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">Exploit</TabsTrigger>
            <TabsTrigger value="auxiliary" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">Auxiliary</TabsTrigger>
            <TabsTrigger value="post" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">Post-Exploit</TabsTrigger>
            <TabsTrigger value="sessions" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="exploit" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target" className="text-white">Target Host/Network</Label>
                  <Input
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="192.168.1.100 or example.com"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="exploit" className="text-white">Exploit Module</Label>
                  <Select value={exploitModule} onValueChange={setExploitModule}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue placeholder="Select exploit module" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                      <SelectItem value="windows/smb/ms17_010_eternalblue">MS17-010 EternalBlue</SelectItem>
                      <SelectItem value="windows/smb/ms08_067_netapi">MS08-067 NetAPI</SelectItem>
                      <SelectItem value="linux/http/apache_struts_rce">Apache Struts RCE</SelectItem>
                      <SelectItem value="multi/http/jenkins_script_console">Jenkins Script Console</SelectItem>
                      <SelectItem value="windows/rdp/cve_2019_0708_bluekeep">BlueKeep RDP</SelectItem>
                      <SelectItem value="linux/ssh/libssh_auth_bypass">LibSSH Auth Bypass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payload" className="text-white">Payload</Label>
                  <Select value={payload} onValueChange={setPayload}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue placeholder="Select payload" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                      <SelectItem value="windows/meterpreter/reverse_tcp">Windows Meterpreter Reverse TCP</SelectItem>
                      <SelectItem value="linux/x64/meterpreter/reverse_tcp">Linux Meterpreter Reverse TCP</SelectItem>
                      <SelectItem value="windows/shell/reverse_tcp">Windows Shell Reverse TCP</SelectItem>
                      <SelectItem value="cmd/unix/reverse">Unix Command Shell</SelectItem>
                      <SelectItem value="generic/shell_reverse_tcp">Generic Shell Reverse TCP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sessionId" className="text-white">Session ID (Optional)</Label>
                  <Input
                    id="sessionId"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Active session ID"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="options" className="text-white">Additional Options</Label>
                <Textarea
                  id="options"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  placeholder="LHOST=192.168.1.50&#10;LPORT=4444&#10;RHOSTS=192.168.1.100"
                  className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white min-h-[80px]"
                />
              </div>

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
              >
                {mutation.isPending ? "Executing..." : "Execute Exploit"}
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="auxiliary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                <Target className="h-4 w-4 mr-2" />
                Port Scanner
              </Button>
              <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                <Shield className="h-4 w-4 mr-2" />
                SMB Scanner
              </Button>
              <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                <Code className="h-4 w-4 mr-2" />
                HTTP Directory
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="post" className="space-y-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-4">Post-Exploitation Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Windows Modules</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• windows/gather/hashdump</li>
                    <li>• windows/gather/credentials/winscp</li>
                    <li>• windows/manage/enable_rdp</li>
                    <li>• windows/gather/enum_logged_on_users</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Linux Modules</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• linux/gather/hashdump</li>
                    <li>• linux/gather/enum_system</li>
                    <li>• linux/gather/enum_network</li>
                    <li>• multi/gather/ssh_creds</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
              <div className="text-gray-400 text-center py-8">
                No active sessions
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {results && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Exploitation Results</h3>
            
            {results.success && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">✓ Exploit Successful</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Session ID: {results.sessionId}</p>
                  <p>Shell Type: {results.shellType}</p>
                  <p>Access Level: {results.accessLevel}</p>
                </div>
              </div>
            )}

            {results.vulnerabilities && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Discovered Vulnerabilities</h4>
                {results.vulnerabilities.map((vuln: any, index: number) => (
                  <div key={index} className="bg-[hsl(215,25%,27%)] rounded-lg p-3 border border-[hsl(215,14%,34%)]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">{vuln.cve}</h5>
                      <Badge className={`${getSeverityColor(vuln.severity)} text-white`}>
                        {vuln.severity}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{vuln.description}</p>
                    <div className="text-xs text-gray-400">
                      CVSS Score: {vuln.cvssScore} | Exploitable: {vuln.exploitable ? "Yes" : "No"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.output && (
              <div className="bg-black rounded-lg p-4 font-mono text-sm">
                <pre className="text-green-400 whitespace-pre-wrap">{results.output}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}