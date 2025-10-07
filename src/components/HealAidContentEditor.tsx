import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface HealAidContentEditorProps {
  content: SiteContent[];
  onContentUpdate: (content: SiteContent[]) => void;
  onSave: (id: string, value: string) => void;
  saving: boolean;
}

const HealAidContentEditor = ({ content, onContentUpdate, onSave, saving }: HealAidContentEditorProps) => {
  const handleInputChange = (id: string, value: string) => {
    onContentUpdate(
      content.map(c => 
        c.id === id ? { ...c, value } : c
      )
    );
  };

  const getContentValue = (key: string): string => {
    return content.find(c => c.key === key)?.value || '';
  };

  const getContentId = (key: string): string => {
    return content.find(c => c.key === key)?.id || '';
  };

  const saveSection = async (keys: string[]) => {
    for (const key of keys) {
      const id = getContentId(key);
      const value = getContentValue(key);
      if (id) {
        await onSave(id, value);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heal-AId Page Content</CardTitle>
        <CardDescription>Edit content for the Heal-AId landing page</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* Hero Section */}
          <AccordionItem value="hero">
            <AccordionTrigger>Hero Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={getContentValue('healaid_hero_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_hero_title'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={getContentValue('healaid_hero_subtitle')}
                  onChange={(e) => handleInputChange(getContentId('healaid_hero_subtitle'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={getContentValue('healaid_hero_description')}
                  onChange={(e) => handleInputChange(getContentId('healaid_hero_description'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary CTA Button</Label>
                <Input
                  value={getContentValue('healaid_hero_cta_primary')}
                  onChange={(e) => handleInputChange(getContentId('healaid_hero_cta_primary'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary CTA Button</Label>
                <Input
                  value={getContentValue('healaid_hero_cta_secondary')}
                  onChange={(e) => handleInputChange(getContentId('healaid_hero_cta_secondary'), e.target.value)}
                />
              </div>
              <Button onClick={() => saveSection(['healaid_hero_title', 'healaid_hero_subtitle', 'healaid_hero_description', 'healaid_hero_cta_primary', 'healaid_hero_cta_secondary'])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Hero Section
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Problem/Solution Section */}
          <AccordionItem value="problem">
            <AccordionTrigger>Problem/Solution Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={getContentValue('healaid_problem_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_problem_title'), e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Card 1 Title</Label>
                  <Input
                    value={getContentValue('healaid_problem_card_1_title')}
                    onChange={(e) => handleInputChange(getContentId('healaid_problem_card_1_title'), e.target.value)}
                  />
                  <Label>Card 1 Description</Label>
                  <Textarea
                    value={getContentValue('healaid_problem_card_1_description')}
                    onChange={(e) => handleInputChange(getContentId('healaid_problem_card_1_description'), e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Card 2 Title</Label>
                  <Input
                    value={getContentValue('healaid_problem_card_2_title')}
                    onChange={(e) => handleInputChange(getContentId('healaid_problem_card_2_title'), e.target.value)}
                  />
                  <Label>Card 2 Description</Label>
                  <Textarea
                    value={getContentValue('healaid_problem_card_2_description')}
                    onChange={(e) => handleInputChange(getContentId('healaid_problem_card_2_description'), e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Card 3 Title</Label>
                  <Input
                    value={getContentValue('healaid_problem_card_3_title')}
                    onChange={(e) => handleInputChange(getContentId('healaid_problem_card_3_title'), e.target.value)}
                  />
                  <Label>Card 3 Description</Label>
                  <Textarea
                    value={getContentValue('healaid_problem_card_3_description')}
                    onChange={(e) => handleInputChange(getContentId('healaid_problem_card_3_description'), e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conclusion Text</Label>
                <Textarea
                  value={getContentValue('healaid_problem_conclusion')}
                  onChange={(e) => handleInputChange(getContentId('healaid_problem_conclusion'), e.target.value)}
                />
              </div>
              <Button onClick={() => saveSection(['healaid_problem_title', 'healaid_problem_card_1_title', 'healaid_problem_card_1_description', 'healaid_problem_card_2_title', 'healaid_problem_card_2_description', 'healaid_problem_card_3_title', 'healaid_problem_card_3_description', 'healaid_problem_conclusion'])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Problem Section
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* How It Works Section */}
          <AccordionItem value="how">
            <AccordionTrigger>How It Works Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={getContentValue('healaid_how_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_how_title'), e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(num => (
                  <div key={num} className="space-y-2">
                    <Label>Step {num} Title</Label>
                    <Input
                      value={getContentValue(`healaid_how_step_${num}_title`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_how_step_${num}_title`), e.target.value)}
                    />
                    <Label>Step {num} Description</Label>
                    <Textarea
                      value={getContentValue(`healaid_how_step_${num}_description`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_how_step_${num}_description`), e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input
                  value={getContentValue('healaid_how_cta_button')}
                  onChange={(e) => handleInputChange(getContentId('healaid_how_cta_button'), e.target.value)}
                />
              </div>
              <Button onClick={() => saveSection(['healaid_how_title', 'healaid_how_step_1_title', 'healaid_how_step_1_description', 'healaid_how_step_2_title', 'healaid_how_step_2_description', 'healaid_how_step_3_title', 'healaid_how_step_3_description', 'healaid_how_cta_button'])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save How It Works Section
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Features Section */}
          <AccordionItem value="features">
            <AccordionTrigger>Features Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={getContentValue('healaid_features_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_features_title'), e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={num} className="space-y-2 p-3 border rounded">
                    <Label>Feature {num} Title</Label>
                    <Input
                      value={getContentValue(`healaid_feature_${num}_title`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_feature_${num}_title`), e.target.value)}
                    />
                    <Label>Feature {num} Description</Label>
                    <Textarea
                      value={getContentValue(`healaid_feature_${num}_description`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_feature_${num}_description`), e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={() => saveSection(['healaid_features_title', ...Array.from({length: 6}, (_, i) => [`healaid_feature_${i+1}_title`, `healaid_feature_${i+1}_description`]).flat()])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Features Section
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Pricing Section */}
          <AccordionItem value="pricing">
            <AccordionTrigger>Pricing Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={getContentValue('healaid_pricing_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_pricing_title'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Section Subtitle</Label>
                <Input
                  value={getContentValue('healaid_pricing_subtitle')}
                  onChange={(e) => handleInputChange(getContentId('healaid_pricing_subtitle'), e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['free', '7day', '30day'].map(tier => (
                  <div key={tier} className="space-y-2 p-3 border rounded">
                    <Label className="font-bold capitalize">{tier.replace('day', ' Day')} Tier</Label>
                    <Label>Title</Label>
                    <Input
                      value={getContentValue(`healaid_pricing_${tier}_title`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_pricing_${tier}_title`), e.target.value)}
                    />
                    <Label>Price</Label>
                    <Input
                      value={getContentValue(`healaid_pricing_${tier}_price`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_pricing_${tier}_price`), e.target.value)}
                    />
                    <Label>Duration</Label>
                    <Input
                      value={getContentValue(`healaid_pricing_${tier}_duration`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_pricing_${tier}_duration`), e.target.value)}
                    />
                    {tier === 'free' && (
                      <>
                        <Label>Badge Text</Label>
                        <Input
                          value={getContentValue('healaid_pricing_free_badge')}
                          onChange={(e) => handleInputChange(getContentId('healaid_pricing_free_badge'), e.target.value)}
                        />
                      </>
                    )}
                    {tier === '30day' && (
                      <>
                        <Label>Badge Text</Label>
                        <Input
                          value={getContentValue('healaid_pricing_30day_badge')}
                          onChange={(e) => handleInputChange(getContentId('healaid_pricing_30day_badge'), e.target.value)}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={() => saveSection(['healaid_pricing_title', 'healaid_pricing_subtitle', 'healaid_pricing_free_title', 'healaid_pricing_free_price', 'healaid_pricing_free_duration', 'healaid_pricing_free_badge', 'healaid_pricing_7day_title', 'healaid_pricing_7day_price', 'healaid_pricing_7day_duration', 'healaid_pricing_30day_title', 'healaid_pricing_30day_price', 'healaid_pricing_30day_duration', 'healaid_pricing_30day_badge'])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Pricing Section
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Use Cases Section */}
          <AccordionItem value="usecases">
            <AccordionTrigger>Use Cases Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={getContentValue('healaid_usecases_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_usecases_title'), e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(num => (
                  <div key={num} className="space-y-2 p-3 border rounded">
                    <Label>Use Case {num} Title</Label>
                    <Input
                      value={getContentValue(`healaid_usecase_${num}_title`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_usecase_${num}_title`), e.target.value)}
                    />
                    <Label>Use Case {num} Description</Label>
                    <Textarea
                      value={getContentValue(`healaid_usecase_${num}_description`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_usecase_${num}_description`), e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={() => saveSection(['healaid_usecases_title', 'healaid_usecase_1_title', 'healaid_usecase_1_description', 'healaid_usecase_2_title', 'healaid_usecase_2_description', 'healaid_usecase_3_title', 'healaid_usecase_3_description'])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Use Cases Section
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Technology Section */}
          <AccordionItem value="technology">
            <AccordionTrigger>Technology Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={getContentValue('healaid_tech_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_tech_title'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={getContentValue('healaid_tech_description')}
                  onChange={(e) => handleInputChange(getContentId('healaid_tech_description'), e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(num => (
                  <div key={num} className="space-y-2 p-3 border rounded">
                    <Label>Stat {num} Number</Label>
                    <Input
                      value={getContentValue(`healaid_tech_stat_${num}_number`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_tech_stat_${num}_number`), e.target.value)}
                    />
                    <Label>Stat {num} Label</Label>
                    <Input
                      value={getContentValue(`healaid_tech_stat_${num}_label`)}
                      onChange={(e) => handleInputChange(getContentId(`healaid_tech_stat_${num}_label`), e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={() => saveSection(['healaid_tech_title', 'healaid_tech_description', 'healaid_tech_stat_1_number', 'healaid_tech_stat_1_label', 'healaid_tech_stat_2_number', 'healaid_tech_stat_2_label', 'healaid_tech_stat_3_number', 'healaid_tech_stat_3_label'])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Technology Section
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Final CTA Section */}
          <AccordionItem value="cta">
            <AccordionTrigger>Final CTA Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={getContentValue('healaid_cta_title')}
                  onChange={(e) => handleInputChange(getContentId('healaid_cta_title'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={getContentValue('healaid_cta_description')}
                  onChange={(e) => handleInputChange(getContentId('healaid_cta_description'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Button Text</Label>
                <Input
                  value={getContentValue('healaid_cta_button_primary')}
                  onChange={(e) => handleInputChange(getContentId('healaid_cta_button_primary'), e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Button Text</Label>
                <Input
                  value={getContentValue('healaid_cta_button_secondary')}
                  onChange={(e) => handleInputChange(getContentId('healaid_cta_button_secondary'), e.target.value)}
                />
              </div>
              <Button onClick={() => saveSection(['healaid_cta_title', 'healaid_cta_description', 'healaid_cta_button_primary', 'healaid_cta_button_secondary'])} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save CTA Section
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default HealAidContentEditor;