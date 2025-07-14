import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Fingerprint, Search } from "lucide-react";

export default function HashAnalyzer() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ hash }: { hash: string }) => {
      const response = await apiRequest("POST", "/api/osint/hash-analysis", { hash });
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
      toast({
        title: "Hash Analysis Complete",
        description: `Identified hash type: ${data.result.detectedType}`,
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
    if (!hash.trim()) return;
    mutation.mutate({ hash: hash.trim() });
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Fingerprint className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Hash Identifier & Decoder
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Identify hash types and attempt decoding</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hash" className="text-gray-300">Hash Input</Label>
            <Textarea
              id="hash"
              placeholder="Enter hash here..."
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              type="submit"
              disabled={mutation.isPending || !hash.trim()}
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
                  Analyze Hash
                </>
              )}
            </Button>
            
            {result && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Detected:</span>
                <Badge variant="outline" className="border-[hsl(207,90%,54%)] text-[hsl(207,90%,54%)]">
                  {result.detectedType} ({result.length} chars)
                </Badge>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
