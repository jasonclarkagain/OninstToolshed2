import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, ExternalLink, Search, ChevronDown, ChevronUp, X } from "lucide-react";

export default function ResultsPanel() {
  const { data: queries, isLoading } = useQuery({
    queryKey: ["/api/osint/queries"],
    refetchInterval: 5000,
  });

  const { toast } = useToast();
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-[hsl(158,64%,52%)]";
      case "pending":   return "bg-[hsl(38,92%,50%)]";
      case "error":     return "bg-[hsl(0,84%,60%)]";
      default:          return "bg-gray-500";
    }
  };

  const getToolTypeLabel = (toolType: string) => {
    const labels: { [key: string]: string } = {
      domain_enumeration:  "Domain Enumeration",
      ip_analysis:         "IP Analysis",
      whois:               "WHOIS Lookup",
      username_check:      "Username Check",
      email_validation:    "Email Validation",
      hash_analysis:       "Hash Analysis",
      url_analysis:        "URL Analysis",
      network_ping:        "Network Ping",
      network_traceroute:  "Network Traceroute",
      network_port_scan:   "Port Scan",
    };
    return labels[toolType] || toolType.replace(/_/g, " ");
  };

  const handleSave = () => {
    if (!queries || queries.length === 0) {
      toast({ title: "Nothing to save", description: "Run a tool first to generate results." });
      return;
    }
    const blob = new Blob([JSON.stringify(queries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint-results-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Results downloaded", description: "Your results have been saved as a JSON file." });
  };

  const handleClear = () => {
    setExpanded(new Set());
    setSelectedQuery(null);
    toast({ title: "View cleared", description: "Results are still saved in your account history." });
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderInlineSummary = (query: any) => {
    const r = query.result;
    if (!r) return null;
    if (query.toolType === "domain_enumeration")
      return <p className="text-gray-300 text-xs">Found {r.subdomains?.length || 0} subdomains · {r.activeHosts?.length || 0} active hosts</p>;
    if (query.toolType === "ip_analysis")
      return <p className="text-gray-300 text-xs">Location: {r.location?.city || "Unknown"}, {r.location?.country || ""} · Reputation: {r.reputation}</p>;
    if (query.toolType === "whois")
      return <p className="text-gray-300 text-xs">Registrar: {r.registrar || "N/A"} · Created: {r.createdDate || "N/A"}</p>;
    if (query.toolType === "username_check")
      return <p className="text-gray-300 text-xs">Checked {Object.keys(r.platforms || {}).length} platforms</p>;
    if (query.toolType === "hash_analysis")
      return <p className="text-gray-300 text-xs">Type: {r.detectedType} · Length: {r.length} chars</p>;
    if (query.toolType === "email_validation")
      return <p className="text-gray-300 text-xs">Valid: {r.isValid ? "Yes" : "No"} · Deliverable: {r.deliverable ? "Yes" : "No"}</p>;
    return <p className="text-gray-300 text-xs">Completed successfully</p>;
  };

  const renderDetailView = (query: any) => {
    const r = query.result;
    if (!r) return <p className="text-gray-400">No result data available.</p>;
    return (
      <pre className="text-xs text-gray-200 bg-[hsl(222,47%,11%)] rounded p-4 overflow-auto max-h-[60vh] whitespace-pre-wrap break-words">
        {JSON.stringify(r, null, 2)}
      </pre>
    );
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
    <>
      <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Investigation Results</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queries && queries.length > 0 ? (
              queries.map((query: any) => (
                <div key={query.id} className="p-4 bg-[hsl(215,25%,27%)] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">
                        {getToolTypeLabel(query.toolType)}
                      </span>
                      <span className="text-sm text-gray-400">— {query.query}</span>
                      <Badge className={getStatusColor(query.status)}>
                        {query.status}
                      </Badge>
                    </div>
                  </div>

                  {renderInlineSummary(query)}

                  {expanded.has(query.id) && query.result && (
                    <div className="mt-3">
                      <pre className="text-xs text-gray-200 bg-[hsl(222,47%,11%)] rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                        {JSON.stringify(query.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {query.createdAt && formatDate(query.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      {query.result && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(query.id)}
                          className="text-gray-400 hover:text-white text-xs px-2 py-1 h-auto"
                        >
                          {expanded.has(query.id) ? (
                            <><ChevronUp className="h-3 w-3 mr-1" />Collapse</>
                          ) : (
                            <><ChevronDown className="h-3 w-3 mr-1" />Expand</>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedQuery(query)}
                        className="text-[hsl(207,90%,54%)] hover:text-blue-400 text-xs px-2 py-1 h-auto"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
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

      {/* View Details Dialog */}
      <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
        <DialogContent className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedQuery && getToolTypeLabel(selectedQuery.toolType)}
              {selectedQuery && (
                <Badge className={getStatusColor(selectedQuery.status)}>
                  {selectedQuery.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Target:</span>
                <span className="text-white font-mono">{selectedQuery.query}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Run at:</span>
                <span className="text-white">{formatDate(selectedQuery.createdAt)}</span>
              </div>
              <div className="border-t border-[hsl(215,14%,34%)] pt-3">
                <p className="text-gray-400 text-xs mb-2">Full Result Data:</p>
                {renderDetailView(selectedQuery)}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(selectedQuery.result, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedQuery.toolType}-${selectedQuery.query}-result.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Download Result
                </Button>
                <Button
                  size="sm"
                  className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
                  onClick={() => setSelectedQuery(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
