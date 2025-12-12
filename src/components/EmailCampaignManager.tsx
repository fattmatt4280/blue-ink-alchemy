import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Send, Users, Mail, RefreshCw, Eye, Trash2, Plus, TestTube } from "lucide-react";
import { format } from "date-fns";

interface MarketingContact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  source: string;
  subscribed: boolean;
  tags: string[];
  total_orders: number;
  total_spent: number;
  created_at: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  status: string;
  total_recipients: number;
  total_sent: number;
  total_failed: number;
  sent_at: string | null;
  created_at: string;
}

const EmailCampaignManager = () => {
  const [contacts, setContacts] = useState<MarketingContact[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Campaign form
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, campaignsRes] = await Promise.all([
        supabase.from("marketing_contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
      ]);

      if (contactsRes.data) setContacts(contactsRes.data);
      if (campaignsRes.data) setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncContacts = async () => {
    setSyncing(true);
    try {
      // Trigger a manual sync by re-fetching
      await fetchData();
      toast.success("Contacts synced successfully");
    } catch (error) {
      toast.error("Failed to sync contacts");
    } finally {
      setSyncing(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !subject || !htmlContent) {
      toast.error("Please fill in subject, content, and test email address");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-mass-email", {
        body: { testEmail, subject, htmlContent },
      });

      if (error) throw error;

      toast.success(`Test email sent to ${testEmail}`);
    } catch (error: any) {
      toast.error(`Failed to send test email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleCreateAndSendCampaign = async () => {
    if (!campaignName || !subject || !htmlContent) {
      toast.error("Please fill in campaign name, subject, and content");
      return;
    }

    const subscribedCount = contacts.filter(c => c.subscribed).length;
    if (subscribedCount === 0) {
      toast.error("No subscribed contacts to send to");
      return;
    }

    if (!confirm(`Are you sure you want to send this email to ${subscribedCount} contacts?`)) {
      return;
    }

    setSending(true);
    try {
      // Create campaign
      const { data: campaign, error: createError } = await supabase
        .from("email_campaigns")
        .insert({
          name: campaignName,
          subject,
          html_content: htmlContent,
          filter_tags: selectedTags.length > 0 ? selectedTags : null,
          status: "pending",
        })
        .select()
        .single();

      if (createError) throw createError;

      // Send emails
      const { data, error } = await supabase.functions.invoke("send-mass-email", {
        body: { 
          campaignId: campaign.id,
          filterTags: selectedTags.length > 0 ? selectedTags : undefined,
        },
      });

      if (error) throw error;

      toast.success(`Campaign sent! ${data.sent} emails delivered, ${data.failed} failed`);
      
      // Reset form
      setCampaignName("");
      setSubject("");
      setHtmlContent("");
      setSelectedTags([]);
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      toast.error(`Failed to send campaign: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const { error } = await supabase.from("marketing_contacts").delete().eq("id", id);
      if (error) throw error;
      setContacts(contacts.filter(c => c.id !== id));
      toast.success("Contact deleted");
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  const handleToggleSubscription = async (contact: MarketingContact) => {
    try {
      const { error } = await supabase
        .from("marketing_contacts")
        .update({ 
          subscribed: !contact.subscribed,
          unsubscribed_at: !contact.subscribed ? null : new Date().toISOString(),
        })
        .eq("id", contact.id);

      if (error) throw error;
      
      setContacts(contacts.map(c => 
        c.id === contact.id ? { ...c, subscribed: !c.subscribed } : c
      ));
      toast.success(contact.subscribed ? "Contact unsubscribed" : "Contact subscribed");
    } catch (error) {
      toast.error("Failed to update subscription");
    }
  };

  const allTags = [...new Set(contacts.flatMap(c => c.tags || []))];
  const subscribedCount = contacts.filter(c => c.subscribed).length;
  const unsubscribedCount = contacts.filter(c => !c.subscribed).length;
  const customerCount = contacts.filter(c => c.tags?.includes("customer")).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{subscribedCount}</p>
                <p className="text-sm text-muted-foreground">Subscribed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{customerCount}</p>
                <p className="text-sm text-muted-foreground">Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-sm text-muted-foreground">Campaigns Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose Campaign</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="history">Campaign History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Email Campaign</CardTitle>
              <CardDescription>
                Send promotional emails to your {subscribedCount} subscribed contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  placeholder="e.g., Holiday Sale 2024"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input
                  placeholder="e.g., 🎄 25% Off Everything - Holiday Sale!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Content (HTML)</label>
                <Textarea
                  placeholder={`<h1>Holiday Sale!</h1>
<p>Hi {{first_name}},</p>
<p>We're running a special holiday sale with 25% off everything!</p>
<p>Use code: HOLIDAY25 at checkout.</p>
<a href="https://dreamtattoocompany.com/shop">Shop Now</a>`}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {"{{first_name}}"} to personalize. Unsubscribe link is added automatically.
                </p>
              </div>

              {allTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Filter by Tags (optional)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag)
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Test email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleSendTestEmail}
                    disabled={sending}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                    Test
                  </Button>
                </div>
                <Button 
                  onClick={handleCreateAndSendCampaign}
                  disabled={sending || !campaignName || !subject || !htmlContent}
                  className="gap-2"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send to {selectedTags.length > 0 
                    ? `${contacts.filter(c => c.subscribed && c.tags?.some(t => selectedTags.includes(t))).length} contacts`
                    : `${subscribedCount} contacts`
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Marketing Contacts</CardTitle>
                <CardDescription>
                  Manage your email list. Contacts are auto-synced from orders and newsletter signups.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleSyncContacts} disabled={syncing}>
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sync
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.email}</TableCell>
                      <TableCell>
                        {contact.first_name || contact.last_name 
                          ? `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{contact.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.total_orders > 0 && (
                          <span>{contact.total_orders} (${contact.total_spent?.toFixed(2)})</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={contact.subscribed ? "default" : "secondary"}>
                          {contact.subscribed ? "Subscribed" : "Unsubscribed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleSubscription(contact)}
                          >
                            {contact.subscribed ? "Unsubscribe" : "Subscribe"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>View past email campaigns and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No campaigns sent yet. Create your first campaign above!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.subject}</TableCell>
                        <TableCell>
                          <Badge variant={
                            campaign.status === "sent" ? "default" :
                            campaign.status === "sending" ? "secondary" : "outline"
                          }>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600">{campaign.total_sent}</TableCell>
                        <TableCell className="text-destructive">{campaign.total_failed}</TableCell>
                        <TableCell>
                          {campaign.sent_at 
                            ? format(new Date(campaign.sent_at), "MMM d, yyyy h:mm a")
                            : "-"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailCampaignManager;
