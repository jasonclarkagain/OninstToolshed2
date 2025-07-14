import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Save, Trash2, ExternalLink, Search } from "lucide-react";

export default function ResultsPanel() {
  const { data: queries, isLoading } = useQuery({
    queryKey: ["/api/osint/queries"],
    refetchInterval: 5000,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[hsl(158,64%,52%)]";
      case "pending":
        return "bg-[hsl(38,92%,50%)]";
      case "error":
        return "bg-[hsl(0,84%,60%)]";
      default:
        return "bg-gray-500";
    }
  };

  const getToolTypeLabel = (toolType: string) => {
    const labels: { [key: string]: string } = {
      domain_enumeration: "Domain Enumeration",
      ip_analysis: "IP Analysis",
      whois: "WHOIS Lookup",
      username_check: "Username Check",
      email_validation: "Email Validation",
      hash_analysis: "Hash Analysis",
      url_analysis: "URL Analysis",
      network_ping: "Network Ping",
      network_traceroute: "Network Traceroute",
      network_port_scan: "Port Scan",
    };
    return labels[toolType] || toolType;
  };

  if (isLoading) {
    return (
      <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(207,90%,54%)]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Investigation Results</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {queries && queries.length > 0 ? (
            queries.map((query: any) => (
              <div key={query.id} className="p-4 bg-[hsl(215,25%,27%)] rounded-lg result-item">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {getToolTypeLabel(query.toolType)} - {query.query}
                    </span>
                    <Badge className={getStatusColor(query.status)}>
                      {query.status}
                    </Badge>
                  </div>
                </div>
                
                {query.result && (
                  <div className="text-sm text-white mb-2">
                    {query.toolType === "domain_enumeration" && (
                      <p>Found {query.result.subdomains?.length || 0} subdomains, {query.result.activeHosts?.length || 0} active hosts</p>
                    )}
                    {query.toolType === "username_check" && (
                      <p>Checked {Object.keys(query.result.platforms || {}).length} platforms</p>
                    )}
                    {query.toolType === "hash_analysis" && (
                      <p>Hash type: {query.result.detectedType} ({query.result.length} chars)</p>
                    )}
                    {query.toolType === "ip_analysis" && (
                      <p>Location: {query.result.location?.city || "Unknown"}, Reputation: {query.result.reputation}</p>
                    )}
                    {(!query.result || typeof query.result === "string") && (
                      <p>Task completed successfully</p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {query.createdAt && formatDate(query.createdAt)}
                  </span>
                  <Button variant="ghost" size="sm" className="text-[hsl(207,90%,54%)] hover:text-blue-400">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No results yet. Run a tool to see results here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
