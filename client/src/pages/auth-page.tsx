import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", email: "" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({ title: "Missing fields", description: "Please enter username and password.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(loginForm.username, loginForm.password);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerForm.username || !registerForm.password) {
      toast({ title: "Missing fields", description: "Username and password are required.", variant: "destructive" });
      return;
    }
    if (registerForm.password.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await register(registerForm.username, registerForm.password, registerForm.email || undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] flex flex-col items-center justify-center p-4">
      <div className="flex items-center mb-8">
        <Shield className="text-[hsl(207,90%,54%)] h-10 w-10 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-white">OSINT Tool Shed</h1>
          <p className="text-gray-400 text-sm">Open Source Intelligence Platform</p>
        </div>
      </div>

      <Card className="w-full max-w-md bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)]">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-xl">Welcome Back</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to access your OSINT tools and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[hsl(215,25%,27%)] mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-[hsl(207,90%,54%)] data-[state=active]:text-white text-gray-300">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[hsl(207,90%,54%)] data-[state=active]:text-white text-gray-300">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-gray-300">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(f => ({ ...f, username: e.target.value }))}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder:text-gray-500"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder:text-gray-500 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white mt-2"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username" className="text-gray-300">Username</Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Choose a username (min 3 chars)"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm(f => ({ ...f, username: e.target.value }))}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder:text-gray-500"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-gray-300">Email <span className="text-gray-500">(optional)</span></Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder:text-gray-500"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                      className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder:text-gray-500 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white mt-2"
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-gray-500 mt-6">
            For authorized security research and educational use only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
