import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SearchCheck, Wand2, ExternalLink } from "lucide-react";

export default function GoogleDorking() {
  const [site, setSite] = useState("");
  const [fileType, setFileType] = useState("");
  const [searchTerms, setSearchTerms] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ site, fileType, searchTerms }: { site?: string; fileType?: string; searchTerms?: string }) => {
      const response = await apiRequest("POST", "/api/osint/google-dork", {
        site,
        fileType,
        searchTerms,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuery(data.dork);
      toast({
        title: "Query Generated",
        description: "Google dork query has been generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    mutation.mutate({ site, fileType, searchTerms });
  };

  const handleSearchGoogle = () => {
    if (generatedQuery) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(generatedQuery)}`, '_blank');
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <SearchCheck className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Google Dorking Assistant
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Generate advanced search queries for information discovery</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site" className="text-gray-300">Site/Domain</Label>
              <Input
                id="site"
                type="text"
                placeholder="example.com"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="fileType" className="text-gray-300">File Type</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">DOC</SelectItem>
                  <SelectItem value="xls">XLS</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="searchTerms" className="text-gray-300">Search Terms</Label>
            <Input
              id="searchTerms"
              type="text"
              placeholder="confidential OR internal"
              value={searchTerms}
              onChange={(e) => setSearchTerms(e.target.value)}
              className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              onClick={handleGenerate}
              disabled={mutation.isPending}
              className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Query
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSearchGoogle}
              disabled={!generatedQuery}
              variant="outline"
              className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Search Google
            </Button>
          </div>
          
          {generatedQuery && (
            <div className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
              <span className="text-sm text-gray-400">Generated Query:</span>
              <code className="block text-[hsl(207,90%,54%)] text-sm mt-1 break-all">
                {generatedQuery}
              </code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
