
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Save, Plus, Trash2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface FAQ {
  q: string;
  a: string;
}

interface BulletPoint {
  text: string;
}

const DEFAULTS: Record<string, string> = {
  free_budder_headline: 'Get Your FREE Baby Blue Dream Budder',
  free_budder_subheading: 'Premium tattoo aftercare — just pay $10.20 shipping',
  free_budder_cta_text: 'Claim Your Free Budder',
  free_budder_badge_text: 'Limited Time Offer',
  free_budder_product_image: 'https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/product-images/products/1751239126214-cpzvrwo41ga.jpeg',
  free_budder_shipping_price: '10.20',
  free_budder_testimonial_quote: 'Best aftercare I\'ve ever used. My tattoos heal faster and the colors stay brighter. I recommend it to all my clients.',
  free_budder_testimonial_author: 'Professional Tattoo Artist',
  free_budder_testimonial_image: '',
  free_budder_bullet_points: JSON.stringify([
    { text: 'Speeds up healing time with organic botanicals' },
    { text: 'No petroleum, no parabens — just clean ingredients' },
    { text: 'Keeps colors vibrant during the healing process' },
    { text: 'Soothes irritation and reduces peeling' },
  ]),
  free_budder_faqs: JSON.stringify([
    { q: 'What am I getting?', a: 'A full-size 10g Baby Blue Dream Budder — our premium tattoo aftercare balm made with organic ingredients. It\'s the same product we sell for $6.99, yours FREE.' },
    { q: 'Why is it free?', a: 'We\'re confident you\'ll love it. Once you try Blue Dream Budder, you\'ll never go back to petroleum-based aftercare. This is our way of letting you experience the difference.' },
    { q: 'How long does shipping take?', a: 'Orders ship within 1-2 business days. Standard delivery is typically 3-7 business days depending on your location.' },
    { q: 'Is there a catch?', a: 'No catch, no subscription, no hidden fees. You just pay $10.20 flat rate shipping and handling. One per customer.' },
  ]),
};

const FIELD_KEYS = Object.keys(DEFAULTS);

export const FreeBudderEditor = () => {
  const [fields, setFields] = useState<Record<string, string>>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', FIELD_KEYS);

    if (!error && data) {
      const merged = { ...DEFAULTS };
      data.forEach((row) => {
        merged[row.key] = row.value;
      });
      setFields(merged);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const key of FIELD_KEYS) {
        const value = fields[key];
        const { error } = await supabase
          .from('site_content')
          .upsert(
            { key, value, type: key === 'free_budder_product_image' ? 'image' : 'text' },
            { onConflict: 'key' }
          );
        if (error) throw error;
      }
      toast({ title: 'Saved!', description: 'Landing page content updated.' });
    } catch (err: any) {
      toast({ title: 'Error saving', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const updateField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  // FAQ helpers
  const parsedFaqs: FAQ[] = (() => {
    try { return JSON.parse(fields.free_budder_faqs); } catch { return []; }
  })();

  const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
    const updated = [...parsedFaqs];
    updated[index] = { ...updated[index], [field]: value };
    updateField('free_budder_faqs', JSON.stringify(updated));
  };

  const addFaq = () => {
    updateField('free_budder_faqs', JSON.stringify([...parsedFaqs, { q: '', a: '' }]));
  };

  const removeFaq = (index: number) => {
    updateField('free_budder_faqs', JSON.stringify(parsedFaqs.filter((_, i) => i !== index)));
  };

  // Bullet point helpers
  const parsedBullets: BulletPoint[] = (() => {
    try { return JSON.parse(fields.free_budder_bullet_points); } catch { return []; }
  })();

  const updateBullet = (index: number, value: string) => {
    const updated = [...parsedBullets];
    updated[index] = { text: value };
    updateField('free_budder_bullet_points', JSON.stringify(updated));
  };

  const addBullet = () => {
    updateField('free_budder_bullet_points', JSON.stringify([...parsedBullets, { text: '' }]));
  };

  const removeBullet = (index: number) => {
    updateField('free_budder_bullet_points', JSON.stringify(parsedBullets.filter((_, i) => i !== index)));
  };

  if (loading) return <div className="text-center py-8">Loading editor...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Free Budder Landing Page</CardTitle>
            <CardDescription>Edit the content shown on the /free-budder landing page</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.open('/free-budder', '_blank')}>
            <ExternalLink className="w-4 h-4 mr-1" /> Preview
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Text Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input value={fields.free_budder_headline} onChange={(e) => updateField('free_budder_headline', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Badge Text</Label>
            <Input value={fields.free_budder_badge_text} onChange={(e) => updateField('free_budder_badge_text', e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Subheading</Label>
            <Input value={fields.free_budder_subheading} onChange={(e) => updateField('free_budder_subheading', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CTA Button Text</Label>
            <Input value={fields.free_budder_cta_text} onChange={(e) => updateField('free_budder_cta_text', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Shipping Price ($)</Label>
            <Input value={fields.free_budder_shipping_price} onChange={(e) => updateField('free_budder_shipping_price', e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <ImageUpload
              title="Product Image"
              description="Upload the product image for the Free Budder landing page"
              bucket="product-images"
              currentImage={fields.free_budder_product_image}
              onImageUploaded={(url) => updateField('free_budder_product_image', url)}
            />
          </div>
        </div>

        {/* Bullet Points */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Why Artists Love It — Bullet Points</Label>
          {parsedBullets.map((bp, i) => (
            <div key={i} className="flex gap-2">
              <Input value={bp.text} onChange={(e) => updateBullet(i, e.target.value)} className="flex-1" />
              <Button variant="ghost" size="icon" onClick={() => removeBullet(i)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addBullet}><Plus className="w-4 h-4 mr-1" /> Add Bullet</Button>
        </div>

        {/* Testimonial */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Testimonial</Label>
          <Textarea
            value={fields.free_budder_testimonial_quote}
            onChange={(e) => updateField('free_budder_testimonial_quote', e.target.value)}
            rows={3}
          />
          <div className="space-y-2">
            <Label>Author</Label>
            <Input value={fields.free_budder_testimonial_author} onChange={(e) => updateField('free_budder_testimonial_author', e.target.value)} />
          </div>
          <ImageUpload
            title="Author Profile Image"
            description="Upload a profile photo for the testimonial author"
            bucket="site-images"
            currentImage={fields.free_budder_testimonial_image}
            onImageUploaded={(url) => updateField('free_budder_testimonial_image', url)}
          />
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">FAQs</Label>
          {parsedFaqs.map((faq, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <Input placeholder="Question" value={faq.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => removeFaq(i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <Textarea placeholder="Answer" value={faq.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} rows={2} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFaq}><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};
