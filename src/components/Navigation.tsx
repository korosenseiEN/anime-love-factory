import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function Navigation() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setIsAuthenticated(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      setIsAdmin(profile?.role === "admin");
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
      return;
    }

    navigate("/");
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated && <li><Link to="/favorites">My Favorites</Link></li>}
        {isAdmin && <li><Link to="/admin">Admin Panel</Link></li>}
        <li>
          {isAuthenticated ? (
            <Button onClick={handleLogout} variant="ghost" className="text-white hover:text-primary">
              Logout
            </Button>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}