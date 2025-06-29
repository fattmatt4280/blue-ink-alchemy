
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface ProductImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  productName: string;
}

const ProductImageUpload = ({ onImageUploaded, currentImage, productName }: ProductImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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
      const filePath = `products/${fileName}`;

      console.log('Uploading product image:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('Product image upload successful, public URL:', data.publicUrl);
      onImageUploaded(data.publicUrl);

      toast({
        title: "Image uploaded!",
        description: "Product image has been uploaded successfully.",
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
      console.log('Product image file selected:', file.name, file.type, file.size);
      uploadImage(file);
    }
    event.target.value = '';
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('product-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      console.log('Product image file dropped:', files[0].name);
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

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>
      
      {currentImage && (
        <div className="relative">
          <img 
            src={currentImage} 
            alt={`${productName} image`} 
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="mt-2 text-sm text-gray-600">Current image</div>
        </div>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Drop product image here, or click to select
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Supports JPG, PNG, GIF up to 10MB
        </p>
        
        <Button 
          type="button" 
          disabled={uploading}
          onClick={handleButtonClick}
          size="sm"
        >
          {uploading ? 'Uploading...' : 'Select Image'}
        </Button>
        
        <Input
          id="product-image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default ProductImageUpload;
