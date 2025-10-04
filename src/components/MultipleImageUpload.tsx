import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface MultipleImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImages?: string[];
  title?: string;
  description?: string;
  bucket?: string;
  maxImages?: number;
}

const MultipleImageUpload = ({
  onImagesUploaded,
  currentImages = [],
  title = "Upload Images",
  description = "Upload multiple images for analysis",
  bucket = "healing-photos",
  maxImages = 10,
}: MultipleImageUploadProps) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not an image file`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds 10MB limit`,
        variant: "destructive",
      });
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - uploadedImages.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can only upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}. Maximum is ${maxImages} images total.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const filesToUpload = Array.from(files);
    const newUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const url = await uploadImage(filesToUpload[i]);
      if (url) {
        newUrls.push(url);
      }
      setUploadProgress(((i + 1) / filesToUpload.length) * 100);
    }

    if (newUrls.length > 0) {
      const updatedImages = [...uploadedImages, ...newUrls];
      setUploadedImages(updatedImages);
      onImagesUploaded(updatedImages);
      
      toast({
        title: "Upload successful",
        description: `${newUrls.length} image${newUrls.length === 1 ? '' : 's'} uploaded successfully`,
      });
    }

    setUploading(false);
    setUploadProgress(0);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFilesSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} (Max {maxImages} images, {uploadedImages.length} uploaded)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uploaded Images Grid */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {/* Upload Area */}
        {uploadedImages.length < maxImages && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={handleButtonClick}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                {uploadedImages.length === 0 ? (
                  <Upload className="h-8 w-8 text-primary" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {uploadedImages.length === 0 ? 'Click to upload or drag and drop' : 'Add more images'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 10MB each
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {maxImages - uploadedImages.length} slots remaining
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFilesSelect(e.target.files)}
          className="hidden"
          disabled={uploading || uploadedImages.length >= maxImages}
        />

        {uploadedImages.length >= maxImages && (
          <p className="text-sm text-muted-foreground text-center">
            Maximum number of images reached. Remove some to upload more.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MultipleImageUpload;
