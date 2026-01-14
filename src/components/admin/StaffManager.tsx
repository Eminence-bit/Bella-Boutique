import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldAlert, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function StaffManager() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            toast({
                title: 'Error',
                description: 'Failed to load staff list',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (profileId: string, currentRole: string) => {
        if (profileId === user?.id) {
            toast({
                title: 'Action Denied',
                description: 'You cannot change your own role.',
                variant: 'destructive',
            });
            return;
        }

        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', profileId);

            if (error) throw error;

            toast({
                title: 'Role Updated',
                description: `User role changed to ${newRole}`,
            });

            // Update local state
            setProfiles(profiles.map(p =>
                p.id === profileId ? { ...p, role: newRole as 'user' | 'admin' } : p
            ));
        } catch (error) {
            console.error('Error updating role:', error);
            toast({
                title: 'Error',
                description: 'Failed to update user role',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>Approve new admins or revoke access</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                                    </TableRow>
                                ) : profiles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">No users found</TableCell>
                                    </TableRow>
                                ) : (
                                    profiles.map((profile) => (
                                        <TableRow key={profile.id}>
                                            <TableCell className="font-mono text-xs">{profile.id}</TableCell>
                                            <TableCell>
                                                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                                                    {profile.role.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {profile.id !== user?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRole(profile.id, profile.role)}
                                                        className={profile.role === 'user' ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                                                    >
                                                        {profile.role === 'user' ? (
                                                            <><Check className="mr-2 h-4 w-4" /> Approve Admin</>
                                                        ) : (
                                                            <><X className="mr-2 h-4 w-4" /> Revoke Access</>
                                                        )}
                                                    </Button>
                                                )}
                                                {profile.id === user?.id && (
                                                    <span className="text-sm text-muted-foreground italic">Current User</span>
                                                )}
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
