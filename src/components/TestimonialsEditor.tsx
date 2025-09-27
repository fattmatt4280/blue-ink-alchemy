import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageOpacityControl from './ImageOpacityControl';

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
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [opacities, setOpacities] = useState<Record<string, number>>({});
  const { toast } = useToast();

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

  const saveAllTestimonialFields = async (keys: string[]) => {
    for (const key of keys) {
      const id = getContentId(key);
      const value = getContentValue(key);
      if (id && value !== undefined) {
        await onSave(id, value);
      }
    }
  };

  const uploadImage = async (file: File, imageKey: string) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(prev => ({ ...prev, [imageKey]: true }));
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      console.log('Uploading testimonial image:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      console.log('Testimonial image upload successful, public URL:', data.publicUrl);
      
      // Update the content with the new image URL
      const contentId = getContentId(imageKey);
      handleInputChange(contentId, data.publicUrl);

      toast({
        title: "Image uploaded!",
        description: "Profile image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [imageKey]: false }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Testimonial image file selected:', file.name, file.type, file.size);
      uploadImage(file, imageKey);
    }
    event.target.value = '';
  };

  const handleUploadClick = (imageKey: string) => {
    const fileInput = document.getElementById(`testimonial-image-${imageKey}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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
            const allKeys = [nameKey, roleKey, imageKey, contentKey, ratingKey];

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
                    <Label>Profile Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={getContentValue(imageKey)}
                        onChange={(e) => handleInputChange(getContentId(imageKey), e.target.value)}
                        placeholder="https://... or upload an image"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUploadClick(imageKey)}
                        disabled={uploading[imageKey]}
                      >
                        <Upload className="w-4 h-4" />
                        {uploading[imageKey] ? 'Uploading...' : 'Upload'}
                      </Button>
                      <Input
                        id={`testimonial-image-${imageKey}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, imageKey)}
                        className="hidden"
                        disabled={uploading[imageKey]}
                      />
                     </div>
                     {getContentValue(imageKey) && (
                       <div className="space-y-2">
                         <img 
                           src={getContentValue(imageKey)} 
                           alt="Profile preview" 
                           className="w-16 h-16 rounded-full object-cover"
                           style={{ opacity: (opacities[imageKey] || 100) / 100 }}
                         />
                         <ImageOpacityControl
                           opacity={opacities[imageKey] || 100}
                           onOpacityChange={(newOpacity) => {
                             setOpacities(prev => ({ ...prev, [imageKey]: newOpacity }));
                           }}
                           imageUrl={getContentValue(imageKey)}
                           className="mt-2"
                         />
                       </div>
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

                  <Button
                    onClick={() => saveAllTestimonialFields(allKeys)}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : `Save Testimonial ${num}`}
                  </Button>
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
