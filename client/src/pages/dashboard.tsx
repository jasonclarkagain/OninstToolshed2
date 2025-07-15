import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Download, History, Settings, TriangleAlert } from "lucide-react";
import Sidebar from "@/components/sidebar";
import DomainEnumeration from "@/components/tools/domain-enumeration";
import IpAnalysis from "@/components/tools/ip-analysis";
import WhoisLookup from "@/components/tools/whois-lookup";
import UsernameChecker from "@/components/tools/username-checker";
import EmailValidator from "@/components/tools/email-validator";
import HashAnalyzer from "@/components/tools/hash-analyzer";
import Base64Encoder from "@/components/tools/base64-encoder";
import UrlAnalyzer from "@/components/tools/url-analyzer";
import GoogleDorking from "@/components/tools/google-dorking";
import NetworkTools from "@/components/tools/network-tools";
import KaliLinuxVM from "@/components/tools/kali-linux-vm";
import MetasploitInterface from "@/components/tools/metasploit-interface";
import SocialEngineeringToolkit from "@/components/tools/social-engineering-toolkit";
import VulnerabilityScanner from "@/components/tools/vulnerability-scanner";
import OsintFramework from "@/components/tools/osint-framework";
import IntelligenceDashboard from "@/components/intelligence-dashboard";
import AdvancedReporting from "@/components/advanced-reporting";
import WorkflowAutomation from "@/components/workflow-automation";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import CollaborationWorkspace from "@/components/collaboration-workspace";
import AdvancedSearch from "@/components/advanced-search";
import AIAnalysis from "@/components/ai-analysis";
import MobileDashboard from "@/components/mobile-dashboard";
import MultiFactorAnalysis from "@/components/multi-factor-analysis";
import CorrelationTest from "@/components/correlation-test";
import ThreatIntelligenceDashboard from "@/components/threat-intelligence-dashboard";
import ResultsPanel from "@/components/results-panel";
import DisclaimerBanner from "@/components/disclaimer-banner";
import { useQuery } from "@tanstack/react-query";
import { useMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("domain-network");

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
    refetchInterval: 5000,
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/osint/reports"],
  });

  const totalQueries = queries?.length || 0;
  const totalReports = reports?.length || 0;

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] text-gray-100">
      {/* Header */}
      <header className="bg-[hsl(217,32%,17%)] border-b border-[hsl(215,14%,34%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-[hsl(207,90%,54%)] h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-white">OSINT Tool Shed</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="outline" size="icon" className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Sidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              stats={{
                queriesToday: totalQueries,
                reportsGenerated: totalReports,
                rateLimit: "Available"
              }}
            />
          </div>

          <div className="lg:col-span-3">
            {activeSection === "domain-network" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Domain & Network Analysis</h2>
                <DomainEnumeration />
                <IpAnalysis />
                <WhoisLookup />
              </section>
            )}

            {activeSection === "social-identity" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Social Media & Identity</h2>
                <UsernameChecker />
                <EmailValidator />
              </section>
            )}

            {activeSection === "data-analysis" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Data Analysis & Encoding</h2>
                <HashAnalyzer />
                <Base64Encoder />
              </section>
            )}

            {activeSection === "search-investigation" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Search & Investigation</h2>
                <UrlAnalyzer />
                <GoogleDorking />
                <NetworkTools />
              </section>
            )}

            {activeSection === "kali-vm" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Kali Linux Virtual Machine</h2>
                <KaliLinuxVM />
              </section>
            )}

            {activeSection === "advanced-security" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Advanced Security Framework</h2>
                <MetasploitInterface />
                <SocialEngineeringToolkit />
                <VulnerabilityScanner />
                <OsintFramework />
              </section>
            )}

            {activeSection === "intelligence" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Intelligence & Analytics</h2>
                <IntelligenceDashboard />
              </section>
            )}

            {activeSection === "reporting" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Advanced Reporting</h2>
                <AdvancedReporting />
              </section>
            )}

            {activeSection === "automation" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Workflow Automation</h2>
                <WorkflowAutomation />
              </section>
            )}

            {activeSection === "analytics" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Performance Analytics</h2>
                <AnalyticsDashboard />
              </section>
            )}

            {activeSection === "collaboration" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Team Collaboration</h2>
                <CollaborationWorkspace />
              </section>
            )}

            {activeSection === "search" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Advanced Search</h2>
                <AdvancedSearch />
              </section>
            )}

            {activeSection === "ai-analysis" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">AI Security Analysis</h2>
                <AIAnalysis />
              </section>
            )}

            {activeSection === "mobile" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Mobile Dashboard</h2>
                <MobileDashboard />
              </section>
            )}

            {activeSection === "multi-factor" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-white">Multi-Factor Analysis</h2>
                <MultiFactorAnalysis />
                <CorrelationTest />
                <ThreatIntelligenceDashboard />
              </section>
            )}

            <ResultsPanel />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[hsl(217,32%,17%)] border-t border-[hsl(215,14%,34%)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              <p>&copy; 2024 OSINT Tool Shed. For educational and legal use only.</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Documentation</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
