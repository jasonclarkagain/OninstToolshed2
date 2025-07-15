import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Workflow, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  Zap, 
  Target, 
  ArrowRight,
  Plus,
  Trash2,
  Copy
} from "lucide-react";

interface WorkflowStep {
  id: string;
  tool: string;
  target: string;
  config: any;
  enabled: boolean;
  delay: number;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  schedule: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
  };
  status: 'active' | 'paused' | 'stopped';
  lastRun?: string;
  nextRun?: string;
}

export default function WorkflowAutomation() {
  const [activeTab, setActiveTab] = useState("workflows");
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: '1',
      name: 'Domain Reconnaissance',
      description: 'Comprehensive domain analysis including subdomain enumeration, vulnerability scanning, and threat intelligence',
      steps: [
        { id: '1', tool: 'domain_enumeration', target: '', config: { scanType: 'full' }, enabled: true, delay: 0 },
        { id: '2', tool: 'whois_lookup', target: '', config: {}, enabled: true, delay: 5 },
        { id: '3', tool: 'vulnerability_scan', target: '', config: { scanType: 'cve' }, enabled: true, delay: 10 },
        { id: '4', tool: 'metasploit', target: '', config: { exploitModule: 'auto' }, enabled: false, delay: 30 }
      ],
      schedule: { enabled: false, frequency: 'daily', time: '09:00' },
      status: 'stopped'
    },
    {
      id: '2',
      name: 'Network Security Sweep',
      description: 'Automated network scanning and security assessment',
      steps: [
        { id: '1', tool: 'network_scan', target: '', config: { type: 'ping_sweep' }, enabled: true, delay: 0 },
        { id: '2', tool: 'port_scan', target: '', config: { ports: 'top1000' }, enabled: true, delay: 15 },
        { id: '3', tool: 'vulnerability_scan', target: '', config: { scanType: 'network' }, enabled: true, delay: 30 }
      ],
      schedule: { enabled: true, frequency: 'weekly', time: '02:00' },
      status: 'active'
    }
  ]);
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [newWorkflow, setNewWorkflow] = useState<Partial<AutomationWorkflow>>({
    name: "",
    description: "",
    steps: [],
    schedule: { enabled: false, frequency: 'daily' },
    status: 'stopped'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const runWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await apiRequest("POST", "/api/osint/run-workflow", { workflowId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow Started",
        description: "Your automation workflow has been started successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Workflow Failed",
        description: "Failed to start the workflow. Please check your configuration.",
        variant: "destructive",
      });
    },
  });

  const availableTools = [
    { id: 'domain_enumeration', name: 'Domain Enumeration', category: 'reconnaissance' },
    { id: 'ip_analysis', name: 'IP Analysis', category: 'reconnaissance' },
    { id: 'whois_lookup', name: 'WHOIS Lookup', category: 'reconnaissance' },
    { id: 'port_scan', name: 'Port Scanning', category: 'scanning' },
    { id: 'vulnerability_scan', name: 'Vulnerability Scan', category: 'scanning' },
    { id: 'metasploit', name: 'Metasploit', category: 'exploitation' },
    { id: 'social_engineering', name: 'Social Engineering', category: 'exploitation' },
    { id: 'osint_framework', name: 'OSINT Framework', category: 'intelligence' },
    { id: 'wifi_scan', name: 'WiFi Scanning', category: 'wireless' },
    { id: 'email_validation', name: 'Email Validation', category: 'validation' }
  ];

  const scanProfiles = [
    { id: 'quick', name: 'Quick Scan', description: 'Fast reconnaissance with basic tools' },
    { id: 'comprehensive', name: 'Comprehensive', description: 'Full assessment with all available tools' },
    { id: 'stealth', name: 'Stealth Mode', description: 'Low-profile scanning to avoid detection' },
    { id: 'aggressive', name: 'Aggressive', description: 'High-intensity scanning and exploitation' }
  ];

  const addStep = (workflowId: string) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      tool: '',
      target: '',
      config: {},
      enabled: true,
      delay: 0
    };
    
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, steps: [...w.steps, newStep] }
        : w
    ));
  };

  const removeStep = (workflowId: string, stepId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, steps: w.steps.filter(s => s.id !== stepId) }
        : w
    ));
  };

  const updateStep = (workflowId: string, stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { 
            ...w, 
            steps: w.steps.map(s => 
              s.id === stepId ? { ...s, ...updates } : s
            ) 
          }
        : w
    ));
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { 
            ...w, 
            status: w.status === 'active' ? 'paused' : 'active',
            lastRun: w.status === 'paused' ? new Date().toISOString() : w.lastRun
          }
        : w
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'paused': return 'bg-yellow-600';
      case 'stopped': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getToolCategory = (toolId: string) => {
    const tool = availableTools.find(t => t.id === toolId);
    return tool?.category || 'unknown';
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Workflow className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Workflow Automation
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-600 text-white">
            {workflows.filter(w => w.status === 'active').length} Active
          </Badge>
          <Badge className="bg-blue-600 text-white">
            {workflows.reduce((sum, w) => sum + w.steps.length, 0)} Total Steps
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="workflows" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="builder" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Settings className="h-4 w-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="profiles" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Target className="h-4 w-4 mr-2" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Active Workflows</h4>
              <Button 
                size="sm" 
                onClick={() => setActiveTab("builder")}
                className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>

            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="text-white font-medium">{workflow.name}</h5>
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        {workflow.schedule.enabled && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{workflow.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{workflow.steps.length} steps</span>
                        {workflow.lastRun && (
                          <span>Last run: {new Date(workflow.lastRun).toLocaleString()}</span>
                        )}
                        {workflow.nextRun && (
                          <span>Next run: {new Date(workflow.nextRun).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => runWorkflowMutation.mutate(workflow.id)}
                        disabled={runWorkflowMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleWorkflow(workflow.id)}
                        className="border-[hsl(215,14%,34%)] text-white"
                      >
                        {workflow.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedWorkflow(workflow.id)}
                        className="border-[hsl(215,14%,34%)] text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {workflow.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center space-x-1 flex-shrink-0">
                        <div className={`px-2 py-1 rounded text-xs ${step.enabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                          {availableTools.find(t => t.id === step.tool)?.name || step.tool}
                        </div>
                        {idx < workflow.steps.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Workflow Builder</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Workflow Name</label>
                  <Input
                    value={newWorkflow.name || ""}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    placeholder="Enter workflow name"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                  <Input
                    value={newWorkflow.description || ""}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    placeholder="Describe this workflow"
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-gray-300 text-sm">Workflow Steps</h5>
                  <Button 
                    size="sm" 
                    onClick={() => addStep('new')}
                    className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {(newWorkflow.steps || []).map((step, idx) => (
                  <div key={step.id} className="bg-[hsl(217,32%,17%)] rounded-lg p-3 border border-[hsl(215,14%,34%)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-sm">Step {idx + 1}</span>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={step.enabled}
                          onCheckedChange={(checked) => updateStep('new', step.id, { enabled: checked })}
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeStep('new', step.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Tool</label>
                        <Select value={step.tool} onValueChange={(value) => updateStep('new', step.id, { tool: value })}>
                          <SelectTrigger className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white">
                            <SelectValue placeholder="Select tool" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTools.map((tool) => (
                              <SelectItem key={tool.id} value={tool.id}>
                                {tool.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Target</label>
                        <Input
                          value={step.target}
                          onChange={(e) => updateStep('new', step.id, { target: e.target.value })}
                          placeholder="Target (domain, IP, etc.)"
                          className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Delay (seconds)</label>
                        <Input
                          type="number"
                          value={step.delay}
                          onChange={(e) => updateStep('new', step.id, { delay: parseInt(e.target.value) || 0 })}
                          className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Save Workflow
                </Button>
                <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                  <Copy className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanProfiles.map((profile) => (
                <div key={profile.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4 border border-[hsl(215,14%,34%)]">
                  <h4 className="text-white font-medium mb-2">{profile.name}</h4>
                  <p className="text-gray-300 text-sm mb-4">{profile.description}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                      Use Profile
                    </Button>
                    <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                      Customize
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Scheduled Workflows</h4>
              
              <div className="space-y-4">
                {workflows.filter(w => w.schedule.enabled).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between border border-[hsl(215,14%,34%)] rounded p-3">
                    <div>
                      <div className="text-white font-medium">{workflow.name}</div>
                      <div className="text-gray-400 text-sm">
                        Runs {workflow.schedule.frequency} at {workflow.schedule.time}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-600">Active</Badge>
                      <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                        Edit Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}