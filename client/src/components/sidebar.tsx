import { Globe, Users, Code, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  stats: {
    queriesToday: number;
    reportsGenerated: number;
    rateLimit: string;
  };
}

export default function Sidebar({ activeSection, onSectionChange, stats }: SidebarProps) {
  const navigationItems = [
    { id: "domain-network", label: "Domain & Network", icon: Globe },
    { id: "social-identity", label: "Social & Identity", icon: Users },
    { id: "data-analysis", label: "Data Analysis", icon: Code },
    { id: "search-investigation", label: "Search & Investigation", icon: Search },
  ];

  return (
    <nav className="bg-[hsl(217,32%,17%)] rounded-lg p-6 sticky top-8">
      <h2 className="text-lg font-semibold mb-4 text-white">Tool Categories</h2>
      <ul className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <Button
                variant="ghost"
                className={`w-full justify-start p-3 ${
                  isActive
                    ? "bg-[hsl(215,25%,27%)] text-[hsl(207,90%,54%)]"
                    : "text-gray-300 hover:bg-[hsl(215,25%,27%)]"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </li>
          );
        })}
      </ul>

      <Card className="mt-8 bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
        <CardHeader>
          <CardTitle className="text-white text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Queries Today:</span>
            <span className="text-white">{stats.queriesToday}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Reports Generated:</span>
            <span className="text-white">{stats.reportsGenerated}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rate Limit:</span>
            <span className="text-[hsl(158,64%,52%)]">{stats.rateLimit}</span>
          </div>
        </CardContent>
      </Card>
    </nav>
  );
}
