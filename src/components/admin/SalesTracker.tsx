import { useState, useEffect } from 'react';
import { supabase, Product, Customer } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search } from 'lucide-react';

interface SalesTrackerProps {
    products: Product[];
}

export function SalesTracker({ products }: SalesTrackerProps) {
    const [sales, setSales] = useState<any[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        productId: '',
        customerId: 'guest',
        buyerName: '',
        totalAmount: '',
        amountPaid: '',
        paymentStatus: 'Paid'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, customersRes] = await Promise.all([
                supabase.from('sales').select('*, products(name), customers(name)').order('date', { ascending: false }),
                supabase.from('customers').select('*').order('name')
            ]);

            if (salesRes.error) throw salesRes.error;
            if (customersRes.error) throw customersRes.error;

            setSales(salesRes.data || []);
            setCustomers(customersRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load sales data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setFormData(prev => ({
                ...prev,
                productId,
                totalAmount: product.price.toString(),
                amountPaid: product.price.toString() // Default to full payment
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const totalAmount = parseFloat(formData.totalAmount);
            const amountPaid = parseFloat(formData.amountPaid);
            const balanceDue = totalAmount - amountPaid;

            let paymentStatus = 'Paid';
            if (balanceDue > 0) {
                paymentStatus = amountPaid > 0 ? 'Partial' : 'Pending';
            }

            const saleData = {
                product_id: formData.productId,
                customer_id: formData.customerId === 'guest' ? null : formData.customerId,
                buyer_name: formData.customerId === 'guest' ? formData.buyerName : null,
                total_amount: totalAmount,
                amount_paid: amountPaid,
                payment_status: paymentStatus,
            };

            const { error } = await supabase.from('sales').insert([saleData]);

            if (error) throw error;

            // Update product stock
            const product = products.find(p => p.id === formData.productId);
            if (product) {
                await supabase.from('products').update({
                    stock: Math.max(0, product.stock - 1),
                    status: product.stock - 1 <= 0 ? 'Sold Out' : product.status
                }).eq('id', formData.productId);
            }

            // Update customer balance if applicable
            if (formData.customerId !== 'guest') {
                const customer = customers.find(c => c.id === formData.customerId);
                if (customer) {
                    await supabase.from('customers').update({
                        total_balance: (customer.total_balance || 0) + balanceDue
                    }).eq('id', formData.customerId);
                }
            }

            toast({ title: 'Success', description: 'Sale recorded successfully' });
            setFormData({
                productId: '',
                customerId: 'guest',
                buyerName: '',
                totalAmount: '',
                amountPaid: '',
                paymentStatus: 'Paid'
            });
            fetchData();
        } catch (error) {
            console.error('Error recording sale:', error);
            toast({
                title: 'Error',
                description: 'Failed to record sale',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Record New Sale</CardTitle>
                    <CardDescription>Enter details for a new transaction</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Select value={formData.productId} onValueChange={handleProductChange} disabled={submitting}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.filter(p => p.stock > 0).map(product => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name} (₹{product.price})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Select
                                    value={formData.customerId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, customerId: val }))}
                                    disabled={submitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="guest">Guest / Walk-in</SelectItem>
                                        {customers.map(customer => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.customerId === 'guest' && (
                                <div className="space-y-2">
                                    <Label>Buyer Name</Label>
                                    <Input
                                        value={formData.buyerName}
                                        onChange={e => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                                        placeholder="Enter name"
                                        disabled={submitting}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Total Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.totalAmount}
                                    readOnly
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Amount Paid (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.amountPaid}
                                    onChange={e => setFormData(prev => ({ ...prev, amountPaid: e.target.value }))}
                                    placeholder={formData.totalAmount}
                                    disabled={submitting}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={submitting || !formData.productId}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Record Sale
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                                    </TableRow>
                                ) : sales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">No sales recorded yet</TableCell>
                                    </TableRow>
                                ) : (
                                    sales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{sale.products?.name || 'Unknown Item'}</TableCell>
                                            <TableCell>{sale.customers?.name || sale.buyer_name || 'Guest'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>Total: ₹{sale.total_amount}</span>
                                                    {sale.balance_due > 0 && <span className="text-red-500 text-xs">Due: ₹{sale.balance_due}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${sale.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                        sale.payment_status === 'Pending' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {sale.payment_status}
                                                </span>
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
