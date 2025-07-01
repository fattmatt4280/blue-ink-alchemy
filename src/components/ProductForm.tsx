
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import ProductImageUpload from './ProductImageUpload';

export interface ProductFormData {
  name: string;
  price: string;
  original_price: string;
  description: string;
  size: string;
  popular: boolean;
  image_url: string;
  stripe_price_id: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  description: string | null;
  size: string | null;
  popular: boolean;
  stripe_price_id: string | null;
}

interface ProductFormProps {
  editingProduct: Product | null;
  showAddForm: boolean;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

const ProductForm = ({
  editingProduct,
  showAddForm,
  formData,
  setFormData,
  onSave,
  onCancel,
  saving
}: ProductFormProps) => {
  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  if (!showAddForm && !editingProduct) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Blue Dream Budder 1oz"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
              placeholder="e.g., 1oz (30ml)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="29.99"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="original_price">Original Price</Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
              placeholder="34.99"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
          <Input
            id="stripe_price_id"
            value={formData.stripe_price_id}
            onChange={(e) => setFormData(prev => ({ ...prev, stripe_price_id: e.target.value }))}
            placeholder="price_1234567890abcdef"
          />
          <p className="text-sm text-gray-500">
            Optional: If provided, Stripe will handle pricing and tax calculations automatically
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Product description"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="popular"
            checked={formData.popular}
            onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
            className="rounded"
          />
          <Label htmlFor="popular">Mark as Popular</Label>
        </div>

        <ProductImageUpload
          currentImage={formData.image_url}
          onImageUploaded={handleImageUpload}
          productName={formData.name || 'Product'}
        />

        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Product'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
