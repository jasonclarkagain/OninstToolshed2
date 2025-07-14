import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Search } from "lucide-react";

export default function UsernameChecker() {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const response = await apiRequest("POST", "/api/osint/username-check", { username });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "Username Check Complete",
        description: `Checked availability for ${username} across platforms`,
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
    if (!username.trim()) return;
    mutation.mutate({ username: username.trim() });
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Username Availability Checker
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Check username availability across multiple social media platforms</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
            />
            <Button
              type="submit"
              disabled={mutation.isPending || !username.trim()}
              className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check All
                </>
              )}
            </Button>
          </div>
        </form>

        {results && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(results.platforms).map(([platform, data]: [string, any]) => (
              <div key={platform} className="p-3 bg-[hsl(215,25%,27%)] rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{platform}</span>
                </div>
                <Badge 
                  variant={data.available ? "default" : "destructive"}
                  className={data.available ? "bg-[hsl(158,64%,52%)]" : "bg-[hsl(0,84%,60%)]"}
                >
                  {data.available ? "Available" : "Taken"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
