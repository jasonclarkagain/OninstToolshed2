import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Flag, 
  Shield, 
  AlertTriangle,
  FileText,
  Link,
  Calendar,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  Plus,
  Edit,
  ExternalLink,
  Target,
  Zap,
  Globe,
  Hash,
  Mail,
  File
} from "lucide-react";

interface SearchFilters {
  type: string[];
  tags: string[];
  confidence: number;
  dateRange?: { start: string; end: string };
}

interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  origin: string;
  sophistication: string;
  confidence: number;
  targetSectors: string[];
}

interface ThreatCampaign {
  id: string;
  name: string;
  description: string;
  actor: string;
  status: string;
  confidence: number;
  impact: {
    severity: string;
    scope: string;
  };
}

interface VulnerabilityIntel {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: string;
  cvssScore: number;
  exploitability: {
    inTheWild: boolean;
    exploitMaturity: string;
  };
}

interface IoC {
  id: string;
  type: string;
  value: string;
  context: {
    confidence: number;
    tlp: string;
    threatActor?: string;
    campaign?: string;
  };
  status: string;
  tags: string[];
}

export default function ThreatIntelligenceKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showEntityDialog, setShowEntityDialog] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    tags: [],
    confidence: 0
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize knowledge base
  const { data: kbStats } = useQuery({
    queryKey: ["/api/intelligence/kb/stats"],
  });

  // Search knowledge base
  const searchKB = useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters: SearchFilters }) => {
      const response = await apiRequest('/api/intelligence/kb/search', {
        method: 'POST',
        body: JSON.stringify({ query, filters })
      });
      return response;
    }
  });

  // Generate intelligence report
  const generateReport = useMutation({
    mutationFn: async ({ entityId, entityType }: { entityId: string; entityType: string }) => {
      const response = await apiRequest('/api/intelligence/kb/report', {
        method: 'POST',
        body: JSON.stringify({ entityId, entityType })
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Intelligence report has been created successfully",
      });
    }
  });

  // Correlate indicators
  const correlateIndicators = useMutation({
    mutationFn: async (iocValue: string) => {
      const response = await apiRequest('/api/intelligence/kb/correlate', {
        method: 'POST',
        body: JSON.stringify({ iocValue })
      });
      return response;
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchKB.mutate({ query: searchQuery, filters });
  };

  const handleEntityClick = (entity: any, type: string) => {
    setSelectedEntity({ ...entity, _type: type });
    setShowEntityDialog(true);
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

  const getSophisticationColor = (sophistication: string) => {
    switch (sophistication?.toLowerCase()) {
      case 'advanced': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTLPColor = (tlp: string) => {
    switch (tlp?.toLowerCase()) {
      case 'red': return 'bg-red-600';
      case 'amber': return 'bg-orange-600';
      case 'green': return 'bg-green-600';
      case 'white': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getIoCIcon = (type: string) => {
    switch (type) {
      case 'domain': return Globe;
      case 'ip': return Target;
      case 'hash': return Hash;
      case 'email': return Mail;
      case 'file': return File;
      default: return Zap;
    }
  };

  const mockStats = {
    totalEntries: 1247,
    byType: {
      actors: 89,
      campaigns: 156,
      vulnerabilities: 423,
      iocs: 521,
      entries: 58
    },
    recentActivity: [
      { date: '2024-01-15', additions: 12, modifications: 5 },
      { date: '2024-01-14', additions: 8, modifications: 3 },
      { date: '2024-01-13', additions: 15, modifications: 7 }
    ],
    confidenceDistribution: { high: 892, medium: 278, low: 77 }
  };

  const displayStats = kbStats || mockStats;
  const searchResults = searchKB.data;

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Database className="h-5 w-5 mr-2 text-blue-400" />
          Threat Intelligence Knowledge Base
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-600 text-white">
              <BookOpen className="h-3 w-3 mr-1" />
              {displayStats.totalEntries.toLocaleString()} Entries
            </Badge>
            <Badge variant="outline" className="text-white">
              Live Data
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-[hsl(215,14%,34%)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="search" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="browse" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Eye className="h-4 w-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="correlate" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Link className="h-4 w-4 mr-2" />
              Correlate
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* Search Interface */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search threat actors, campaigns, IoCs, vulnerabilities..."
                  className="flex-1 bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searchKB.isPending}
                  className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                >
                  {searchKB.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Search Filters */}
              <div className="flex flex-wrap gap-2">
                <Select>
                  <SelectTrigger className="w-32 bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actor">Actors</SelectItem>
                    <SelectItem value="campaign">Campaigns</SelectItem>
                    <SelectItem value="vulnerability">Vulnerabilities</SelectItem>
                    <SelectItem value="ioc">IoCs</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-36 bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                    <SelectValue placeholder="Confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (60-80%)</SelectItem>
                    <SelectItem value="low">Low (&lt;60%)</SelectItem>
                  </SelectContent>
                </Select>

                <Badge variant="outline" className="cursor-pointer">
                  <Filter className="h-3 w-3 mr-1" />
                  More Filters
                </Badge>
              </div>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="space-y-4">
                <div className="text-white text-sm">
                  Found {searchResults.totalResults} results
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {/* Threat Actors */}
                    {searchResults.actors?.map((actor: ThreatActor) => (
                      <div 
                        key={actor.id} 
                        className="bg-[hsl(215,25%,27%)] rounded-lg p-4 cursor-pointer hover:bg-[hsl(215,25%,30%)] transition-colors"
                        onClick={() => handleEntityClick(actor, 'actor')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-red-400" />
                            <h4 className="text-white font-medium">{actor.name}</h4>
                            <Badge className={getSophisticationColor(actor.sophistication)}>
                              {actor.sophistication}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">
                            {(actor.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{actor.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Origin:</span>
                          <span className="text-xs text-white">{actor.origin}</span>
                          <span className="text-xs text-gray-400">Aliases:</span>
                          <span className="text-xs text-blue-300">{actor.aliases.join(', ')}</span>
                        </div>
                      </div>
                    ))}

                    {/* Campaigns */}
                    {searchResults.campaigns?.map((campaign: ThreatCampaign) => (
                      <div 
                        key={campaign.id} 
                        className="bg-[hsl(215,25%,27%)] rounded-lg p-4 cursor-pointer hover:bg-[hsl(215,25%,30%)] transition-colors"
                        onClick={() => handleEntityClick(campaign, 'campaign')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Flag className="h-4 w-4 text-orange-400" />
                            <h4 className="text-white font-medium">{campaign.name}</h4>
                            <Badge className={getSeverityColor(campaign.impact.severity)}>
                              {campaign.impact.severity}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm">{campaign.description}</p>
                      </div>
                    ))}

                    {/* Vulnerabilities */}
                    {searchResults.vulnerabilities?.map((vuln: VulnerabilityIntel) => (
                      <div 
                        key={vuln.id} 
                        className="bg-[hsl(215,25%,27%)] rounded-lg p-4 cursor-pointer hover:bg-[hsl(215,25%,30%)] transition-colors"
                        onClick={() => handleEntityClick(vuln, 'vulnerability')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-yellow-400" />
                            <h4 className="text-white font-medium">{vuln.cveId}</h4>
                            <Badge className={getSeverityColor(vuln.severity)}>
                              {vuln.severity}
                            </Badge>
                            {vuln.exploitability.inTheWild && (
                              <Badge className="bg-red-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                In the Wild
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            CVSS: {vuln.cvssScore}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{vuln.title}</p>
                      </div>
                    ))}

                    {/* IoCs */}
                    {searchResults.iocs?.map((ioc: IoC) => {
                      const IconComponent = getIoCIcon(ioc.type);
                      return (
                        <div 
                          key={ioc.id} 
                          className="bg-[hsl(215,25%,27%)] rounded-lg p-4 cursor-pointer hover:bg-[hsl(215,25%,30%)] transition-colors"
                          onClick={() => handleEntityClick(ioc, 'ioc')}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4 text-purple-400" />
                              <code className="text-blue-300 text-sm bg-[hsl(217,32%,17%)] px-2 py-1 rounded">
                                {ioc.value}
                              </code>
                              <Badge className={getTLPColor(ioc.context.tlp)}>
                                TLP:{ioc.context.tlp.toUpperCase()}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {ioc.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">Type:</span>
                              <span className="text-xs text-white">{ioc.type.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">Confidence:</span>
                              <span className="text-xs text-white">{(ioc.context.confidence * 100).toFixed(0)}%</span>
                            </div>
                            {ioc.context.threatActor && (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-400">Actor:</span>
                                <span className="text-xs text-orange-300">{ioc.context.threatActor}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* No Results */}
            {searchResults && searchResults.totalResults === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">No Results Found</h3>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}

            {/* Initial State */}
            {!searchResults && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Search the Knowledge Base</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Search across threat actors, campaigns, vulnerabilities, and indicators
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-md mx-auto">
                  {['APT29', 'CVE-2021-44228', 'SolarWinds', 'malware.exe'].map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery(example)}
                      className="text-white border-[hsl(215,14%,34%)] hover:bg-[hsl(215,25%,27%)]"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Browse Categories</h3>
              <p className="text-gray-400 text-sm mb-4">
                Explore the knowledge base by category
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Threat Actors', count: displayStats.byType.actors, icon: Users, color: 'text-red-400' },
                  { name: 'Campaigns', count: displayStats.byType.campaigns, icon: Flag, color: 'text-orange-400' },
                  { name: 'Vulnerabilities', count: displayStats.byType.vulnerabilities, icon: Shield, color: 'text-yellow-400' },
                  { name: 'Indicators', count: displayStats.byType.iocs, icon: Target, color: 'text-purple-400' },
                  { name: 'Knowledge', count: displayStats.byType.entries, icon: FileText, color: 'text-blue-400' },
                  { name: 'All Entries', count: displayStats.totalEntries, icon: Database, color: 'text-green-400' }
                ].map((category) => (
                  <div key={category.name} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 cursor-pointer hover:bg-[hsl(215,25%,30%)] transition-colors">
                    <category.icon className={`h-8 w-8 ${category.color} mx-auto mb-2`} />
                    <h4 className="text-white font-medium text-sm">{category.name}</h4>
                    <p className="text-gray-400 text-xs">{category.count} entries</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="correlate" className="space-y-4">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter IoC to correlate (IP, domain, hash, etc.)"
                  className="flex-1 bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                />
                <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                  <Link className="h-4 w-4 mr-2" />
                  Correlate
                </Button>
              </div>
              
              <div className="text-center py-8">
                <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Indicator Correlation</h3>
                <p className="text-gray-400 text-sm">
                  Find related indicators and threat context for any IoC
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Entries */}
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Total Entries</h4>
                  <Database className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{displayStats.totalEntries.toLocaleString()}</div>
                <p className="text-xs text-gray-400">Across all categories</p>
              </div>

              {/* Confidence Distribution */}
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Confidence</h4>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">High</span>
                    <span className="text-green-400">{displayStats.confidenceDistribution.high}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Medium</span>
                    <span className="text-yellow-400">{displayStats.confidenceDistribution.medium}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Low</span>
                    <span className="text-red-400">{displayStats.confidenceDistribution.low}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Recent Activity</h4>
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  {displayStats.recentActivity.map((day, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-400">{day.date}</span>
                      <span className="text-green-400">+{day.additions}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Category Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(displayStats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{type}</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(count / displayStats.totalEntries) * 100} 
                        className="w-20 h-2"
                      />
                      <span className="text-white text-sm w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Entity Details Dialog */}
        <Dialog open={showEntityDialog} onOpenChange={setShowEntityDialog}>
          <DialogContent className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedEntity?.name || selectedEntity?.cveId || selectedEntity?.value || 'Entity Details'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEntity && (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Basic Information</h5>
                    <div className="space-y-2 text-sm">
                      {selectedEntity._type === 'actor' && (
                        <>
                          <div><span className="text-gray-400">Name:</span> <span className="text-white">{selectedEntity.name}</span></div>
                          <div><span className="text-gray-400">Origin:</span> <span className="text-white">{selectedEntity.origin}</span></div>
                          <div><span className="text-gray-400">Sophistication:</span> <Badge className={getSophisticationColor(selectedEntity.sophistication)}>{selectedEntity.sophistication}</Badge></div>
                        </>
                      )}
                      {selectedEntity._type === 'vulnerability' && (
                        <>
                          <div><span className="text-gray-400">CVE ID:</span> <span className="text-white">{selectedEntity.cveId}</span></div>
                          <div><span className="text-gray-400">CVSS Score:</span> <span className="text-white">{selectedEntity.cvssScore}</span></div>
                          <div><span className="text-gray-400">Severity:</span> <Badge className={getSeverityColor(selectedEntity.severity)}>{selectedEntity.severity}</Badge></div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Actions</h5>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                        onClick={() => generateReport.mutate({ 
                          entityId: selectedEntity.id, 
                          entityType: selectedEntity._type 
                        })}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                      
                      {selectedEntity._type === 'ioc' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full text-white border-[hsl(215,14%,34%)]"
                          onClick={() => correlateIndicators.mutate(selectedEntity.value)}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Find Related IoCs
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full text-white border-[hsl(215,14%,34%)]"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h5 className="text-white font-medium mb-2">Description</h5>
                  <p className="text-gray-300 text-sm">
                    {selectedEntity.description || 'No description available'}
                  </p>
                </div>

                {/* Additional Fields based on type */}
                {selectedEntity._type === 'actor' && selectedEntity.aliases && (
                  <div>
                    <h5 className="text-white font-medium mb-2">Aliases</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedEntity.aliases.map((alias: string, index: number) => (
                        <Badge key={index} variant="outline">{alias}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntity._type === 'ioc' && selectedEntity.tags && (
                  <div>
                    <h5 className="text-white font-medium mb-2">Tags</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedEntity.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}