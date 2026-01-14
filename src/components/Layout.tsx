import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Home, Grid3X3, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Bella Boutique</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/catalog"
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Catalog</span>
              </Link>
            </nav>

            {/* Hidden admin access - only show if user is logged in */}
            {user && (
              <div className="flex items-center space-x-2">
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-4 flex justify-center space-x-8">
            <Link
              to="/"
              className="flex flex-col items-center space-y-1 text-sm font-medium transition-colors hover:text-primary"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/catalog"
              className="flex flex-col items-center space-y-1 text-sm font-medium transition-colors hover:text-primary"
            >
              <Grid3X3 className="h-5 w-5" />
              <span>Catalog</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="font-semibold">Bella Boutique</span>
              <span className="text-sm text-muted-foreground">
                Your favorite ladies fashion & accessories store
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Bella Boutique. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}