import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 500:
          return "Authentication server error. Please check if you have configured the Site URL and Redirect URLs in your Supabase dashboard.";
        case 400:
          return "Invalid email or password.";
        default:
          if (error.message.includes("Database error querying schema")) {
            return "Database configuration error. Please ensure your Supabase project is properly set up.";
          }
          return error.message;
      }
    }
    return "An unexpected error occurred. Please try again.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) throw authError;

      if (!session) throw new Error("No session");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof AuthError ? getErrorMessage(error) : "Failed to login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </Button>
      </form>
    </div>
  );
}

export default LoginPage;