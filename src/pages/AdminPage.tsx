import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLoader } from '@/components/LoadingSpinner';
import { Package, DollarSign, Tag, Users, Activity } from 'lucide-react';
import { InventoryManager } from '@/components/admin/InventoryManager';
import { SalesTracker } from '@/components/admin/SalesTracker';
import { CustomerManager } from '@/components/admin/CustomerManager';

export function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { products } = useProducts();

  // Redirect if not authenticated or not admin
  if (!authLoading && (!user || !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading) return <PageLoader />;

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const outOfStock = products.filter(p => p.stock === 0 || p.status === 'Sold Out').length;

  // Calculate total inventory items
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage inventory, track sales, and credit accounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{totalStock} items in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalValue.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Active Sections: Inventory, Sales, Customers
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Sales & Billing
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Credit & Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryManager products={products} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <SalesTracker products={products} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomerManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}