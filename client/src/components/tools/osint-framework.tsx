import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Network, ExternalLink, Search, Globe } from "lucide-react";

export default function OsintFramework() {
  const [target, setTarget] = useState("");
  const [category, setCategory] = useState("people");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, category }: { target: string; category: string }) => {
      const response = await apiRequest("POST", "/api/osint/osint-framework", {
        target,
        category,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "OSINT Framework Search Complete",
        description: `Found ${data.result.sources?.length || 0} relevant sources`,
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
    mutation.mutate({ target: target.trim(), category });
  };

  const frameworkCategories = [
    { value: "people", label: "People Investigation" },
    { value: "email", label: "Email Addresses" },
    { value: "usernames", label: "Usernames" },
    { value: "websites", label: "Websites & Domains" },
    { value: "social", label: "Social Networks" },
    { value: "phone", label: "Phone Numbers" },
    { value: "images", label: "Image Analysis" },
    { value: "documents", label: "Document Analysis" },
    { value: "geolocation", label: "Geolocation" },
    { value: "cryptocurrency", label: "Cryptocurrency" },
  ];

  const openFrameworkSite = () => {
    window.open('https://osintframework.com/', '_blank');
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Network className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            OSINT Framework Integration
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={openFrameworkSite}
            className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Framework
          </Button>
        </div>
        <p className="text-gray-400 text-sm">Access curated OSINT resources and tools from the OSINT Framework</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target" className="text-gray-300">Investigation Target</Label>
              <Input
                id="target"
                type="text"
                placeholder="username, email, domain, etc."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-gray-300">Investigation Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frameworkCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Resources
                </>
              )}
            </Button>
            <span className="text-sm text-gray-400">
              Powered by OSINT Framework
            </span>
          </div>
        </form>

        {results && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Recommended Resources</span>
                <span className="text-xs text-gray-400">
                  {results.sources?.length || 0} tools found
                </span>
              </div>
              
              {results.sources && results.sources.length > 0 ? (
                <div className="space-y-2">
                  {results.sources.map((source: any, index: number) => (
                    <div key={index} className="p-2 bg-[hsl(222,47%,11%)] rounded text-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-white font-medium">{source.name}</div>
                          <div className="text-gray-400 text-xs mt-1">{source.description}</div>
                          <div className="text-blue-400 text-xs mt-1">
                            Category: {source.category}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(source.url, '_blank')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Globe className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No specific resources found for this target</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}