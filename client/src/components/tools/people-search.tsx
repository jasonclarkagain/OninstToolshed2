import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Search, MapPin, Phone, Mail, Building, Calendar, Shield, Eye, Globe } from "lucide-react";

export default function PeopleSearch() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedEngines, setSelectedEngines] = useState<string[]>([
    "whitepages", "truepeoplesearch", "fastpeoplesearch", "beenverified", "spokeo"
  ]);
  const [includeLexisNexis, setIncludeLexisNexis] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const searchEngines = [
    { id: "whitepages", name: "WhitePages", type: "free", description: "Comprehensive directory service" },
    { id: "truepeoplesearch", name: "TruePeopleSearch", type: "free", description: "Free people search engine" },
    { id: "fastpeoplesearch", name: "FastPeopleSearch", type: "free", description: "Fast and accurate results" },
    { id: "beenverified", name: "BeenVerified", type: "premium", description: "Background check service" },
    { id: "spokeo", name: "Spokeo", type: "premium", description: "People search and background reports" },
    { id: "pipl", name: "Pipl", type: "premium", description: "Professional people search" },
    { id: "intelius", name: "Intelius", type: "premium", description: "People finder and background checks" },
    { id: "peoplefinder", name: "PeopleFinder", type: "free", description: "Free people directory" },
    { id: "familytreenow", name: "FamilyTreeNow", type: "free", description: "Family tree and people search" },
    { id: "radaris", name: "Radaris", type: "free", description: "People search and public records" },
    { id: "zabasearch", name: "ZabaSearch", type: "free", description: "Free people search engine" },
    { id: "peekyou", name: "PeekYou", type: "free", description: "People search across social media" },
    { id: "socialcatfish", name: "Social Catfish", type: "premium", description: "Reverse image and people search" },
    { id: "instantcheckmate", name: "InstantCheckmate", type: "premium", description: "Background check service" },
    { id: "truthfinder", name: "TruthFinder", type: "premium", description: "People search and background reports" }
  ];

  const mutation = useMutation({
    mutationFn: async (searchData: any) => {
      const response = await apiRequest("POST", "/api/osint/people-search", searchData);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      setProgress(100);
      toast({
        title: "People Search Complete",
        description: `Found ${data.result?.totalResults || 0} results across ${data.result?.sourcesUsed || 0} sources`,
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
    if (!firstName.trim() && !lastName.trim() && !email.trim() && !phone.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least one search parameter",
        variant: "destructive",
      });
      return;
    }
    
    setProgress(0);
    mutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      location: location.trim(),
      age: age.trim(),
      email: email.trim(),
      phone: phone.trim(),
      selectedEngines,
      includeLexisNexis
    });
  };

  const toggleEngine = (engineId: string) => {
    setSelectedEngines(prev =>
      prev.includes(engineId)
        ? prev.filter(id => id !== engineId)
        : [...prev, engineId]
    );
  };

  const getEngineTypeColor = (type: string) => {
    switch (type) {
      case "free": return "bg-green-600";
      case "premium": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <User className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          People Search Engine
        </CardTitle>
        <p className="text-gray-400 text-sm">Advanced people search across multiple databases including LexisNexis integration</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="search" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Search</TabsTrigger>
            <TabsTrigger value="engines" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Engines</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-[hsl(207,90%,54%)]">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location (City, State)</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="New York, NY"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-gray-300">Age Range</Label>
                  <Input
                    id="age"
                    type="text"
                    placeholder="25-35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1-555-123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <Checkbox
                  id="lexisNexis"
                  checked={includeLexisNexis}
                  onCheckedChange={setIncludeLexisNexis}
                />
                <Shield className="h-4 w-4 text-yellow-400" />
                <label htmlFor="lexisNexis" className="text-white font-medium cursor-pointer">
                  Include LexisNexis Professional Search
                </label>
                <Badge className="bg-yellow-600 text-xs">Premium</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {selectedEngines.length} of {searchEngines.length} engines selected
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
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
                      Search People
                    </>
                  )}
                </Button>
              </div>
            </form>
            
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
          
          <TabsContent value="engines" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchEngines.map((engine) => (
                <div key={engine.id} className="flex items-center space-x-3 p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                  <Checkbox
                    id={engine.id}
                    checked={selectedEngines.includes(engine.id)}
                    onCheckedChange={() => toggleEngine(engine.id)}
                  />
                  <Globe className="h-4 w-4 text-[hsl(207,90%,54%)]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor={engine.id} className="text-white font-medium cursor-pointer">
                        {engine.name}
                      </label>
                      <Badge className={getEngineTypeColor(engine.type)}>
                        {engine.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{engine.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedEngines(searchEngines.filter(e => e.type === 'free').map(e => e.id))}
                className="text-white border-gray-600"
              >
                Free Only
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedEngines(searchEngines.map(e => e.id))}
                className="text-white border-gray-600"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedEngines([])}
                className="text-white border-gray-600"
              >
                Clear All
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {results && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Total Results</div>
                    <div className="text-xl font-bold text-white">{results.totalResults || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Sources Used</div>
                    <div className="text-xl font-bold text-white">{results.sourcesUsed || 0}</div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">LexisNexis</div>
                    <div className="text-xl font-bold text-yellow-400">
                      {results.lexisNexisResults ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-xl font-bold text-green-400">{results.confidence || 0}%</div>
                  </div>
                </div>
                
                {/* Primary Results */}
                {results.primaryResults && results.primaryResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Primary Results</h3>
                    {results.primaryResults.map((person: any, index: number) => (
                      <Card key={index} className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <User className="h-8 w-8 text-[hsl(207,90%,54%)]" />
                              <div>
                                <h4 className="text-white font-medium">{person.fullName}</h4>
                                <p className="text-sm text-gray-400">{person.age} years old</p>
                              </div>
                            </div>
                            <Badge className="bg-[hsl(207,90%,54%)]">
                              {person.confidence}% match
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {person.addresses && person.addresses.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-400">Addresses</span>
                                </div>
                                {person.addresses.map((addr: any, idx: number) => (
                                  <div key={idx} className="text-sm text-white mb-1">
                                    {addr.street}, {addr.city}, {addr.state} {addr.zip}
                                    {addr.current && <Badge className="ml-2 bg-green-600 text-xs">Current</Badge>}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {person.phones && person.phones.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-400">Phone Numbers</span>
                                </div>
                                {person.phones.map((phone: any, idx: number) => (
                                  <div key={idx} className="text-sm text-white mb-1">
                                    {phone.number} ({phone.type})
                                    {phone.current && <Badge className="ml-2 bg-green-600 text-xs">Current</Badge>}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {person.emails && person.emails.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-400">Email Addresses</span>
                                </div>
                                {person.emails.map((email: string, idx: number) => (
                                  <div key={idx} className="text-sm text-white mb-1">{email}</div>
                                ))}
                              </div>
                            )}
                            
                            {person.relatives && person.relatives.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-400">Relatives</span>
                                </div>
                                {person.relatives.map((relative: any, idx: number) => (
                                  <div key={idx} className="text-sm text-white mb-1">
                                    {relative.name} ({relative.relationship})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {person.sources && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <div className="text-xs text-gray-400 mb-1">Sources:</div>
                              <div className="flex flex-wrap gap-1">
                                {person.sources.map((source: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* LexisNexis Results */}
                {results.lexisNexisResults && (
                  <Card className="bg-[hsl(215,25%,27%)] border-yellow-500">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-yellow-400" />
                        LexisNexis Professional Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {results.lexisNexisResults.criminalRecords && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Criminal Records</h4>
                            <div className="space-y-2">
                              {results.lexisNexisResults.criminalRecords.map((record: any, idx: number) => (
                                <div key={idx} className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                                  <div className="text-white font-medium">{record.charge}</div>
                                  <div className="text-sm text-gray-400">{record.date} • {record.jurisdiction}</div>
                                  <div className="text-sm text-gray-300">{record.disposition}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {results.lexisNexisResults.civilRecords && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Civil Records</h4>
                            <div className="space-y-2">
                              {results.lexisNexisResults.civilRecords.map((record: any, idx: number) => (
                                <div key={idx} className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                                  <div className="text-white font-medium">{record.caseType}</div>
                                  <div className="text-sm text-gray-400">{record.date} • {record.court}</div>
                                  <div className="text-sm text-gray-300">{record.status}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {results.lexisNexisResults.propertyRecords && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Property Records</h4>
                            <div className="space-y-2">
                              {results.lexisNexisResults.propertyRecords.map((record: any, idx: number) => (
                                <div key={idx} className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                                  <div className="text-white font-medium">{record.address}</div>
                                  <div className="text-sm text-gray-400">Value: ${record.value?.toLocaleString()}</div>
                                  <div className="text-sm text-gray-300">Purchased: {record.purchaseDate}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {!results && !mutation.isPending && (
              <div className="text-center py-8">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No results yet. Perform a search to see results here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}