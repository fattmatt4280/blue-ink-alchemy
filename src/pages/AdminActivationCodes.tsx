import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AdminActivationCodes = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [codes, setCodes] = useState<any[]>([]);
  const [count, setCount] = useState(10);
  const [email, setEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || roleData.role !== 'admin') {
        navigate("/");
        toast.error("Admin access required");
        return;
      }

      setIsAdmin(true);
      loadCodes();
    } catch (error) {
      console.error("Error checking admin:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("healyn_activation_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error("Error loading codes:", error);
      toast.error("Failed to load codes");
    }
  };

  const handleGenerate = async () => {
    if (count < 1 || count > 100) {
      toast.error("Please enter a number between 1 and 100");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('generate-activation-codes', {
        body: { count, email: email || undefined },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Generated ${data.count} activation codes`);
      loadCodes();
      setCount(10);
      setEmail("");
    } catch (error: any) {
      console.error("Generate error:", error);
      toast.error(error.message || "Failed to generate codes");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const downloadCodes = () => {
    const csv = "Code,Email,Redeemed,Created\n" + 
      codes.map(c => `${c.code},${c.email || ''},${c.redeemed ? 'Yes' : 'No'},${c.created_at}`).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "healyn-activation-codes.csv";
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <Link to="/admin">
          <Button variant="outline" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
      </div>
      
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Healyn Activation Codes</h1>
          <p className="text-muted-foreground">Generate and manage activation codes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Generate Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Generate New Codes</CardTitle>
              <CardDescription>Create activation codes for Healyn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of Codes (1-100)</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Pre-assign Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Codes"}
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{codes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Codes</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">
                    {codes.filter(c => c.redeemed).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Redeemed</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={downloadCodes}
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Codes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activation Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>{code.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={code.redeemed ? "secondary" : "default"}>
                        {code.redeemed ? "Redeemed" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(code.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(code.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminActivationCodes;