
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Save } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  size: string | null;
  display_order: number;
}

const ProductReorderTool = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, size, display_order')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // If products don't have display_order, assign them based on current order
      const productsWithOrder = data?.map((product, index) => ({
        ...product,
        display_order: product.display_order ?? index + 1
      })) || [];
      
      setProducts(productsWithOrder);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moveProduct = (fromIndex: number, toIndex: number) => {
    const newProducts = [...products];
    const [movedProduct] = newProducts.splice(fromIndex, 1);
    newProducts.splice(toIndex, 0, movedProduct);
    
    // Update display_order for all products
    const updatedProducts = newProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));
    
    setProducts(updatedProducts);
    setHasChanges(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      moveProduct(dragIndex, dropIndex);
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      // Update all products with their new display_order
      const updates = products.map(product => ({
        id: product.id,
        display_order: product.display_order,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({ display_order: update.display_order, updated_at: update.updated_at })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Order saved!",
        description: "Product order has been updated successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error saving order",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Product Order</CardTitle>
            <CardDescription>Drag and drop to reorder products</CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={saveOrder} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Order'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {products.map((product, index) => (
            <div
              key={product.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-move"
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">
                  {product.size} - ${product.price}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Order: {product.display_order}
              </div>
            </div>
          ))}
        </div>
        
        {hasChanges && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You have unsaved changes. Click "Save Order" to apply the new product order.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductReorderTool;
