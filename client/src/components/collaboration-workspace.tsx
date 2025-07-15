import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Bell, 
  Eye, 
  Edit, 
  Bookmark,
  Tag,
  Clock,
  UserPlus,
  Settings
} from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  queryId?: number;
  reportId?: number;
  mentions: string[];
  timestamp: string;
  edited?: boolean;
}

interface TeamMember {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
  lastActive: string;
  status: 'online' | 'away' | 'offline';
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
}

export default function CollaborationWorkspace() {
  const [activeTab, setActiveTab] = useState("workspace");
  const [comments, setComments] = useState<Comment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queries } = useQuery({
    queryKey: ["/api/osint/queries"],
  });

  // Initialize collaboration data
  useEffect(() => {
    const initializeData = () => {
      // Sample team members
      const members: TeamMember[] = [
        {
          id: '1',
          username: 'alice.security',
          email: 'alice@company.com',
          role: 'admin',
          avatar: '/api/avatars/alice.jpg',
          lastActive: new Date().toISOString(),
          status: 'online'
        },
        {
          id: '2',
          username: 'bob.analyst',
          email: 'bob@company.com',
          role: 'analyst',
          lastActive: new Date(Date.now() - 300000).toISOString(),
          status: 'online'
        },
        {
          id: '3',
          username: 'charlie.viewer',
          email: 'charlie@company.com',
          role: 'viewer',
          lastActive: new Date(Date.now() - 1800000).toISOString(),
          status: 'away'
        }
      ];

      const workspace: Workspace = {
        id: '1',
        name: 'Security Assessment Team',
        description: 'Collaborative workspace for ongoing security assessments and threat analysis',
        members: members,
        createdBy: 'alice.security',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isPublic: false
      };

      // Sample comments
      const sampleComments: Comment[] = [
        {
          id: '1',
          userId: '1',
          username: 'alice.security',
          content: 'Found interesting subdomain enumeration results for @bob.analyst to review. The staging environment appears to be publicly accessible.',
          queryId: queries?.[0]?.id,
          mentions: ['bob.analyst'],
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          userId: '2',
          username: 'bob.analyst',
          content: 'Thanks @alice.security! I see several critical vulnerabilities in the staging environment. Should we escalate this to the security team?',
          queryId: queries?.[0]?.id,
          mentions: ['alice.security'],
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          userId: '1',
          username: 'alice.security',
          content: 'Yes, please create a high-priority report. The CVE-2024-0001 vulnerability needs immediate attention.',
          queryId: queries?.[0]?.id,
          mentions: [],
          timestamp: new Date(Date.now() - 900000).toISOString()
        }
      ];

      setTeamMembers(members);
      setWorkspaces([workspace]);
      setComments(sampleComments);
      setSelectedWorkspace(workspace.id);
    };

    initializeData();
  }, [queries]);

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await apiRequest("POST", "/api/collaboration/comments", commentData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/collaboration/comments"] });
    },
    onError: (error) => {
      toast({
        title: "Comment Failed",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const mentions = newComment.match(/@(\w+(?:\.\w+)*)/g)?.map(m => m.substring(1)) || [];
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      username: 'current.user',
      content: newComment,
      mentions: mentions,
      timestamp: new Date().toISOString()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");
    
    // Send notifications for mentions
    mentions.forEach(mention => {
      toast({
        title: "Mention Sent",
        description: `Notification sent to @${mention}`,
      });
    });
  };

  const handleMentionInput = (value: string) => {
    setNewComment(value);
    
    // Extract current word being typed after @
    const words = value.split(' ');
    const currentWord = words[words.length - 1];
    
    if (currentWord.startsWith('@')) {
      const searchTerm = currentWord.substring(1).toLowerCase();
      const suggestions = teamMembers
        .filter(member => member.username.toLowerCase().includes(searchTerm))
        .map(member => member.username);
      setMentionSuggestions(suggestions);
    } else {
      setMentionSuggestions([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600';
      case 'analyst': return 'bg-blue-600';
      case 'viewer': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Users className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
          Collaboration Workspace
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-600 text-white">
            {teamMembers.filter(m => m.status === 'online').length} Online
          </Badge>
          <Badge className="bg-blue-600 text-white">
            {comments.length} Comments
          </Badge>
          <Badge className="bg-purple-600 text-white">Team: {workspaces[0]?.name}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(215,25%,27%)]">
            <TabsTrigger value="workspace" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Users className="h-4 w-4 mr-2" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="sharing" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Share2 className="h-4 w-4 mr-2" />
              Sharing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-[hsl(207,90%,54%)]">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Team Members</h4>
                <Button size="sm" className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
              
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between border border-[hsl(215,14%,34%)] rounded p-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-[hsl(207,90%,54%)] text-white">
                            {member.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[hsl(215,25%,27%)] ${getStatusColor(member.status)}`}></div>
                      </div>
                      <div>
                        <div className="text-white font-medium">{member.username}</div>
                        <div className="text-gray-400 text-sm">{member.email}</div>
                        <div className="text-gray-500 text-xs">
                          Last active: {new Date(member.lastActive).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                      <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Workspace Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Workspace Name</span>
                  <span className="text-white">{workspaces[0]?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Created By</span>
                  <span className="text-white">{workspaces[0]?.createdBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Members</span>
                  <span className="text-white">{teamMembers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Visibility</span>
                  <Badge variant="outline">
                    {workspaces[0]?.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Add Comment</h4>
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    value={newComment}
                    onChange={(e) => handleMentionInput(e.target.value)}
                    placeholder="Type your comment... Use @username to mention team members"
                    className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                    rows={3}
                  />
                  {mentionSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-[hsl(217,32%,17%)] border border-[hsl(215,14%,34%)] rounded-b z-10">
                      {mentionSuggestions.map((suggestion, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-2 text-white hover:bg-[hsl(215,25%,27%)] cursor-pointer"
                          onClick={() => {
                            const words = newComment.split(' ');
                            words[words.length - 1] = `@${suggestion} `;
                            setNewComment(words.join(' '));
                            setMentionSuggestions([]);
                          }}
                        >
                          @{suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                      <Tag className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                    <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmark
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="bg-[hsl(207,90%,54%)] hover:bg-blue-600"
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[hsl(207,90%,54%)] text-white text-sm">
                        {comment.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">{comment.username}</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                        {comment.edited && (
                          <Badge variant="outline" className="text-xs">Edited</Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {comment.content.split(' ').map((word, idx) => (
                          <span key={idx}>
                            {word.startsWith('@') ? (
                              <span className="text-blue-400 font-medium">{word}</span>
                            ) : (
                              word
                            )}
                            {' '}
                          </span>
                        ))}
                      </p>
                      {comment.mentions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {comment.mentions.map((mention, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              @{mention}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Share Investigation Results</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Share Type</label>
                    <select className="w-full bg-[hsl(217,32%,17%)] border border-[hsl(215,14%,34%)] rounded p-2 text-white">
                      <option>Individual Query</option>
                      <option>Report</option>
                      <option>Workflow Results</option>
                      <option>Complete Investigation</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Access Level</label>
                    <select className="w-full bg-[hsl(217,32%,17%)] border border-[hsl(215,14%,34%)] rounded p-2 text-white">
                      <option>View Only</option>
                      <option>Comment & View</option>
                      <option>Edit & Comment</option>
                      <option>Full Access</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Share With</label>
                  <Input
                    placeholder="Enter email addresses or usernames"
                    className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Message (Optional)</label>
                  <Textarea
                    placeholder="Add a message for the recipients"
                    className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] text-white"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button className="bg-[hsl(207,90%,54%)] hover:bg-blue-600">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                  <Button variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                    Generate Link
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Notification Center</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between border border-[hsl(215,14%,34%)] rounded p-3">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-white text-sm">New mention in comments</div>
                      <div className="text-gray-400 text-xs">@alice.security mentioned you in vulnerability discussion</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">2m ago</span>
                    <Badge className="bg-blue-600">New</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border border-[hsl(215,14%,34%)] rounded p-3">
                  <div className="flex items-center space-x-3">
                    <Share2 className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="text-white text-sm">Report shared with you</div>
                      <div className="text-gray-400 text-xs">Security Assessment Report - Q4 2024</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">1h ago</span>
                    <Button size="sm" variant="outline" className="border-[hsl(215,14%,34%)] text-white">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border border-[hsl(215,14%,34%)] rounded p-3">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="text-white text-sm">Team member joined workspace</div>
                      <div className="text-gray-400 text-xs">charlie.viewer has joined Security Assessment Team</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">3h ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(215,25%,27%)] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Notification Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email notifications</span>
                  <input type="checkbox" checked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Mention alerts</span>
                  <input type="checkbox" checked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Report sharing notifications</span>
                  <input type="checkbox" checked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Workflow completion alerts</span>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}