
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';
import { useProductManager } from '@/hooks/useProductManager';

const ProductManager = () => {
  const {
    products,
    editingProduct,
    showAddForm,
    loading,
    saving,
    formData,
    setShowAddForm,
    setFormData,
    handleEdit,
    handleSave,
    handleDelete,
    handleCancel
  } = useProductManager();

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm || editingProduct !== null}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ProductForm
          editingProduct={editingProduct}
          showAddForm={showAddForm}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />

        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          editingProduct={editingProduct}
          showAddForm={showAddForm}
        />
      </CardContent>
    </Card>
  );
};

export default ProductManager;
