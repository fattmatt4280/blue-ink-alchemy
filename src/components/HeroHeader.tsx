
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";

const HeroHeader = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="absolute top-4 right-4 z-20 flex gap-2">
      <CartIcon />
      
      {user ? (
        <div className="flex gap-2">
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
          
          <Button 
            size="sm"
            className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
            variant="outline"
            onClick={signOut}
          >
            <User className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      ) : (
        <Link to="/auth">
          <Button 
            size="sm"
            className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
            variant="outline"
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default HeroHeader;
