
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
}

const CartDialog = ({ open, onOpenChange, productName }: CartDialogProps) => {
  const navigate = useNavigate();
  const isBudderProduct = productName.toLowerCase().includes('budder');

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Item Added to Cart!</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{productName}</strong> has been added to your cart. 
            Would you like to checkout now or continue shopping?
            {isBudderProduct && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 font-medium">
                  ✨ Bonus: We've added a FREE 3-day Heal-AId trial to your order!
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleContinueShopping}>
            Continue Shopping
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleCheckout}>
            Checkout Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CartDialog;
