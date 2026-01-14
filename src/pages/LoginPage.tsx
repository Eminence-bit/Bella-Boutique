import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User, Mail, Lock, ShieldAlert, LogOut } from 'lucide-react';

export function LoginPage() {
  const { user, isAdmin, signIn, signUp, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Clear error when switching between login/signup modes
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  // Redirect if already logged in AND is admin
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // If logged in but NOT admin, show pending state
  if (user && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
                <ShieldAlert className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl text-yellow-900">Access Pending</CardTitle>
              <CardDescription className="text-yellow-700">
                Your account has been created, but you do not have administrative privileges yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-center text-yellow-800">
                Please ask an existing administrator to approve your account access.
              </p>

              {/* Debug Info */}
              <div className="bg-black/5 p-2 rounded text-xs font-mono break-all">
                <p><strong>Debug Info:</strong></p>
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Role in Profile: {JSON.stringify(profile)}</p>
                <p>Is Admin Check: {isAdmin ? 'YES' : 'NO'}</p>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => signOut()} className="border-yellow-200 hover:bg-yellow-100 text-yellow-900">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isLogin
        ? await signIn(formData.email, formData.password)
        : await signUp(formData.email, formData.password);

      if (error) {
        setError(error.message);
      } else {
        // Navigation handled by re-render
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? 'Admin Login' : 'Request Access'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Sign in to manage your products'
                : 'Create an account to request admin access'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="pl-9"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pl-9"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {isLogin ? 'Sign In' : 'Request Access'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={toggleMode}
                disabled={loading}
              >
                {isLogin
                  ? "Need access? Request an account"
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}