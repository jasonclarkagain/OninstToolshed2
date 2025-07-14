import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Search } from "lucide-react";

export default function IpAnalysis() {
  const [ip, setIp] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ ip }: { ip: string }) => {
      const response = await apiRequest("POST", "/api/osint/ip-analysis", { ip });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "IP Analysis Complete",
        description: `Analysis completed for ${ip}`,
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
    if (!ip.trim()) return;
    mutation.mutate({ ip: ip.trim() });
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            IP Address Analysis
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Analyze IP addresses for geolocation, ASN, and reputation data</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="ip" className="text-gray-300">IP Address</Label>
              <Input
                id="ip"
                type="text"
                placeholder="8.8.8.8"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={mutation.isPending || !ip.trim()}
                className="w-full bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
              >
                {mutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
