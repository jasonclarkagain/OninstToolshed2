import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, Phone, Globe, AlertTriangle, Target } from "lucide-react";

export default function SocialEngineeringToolkit() {
  const [target, setTarget] = useState("");
  const [attackType, setAttackType] = useState("");
  const [template, setTemplate] = useState("");
  const [payload, setPayload] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ target, attackType, template, payload, customMessage }: { 
      target: string; 
      attackType: string; 
      template: string; 
      payload: string; 
      customMessage: string; 
    }) => {
      const response = await apiRequest("POST", "/api/osint/social-engineering", {
        target,
        attackType,
        template,
        payload,
        customMessage,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.result);
      toast({
        title: "Social Engineering Analysis Complete",
        description: "Attack vector analysis completed",
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
    if (!target.trim()) return;
    mutation.mutate({ target: target.trim(), attackType, template, payload, customMessage });
  };

  const getRiskLevel = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical": return { color: "bg-red-600", text: "Critical" };
      case "high": return { color: "bg-orange-600", text: "High" };
      case "medium": return { color: "bg-yellow-600", text: "Medium" };
      case "low": return { color: "bg-green-600", text: "Low" };
      default: return { color: "bg-gray-600", text: "Unknown" };
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Users className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Social Engineering Toolkit (SET)
        </CardTitle>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
            <span className="text-red-400 text-sm font-medium">
              Educational Use Only - Authorized Testing Required
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phishing" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="phishing" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">Phishing</TabsTrigger>
            <TabsTrigger value="spear" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">Spear Phishing</TabsTrigger>
            <TabsTrigger value="pretexting" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">Pretexting</TabsTrigger>
            <TabsTrigger value="osint" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">OSINT Recon</TabsTrigger>
          </TabsList>

          <TabsContent value="phishing" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target" className="text-white">Target Organization/Domain</Label>
                  <Input
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="example.com or organization name"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="attackType" className="text-white">Attack Vector</Label>
                  <Select value={attackType} onValueChange={setAttackType}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue placeholder="Select attack type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                      <SelectItem value="credential_harvesting">Credential Harvesting</SelectItem>
                      <SelectItem value="malware_delivery">Malware Delivery</SelectItem>
                      <SelectItem value="website_cloning">Website Cloning</SelectItem>
                      <SelectItem value="email_phishing">Email Phishing</SelectItem>
                      <SelectItem value="usb_payload">USB Payload</SelectItem>
                      <SelectItem value="qr_code_attack">QR Code Attack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template" className="text-white">Email Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                      <SelectItem value="urgent_security">Urgent Security Alert</SelectItem>
                      <SelectItem value="password_expiry">Password Expiry Notice</SelectItem>
                      <SelectItem value="it_support">IT Support Request</SelectItem>
                      <SelectItem value="invoice_notification">Invoice Notification</SelectItem>
                      <SelectItem value="linkedin_invitation">LinkedIn Invitation</SelectItem>
                      <SelectItem value="package_delivery">Package Delivery</SelectItem>
                      <SelectItem value="bank_verification">Bank Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payload" className="text-white">Payload Type</Label>
                  <Select value={payload} onValueChange={setPayload}>
                    <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                      <SelectValue placeholder="Select payload" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)]">
                      <SelectItem value="credential_capture">Credential Capture Page</SelectItem>
                      <SelectItem value="browser_exploit">Browser Exploit</SelectItem>
                      <SelectItem value="office_macro">Office Macro Document</SelectItem>
                      <SelectItem value="pdf_exploit">PDF Exploit</SelectItem>
                      <SelectItem value="powershell_script">PowerShell Script</SelectItem>
                      <SelectItem value="reverse_shell">Reverse Shell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="customMessage" className="text-white">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Custom phishing email content or additional context..."
                  className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white min-h-[80px]"
                />
              </div>

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
              >
                {mutation.isPending ? "Analyzing..." : "Analyze Attack Vector"}
                <Target className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="spear" className="space-y-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-4">Spear Phishing Campaigns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Target Research</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• LinkedIn profile analysis</li>
                    <li>• Social media intelligence</li>
                    <li>• Corporate hierarchy mapping</li>
                    <li>• Communication patterns</li>
                  </ul>
                </div>
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Personalization Vectors</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• Executive impersonation</li>
                    <li>• Vendor communication</li>
                    <li>• Industry-specific themes</li>
                    <li>• Recent news integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pretexting" className="space-y-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-4">Pretexting Scenarios</h3>
              <div className="space-y-4">
                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Voice-based Attacks
                  </h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Telephone-based social engineering techniques for information gathering and access.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                      IT Support Call
                    </Button>
                    <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                      Survey Research
                    </Button>
                  </div>
                </div>

                <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email-based Attacks
                  </h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Email pretexting for credential harvesting and information disclosure.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                      Account Verification
                    </Button>
                    <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                      Security Audit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="osint" className="space-y-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-4">OSINT Reconnaissance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                  <Globe className="h-4 w-4 mr-2" />
                  Domain Analysis
                </Button>
                <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                  <Users className="h-4 w-4 mr-2" />
                  Employee Enumeration
                </Button>
                <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white hover:bg-[hsl(215,25%,27%)]">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Harvesting
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {results && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Attack Vector Analysis</h3>
            
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Risk Assessment</h4>
                <Badge className={`${getRiskLevel(results.riskLevel).color} text-white`}>
                  {getRiskLevel(results.riskLevel).text} Risk
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Success Probability:</span>
                  <div className="text-white font-medium">{results.successProbability}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Detection Risk:</span>
                  <div className="text-white font-medium">{results.detectionRisk}</div>
                </div>
                <div>
                  <span className="text-gray-400">Target Awareness:</span>
                  <div className="text-white font-medium">{results.targetAwareness}</div>
                </div>
              </div>
            </div>

            {results.vulnerabilities && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Identified Vulnerabilities</h4>
                {results.vulnerabilities.map((vuln: any, index: number) => (
                  <div key={index} className="bg-[hsl(215,25%,27%)] rounded-lg p-3 border border-[hsl(215,14%,34%)]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">{vuln.type}</h5>
                      <Badge className={`${getRiskLevel(vuln.severity).color} text-white`}>
                        {vuln.severity}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{vuln.description}</p>
                    <div className="text-xs text-gray-400">
                      Exploitability: {vuln.exploitability} | Mitigation: {vuln.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.recommendations && (
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">Security Recommendations</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {results.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}