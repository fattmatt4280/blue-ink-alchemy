
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
