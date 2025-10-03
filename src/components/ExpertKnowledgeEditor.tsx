import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, BookOpen, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KnowledgeEntry {
  id: string;
  condition_name: string;
  condition_description: string;
  healing_stage: string;
  visual_indicators: string[];
  common_causes: string[];
  recommended_actions: string[];
  product_recommendations: string[];
  timeline_expectations: string;
  severity_level: string;
  times_referenced: number;
  created_at: string;
  reference_images?: string[];
}

export const ExpertKnowledgeEditor = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [conditionName, setConditionName] = useState('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [healingStage, setHealingStage] = useState('');
  const [visualIndicators, setVisualIndicators] = useState('');
  const [commonCauses, setCommonCauses] = useState('');
  const [recommendedActions, setRecommendedActions] = useState('');
  const [productRecommendations, setProductRecommendations] = useState('');
  const [timelineExpectations, setTimelineExpectations] = useState('');
  const [severityLevel, setSeverityLevel] = useState('normal');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expert_knowledge_base')
      .select('*')
      .order('condition_name');

    if (error) {
      toast({
        title: "Error loading knowledge base",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const loadEntry = (entry: KnowledgeEntry) => {
    setSelectedEntry(entry);
    setConditionName(entry.condition_name);
    setConditionDescription(entry.condition_description);
    setHealingStage(entry.healing_stage);
    setVisualIndicators(entry.visual_indicators?.join('\n') || '');
    setCommonCauses(entry.common_causes?.join('\n') || '');
    setRecommendedActions(entry.recommended_actions?.join('\n') || '');
    setProductRecommendations(entry.product_recommendations?.join('\n') || '');
    setTimelineExpectations(entry.timeline_expectations || '');
    setSeverityLevel(entry.severity_level || 'normal');
    setReferenceImages(entry.reference_images || []);
    setIsCreating(false);
  };

  const createNew = () => {
    setSelectedEntry(null);
    setConditionName('');
    setConditionDescription('');
    setHealingStage('');
    setVisualIndicators('');
    setCommonCauses('');
    setRecommendedActions('');
    setProductRecommendations('');
    setTimelineExpectations('');
    setSeverityLevel('normal');
    setReferenceImages([]);
    setIsCreating(true);
  };

  const saveEntry = async () => {
    if (!conditionName || !conditionDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the condition name and description",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const entryData = {
      condition_name: conditionName,
      condition_description: conditionDescription,
      healing_stage: healingStage,
      visual_indicators: visualIndicators.split('\n').filter(v => v.trim()),
      common_causes: commonCauses.split('\n').filter(c => c.trim()),
      recommended_actions: recommendedActions.split('\n').filter(r => r.trim()),
      product_recommendations: productRecommendations.split('\n').filter(p => p.trim()),
      timeline_expectations: timelineExpectations,
      severity_level: severityLevel,
      reference_images: referenceImages,
      created_by: user.id,
    };

    if (selectedEntry) {
      // Update existing
      const { error } = await supabase
        .from('expert_knowledge_base')
        .update(entryData)
        .eq('id', selectedEntry.id);

      if (error) {
        toast({
          title: "Error updating entry",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Entry updated!",
          description: "Knowledge base has been updated.",
        });
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('expert_knowledge_base')
        .insert([entryData]);

      if (error) {
        toast({
          title: "Error creating entry",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Entry created!",
          description: "New knowledge has been added to the database.",
        });
        setIsCreating(false);
      }
    }

    setSaving(false);
    fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;

    const { error } = await supabase
      .from('expert_knowledge_base')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entry deleted",
        description: "Knowledge entry has been removed.",
      });
      setSelectedEntry(null);
      setIsCreating(false);
      fetchEntries();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Knowledge Base List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>{entries.length} conditions documented</CardDescription>
          <Button type="button" onClick={createNew} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Condition
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => loadEntry(entry)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedEntry?.id === entry.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  <div className="font-medium mb-1">{entry.condition_name}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {entry.healing_stage}
                    </Badge>
                    <Badge
                      variant={
                        entry.severity_level === 'urgent'
                          ? 'destructive'
                          : entry.severity_level === 'concerning'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {entry.severity_level}
                    </Badge>
                  </div>
                  {entry.times_referenced > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Used {entry.times_referenced} times
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Editor */}
      {(selectedEntry || isCreating) ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {isCreating ? 'New Knowledge Entry' : 'Edit Knowledge Entry'}
            </CardTitle>
            <CardDescription>
              Document conditions, solutions, and expert recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                <div>
                  <Label>Condition Name</Label>
                  <Input
                    value={conditionName}
                    onChange={(e) => setConditionName(e.target.value)}
                    placeholder="e.g., Excessive Scabbing"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={conditionDescription}
                    onChange={(e) => setConditionDescription(e.target.value)}
                    rows={3}
                    placeholder="Detailed description of the condition..."
                  />
                </div>

                <div>
                  <Label>Healing Stage</Label>
                  <Select value={healingStage} onValueChange={setHealingStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fresh (Days 1-3)">Fresh (Days 1-3)</SelectItem>
                      <SelectItem value="Early Healing (Days 4-7)">Early Healing (Days 4-7)</SelectItem>
                      <SelectItem value="Peeling Phase (Days 7-14)">Peeling Phase (Days 7-14)</SelectItem>
                      <SelectItem value="Late Healing (Weeks 2-4)">Late Healing (Weeks 2-4)</SelectItem>
                      <SelectItem value="Settled (4+ Weeks)">Settled (4+ Weeks)</SelectItem>
                      <SelectItem value="Any Stage">Any Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Severity Level</Label>
                  <Select value={severityLevel} onValueChange={setSeverityLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal - Expected</SelectItem>
                      <SelectItem value="monitor">Monitor - Watch</SelectItem>
                      <SelectItem value="concerning">Concerning - Attention Needed</SelectItem>
                      <SelectItem value="urgent">Urgent - Immediate Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Visual Indicators (one per line)</Label>
                  <Textarea
                    value={visualIndicators}
                    onChange={(e) => setVisualIndicators(e.target.value)}
                    rows={4}
                    placeholder="What to look for visually..."
                  />
                </div>

                <div>
                  <Label>Common Causes (one per line)</Label>
                  <Textarea
                    value={commonCauses}
                    onChange={(e) => setCommonCauses(e.target.value)}
                    rows={3}
                    placeholder="What typically causes this..."
                  />
                </div>

                <div>
                  <Label>Recommended Actions (one per line)</Label>
                  <Textarea
                    value={recommendedActions}
                    onChange={(e) => setRecommendedActions(e.target.value)}
                    rows={4}
                    placeholder="Steps to take..."
                  />
                </div>

                <div>
                  <Label>Product Recommendations (one per line)</Label>
                  <Textarea
                    value={productRecommendations}
                    onChange={(e) => setProductRecommendations(e.target.value)}
                    rows={3}
                    placeholder="Specific products or ingredients..."
                  />
                </div>

                <div>
                  <Label>Timeline Expectations</Label>
                  <Textarea
                    value={timelineExpectations}
                    onChange={(e) => setTimelineExpectations(e.target.value)}
                    rows={2}
                    placeholder="How long until improvement..."
                  />
                </div>

                {/* Reference Images Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-base font-semibold">Reference Images (Visual Examples)</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload up to 5 reference photos showing what this condition looks like. 
                      The AI will use these images for visual comparison.
                    </p>
                  </div>

                  {/* Image Grid */}
                  {referenceImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {referenceImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={`Reference ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setReferenceImages(referenceImages.filter((_, i) => i !== index));
                            }}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            Image {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {referenceImages.length < 5 && (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.size > 10 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Image must be less than 10MB",
                              variant: "destructive",
                            });
                            return;
                          }

                          if (!conditionName) {
                            toast({
                              title: "Enter condition name first",
                              description: "Please enter a condition name before uploading images",
                              variant: "destructive",
                            });
                            return;
                          }

                          setUploading(true);
                          try {
                            const fileExt = file.name.split('.').pop();
                            const slug = conditionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                            const fileName = `expert-knowledge/${slug}/${Date.now()}.${fileExt}`;
                            
                            const { data, error } = await supabase.storage
                              .from('healing-photos')
                              .upload(fileName, file);

                            if (error) throw error;

                            const { data: { publicUrl } } = supabase.storage
                              .from('healing-photos')
                              .getPublicUrl(fileName);

                            setReferenceImages([...referenceImages, publicUrl]);
                            toast({
                              title: "Image uploaded!",
                              description: "Reference image added successfully",
                            });
                          } catch (error) {
                            console.error('Upload error:', error);
                            toast({
                              title: "Upload failed",
                              description: "Failed to upload image. Please try again.",
                              variant: "destructive",
                            });
                          } finally {
                            setUploading(false);
                            // Reset the input
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                        id="reference-image-upload"
                        disabled={uploading}
                      />
                      <label 
                        htmlFor="reference-image-upload"
                        className="cursor-pointer block"
                      >
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">
                          {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP up to 10MB ({5 - referenceImages.length} remaining)
                        </p>
                      </label>
                    </div>
                  )}

                  {referenceImages.length >= 5 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Maximum of 5 reference images reached
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={saveEntry}
                    disabled={saving}
                    className="flex-1"
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Entry'
                    )}
                  </Button>
                  {selectedEntry && (
                    <Button
                      onClick={() => deleteEntry(selectedEntry.id)}
                      variant="destructive"
                      size="lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>Select an entry to edit or create a new one</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
