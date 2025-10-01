
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import ImageOpacityControl from './ImageOpacityControl';

interface ImageUploadProps {
  onImageUploaded: (url: string, opacity?: number) => void;
  currentImage?: string;
  currentOpacity?: number;
  title: string;
  description: string;
  bucket?: string;
}

const ImageUpload = ({ onImageUploaded, currentImage, currentOpacity = 100, title, description, bucket = 'site-images' }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [opacity, setOpacity] = useState(currentOpacity);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Get current user for healing-photos bucket
      const { data: { user } } = await supabase.auth.getUser();
      
      // Safety check: prevent uploads to healing-photos if not authenticated
      if (bucket === 'healing-photos' && !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload healing photos.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      // For healing-photos, organize by user ID; otherwise use uploads folder
      const filePath = bucket === 'healing-photos' && user
        ? `${user.id}/${fileName}`
        : `uploads/${fileName}`;

      console.log('Uploading file to bucket:', bucket, 'path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', data.publicUrl);
      onImageUploaded(data.publicUrl, opacity);

      toast({
        title: "Image uploaded!",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      uploadImage(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById(`image-upload-${title.replace(/\s+/g, '-')}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      console.log('File dropped:', files[0].name);
      uploadImage(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const inputId = `image-upload-${title.replace(/\s+/g, '-')}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentImage && (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={currentImage} 
                alt="Current image" 
                className="w-full h-48 object-cover rounded-lg"
                style={{ opacity: opacity / 100 }}
              />
              <div className="mt-2 text-sm text-muted-foreground">Current image</div>
            </div>
            
            <ImageOpacityControl
              opacity={opacity}
              onOpacityChange={(newOpacity) => {
                setOpacity(newOpacity);
                onImageUploaded(currentImage, newOpacity);
              }}
              imageUrl={currentImage}
            />
          </div>
        )}
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your image here, or click to select
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports JPG, PNG, GIF up to 10MB
          </p>
          
          <Button 
            type="button" 
            disabled={uploading}
            onClick={handleButtonClick}
            className="relative"
          >
            {uploading ? 'Uploading...' : 'Select Image'}
          </Button>
          
          <Input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
