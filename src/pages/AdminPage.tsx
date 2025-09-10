import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { LoadingSpinner, PageLoader } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Upload, Plus, Package, DollarSign, Tag } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  images: File[];
}

export function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { products, loading: productsLoading, refetch } = useProducts();
  const { toast } = useToast();
  
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '1',
    images: [],
  });

  // Redirect if not authenticated or not admin
  if (!authLoading && (!user || !isAdmin)) {
    return <Navigate to="/catalog" replace />;
  }

  if (authLoading) return <PageLoader />;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: files,
      }));
    }
  };

  const uploadImages = async (files: File[]) => {
    const imageUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }

      const { data: publicUrl } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      imageUrls.push(publicUrl.publicUrl);
    }

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Validate form data
      if (!formData.name.trim() || !formData.description.trim() || 
          !formData.price || !formData.category.trim()) {
        throw new Error('Please fill in all required fields');
      }

      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);

      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price');
      }

      if (isNaN(stock) || stock < 0) {
        throw new Error('Please enter a valid stock quantity');
      }

      // Upload images if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images);
      }

      // Insert product into database
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim(),
          price,
          category: formData.category.trim(),
          stock,
          status: stock > 0 ? 'Available' : 'Sold Out',
          image_urls: imageUrls,
        }]);

      if (error) throw error;

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '1',
        images: [],
      });

      // Reset file input
      const fileInput = document.getElementById('images') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: 'Success!',
        description: 'Product has been added successfully.',
      });

      // Refresh products list
      refetch();
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))].sort();
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const outOfStock = products.filter(p => p.stock === 0 || p.status === 'Sold Out').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage your fashion, jewelry, and beauty products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
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
                <div className="text-2xl font-bold">{outOfStock}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Product</span>
              </CardTitle>
              <CardDescription>
                Fill in the details below to add a new product to your catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Cotton T-Shirt"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="599.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                      disabled={uploading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or enter category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Jewelry">Jewelry</SelectItem>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Bags">Bags</SelectItem>
                        <SelectItem value="Footwear">Footwear</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or enter new category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, category: e.target.value }))
                      }
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Beautiful gold-plated chain perfect for special occasions..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={uploading}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Product Images</Label>
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select multiple images to create a gallery (optional)
                  </p>
                  {formData.images.length > 0 && (
                    <p className="text-sm text-primary">
                      {formData.images.length} image(s) selected
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={uploading}
                >
                  {uploading && <LoadingSpinner size="sm" className="mr-2" />}
                  {uploading ? 'Adding Product...' : 'Add Product'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <a href="/catalog" target="_blank">
                  View Catalog
                </a>
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={refetch}
                disabled={productsLoading}
              >
                {productsLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Refresh Data
              </Button>
            </CardContent>
          </Card>

          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const count = products.filter(p => p.category === category).length;
                    return (
                      <div key={category} className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}