
import { useProductGrid } from '@/hooks/useProductGrid';
import SphereCarousel from './SphereCarousel';
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

  console.log('🎠 ProductGrid render - products:', products?.length, 'loading:', loading);

  if (loading) {
    console.log('⏳ Still loading products...');
    return <ProductGridLoading />;
  }

  return (
    <>
      <section className="py-20 px-4" id="products">
        <div className="max-w-6xl mx-auto">
          <ProductGridHeader />

          <div className="mt-8">
            {products.length > 0 ? (
              <SphereCarousel
                products={products}
                onAddToCart={handleAddToCart}
                onProductView={handleProductView}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No products available</p>
                <p className="text-sm mt-2">Check console for debugging info</p>
              </div>
            )}
          </div>
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
