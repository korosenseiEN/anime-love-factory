import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("Attempting login...");
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        console.error("Auth error:", authError);
        if (authError instanceof AuthApiError) {
          switch (authError.status) {
            case 400:
              throw new Error("Invalid email or password. Please check your credentials.");
            case 422:
              throw new Error("Email format is invalid.");
            case 500:
              throw new Error("Server error. Please try again later.");
            default:
              throw new Error(authError.message);
          }
        }
        throw authError;
      }

      if (!session) {
        console.error("No session returned");
        throw new Error("Login failed. Please try again.");
      }

      console.log("Session obtained, fetching profile...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw new Error("Failed to fetch user profile");
      }

      console.log("Login successful, navigating...");
      navigate(profile?.role === "admin" ? "/admin" : "/");
      toast({ title: "Success", description: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error);
      let message = "An unexpected error occurred";
      
      if (error instanceof Error) {
        message = error.message;
      } else if (error instanceof AuthApiError) {
        message = error.message;
      }
      
      setError(message);
      toast({ 
        title: "Error", 
        description: message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">Login</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;