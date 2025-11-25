import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, RefreshCw, ShoppingCart, DollarSign, TrendingUp, Clock, Trash2 } from "lucide-react";
import { logAdminAction } from "@/utils/adminLogger";
import { Skeleton } from "@/components/ui/skeleton";

interface AbandonedCart {
  id: string;
  email: string;
  cart_items: any[];
  cart_value: number;
  created_at: string;
  email_sent_at: string | null;
  converted: boolean;
  converted_at: string | null;
  discount_code_used: string | null;
}

const AbandonedCartsManager = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendingEmail: 0,
    emailSent: 0,
    recovered: 0,
    totalValue: 0,
    recoveredValue: 0
  });

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setCarts(data as any[] || []);

      // Calculate stats
      const total = data?.length || 0;
      const pendingEmail = data?.filter(c => !c.email_sent_at && !c.converted).length || 0;
      const emailSent = data?.filter(c => c.email_sent_at && !c.converted).length || 0;
      const recovered = data?.filter(c => c.converted).length || 0;
      const totalValue = data?.reduce((sum, c) => sum + Number(c.cart_value), 0) || 0;
      const recoveredValue = data?.filter(c => c.converted).reduce((sum, c) => sum + Number(c.cart_value), 0) || 0;

      setStats({
        total,
        pendingEmail,
        emailSent,
        recovered,
        totalValue,
        recoveredValue
      });
    } catch (error: any) {
      console.error('Error fetching abandoned carts:', error);
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const processAbandonedCarts = async () => {
    try {
      toast.info('Processing abandoned carts...');
      const { data, error } = await supabase.functions.invoke('process-abandoned-carts');
      
      if (error) throw error;
      
      toast.success(`Processed ${data.processed || 0} abandoned carts`);
      fetchCarts();
    } catch (error: any) {
      console.error('Error processing abandoned carts:', error);
      toast.error('Failed to process abandoned carts');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const deleteCart = async (cartId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete the abandoned cart for ${email}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .delete()
        .eq('id', cartId);
      
      if (error) throw error;
      
      // Log the admin action
      await logAdminAction({
        action: 'deleted',
        resourceType: 'abandoned_cart',
        resourceId: cartId,
        details: { email, cart_value: carts.find(c => c.id === cartId)?.cart_value }
      });
      
      toast.success(`Deleted abandoned cart for ${email}`);
      fetchCarts();
    } catch (error: any) {
      console.error('Error deleting cart:', error);
      toast.error('Failed to delete cart');
    }
  };

  const recoveryRate = stats.total > 0 ? ((stats.recovered / stats.total) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abandoned</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalValue)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Email</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEmail}</div>
            <p className="text-xs text-muted-foreground">
              Waiting 24h before sending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailSent}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recoveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.recoveredValue)} recovered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Abandoned Carts Management</CardTitle>
          <CardDescription>
            View and manage abandoned shopping carts. Emails are automatically sent 24 hours after cart abandonment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={processAbandonedCarts} variant="default">
              <Mail className="w-4 h-4 mr-2" />
              Process Pending Carts Now
            </Button>
            <Button onClick={fetchCarts} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {carts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No abandoned carts found
                    </TableCell>
                  </TableRow>
                ) : (
                  carts.map((cart) => (
                    <TableRow key={cart.id}>
                      <TableCell className="font-medium">{cart.email}</TableCell>
                      <TableCell>{cart.cart_items?.length || 0} items</TableCell>
                      <TableCell>{formatCurrency(cart.cart_value)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getTimeAgo(cart.created_at)}
                          <div className="text-xs text-muted-foreground">
                            {formatDate(cart.created_at)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cart.email_sent_at ? (
                          <Badge variant="secondary">
                            Sent {getTimeAgo(cart.email_sent_at)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {cart.converted ? (
                          <Badge variant="default" className="bg-green-500">
                            ✓ Recovered
                            {cart.discount_code_used && (
                              <span className="ml-1">({cart.discount_code_used})</span>
                            )}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Abandoned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCart(cart.id, cart.email)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
};

export default AbandonedCartsManager;
