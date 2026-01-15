import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Edit, Trash2 } from 'lucide-react';
import { Product } from '@/lib/supabase';

interface InventoryManagerProps {
    products: Product[];
}

export function InventoryManager({ products }: InventoryManagerProps) {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [customFields, setCustomFields] = useState<{ key: string, value: string }[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '1',
        images: [] as File[],
    });

    const categories = [...new Set(products.map(p => p.category).filter(c => c && c.trim() !== ''))].sort();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData(prev => ({ ...prev, images: Array.from(e.target.files || []) }));
        }
    };

    const addCustomField = () => {
        setCustomFields([...customFields, { key: '', value: '' }]);
    };

    const removeCustomField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const updateCustomField = (index: number, key: string, value: string) => {
        const newFields = [...customFields];
        newFields[index] = { key, value };
        setCustomFields(newFields);
    };

    const uploadImages = async (files: File[]) => {
        // Performance: Upload images in parallel instead of sequentially
        const uploadPromises = files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
            const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);

            if (error) throw error;

            const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(data.path);
            return publicUrl.publicUrl;
        });

        return await Promise.all(uploadPromises);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            const imageUrls = formData.images.length > 0 ? await uploadImages(formData.images) : [];

            // Convert custom fields array to object
            const customFieldsObj = customFields.reduce((acc, curr) => {
                if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
                return acc;
            }, {} as Record<string, string>);

            if (editingProduct) {
                // Update database
                const { error } = await supabase.from('products').update({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    stock: parseInt(formData.stock),
                    status: parseInt(formData.stock) > 0 ? 'Available' : 'Sold Out',
                    image_urls: imageUrls.length > 0 ? imageUrls : editingProduct.image_urls,
                    custom_fields: customFieldsObj
                }).eq('id', editingProduct.id);

                if (error) throw error;
                
                toast({ title: 'Success', description: 'Product updated successfully' });
                setEditingProduct(null);
                
                // Real-time subscription will update the UI automatically
            } else {
                // Insert new product
                const { error } = await supabase.from('products').insert([{
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    stock: parseInt(formData.stock),
                    status: parseInt(formData.stock) > 0 ? 'Available' : 'Sold Out',
                    image_urls: imageUrls,
                    custom_fields: customFieldsObj
                }]);

                if (error) throw error;
                toast({ title: 'Success', description: 'Product added successfully' });
                
                // Real-time subscription will update the UI automatically
            }

            setFormData({ name: '', description: '', price: '', category: '', stock: '1', images: [] });
            setCustomFields([]);

            // Reset file input
            const fileInput = document.getElementById('images') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error saving product:', error);
            toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            stock: product.stock.toString(),
            images: []
        });
        if (product.custom_fields) {
            const fields = Object.entries(product.custom_fields).map(([key, value]) => ({ key, value: value as string }));
            setCustomFields(fields);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw error;

            toast({ title: 'Success', description: 'Product deleted successfully' });
            // Real-time subscription will update the UI automatically
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
        }
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', category: '', stock: '1', images: [] });
        setCustomFields([]);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingProduct ? 'Edit Item' : 'Add New Item'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Item Name</Label>
                                        <Input name="name" value={formData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <div className="flex gap-2">
                                            <Select onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))} value={formData.category}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Clothing">Clothing</SelectItem>
                                                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                                                    <SelectItem value="Beauty">Beauty</SelectItem>
                                                    <SelectItem value="Accessories">Accessories</SelectItem>
                                                    {categories.filter(c => !['Clothing', 'Jewelry', 'Beauty', 'Accessories'].includes(c)).map(c => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input placeholder="New" onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-24" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Price (₹)</Label>
                                        <Input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Stock</Label>
                                        <Input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea name="description" value={formData.description} onChange={handleInputChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Images</Label>
                                    <Input id="images" type="file" multiple accept="image/*" onChange={handleFileChange} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Custom Fields (e.g. Size, Material, Color)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                                            <Plus className="h-4 w-4 mr-1" /> Add Field
                                        </Button>
                                    </div>
                                    {customFields.map((field, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input placeholder="Field Name (e.g. Size)" value={field.key} onChange={e => updateCustomField(index, e.target.value, field.value)} />
                                            <Input placeholder="Value (e.g. XL)" value={field.value} onChange={e => updateCustomField(index, field.key, e.target.value)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(index)}>
                                                <X className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={uploading} className="flex-1">
                                        {uploading ? <Loader2 className="animate-spin mr-2" /> : null}
                                        {editingProduct ? 'Update Item' : 'Add Item to Catalog'}
                                    </Button>
                                    {editingProduct && (
                                        <Button type="button" variant="outline" onClick={cancelEdit}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Items</span>
                                    <span className="font-bold">{products.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Value</span>
                                    <span className="font-bold">₹{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Product List Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Catalog</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No products found. Add your first product above.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>₹{product.price.toLocaleString()}</TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(product)}
                                                        title="Edit product"
                                                        className="hover:bg-blue-50"
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(product.id)}
                                                        title="Delete product"
                                                        className="hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
