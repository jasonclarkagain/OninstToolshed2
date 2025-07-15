import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Zap, AlertTriangle, Upload, Download } from "lucide-react";

export default function PasswordCracker() {
  const [target, setTarget] = useState("");
  const [crackType, setCrackType] = useState("dictionary");
  const [wordlist, setWordlist] = useState("rockyou.txt");
  const [customRules, setCustomRules] = useState("");
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, crackType, wordlist, customRules }: { 
      target: string; 
      crackType: string; 
      wordlist: string; 
      customRules: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/password-crack", {
        target,
        crackType,
        wordlist,
        customRules,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      setProgress(100);
      toast({
        title: "Password Cracking Complete",
        description: data.result.success ? "Password found!" : "Password not cracked",
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
    setProgress(0);
    mutation.mutate({ target: target.trim(), crackType, wordlist, customRules });
  };

  const getCrackTypeDescription = (type: string) => {
    switch (type) {
      case "dictionary":
        return "Uses wordlist-based attack";
      case "brute":
        return "Exhaustive character combination";
      case "hybrid":
        return "Dictionary + rules/mutations";
      case "rainbow":
        return "Pre-computed hash tables";
      case "mask":
        return "Pattern-based attack";
      default:
        return "";
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Lock className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Advanced Password Cracker
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Multi-method password cracking with John the Ripper, Hashcat, and custom tools</p>
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Educational and authorized testing only - Ensure you have permission</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target" className="text-gray-300">Target Hash/File</Label>
              <Textarea
                id="target"
                placeholder="Hash: $1$salt$hash... or upload hash file"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                rows={3}
              />
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="crackType" className="text-gray-300">Attack Method</Label>
                <Select value={crackType} onValueChange={setCrackType}>
                  <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dictionary">Dictionary Attack</SelectItem>
                    <SelectItem value="brute">Brute Force</SelectItem>
                    <SelectItem value="hybrid">Hybrid Attack</SelectItem>
                    <SelectItem value="rainbow">Rainbow Tables</SelectItem>
                    <SelectItem value="mask">Mask Attack</SelectItem>
                    <SelectItem value="combinator">Combinator Attack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="wordlist" className="text-gray-300">Wordlist</Label>
                <Select value={wordlist} onValueChange={setWordlist}>
                  <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rockyou.txt">RockYou (14M passwords)</SelectItem>
                    <SelectItem value="common.txt">Common Passwords</SelectItem>
                    <SelectItem value="leaked.txt">Leaked Databases</SelectItem>
                    <SelectItem value="custom.txt">Custom Wordlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="customRules" className="text-gray-300">Custom Rules (John/Hashcat format)</Label>
            <Textarea
              id="customRules"
              placeholder="$0 $1 $2 $3 $4 $5 $6 $7 $8 $9 (append digits)&#10;^0 ^1 ^2 ^3 ^4 ^5 ^6 ^7 ^8 ^9 (prepend digits)&#10;c (capitalize first letter)"
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
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
                  Cracking...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Start Cracking
                </>
              )}
            </Button>
            <div className="text-sm text-gray-400">
              {getCrackTypeDescription(crackType)}
            </div>
          </div>
        </form>

        {mutation.isPending && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results && (
          <div className="mt-4 space-y-3">
            {results.success ? (
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">Password Cracked!</span>
                </div>
                <div className="text-white font-mono bg-[hsl(222,47%,11%)] p-2 rounded">
                  {results.password}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Method: {results.method} • Time: {results.timeElapsed} • Attempts: {results.attempts}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 font-medium">Password Not Found</div>
                <div className="text-sm text-gray-400 mt-1">
                  Tried {results.attempts} combinations in {results.timeElapsed}
                </div>
              </div>
            )}
            
            {results.hashInfo && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Hash Analysis</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Type: <span className="text-white">{results.hashInfo.type}</span></div>
                  <div className="text-gray-400">Length: <span className="text-white">{results.hashInfo.length}</span></div>
                  <div className="text-gray-400">Salt: <span className="text-white">{results.hashInfo.salted ? 'Yes' : 'No'}</span></div>
                  <div className="text-gray-400">Complexity: <span className="text-white">{results.hashInfo.complexity}</span></div>
                </div>
              </div>
            )}
            
            {results.statistics && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Cracking Statistics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Speed: <span className="text-white">{results.statistics.speed}/s</span></div>
                  <div className="text-gray-400">ETA: <span className="text-white">{results.statistics.eta}</span></div>
                  <div className="text-gray-400">Progress: <span className="text-white">{results.statistics.progress}%</span></div>
                  <div className="text-gray-400">Keyspace: <span className="text-white">{results.statistics.keyspace}</span></div>
                </div>
              </div>
            )}
            
            {results.recommendations && (
              <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Recommendations</div>
                <ul className="text-xs text-gray-300 space-y-1">
                  {results.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}