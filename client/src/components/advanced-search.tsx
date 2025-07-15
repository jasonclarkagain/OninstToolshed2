import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Bookmark, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Download,
  Eye,
  Star,
  Clock,
  Target,
  AlertTriangle
} from "lucide-react";

interface SearchFilter {
  toolType: string[];
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  severity: string[];
  tags: string[];
  bookmarked: boolean;
}

interface SearchResult {
  id: number;
  toolType: string;
  query: string;
  result: any;
  status: string;
  severity?: string;
  tags: string[];
  bookmarked: boolean;
  createdAt: string;
  relevanceScore: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter;
  createdAt: string;
  lastUsed: string;
}

export default function AdvancedSearch() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilter>({
    toolType: [],
    dateRange: { start: "", end: "" },
    status: [],
    severity: [],
    tags: [],
    bookmarked: false
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  // Initialize search data and perform search
  useEffect(() => {
    if (queries) {
      performSearch();
      initializeSavedSearches();
    }
  }, [queries, searchQuery, filters]);

  const performSearch = () => {
    if (!queries) return;

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      let results = queries.map((query: any) => ({
        ...query,
        severity: query.result?.vulnerabilities?.[0]?.severity || 'Low',
        tags: [`${query.toolType}`, 'osint', query.result?.success ? 'success' : 'failed'],
        bookmarked: Math.random() > 0.7,
        relevanceScore: Math.random() * 100
      }));

      // Apply text search
      if (searchQuery.trim()) {
        const searchTerms = searchQuery.toLowerCase().split(' ');
        results = results.filter((result: any) => 
          searchTerms.some(term => 
            result.query.toLowerCase().includes(term) ||
            result.toolType.toLowerCase().includes(term) ||
            JSON.stringify(result.result).toLowerCase().includes(term)
          )
        );
      }

      // Apply filters
      if (filters.toolType.length > 0) {
        results = results.filter((result: any) => 
          filters.toolType.includes(result.toolType)
        );
      }

      if (filters.status.length > 0) {
        results = results.filter((result: any) => 
          filters.status.includes(result.status)
        );
      }

      if (filters.severity.length > 0) {
        results = results.filter((result: any) => 
          filters.severity.includes(result.severity)
        );
      }

      if (filters.bookmarked) {
        results = results.filter((result: any) => result.bookmarked);
      }

      if (filters.dateRange.start) {
        results = results.filter((result: any) => 
          new Date(result.createdAt) >= new Date(filters.dateRange.start)
        );
      }

      if (filters.dateRange.end) {
        results = results.filter((result: any) => 
          new Date(result.createdAt) <= new Date(filters.dateRange.end)
        );
      }

      // Sort by relevance score
      results.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

      setSearchResults(results);
      setIsSearching(false);

      // Add to search history
      if (searchQuery.trim() && !searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
      }
    }, 500);
  };

  const initializeSavedSearches = () => {
    const searches: SavedSearch[] = [
      {
        id: '1',
        name: 'Critical Vulnerabilities',
        query: 'vulnerability critical',
        filters: {
          ...filters,
          severity: ['Critical', 'High'],
          toolType: ['vulnerability_scan']
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastUsed: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        name: 'Domain Enumeration Results',
        query: 'domain enumeration',
        filters: {
          ...filters,
          toolType: ['domain_enumeration'],
          status: ['completed']
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        lastUsed: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '3',
        name: 'Recent Network Scans',
        query: 'network scan',
        filters: {
          ...filters,
          toolType: ['network_scan', 'port_scan'],
          dateRange: {
            start: new Date(Date.now() - 604800000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        },
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        lastUsed: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    setSavedSearches(searches);
  };

  const saveCurrentSearch = () => {
    if (!searchQuery.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchQuery,
      query: searchQuery,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    setSavedSearches(prev => [newSearch, ...prev]);
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query);
    setFilters(search.filters);
    
    // Update last used
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === search.id 
          ? { ...s, lastUsed: new Date().toISOString() }
          : s
      )
    );
  };

  const toggleBookmark = (resultId: number) => {
    setSearchResults(prev => 
      prev.map(result => 
        result.id === resultId 
          ? { ...result, bookmarked: !result.bookmarked }
          : result
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const availableToolTypes = [
    'domain_enumeration', 'ip_analysis', 'vulnerability_scan', 
    'network_scan', 'port_scan', 'whois_lookup', 'email_validation',
    'metasploit', 'social_engineering', 'osint_framework', 'kali_vm'
  ];

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Search className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Advanced Search & Filtering
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-blue-600 text-white">
            {searchResults.length} Results
          </Badge>
          <Badge className="bg-green-600 text-white">
            {savedSearches.length} Saved Searches
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="search" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="filters" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="results" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search across all OSINT data... (e.g., vulnerability, domain, IP address)"
                      className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  <Button 
                    onClick={performSearch}
                    disabled={isSearching}
                    className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                  <Button 
                    onClick={saveCurrentSearch}
                    variant="outline" 
                    className="border-[hsl(215,14%,34%)] text-white"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>

                {searchHistory.length > 0 && (
                  <div>
                    <h5 className="text-gray-300 text-sm mb-2">Recent Searches</h5>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((query, idx) => (
                        <Badge 
                          key={idx}
                          variant="outline" 
                          className="cursor-pointer hover:bg-[hsl(215,25%,27%)]"
                          onClick={() => setSearchQuery(query)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {query}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-gray-300 text-sm mb-2">Quick Search Suggestions</h5>
                  <div className="flex flex-wrap gap-2">
                    {['vulnerability critical', 'domain enumeration', 'network scan', 'metasploit exploit', 'kali linux'].map((suggestion, idx) => (
                      <Badge 
                        key={idx}
                        variant="secondary" 
                        className="cursor-pointer hover:bg-[hsl(207,90%,54%)]"
                        onClick={() => setSearchQuery(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Search Tips</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div>• Use quotes for exact phrases: "critical vulnerability"</div>
                <div>• Use AND/OR operators: vulnerability AND critical</div>
                <div>• Search by tool type: tool:vulnerability_scan</div>
                <div>• Search by severity: severity:high</div>
                <div>• Search by date: after:2024-01-01</div>
                <div>• Combine filters: critical AND tool:vulnerability_scan</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Tool Types</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableToolTypes.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox 
                        checked={filters.toolType.includes(tool)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              toolType: [...prev.toolType, tool]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              toolType: prev.toolType.filter(t => t !== tool)
                            }));
                          }
                        }}
                      />
                      <label className="text-gray-300 text-sm">
                        {tool.replace('_', ' ').toUpperCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Status</h4>
                  <div className="space-y-2">
                    {['completed', 'pending', 'failed', 'running'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={filters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({
                                ...prev,
                                status: [...prev.status, status]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                status: prev.status.filter(s => s !== status)
                              }));
                            }
                          }}
                        />
                        <label className="text-gray-300 text-sm capitalize">{status}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Severity</h4>
                  <div className="space-y-2">
                    {['Critical', 'High', 'Medium', 'Low'].map((severity) => (
                      <div key={severity} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={filters.severity.includes(severity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({
                                ...prev,
                                severity: [...prev.severity, severity]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                severity: prev.severity.filter(s => s !== severity)
                              }));
                            }
                          }}
                        />
                        <label className="text-gray-300 text-sm">{severity}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Date Range</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Start Date</label>
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">End Date</label>
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={filters.bookmarked}
                      onCheckedChange={(checked) => setFilters(prev => ({
                        ...prev,
                        bookmarked: !!checked
                      }))}
                    />
                    <label className="text-gray-300 text-sm">Bookmarked only</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={performSearch}
                className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
              >
                Apply Filters
              </Button>
              <Button 
                onClick={() => setFilters({
                  toolType: [],
                  dateRange: { start: "", end: "" },
                  status: [],
                  severity: [],
                  tags: [],
                  bookmarked: false
                })}
                variant="outline" 
                className="border-[hsl(215,14%,34%)] text-white"
              >
                Clear All
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Saved Searches</h4>
              <Button 
                onClick={saveCurrentSearch}
                size="sm" 
                className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
              >
                Save Current Search
              </Button>
            </div>

            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div key={search.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="text-white font-medium">{search.name}</h5>
                        <Badge variant="outline">
                          {search.filters.toolType.length} filters
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">"{search.query}"</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Created: {new Date(search.createdAt).toLocaleDateString()}</span>
                        <span>Last used: {new Date(search.lastUsed).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => loadSavedSearch(search)}
                        className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                      >
                        Load
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-[hsl(215,14%,34%)] text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">
                Search Results ({searchResults.length})
              </h4>
              <div className="flex space-x-2">
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-40 bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort by Relevance</SelectItem>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="severity">Sort by Severity</SelectItem>
                    <SelectItem value="tool">Sort by Tool</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div key={result.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="text-white font-medium">{result.query}</h5>
                        <Badge variant="outline">
                          {result.toolType.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getSeverityColor(result.severity)}>
                          {result.severity}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {Math.round(result.relevanceScore)}% match
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-gray-300 text-sm mb-2">
                        {result.result?.description || 'No description available'}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(result.createdAt).toLocaleString()}
                        </span>
                        <span>Status: {result.status}</span>
                        {result.result?.vulnerabilities && (
                          <span>
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {result.result.vulnerabilities.length} vulnerabilities
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => toggleBookmark(result.id)}
                        className={`border-[hsl(215,14%,34%)] ${result.bookmarked ? 'text-yellow-400' : 'text-white'}`}
                      >
                        <Star className={`h-4 w-4 ${result.bookmarked ? 'fill-current' : ''}`} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-[hsl(215,14%,34%)] text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-[hsl(215,14%,34%)] text-white"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {searchResults.length === 0 && !isSearching && (
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">No results found</p>
                  <p className="text-gray-400">Try adjusting your search query or filters</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}