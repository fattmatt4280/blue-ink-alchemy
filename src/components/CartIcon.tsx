
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

const CartIcon = () => {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <Link to="/checkout">
      <Button 
        size="sm"
        className="bg-white/20 hover:bg-white/30 text-white border-white/30 relative"
        variant="outline"
      >
        <ShoppingCart className="w-4 h-4" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartIcon;
