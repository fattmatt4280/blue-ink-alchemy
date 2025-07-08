
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";

const HeroHeader = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="absolute top-4 right-4 z-20 flex gap-2">
      <CartIcon />
      
      {isAdmin && (
        <Link to="/admin">
          <Button 
            size="sm"
            className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      )}

      {!user && (
        <Link to="/auth">
          <Button 
            size="sm"
            className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
            variant="outline"
          >
            Admin Login
          </Button>
        </Link>
      )}
    </div>
  );
};

export default HeroHeader;
