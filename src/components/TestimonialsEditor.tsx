
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload } from 'lucide-react';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface TestimonialsEditorProps {
  content: SiteContent[];
  onContentUpdate: (content: SiteContent[]) => void;
  onSave: (id: string, value: string) => void;
  saving: boolean;
}

const TestimonialsEditor = ({ content, onContentUpdate, onSave, saving }: TestimonialsEditorProps) => {
  const handleInputChange = (id: string, value: string) => {
    onContentUpdate(
      content.map(c => 
        c.id === id ? { ...c, value } : c
      )
    );
  };

  const getContentValue = (key: string) => {
    return content.find(c => c.key === key)?.value || '';
  };

  const getContentId = (key: string) => {
    return content.find(c => c.key === key)?.id || '';
  };

  const testimonialNumbers = [1, 2, 3];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials Section Editor</CardTitle>
        <CardDescription>Edit customer testimonials and reviews</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {testimonialNumbers.map((num) => {
            const nameKey = `testimonial_${num}_name`;
            const roleKey = `testimonial_${num}_role`;
            const imageKey = `testimonial_${num}_image`;
            const contentKey = `testimonial_${num}_content`;
            const ratingKey = `testimonial_${num}_rating`;

            return (
              <Card key={num} className="p-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Testimonial {num}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input
                        value={getContentValue(nameKey)}
                        onChange={(e) => handleInputChange(getContentId(nameKey), e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Role/Title</Label>
                      <Input
                        value={getContentValue(roleKey)}
                        onChange={(e) => handleInputChange(getContentId(roleKey), e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={getContentValue(imageKey)}
                        onChange={(e) => handleInputChange(getContentId(imageKey), e.target.value)}
                        placeholder="https://..."
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {getContentValue(imageKey) && (
                      <img 
                        src={getContentValue(imageKey)} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <Select
                      value={getContentValue(ratingKey)}
                      onValueChange={(value) => handleInputChange(getContentId(ratingKey), value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Star</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Testimonial Content</Label>
                    <Textarea
                      value={getContentValue(contentKey)}
                      onChange={(e) => handleInputChange(getContentId(contentKey), e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Customer testimonial text..."
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {[nameKey, roleKey, imageKey, contentKey, ratingKey].map((key) => {
                      const id = getContentId(key);
                      const value = getContentValue(key);
                      return (
                        <Button
                          key={key}
                          onClick={() => onSave(id, value)}
                          disabled={saving}
                          size="sm"
                          variant="outline"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save {key.split('_').pop()}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsEditor;
