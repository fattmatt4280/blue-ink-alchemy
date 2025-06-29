
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  description: string | null;
  size: string | null;
  popular: boolean;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  editingProduct: Product | null;
  showAddForm: boolean;
}

const ProductTable = ({ products, onEdit, onDelete, editingProduct, showAddForm }: ProductTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Popular</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
            </TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.size}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-semibold">${product.price}</span>
                {product.original_price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.original_price}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {product.popular && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Popular
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                  disabled={editingProduct !== null || showAddForm}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(product.id)}
                  disabled={editingProduct !== null || showAddForm}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
