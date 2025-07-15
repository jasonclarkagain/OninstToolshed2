import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Globe, Shield, Database, Users, FileText, Building, Calendar, TrendingUp } from "lucide-react";

export default function GeospatialIntelligence() {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [searchRadius, setSearchRadius] = useState("1");
  const [useProxy, setUseProxy] = useState(true);
  const [proxyRegion, setProxyRegion] = useState("us-east");
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "census", "voter-rolls", "property-records", "ancestry", "demographic", "sex-offender-registry", "prison-search"
  ]);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [mapData, setMapData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dataSources = [
    { id: "census", name: "US Census Bureau", icon: Users, type: "government", description: "Population, housing, economic data" },
    { id: "voter-rolls", name: "Voter Registration", icon: FileText, type: "government", description: "Registered voter information" },
    { id: "property-records", name: "Property Records", icon: Building, type: "government", description: "Property ownership and tax records" },
    { id: "ancestry", name: "FamilySearch/LDS", icon: Users, type: "genealogy", description: "Genealogical and historical records" },
    { id: "demographic", name: "Demographics API", icon: TrendingUp, type: "commercial", description: "Population demographics and statistics" },
    { id: "business-registry", name: "Business Registry", icon: Building, type: "government", description: "Business registration and licenses" },
    { id: "permits", name: "Building Permits", icon: FileText, type: "government", description: "Construction and renovation permits" },
    { id: "court-records", name: "Court Records", icon: Shield, type: "government", description: "Civil and criminal court filings" },
    { id: "sex-offender-registry", name: "Sex Offender Registry", icon: Shield, type: "security", description: "National and state sex offender databases" },
    { id: "no-fly-list", name: "No Fly List Research", icon: Shield, type: "security", description: "TSA watchlist and travel restrictions (limited)" },
    { id: "prison-search", name: "Prison/Institution Search", icon: Shield, type: "security", description: "Federal and state correctional facilities" },
    { id: "missing-persons", name: "Missing Persons", icon: Users, type: "security", description: "NamUs and missing person databases" }
  ];

  const proxyRegions = [
    { value: "us-east", label: "US East Coast", flag: "🇺🇸" },
    { value: "us-west", label: "US West Coast", flag: "🇺🇸" },
    { value: "eu-west", label: "Europe West", flag: "🇪🇺" },
    { value: "asia-pacific", label: "Asia Pacific", flag: "🌏" },
    { value: "canada", label: "Canada", flag: "🇨🇦" },
    { value: "australia", label: "Australia", flag: "🇦🇺" }
  ];

  const mutation = useMutation({
    mutationFn: async (searchData: any) => {
      const response = await apiRequest("POST", "/api/osint/geospatial-intelligence", searchData);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      setMapData(data.mapData);
      setProgress(100);
      toast({
        title: "Geospatial Intelligence Complete",
        description: `Analyzed ${data.result?.totalRecords || 0} records from ${data.result?.sourcesUsed || 0} sources`,
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
    if (!address.trim() && (!coordinates.lat || !coordinates.lng)) {
      toast({
        title: "Error",
        description: "Please provide either an address or coordinates",
        variant: "destructive",
      });
      return;
    }
    
    setProgress(0);
    mutation.mutate({
      address: address.trim(),
      coordinates: coordinates.lat && coordinates.lng ? coordinates : null,
      searchRadius: parseInt(searchRadius),
      useProxy,
      proxyRegion,
      selectedSources
    });
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case "government": return "bg-blue-600";
      case "genealogy": return "bg-green-600";
      case "commercial": return "bg-purple-600";
      case "security": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Geospatial Intelligence Platform
        </CardTitle>
        <p className="text-gray-400 text-sm">Location-based intelligence with Census, voter rolls, and genealogy integration</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="search" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Search</TabsTrigger>
            <TabsTrigger value="sources" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Sources</TabsTrigger>
            <TabsTrigger value="proxy" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Proxy/VPN</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address" className="text-gray-300">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main St, City, State, ZIP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="searchRadius" className="text-gray-300">Search Radius (miles)</Label>
                  <Select value={searchRadius} onValueChange={setSearchRadius}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5 miles</SelectItem>
                      <SelectItem value="1">1 mile</SelectItem>
                      <SelectItem value="2">2 miles</SelectItem>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-gray-300">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="text"
                    placeholder="40.7128"
                    value={coordinates.lat}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-gray-300">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="text"
                    placeholder="-74.0060"
                    value={coordinates.lng}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {selectedSources.length} of {dataSources.length} sources selected
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Analyze Location
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            {mutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing geospatial data...</span>
                  <span className="text-white">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataSources.map((source) => {
                const Icon = source.icon;
                return (
                  <div key={source.id} className="flex items-center space-x-3 p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <Checkbox
                      id={source.id}
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={() => toggleSource(source.id)}
                    />
                    <Icon className="h-5 w-5 text-[hsl(207,90%,54%)]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label htmlFor={source.id} className="text-white font-medium cursor-pointer">
                          {source.name}
                        </label>
                        <Badge className={getSourceTypeColor(source.type)}>
                          {source.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{source.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedSources(dataSources.filter(s => s.type === 'government').map(s => s.id))}
                className="text-white border-gray-600"
              >
                Government Only
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedSources(dataSources.map(s => s.id))}
                className="text-white border-gray-600"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedSources([])}
                className="text-white border-gray-600"
              >
                Clear All
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="proxy" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[hsl(207,90%,54%)]" />
                  <div>
                    <div className="text-white font-medium">Enable Proxy/VPN</div>
                    <div className="text-sm text-gray-400">Bypass regional restrictions and enhance privacy</div>
                  </div>
                </div>
                <Switch
                  checked={useProxy}
                  onCheckedChange={setUseProxy}
                />
              </div>
              
              {useProxy && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="proxyRegion" className="text-gray-300">Proxy Region</Label>
                    <Select value={proxyRegion} onValueChange={setProxyRegion}>
                      <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {proxyRegions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            <div className="flex items-center gap-2">
                              <span>{region.flag}</span>
                              {region.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-[hsl(222,47%,11%)] rounded-lg">
                      <div className="text-sm text-gray-400">Connection Status</div>
                      <div className="text-lg font-bold text-green-400">Secured</div>
                    </div>
                    <div className="p-3 bg-[hsl(222,47%,11%)] rounded-lg">
                      <div className="text-sm text-gray-400">Virtual Location</div>
                      <div className="text-lg font-bold text-white">
                        {proxyRegions.find(r => r.value === proxyRegion)?.label}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-yellow-400" />
                      <div className="text-sm text-yellow-200">
                        <strong>Privacy Notice:</strong> Proxy/VPN helps access geo-restricted data sources and enhances anonymity during intelligence gathering.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {results && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Total Records</div>
                    <div className="text-xl font-bold text-white">{results.totalRecords || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Data Sources</div>
                    <div className="text-xl font-bold text-white">{results.sourcesUsed || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Population</div>
                    <div className="text-xl font-bold text-white">{results.demographics?.population?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Properties</div>
                    <div className="text-xl font-bold text-white">{results.propertyCount || 0}</div>
                  </div>
                </div>
                
                {/* Map Visualization */}
                {mapData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                    <CardHeader>
                      <CardTitle className="text-white">Interactive Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-64 bg-[hsl(222,47%,11%)] rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-16 w-16 text-[hsl(207,90%,54%)] mx-auto mb-2" />
                          <div className="text-white font-medium">Map visualization would appear here</div>
                          <div className="text-sm text-gray-400">
                            Showing {mapData.markers?.length || 0} markers in {searchRadius} mile radius
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Census Data */}
                {results.censusData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        US Census Bureau Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">Demographics</h4>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-gray-400">Population: </span>
                              <span className="text-white">{results.censusData.population?.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Median Age: </span>
                              <span className="text-white">{results.censusData.medianAge}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Households: </span>
                              <span className="text-white">{results.censusData.households?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-2">Economic</h4>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-gray-400">Median Income: </span>
                              <span className="text-white">${results.censusData.medianIncome?.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Poverty Rate: </span>
                              <span className="text-white">{results.censusData.povertyRate}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Employment: </span>
                              <span className="text-white">{results.censusData.employmentRate}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-2">Housing</h4>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-gray-400">Median Home Value: </span>
                              <span className="text-white">${results.censusData.medianHomeValue?.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Rent: </span>
                              <span className="text-white">${results.censusData.medianRent?.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Owner Occupied: </span>
                              <span className="text-white">{results.censusData.ownerOccupied}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Voter Registration Data */}
                {results.voterData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Voter Registration Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.voterData.map((voter: any, index: number) => (
                          <div key={index} className="p-3 bg-[hsl(222,47%,11%)] rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-white font-medium">{voter.name}</div>
                              <Badge className="bg-[hsl(207,90%,54%)]">{voter.party}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Address: </span>
                                <span className="text-white">{voter.address}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Registration Date: </span>
                                <span className="text-white">{voter.registrationDate}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Genealogy Data */}
                {results.genealogyData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        FamilySearch/LDS Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.genealogyData.map((record: any, index: number) => (
                          <div key={index} className="p-3 bg-[hsl(222,47%,11%)] rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-white font-medium">{record.name}</div>
                              <Badge variant="outline">{record.recordType}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Birth: </span>
                                <span className="text-white">{record.birthDate} • {record.birthPlace}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Death: </span>
                                <span className="text-white">{record.deathDate} • {record.deathPlace}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Sex Offender Registry */}
                {results.sexOffenderData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-red-500">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-red-400" />
                        Sex Offender Registry
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.sexOffenderData.map((offender: any, index: number) => (
                          <div key={index} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-white font-medium">{offender.name}</div>
                              <Badge className="bg-red-600">{offender.riskLevel}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Age: </span>
                                <span className="text-white">{offender.age}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Height/Weight: </span>
                                <span className="text-white">{offender.height}, {offender.weight}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Address: </span>
                                <span className="text-white">{offender.address}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Offense Date: </span>
                                <span className="text-white">{offender.offenseDate}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Offense: </span>
                                <span className="text-white">{offender.offense}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* No Fly List Research */}
                {results.noFlyListData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-yellow-500">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-yellow-400" />
                        No Fly List Research
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-yellow-400" />
                          <div className="text-sm text-yellow-200">
                            <strong>Notice:</strong> No Fly List data is classified. This tool searches for publicly available watchlist indicators and travel restrictions.
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {results.noFlyListData.indicators && results.noFlyListData.indicators.length > 0 ? (
                          results.noFlyListData.indicators.map((indicator: any, index: number) => (
                            <div key={index} className="p-3 bg-[hsl(222,47%,11%)] rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-white font-medium">{indicator.type}</div>
                                <Badge className="bg-yellow-600">{indicator.confidence}</Badge>
                              </div>
                              <div className="text-sm text-gray-300">{indicator.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-gray-400">No public watchlist indicators found</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Prison/Institution Search */}
                {results.prisonData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-orange-500">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-orange-400" />
                        Prison/Institution Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.prisonData.map((record: any, index: number) => (
                          <div key={index} className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-white font-medium">{record.name}</div>
                              <Badge className="bg-orange-600">{record.status}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Facility: </span>
                                <span className="text-white">{record.facility}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Inmate ID: </span>
                                <span className="text-white">{record.inmateId}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Admission Date: </span>
                                <span className="text-white">{record.admissionDate}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Release Date: </span>
                                <span className="text-white">{record.releaseDate || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Charges: </span>
                                <span className="text-white">{record.charges}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Missing Persons Database */}
                {results.missingPersonsData && (
                  <Card className="bg-[hsl(215,25%,27%)] border-purple-500">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-400" />
                        Missing Persons (NamUs)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.missingPersonsData.map((person: any, index: number) => (
                          <div key={index} className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-white font-medium">{person.name}</div>
                              <Badge className="bg-purple-600">{person.status}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Age at Disappearance: </span>
                                <span className="text-white">{person.ageAtDisappearance}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Missing Since: </span>
                                <span className="text-white">{person.missingSince}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Last Seen: </span>
                                <span className="text-white">{person.lastSeen}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Case Number: </span>
                                <span className="text-white">{person.caseNumber}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="text-sm">
                                <span className="text-gray-400">Circumstances: </span>
                                <span className="text-white">{person.circumstances}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {!results && !mutation.isPending && (
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No results yet. Analyze a location to see intelligence data here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}