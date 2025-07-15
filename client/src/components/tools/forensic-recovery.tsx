import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Search, AlertTriangle, Download } from "lucide-react";

export default function ForensicRecovery() {
  const [target, setTarget] = useState("");
  const [recoveryType, setRecoveryType] = useState("file");
  const [fileTypes, setFileTypes] = useState("jpg,png,pdf,doc,txt");
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, recoveryType, fileTypes, keywords }: { 
      target: string; 
      recoveryType: string; 
      fileTypes: string; 
      keywords: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/forensic-recovery", {
        target,
        recoveryType,
        fileTypes,
        keywords,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "Forensic Recovery Complete",
        description: `Found ${data.result.recoveredFiles?.length || 0} potential recoverable items`,
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
    mutation.mutate({ target: target.trim(), recoveryType, fileTypes, keywords });
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <HardDrive className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Forensic Data Recovery
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Advanced data recovery and forensic analysis tools</p>
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Educational purposes only - Follow all applicable laws and regulations</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target" className="text-gray-300">Target Path/Device</Label>
              <Input
                id="target"
                type="text"
                placeholder="/dev/sda1 or C:\Users\..."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="recoveryType" className="text-gray-300">Recovery Type</Label>
              <Select value={recoveryType} onValueChange={setRecoveryType}>
                <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">File Recovery</SelectItem>
                  <SelectItem value="partition">Partition Recovery</SelectItem>
                  <SelectItem value="metadata">Metadata Analysis</SelectItem>
                  <SelectItem value="timeline">Timeline Analysis</SelectItem>
                  <SelectItem value="registry">Registry Analysis</SelectItem>
                  <SelectItem value="memory">Memory Dump Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="fileTypes" className="text-gray-300">File Types (comma-separated)</Label>
            <Input
              id="fileTypes"
              type="text"
              placeholder="jpg,png,pdf,doc,txt,zip"
              value={fileTypes}
              onChange={(e) => setFileTypes(e.target.value)}
              className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
            />
          </div>
          
          <div>
            <Label htmlFor="keywords" className="text-gray-300">Search Keywords (optional)</Label>
            <Textarea
              id="keywords"
              placeholder="password, confidential, secret..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              rows={2}
            />
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Start Recovery
                </>
              )}
            </Button>
            <span className="text-sm text-gray-400">
              Estimated time: 5-30 minutes
            </span>
          </div>
        </form>

        {results && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Recovery Results</span>
                <span className="text-xs text-gray-400">
                  Found: {results.recoveredFiles?.length || 0} items
                </span>
              </div>
              
              {results.recoveredFiles && results.recoveredFiles.length > 0 ? (
                <div className="space-y-2">
                  {results.recoveredFiles.slice(0, 10).map((file: any, index: number) => (
                    <div key={index} className="p-2 bg-[hsl(222,47%,11%)] rounded text-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-white font-mono text-xs truncate">{file.path}</div>
                          <div className="text-gray-400 text-xs mt-1">
                            {file.type} • {file.size} • {file.dateModified}
                          </div>
                          {file.confidence && (
                            <div className="text-blue-400 text-xs">
                              Confidence: {file.confidence}%
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No recoverable files found</div>
              )}
            </div>
            
            {results.statistics && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Recovery Statistics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Sectors Scanned: <span className="text-white">{results.statistics.sectorsScanned}</span></div>
                  <div className="text-gray-400">Files Recovered: <span className="text-white">{results.statistics.filesRecovered}</span></div>
                  <div className="text-gray-400">Integrity Check: <span className="text-green-400">{results.statistics.integrityCheck}</span></div>
                  <div className="text-gray-400">Scan Time: <span className="text-white">{results.statistics.scanTime}</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}