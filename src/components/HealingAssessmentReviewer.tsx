import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Star, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HealingProgressEntry {
  id: string;
  photo_url: string;
  healing_stage: string;
  progress_score: number;
  recommendations: string[];
  analysis_result: any;
  created_at: string;
  expert_assessment?: any;
  ai_rating?: any;
}

export const HealingAssessmentReviewer = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<HealingProgressEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HealingProgressEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Expert override form state
  const [expertStage, setExpertStage] = useState('');
  const [expertScore, setExpertScore] = useState<number>(0);
  const [expertRecommendations, setExpertRecommendations] = useState('');
  const [expertRisk, setExpertRisk] = useState('');
  const [expertProducts, setExpertProducts] = useState('');
  const [expertNotes, setExpertNotes] = useState('');
  const [keyIndicators, setKeyIndicators] = useState('');
  const [commonMistakes, setCommonMistakes] = useState('');
  
  // Rating state
  const [stageRating, setStageRating] = useState(0);
  const [scoreRating, setScoreRating] = useState(0);
  const [recommendationsRating, setRecommendationsRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [ratingNotes, setRatingNotes] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('healing_progress')
      .select(`
        *,
        expert_assessments(*),
        ai_assessment_ratings(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading assessments",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const loadExpertData = (entry: HealingProgressEntry) => {
    if (entry.expert_assessment) {
      const expert = entry.expert_assessment;
      setExpertStage(expert.healing_stage || '');
      setExpertScore(expert.progress_score || 0);
      setExpertRecommendations(expert.recommendations?.join('\n') || '');
      setExpertRisk(expert.risk_assessment || '');
      setExpertProducts(expert.product_recommendations?.join('\n') || '');
      setExpertNotes(expert.expert_notes || '');
      setKeyIndicators(expert.key_indicators?.join('\n') || '');
      setCommonMistakes(expert.common_mistakes_corrected || '');
    } else {
      // Pre-fill with AI assessment for easy correction
      setExpertStage(entry.healing_stage || '');
      setExpertScore(entry.progress_score || 0);
      setExpertRecommendations(entry.recommendations?.join('\n') || '');
      setExpertRisk('');
      setExpertProducts('');
      setExpertNotes('');
      setKeyIndicators('');
      setCommonMistakes('');
    }

    if (entry.ai_rating) {
      const rating = entry.ai_rating;
      setStageRating(rating.healing_stage_accuracy || 0);
      setScoreRating(rating.progress_score_accuracy || 0);
      setRecommendationsRating(rating.recommendations_accuracy || 0);
      setOverallRating(rating.overall_accuracy || 0);
      setRatingNotes(rating.notes || '');
    } else {
      setStageRating(0);
      setScoreRating(0);
      setRecommendationsRating(0);
      setOverallRating(0);
      setRatingNotes('');
    }
  };

  const saveExpertAssessment = async () => {
    if (!selectedEntry) return;

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save expert assessment
    const { error: assessmentError } = await supabase
      .from('expert_assessments')
      .upsert({
        healing_progress_id: selectedEntry.id,
        expert_user_id: user.id,
        healing_stage: expertStage,
        progress_score: expertScore,
        recommendations: expertRecommendations.split('\n').filter(r => r.trim()),
        risk_assessment: expertRisk,
        product_recommendations: expertProducts.split('\n').filter(p => p.trim()),
        expert_notes: expertNotes,
        key_indicators: keyIndicators.split('\n').filter(k => k.trim()),
        common_mistakes_corrected: commonMistakes,
      });

    if (assessmentError) {
      toast({
        title: "Error saving assessment",
        description: assessmentError.message,
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    // Save AI rating
    if (overallRating > 0) {
      const { error: ratingError } = await supabase
        .from('ai_assessment_ratings')
        .upsert({
          healing_progress_id: selectedEntry.id,
          expert_user_id: user.id,
          healing_stage_accuracy: stageRating,
          progress_score_accuracy: scoreRating,
          recommendations_accuracy: recommendationsRating,
          overall_accuracy: overallRating,
          notes: ratingNotes,
        });

      if (ratingError) {
        toast({
          title: "Error saving rating",
          description: ratingError.message,
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Expert assessment saved!",
      description: "Your expertise has been added to the AI training data.",
    });

    setSaving(false);
    fetchEntries();
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

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
      {/* Entry List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Healing Assessments</CardTitle>
          <CardDescription>Click to review and refine AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setSelectedEntry(entry);
                    loadExpertData(entry);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedEntry?.id === entry.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={entry.expert_assessment ? 'default' : 'secondary'}>
                      {entry.expert_assessment ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> Reviewed
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" /> Needs Review
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs mt-1">
                    AI: {entry.healing_stage} ({entry.progress_score}%)
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Review Interface */}
      {selectedEntry ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expert Review & Training</CardTitle>
            <CardDescription>
              Refine the AI assessment with your 25 years of tattoo artistry expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {/* Photo */}
                <div>
                  <Label>Uploaded Photo</Label>
                  <img
                    src={selectedEntry.photo_url}
                    alt="Tattoo healing progress"
                    className="w-full max-w-md rounded-lg mt-2"
                  />
                </div>

                <Separator />

                {/* AI Assessment */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">AI Assessment</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Stage:</span> {selectedEntry.healing_stage}
                    </div>
                    <div>
                      <span className="font-medium">Score:</span> {selectedEntry.progress_score}%
                    </div>
                    <div>
                      <span className="font-medium">Recommendations:</span>
                      <ul className="list-disc list-inside mt-1">
                        {selectedEntry.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rate AI Accuracy */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Rate AI Accuracy</h3>
                  <StarRating
                    value={stageRating}
                    onChange={setStageRating}
                    label="Healing Stage Accuracy"
                  />
                  <StarRating
                    value={scoreRating}
                    onChange={setScoreRating}
                    label="Progress Score Accuracy"
                  />
                  <StarRating
                    value={recommendationsRating}
                    onChange={setRecommendationsRating}
                    label="Recommendations Accuracy"
                  />
                  <StarRating
                    value={overallRating}
                    onChange={setOverallRating}
                    label="Overall Accuracy"
                  />
                </div>

                <Separator />

                {/* Expert Override */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Expert Assessment</h3>
                  
                  <div>
                    <Label>Healing Stage</Label>
                    <Select value={expertStage} onValueChange={setExpertStage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fresh (Days 1-3)">Fresh (Days 1-3)</SelectItem>
                        <SelectItem value="Early Healing (Days 4-7)">Early Healing (Days 4-7)</SelectItem>
                        <SelectItem value="Peeling Phase (Days 7-14)">Peeling Phase (Days 7-14)</SelectItem>
                        <SelectItem value="Late Healing (Weeks 2-4)">Late Healing (Weeks 2-4)</SelectItem>
                        <SelectItem value="Settled (4+ Weeks)">Settled (4+ Weeks)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Progress Score (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={expertScore}
                      onChange={(e) => setExpertScore(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Recommendations (one per line)</Label>
                    <Textarea
                      value={expertRecommendations}
                      onChange={(e) => setExpertRecommendations(e.target.value)}
                      rows={4}
                      placeholder="Enter recommendations..."
                    />
                  </div>

                  <div>
                    <Label>Risk Assessment</Label>
                    <Select value={expertRisk} onValueChange={setExpertRisk}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal - Healing Well</SelectItem>
                        <SelectItem value="monitor">Monitor - Watch Closely</SelectItem>
                        <SelectItem value="concerning">Concerning - May Need Attention</SelectItem>
                        <SelectItem value="urgent">Urgent - See Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Product Recommendations (one per line)</Label>
                    <Textarea
                      value={expertProducts}
                      onChange={(e) => setExpertProducts(e.target.value)}
                      rows={3}
                      placeholder="Specific products or ingredients..."
                    />
                  </div>

                  <div>
                    <Label>Key Visual Indicators (one per line)</Label>
                    <Textarea
                      value={keyIndicators}
                      onChange={(e) => setKeyIndicators(e.target.value)}
                      rows={3}
                      placeholder="What visual cues led to your assessment..."
                    />
                  </div>

                  <div>
                    <Label>Common AI Mistakes Corrected</Label>
                    <Textarea
                      value={commonMistakes}
                      onChange={(e) => setCommonMistakes(e.target.value)}
                      rows={2}
                      placeholder="What did the AI miss or get wrong..."
                    />
                  </div>

                  <div>
                    <Label>Expert Notes & Reasoning</Label>
                    <Textarea
                      value={expertNotes}
                      onChange={(e) => setExpertNotes(e.target.value)}
                      rows={4}
                      placeholder="Your professional insights and reasoning..."
                    />
                  </div>

                  <div>
                    <Label>Rating Notes</Label>
                    <Textarea
                      value={ratingNotes}
                      onChange={(e) => setRatingNotes(e.target.value)}
                      rows={2}
                      placeholder="Additional notes about the AI's performance..."
                    />
                  </div>
                </div>

                <Button
                  onClick={saveExpertAssessment}
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Expert Assessment'
                  )}
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>Select an assessment to review</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
