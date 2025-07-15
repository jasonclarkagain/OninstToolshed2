import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Eye, Share, AlertTriangle, Shield, Target } from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  type: 'executive' | 'technical' | 'compliance' | 'custom';
  sections: string[];
  format: 'pdf' | 'html' | 'docx' | 'json';
}

interface ReportData {
  title: string;
  executiveSummary: string;
  methodology: string;
  findings: any[];
  recommendations: string[];
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  scope: string;
  timeline: string;
  audience: string;
}

export default function AdvancedReporting() {
  const [activeTab, setActiveTab] = useState("generator");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData>({
    title: "",
    executiveSummary: "",
    methodology: "",
    findings: [],
    recommendations: [],
    riskRating: "medium",
    scope: "",
    timeline: "",
    audience: "technical"
  });
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportConfig: any) => {
      const response = await apiRequest("POST", "/api/osint/generate-report", reportConfig);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Your report has been successfully generated and is ready for download.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/osint/reports"] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const templates: ReportTemplate[] = [
    {
      id: 'executive',
      name: 'Executive Summary Report',
      type: 'executive',
      sections: ['Executive Summary', 'Key Findings', 'Risk Assessment', 'Recommendations', 'Next Steps'],
      format: 'pdf'
    },
    {
      id: 'technical',
      name: 'Technical Assessment Report',
      type: 'technical',
      sections: ['Methodology', 'Detailed Findings', 'Vulnerability Analysis', 'Evidence', 'Remediation Steps'],
      format: 'pdf'
    },
    {
      id: 'penetration',
      name: 'Penetration Testing Report',
      type: 'technical',
      sections: ['Scope', 'Methodology', 'Executive Summary', 'Vulnerability Details', 'Risk Matrix', 'Recommendations'],
      format: 'pdf'
    },
    {
      id: 'compliance',
      name: 'Compliance Assessment',
      type: 'compliance',
      sections: ['Compliance Framework', 'Audit Results', 'Gaps Analysis', 'Remediation Plan'],
      format: 'docx'
    }
  ];

  const generateAutomaticReport = () => {
    if (!queries || queries.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please run some OSINT queries first to generate a report.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingReport(true);
    
    // Auto-generate report data from queries
    const findings = queries.map((query: any) => ({
      toolType: query.toolType,
      target: query.query,
      result: query.result,
      severity: query.result?.vulnerabilities?.length > 0 ? 'high' : 'medium',
      timestamp: query.createdAt
    }));

    const vulnerabilityCount = queries.reduce((count: number, query: any) => {
      return count + (query.result?.vulnerabilities?.length || 0);
    }, 0);

    const riskRating = vulnerabilityCount > 5 ? 'critical' : 
                      vulnerabilityCount > 2 ? 'high' : 
                      vulnerabilityCount > 0 ? 'medium' : 'low';

    const autoReport = {
      title: `OSINT Assessment Report - ${new Date().toLocaleDateString()}`,
      executiveSummary: `This report summarizes the findings from a comprehensive OSINT assessment conducted using ${queries.length} different intelligence gathering techniques. The assessment identified ${vulnerabilityCount} potential security concerns across the target scope.`,
      methodology: "The assessment utilized automated OSINT tools including domain enumeration, IP analysis, vulnerability scanning, social engineering assessment, and network reconnaissance.",
      findings: findings,
      recommendations: [
        "Implement regular security assessments and monitoring",
        "Address identified vulnerabilities in order of criticality",
        "Enhance network segmentation and access controls",
        "Deploy comprehensive logging and monitoring solutions",
        "Conduct regular security awareness training"
      ],
      riskRating: riskRating,
      scope: "Network infrastructure, web applications, and public-facing assets",
      timeline: `Assessment conducted on ${new Date().toLocaleDateString()}`,
      audience: "technical",
      template: selectedTemplate || "technical",
      format: "pdf"
    };

    generateReportMutation.mutate(autoReport);
    setGeneratingReport(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <FileText className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Advanced Reporting Engine
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-blue-600 text-white">
            {queries?.length || 0} Data Sources
          </Badge>
          <Badge className="bg-green-600 text-white">Report Generator Ready</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="generator" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <FileText className="h-4 w-4 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Eye className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Target className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="export" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Report Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Report Title</label>
                  <Input
                    value={reportData.title}
                    onChange={(e) => setReportData({...reportData, title: e.target.value})}
                    placeholder="Enter report title"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Risk Rating</label>
                  <Select value={reportData.riskRating} onValueChange={(value: any) => setReportData({...reportData, riskRating: value})}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="critical">Critical Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Target Audience</label>
                  <Select value={reportData.audience} onValueChange={(value) => setReportData({...reportData, audience: value})}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive Leadership</SelectItem>
                      <SelectItem value="technical">Technical Team</SelectItem>
                      <SelectItem value="compliance">Compliance/Audit</SelectItem>
                      <SelectItem value="mixed">Mixed Audience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Executive Summary</label>
                  <Textarea
                    value={reportData.executiveSummary}
                    onChange={(e) => setReportData({...reportData, executiveSummary: e.target.value})}
                    placeholder="Brief overview of the assessment and key findings"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Scope</label>
                  <Textarea
                    value={reportData.scope}
                    onChange={(e) => setReportData({...reportData, scope: e.target.value})}
                    placeholder="Define the scope of the assessment"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Methodology</label>
                  <Textarea
                    value={reportData.methodology}
                    onChange={(e) => setReportData({...reportData, methodology: e.target.value})}
                    placeholder="Describe the methodology used"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={generateAutomaticReport}
                disabled={generatingReport || generateReportMutation.isPending}
                className="bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                {generatingReport ? "Generating..." : "Auto-Generate Report"}
              </Button>
              <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                <Eye className="h-4 w-4 mr-2" />
                Preview Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{template.name}</h4>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <h5 className="text-gray-300 text-sm">Sections Included:</h5>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.map((section, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{section}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Format: {template.format.toUpperCase()}</span>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedTemplate(template.id)}
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      className={selectedTemplate === template.id ? "bg-[hsl(207,90%,54%)]" : "border-[hsl(215,14%,34%)] text-white"}
                    >
                      {selectedTemplate === template.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-6">
              <div className="border-b border-[hsl(215,14%,34%)] pb-4 mb-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {reportData.title || "OSINT Assessment Report"}
                </h3>
                <div className="flex items-center space-x-4">
                  <Badge className={getRiskColor(reportData.riskRating)}>
                    {reportData.riskRating.toUpperCase()} RISK
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    Generated on {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Executive Summary</h4>
                  <p className="text-gray-300 text-sm">
                    {reportData.executiveSummary || "This section will contain a high-level overview of the assessment findings and recommendations."}
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Key Findings</h4>
                  <div className="space-y-2">
                    {queries?.slice(0, 3).map((query: any, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">
                          {query.toolType.replace('_', ' ').toUpperCase()}: {query.query}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {query.result?.success ? "Completed" : "Failed"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {reportData.recommendations.length > 0 ? reportData.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>{rec}</span>
                      </li>
                    )) : (
                      <li className="text-gray-400">Recommendations will be generated based on findings</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <h4 className="text-white font-medium mb-2">PDF Report</h4>
                <p className="text-gray-400 text-sm mb-3">Professional formatted report with charts and graphics</p>
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-white font-medium mb-2">Word Document</h4>
                <p className="text-gray-400 text-sm mb-3">Editable DOCX format for further customization</p>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export DOCX
                </Button>
              </div>

              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h4 className="text-white font-medium mb-2">JSON Data</h4>
                <p className="text-gray-400 text-sm mb-3">Raw data export for integration with other tools</p>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Sharing Options</h4>
              <div className="flex space-x-3">
                <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                  <Share className="h-4 w-4 mr-2" />
                  Generate Shareable Link
                </Button>
                <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Email Report
                </Button>
                <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure Delivery
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}