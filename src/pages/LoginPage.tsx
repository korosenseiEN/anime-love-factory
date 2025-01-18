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
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        if (authError instanceof AuthApiError) {
          if (authError.status === 500) {
            throw new Error("Authentication configuration error. Please ensure Site URL and Redirect URLs are properly set in Supabase.");
          }
          switch (authError.message) {
            case "Invalid login credentials":
              throw new Error("Invalid email or password. Please check your credentials.");
            default:
              throw authError;
          }
        }
        throw authError;
      }

      if (!session) throw new Error("No session returned");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      navigate(profile?.role === "admin" ? "/admin" : "/");
      toast({ title: "Success", description: "Logged in successfully" });
    } catch (error) {
      let message = "An unexpected error occurred";
      
      if (error instanceof Error) {
        message = error.message;
      } else if (error instanceof AuthApiError) {
        if (error.status === 500) {
          message = "Authentication configuration error. Please check Supabase URL settings.";
        } else {
          message = error.message;
        }
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