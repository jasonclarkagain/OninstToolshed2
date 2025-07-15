import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Phone, Mail, MapPin, Camera, User, Globe, FileImage, Clock } from "lucide-react";

export default function ReverseSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("phone");
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const searchTypes = [
    { value: "phone", label: "Phone Number", icon: Phone, placeholder: "+1-555-123-4567" },
    { value: "email", label: "Email Address", icon: Mail, placeholder: "example@domain.com" },
    { value: "address", label: "Address", icon: MapPin, placeholder: "123 Main St, City, State" },
    { value: "image", label: "Image Search", icon: Camera, placeholder: "Image URL or upload" },
    { value: "ip", label: "IP Address", icon: Globe, placeholder: "192.168.1.1" },
    { value: "username", label: "Username", icon: User, placeholder: "john_doe" },
    { value: "license", label: "License Plate", icon: FileImage, placeholder: "ABC-123" }
  ];

  const mutation = useMutation({
    mutationFn: async ({ query, type }: { query: string; type: string }) => {
      const response = await apiRequest("POST", "/api/osint/reverse-search", {
        query: query.trim(),
        searchType: type,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      setProgress(100);
      toast({
        title: "Reverse Search Complete",
        description: `Found ${data.result?.totalResults || 0} results`,
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
    if (!searchQuery.trim()) return;
    setProgress(0);
    mutation.mutate({ query: searchQuery.trim(), type: searchType });
  };

  const currentSearchType = searchTypes.find(t => t.value === searchType);
  const Icon = currentSearchType?.icon || Search;

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Search className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Reverse Search Engine
        </CardTitle>
        <p className="text-gray-400 text-sm">Comprehensive reverse lookup for phone, email, address, images, and more</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="search" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Search</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="searchType" className="text-gray-300">Search Type</Label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {searchTypes.map((type) => {
                        const TypeIcon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="searchQuery" className="text-gray-300">Search Query</Label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="searchQuery"
                      type="text"
                      placeholder={currentSearchType?.placeholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400 pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={mutation.isPending || !searchQuery.trim()}
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
                      Search
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            {/* Search Progress */}
            {mutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Searching databases...</span>
                  <span className="text-white">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {results && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Total Results</div>
                    <div className="text-xl font-bold text-white">{results.totalResults || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Data Sources</div>
                    <div className="text-xl font-bold text-white">{results.sources?.length || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-xl font-bold text-green-400">{results.confidence || 0}%</div>
                  </div>
                </div>
                
                {/* Main Results */}
                {results.primaryResult && (
                  <Card className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Primary Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(results.primaryResult).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="text-white font-mono">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Additional Results */}
                {results.additionalResults && results.additionalResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Additional Results</h3>
                    {results.additionalResults.map((result: any, index: number) => (
                      <Card key={index} className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-[hsl(207,90%,54%)]">{result.source}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.confidence}% confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(result.data).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="text-gray-400 capitalize">{key}: </span>
                                <span className="text-white">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Social Media Results */}
                {results.socialMedia && results.socialMedia.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Social Media Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.socialMedia.map((profile: any, index: number) => (
                        <div key={index} className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-medium">{profile.platform}</div>
                            <Badge className={profile.verified ? 'bg-green-600' : 'bg-gray-600'}>
                              {profile.verified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-400">Username: <span className="text-white">{profile.username}</span></div>
                            <div className="text-sm text-gray-400">Followers: <span className="text-white">{profile.followers || 'N/A'}</span></div>
                            <div className="text-sm text-gray-400">Last Active: <span className="text-white">{profile.lastActive || 'Unknown'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Timeline */}
                {results.timeline && results.timeline.length > 0 && (
                  <Card className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.timeline.map((event: any, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-[hsl(207,90%,54%)] rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="text-white text-sm">{event.description}</div>
                              <div className="text-xs text-gray-400">{event.date} • {event.source}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Data Sources */}
                {results.sources && results.sources.length > 0 && (
                  <Card className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                    <CardHeader>
                      <CardTitle className="text-white">Data Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {results.sources.map((source: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {!results && !mutation.isPending && (
              <div className="text-center py-8">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No results yet. Perform a search to see results here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}