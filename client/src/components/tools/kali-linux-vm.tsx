import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Monitor, Cpu, HardDrive, Zap, Shield } from "lucide-react";

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

export default function KaliLinuxVM() {
  const [currentCommand, setCurrentCommand] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    {
      type: 'system',
      content: '┌──(kali㉿kali)-[~]',
      timestamp: new Date()
    }
  ]);
  const [currentDirectory, setCurrentDirectory] = useState("~");
  const [isRunning, setIsRunning] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ command, directory }: { command: string; directory: string }) => {
      const response = await apiRequest("POST", "/api/osint/kali-vm", {
        command,
        directory,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const output = data.result.output;
      const newLines: TerminalLine[] = output.split('\n').map((line: string) => ({
        type: data.result.success ? 'output' : 'error',
        content: line,
        timestamp: new Date()
      }));
      
      setTerminalHistory(prev => [...prev, ...newLines]);
      setCurrentDirectory(data.result.currentDirectory || currentDirectory);
      
      queryClient.invalidateQueries({ queryKey: ["/api/osint/queries"] });
    },
    onError: (error) => {
      setTerminalHistory(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }]);
    },
  });

  const executeCommand = () => {
    if (!currentCommand.trim()) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev, currentCommand]);
    setHistoryIndex(-1);
    
    // Add command to terminal
    setTerminalHistory(prev => [...prev, {
      type: 'command',
      content: `┌──(kali㉿kali)-[${currentDirectory}]\n└─$ ${currentCommand}`,
      timestamp: new Date()
    }]);

    // Execute command
    mutation.mutate({ command: currentCommand.trim(), directory: currentDirectory });
    setCurrentCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand("");
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  useEffect(() => {
    if (inputRef.current && isRunning) {
      inputRef.current.focus();
    }
  }, [isRunning]);

  const getLineColor = (type: string) => {
    switch (type) {
      case 'command': return 'text-green-400';
      case 'output': return 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'system': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const quickCommands = [
    { label: "System Info", cmd: "uname -a" },
    { label: "Network Scan", cmd: "nmap -sn 192.168.1.0/24" },
    { label: "Metasploit", cmd: "msfconsole" },
    { label: "WiFi Tools", cmd: "aircrack-ng --help" },
    { label: "Web Scanner", cmd: "nikto -h localhost" },
    { label: "Password Crack", cmd: "john --help" },
    { label: "SQL Injection", cmd: "sqlmap --help" },
    { label: "Burp Suite", cmd: "burpsuite" },
  ];

  const systemStats = {
    cpu: "Intel Core i7-12700K (8 cores)",
    memory: "16 GB DDR4",
    storage: "512 GB NVMe SSD",
    network: "Gigabit Ethernet + WiFi 6",
    os: "Kali Linux 2024.1",
    kernel: "6.1.0-kali9-amd64"
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Monitor className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Kali Linux Virtual Machine
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm">
          <Badge className="bg-green-600 text-white">
            {isRunning ? "Running" : "Stopped"}
          </Badge>
          <span className="text-gray-400">IP: 192.168.1.100</span>
          <span className="text-gray-400">RAM: 16GB</span>
          <span className="text-gray-400">CPU: 8 cores</span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="terminal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="terminal" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Terminal className="h-4 w-4 mr-2" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="system" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Cpu className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Shield className="h-4 w-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="network" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <HardDrive className="h-4 w-4 mr-2" />
              Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terminal" className="space-y-4">
            <div className="bg-black rounded-lg p-4 font-mono text-sm min-h-[400px] max-h-[600px] overflow-y-auto"
                 ref={terminalRef}>
              <div className="text-green-400 mb-4">
                <pre>{`
██╗  ██╗ █████╗ ██╗     ██╗    ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗
██║ ██╔╝██╔══██╗██║     ██║    ██║     ██║████╗  ██║██║   ██║╚██╗██╔╝
█████╔╝ ███████║██║     ██║    ██║     ██║██╔██╗ ██║██║   ██║ ╚███╔╝ 
██╔═██╗ ██╔══██║██║     ██║    ██║     ██║██║╚██╗██║██║   ██║ ██╔██╗ 
██║  ██╗██║  ██║███████╗██║    ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝
                `}</pre>
                <div className="text-blue-400 text-xs mt-2">
                  Kali Linux 2024.1 | Kernel 6.1.0-kali9-amd64 | VM Ready
                </div>
              </div>
              
              {terminalHistory.map((line, index) => (
                <div key={index} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
                  {line.content}
                </div>
              ))}
              
              <div className="flex items-center mt-2">
                <span className="text-green-400">┌──(kali㉿kali)-[{currentDirectory}]</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400">└─$ </span>
                <Input
                  ref={inputRef}
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none text-white ml-1 p-0 focus:ring-0"
                  placeholder={isRunning ? "Enter command..." : "VM stopped"}
                  disabled={!isRunning || mutation.isPending}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickCommands.map((cmd, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentCommand(cmd.cmd)}
                  className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)] text-xs"
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Cpu className="h-4 w-4 mr-2" />
                  System Specifications
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">CPU:</span>
                    <span className="text-white">{systemStats.cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory:</span>
                    <span className="text-white">{systemStats.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage:</span>
                    <span className="text-white">{systemStats.storage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">OS:</span>
                    <span className="text-white">{systemStats.os}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Monitor className="h-4 w-4 mr-2" />
                  Resource Usage
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">CPU Usage</span>
                      <span className="text-white">23%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Memory</span>
                      <span className="text-white">8.2GB / 16GB</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '51%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Disk</span>
                      <span className="text-white">156GB / 512GB</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Exploitation Tools</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Metasploit Framework</li>
                  <li>• Social Engineering Toolkit</li>
                  <li>• BeEF Framework</li>
                  <li>• Exploitdb</li>
                  <li>• Searchsploit</li>
                </ul>
              </div>
              
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Network Tools</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Nmap</li>
                  <li>• Masscan</li>
                  <li>• Netcat</li>
                  <li>• Wireshark</li>
                  <li>• Aircrack-ng</li>
                </ul>
              </div>
              
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Web Application</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Burp Suite</li>
                  <li>• OWASP ZAP</li>
                  <li>• SQLmap</li>
                  <li>• Nikto</li>
                  <li>• Gobuster</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Network Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Interface:</span>
                  <div className="text-white">eth0 (NAT)</div>
                  <span className="text-gray-400">IP Address:</span>
                  <div className="text-white">192.168.1.100/24</div>
                  <span className="text-gray-400">Gateway:</span>
                  <div className="text-white">192.168.1.1</div>
                </div>
                <div>
                  <span className="text-gray-400">DNS:</span>
                  <div className="text-white">8.8.8.8, 8.8.4.4</div>
                  <span className="text-gray-400">MAC:</span>
                  <div className="text-white">08:00:27:ab:cd:ef</div>
                  <span className="text-gray-400">Status:</span>
                  <div className="text-green-400">Connected</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}