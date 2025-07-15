import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Radar, Search, AlertTriangle } from "lucide-react";

export default function ShodanSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("host");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ query, searchType }: { query: string; searchType: string }) => {
      const response = await apiRequest("POST", "/api/osint/shodan-search", {
        query,
        searchType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "Shodan Search Complete",
        description: `Found ${data.result.total || 0} results for "${query}"`,
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
    if (!query.trim()) return;
    mutation.mutate({ query: query.trim(), searchType });
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Radar className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Shodan Search
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Search for internet-connected devices and services</p>
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Requires Shodan API key for full functionality</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="query" className="text-gray-300">Search Query</Label>
              <Input
                id="query"
                type="text"
                placeholder="apache country:US"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="searchType" className="text-gray-300">Search Type</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="host">Host Search</SelectItem>
                  <SelectItem value="facets">Facet Analysis</SelectItem>
                  <SelectItem value="ports">Port Statistics</SelectItem>
                  <SelectItem value="services">Service Discovery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              type="submit"
              disabled={mutation.isPending || !query.trim()}
              className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Shodan
                </>
              )}
            </Button>
            <span className="text-sm text-gray-400">
              Powered by Shodan.io
            </span>
          </div>
        </form>

        {results && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Search Results</span>
                <span className="text-xs text-gray-400">Total: {results.total || 0}</span>
              </div>
              
              {results.matches && results.matches.length > 0 ? (
                <div className="space-y-2">
                  {results.matches.slice(0, 5).map((match: any, index: number) => (
                    <div key={index} className="p-2 bg-[hsl(222,47%,11%)] rounded text-sm">
                      <div className="text-white font-mono">{match.ip_str}:{match.port}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {match.org} • {match.location?.country_name || 'Unknown'}
                      </div>
                      {match.product && (
                        <div className="text-blue-400 text-xs">{match.product}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No results found</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}