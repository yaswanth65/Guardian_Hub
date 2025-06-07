
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onBackClick: () => void;
  onAdminLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBackClick, onAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Predefined admin credentials
  const adminCredentials = [
    { email: 'admin1@safety.com', password: 'admin123' },
    { email: 'admin2@safety.com', password: 'admin456' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Check against predefined admin credentials
    const isValidAdmin = adminCredentials.some(
      admin => admin.email === email && admin.password === password
    );

    if (isValidAdmin) {
      localStorage.setItem('isAdmin', 'true');
      onAdminLogin();
      toast({
        title: "Success",
        description: "Admin logged in successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="absolute top-4 left-4 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Admin Portal</CardTitle>
          <CardDescription className="text-slate-300">
            Administrative access only
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
              <p className="text-xs text-slate-400 mb-2">Demo Admin Credentials:</p>
              <p className="text-xs text-slate-300">admin1@safety.com / admin123</p>
              <p className="text-xs text-slate-300">admin2@safety.com / admin456</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Admin Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
