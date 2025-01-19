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
      if (!email.trim() || !password.trim()) {
        throw new Error("Please enter both email and password");
      }

      console.log("Attempting login with email:", email); // Debug log

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error("Sign in error details:", {
          status: signInError.status,
          message: signInError.message,
          name: signInError.name,
          code: 'code' in signInError ? signInError.code : undefined
        });

        if (signInError instanceof AuthApiError) {
          switch (signInError.status) {
            case 400:
              throw new Error("Invalid email or password. Please check your credentials and try again.");
            case 500:
              console.error("Server error details:", signInError);
              throw new Error("We're experiencing technical difficulties. Please try again in a few minutes.");
            default:
              throw signInError;
          }
        }
        throw signInError;
      }

      if (!authData?.user) {
        throw new Error("Authentication failed - please try again");
      }

      console.log("Authentication successful, user:", authData.user.id); // Debug log

      // Wait a brief moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Don't throw here, just default to user role
        navigate("/");
        return;
      }

      console.log("Profile fetched successfully:", profile); // Debug log

      // Navigate based on role
      navigate(profile?.role === "admin" ? "/admin" : "/");
      
      toast({ 
        title: "Success", 
        description: "Logged in successfully",
        duration: 3000
      });
    } catch (error) {
      console.error("Login error:", error);
      let message = "An unexpected error occurred";
      
      if (error instanceof AuthApiError) {
        switch (error.status) {
          case 400:
            message = "Invalid email or password. Please check your credentials and try again.";
            break;
          case 401:
            message = "Invalid login credentials";
            break;
          case 422:
            message = "Email and password are required";
            break;
          case 500:
            message = "We're experiencing technical difficulties. Please try again in a few minutes.";
            console.error("Server error details:", error);
            break;
          default:
            message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      setError(message);
      toast({ 
        title: "Error", 
        description: message,
        variant: "destructive",
        duration: 5000
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
          className="w-full"
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
          disabled={loading}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;