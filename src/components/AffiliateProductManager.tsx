import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { useAffiliateProductManager } from '@/hooks/useAffiliateProductManager';
import { useState } from 'react';

const CATEGORIES = [
  'ointment',
  'lotion',
  'cleanser',
  'bandage',
  'supplement',
  'other'
];

const CONDITION_OPTIONS = [
  'dry_skin',
  'infection_risk',
  'sensitive_skin',
  'excessive_scabbing',
  'slow_healing',
  'irritation',
  'allergic_reaction'
];

const AffiliateProductManager = () => {
  const {
    products,
    editingProduct,
    showAddForm,
    loading,
    saving,
    formData,
    associateTag,
    setShowAddForm,
    setFormData,
    handleEdit,
    handleSave,
    handleDelete,
    handleToggleActive,
    handleCancel,
    saveAssociateTag
  } = useAffiliateProductManager();

  const [tagInput, setTagInput] = useState('');
  const [showTagEditor, setShowTagEditor] = useState(false);

  if (loading) {
    return <div className="text-center py-8">Loading affiliate products...</div>;
  }

  const isFormVisible = showAddForm || editingProduct !== null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Amazon Affiliate Product Management</CardTitle>
            <CardDescription>Manage products for Healyn recommendations</CardDescription>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            disabled={isFormVisible}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Amazon Associate Tag Section */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Amazon Associate Tag</Label>
            {!showTagEditor && (
              <Button variant="outline" size="sm" onClick={() => {
                setTagInput(associateTag);
                setShowTagEditor(true);
              }}>
                {associateTag ? 'Edit' : 'Set Tag'}
              </Button>
            )}
          </div>
          {showTagEditor ? (
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="yourtag-20"
                className="flex-1"
              />
              <Button onClick={() => {
                saveAssociateTag(tagInput);
                setShowTagEditor(false);
              }}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowTagEditor(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {associateTag || 'Not set - required to generate affiliate links'}
            </p>
          )}
        </div>

        {/* Add/Edit Form */}
        {isFormVisible && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_name">Product Name *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="Aquaphor Healing Ointment"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amazon_asin">Amazon ASIN *</Label>
                <Input
                  id="amazon_asin"
                  value={formData.amazon_asin}
                  onChange={(e) => setFormData({ ...formData, amazon_asin: e.target.value })}
                  placeholder="B00XXXXX"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority (lower = higher)</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Recommended For</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {CONDITION_OPTIONS.map((condition) => (
                    <label key={condition} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.recommended_for.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              recommended_for: [...formData.recommended_for, condition]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              recommended_for: formData.recommended_for.filter(c => c !== condition)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{condition.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief product description..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>ASIN</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No affiliate products yet. Add your first product above.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{product.amazon_asin}</TableCell>
                    <TableCell>{product.priority}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(product.id, product.active)}
                      >
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={product.affiliate_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          disabled={isFormVisible}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={isFormVisible}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateProductManager;
