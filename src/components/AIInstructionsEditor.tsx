import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Brain, ToggleLeft, ToggleRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

interface AIInstruction {
  id: string;
  title: string;
  instruction_text: string;
  category: string;
  priority: number;
  active: boolean;
  created_at: string;
}

export const AIInstructionsEditor = () => {
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<AIInstruction[]>([]);
  const [selectedInstruction, setSelectedInstruction] = useState<AIInstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [instructionText, setInstructionText] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_custom_instructions')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading instructions",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setInstructions(data || []);
    }
    setLoading(false);
  };

  const loadInstruction = (instruction: AIInstruction) => {
    setSelectedInstruction(instruction);
    setTitle(instruction.title);
    setInstructionText(instruction.instruction_text);
    setCategory(instruction.category);
    setPriority(instruction.priority);
    setActive(instruction.active);
    setIsCreating(false);
  };

  const createNew = () => {
    setSelectedInstruction(null);
    setTitle('');
    setInstructionText('');
    setCategory('general');
    setPriority(0);
    setActive(true);
    setIsCreating(true);
  };

  const saveInstruction = async () => {
    if (!title || !instructionText) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and instruction text",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const instructionData = {
      title,
      instruction_text: instructionText,
      category,
      priority: parseInt(priority.toString()),
      active,
      created_by: user.id,
    };

    if (selectedInstruction) {
      // Update existing
      const { error } = await supabase
        .from('ai_custom_instructions')
        .update(instructionData)
        .eq('id', selectedInstruction.id);

      if (error) {
        toast({
          title: "Error updating instruction",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Instruction updated!",
          description: "AI will use this updated instruction.",
        });
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('ai_custom_instructions')
        .insert([instructionData]);

      if (error) {
        toast({
          title: "Error creating instruction",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Instruction created!",
          description: "AI will now use this instruction.",
        });
        setIsCreating(false);
      }
    }

    setSaving(false);
    fetchInstructions();
  };

  const deleteInstruction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this instruction?')) return;

    const { error } = await supabase
      .from('ai_custom_instructions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting instruction",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Instruction deleted",
        description: "Instruction has been removed.",
      });
      setSelectedInstruction(null);
      setIsCreating(false);
      fetchInstructions();
    }
  };

  const toggleActive = async (instruction: AIInstruction) => {
    const { error } = await supabase
      .from('ai_custom_instructions')
      .update({ active: !instruction.active })
      .eq('id', instruction.id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchInstructions();
      toast({
        title: instruction.active ? "Instruction deactivated" : "Instruction activated",
        description: instruction.active ? "AI will no longer use this instruction" : "AI will now use this instruction",
      });
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
      {/* Instructions List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Instructions
          </CardTitle>
          <CardDescription>{instructions.length} custom instructions</CardDescription>
          <Button onClick={createNew} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Instruction
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {instructions.map((instruction) => (
                <div
                  key={instruction.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedInstruction?.id === instruction.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <button
                      onClick={() => loadInstruction(instruction)}
                      className="flex-1 text-left font-medium"
                    >
                      {instruction.title}
                    </button>
                    <button
                      onClick={() => toggleActive(instruction)}
                      className="ml-2"
                      title={instruction.active ? "Deactivate" : "Activate"}
                    >
                      {instruction.active ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {instruction.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Priority: {instruction.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {instruction.instruction_text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Editor */}
      {(selectedInstruction || isCreating) ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {isCreating ? 'New AI Instruction' : 'Edit AI Instruction'}
            </CardTitle>
            <CardDescription>
              Add custom instructions and parameters to guide the AI's behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Always check for infection signs"
                  />
                </div>

                <div>
                  <Label>Instruction / Prompt Parameter</Label>
                  <Textarea
                    value={instructionText}
                    onChange={(e) => setInstructionText(e.target.value)}
                    rows={12}
                    placeholder="Write your custom instruction here. This will be added to the AI's system prompt.&#x0a;&#x0a;Example:&#x0a;- Always prioritize safety and recommend seeing a professional for any signs of infection&#x0a;- Be conservative in your assessments&#x0a;- Use specific product names from our lineup when making recommendations&#x0a;- Avoid medical diagnosis but describe visible symptoms clearly"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Write this as if you're instructing a GPT model. Be specific and clear.
                  </p>
                </div>

                <div>
                  <Label>Category</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., safety, recommendations, analysis"
                  />
                </div>

                <div>
                  <Label>Priority (0-100)</Label>
                  <Input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                    placeholder="Higher priority instructions appear first"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher priority instructions are shown first to the AI
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={active}
                    onCheckedChange={setActive}
                    id="active"
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Active (AI will use this instruction)
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={saveInstruction}
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
                      'Save Instruction'
                    )}
                  </Button>
                  {selectedInstruction && (
                    <Button
                      onClick={() => deleteInstruction(selectedInstruction.id)}
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
              <Brain className="h-12 w-12 mx-auto mb-4" />
              <p>Select an instruction to edit or create a new one</p>
              <p className="text-sm mt-2">These instructions guide how the AI analyzes tattoos</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};