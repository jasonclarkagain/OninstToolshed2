import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Table, Play } from "lucide-react";

export default function DomainEnumeration() {
  const [domain, setDomain] = useState("");
  const [scanType, setScanType] = useState("full");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ domain, scanType }: { domain: string; scanType: string }) => {
      const response = await apiRequest("POST", "/api/osint/domain-enumeration", {
        domain,
        scanType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Domain Enumeration Complete",
        description: `Found ${data.result.subdomains.length} subdomains for ${domain}`,
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
    if (!domain.trim()) return;
    mutation.mutate({ domain: domain.trim(), scanType });
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Table className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Domain Enumeration
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Discover subdomains and analyze domain infrastructure</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain" className="text-gray-300">Target Domain</Label>
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
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
                  <SelectItem value="full">Full Scan</SelectItem>
                  <SelectItem value="quick">Quick Scan</SelectItem>
                  <SelectItem value="passive">Passive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              type="submit"
              disabled={mutation.isPending || !domain.trim()}
              className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Enumeration
                </>
              )}
            </Button>
            <span className="text-sm text-gray-400">
              Estimated time: {scanType === 'full' ? '2-5 minutes' : '30 seconds'}
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
