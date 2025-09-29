
import { useProductGrid } from '@/hooks/useProductGrid';
import ProductCard from './ProductCard';
import ProductGridHeader from './ProductGridHeader';
import ProductGridLoading from './ProductGridLoading';
import ProductGridEmpty from './ProductGridEmpty';
import CartDialog from './CartDialog';

const ProductGrid = () => {
  const {
    products,
    loading,
    cartDialogOpen,
    selectedProductName,
    setCartDialogOpen,
    handleAddToCart,
    handleProductView,
  } = useProductGrid();

  if (loading) {
    return <ProductGridLoading />;
  }

  return (
    <>
      <section className="py-20 px-4" id="products">
        <div className="max-w-6xl mx-auto">
          <ProductGridHeader />

          <div className="mt-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onProductView={handleProductView}
                />
              ))}
            </div>
          </div>

          {products.length === 0 && <ProductGridEmpty />}
        </div>
      </section>

      <CartDialog 
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productName={selectedProductName}
      />
    </>
  );
};

export default ProductGrid;
