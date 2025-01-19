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

      // Check if we can connect to Supabase
      const { data: healthCheck, error: healthError } = await supabase.from('profiles').select('count').limit(1);
      if (healthError) {
        console.error("Database health check failed:", healthError);
        throw new Error("Unable to connect to the database. Please try again later.");
      }

      console.log("Database connection successful, attempting login with email:", email);

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error("Sign in error:", {
          status: signInError.status,
          message: signInError.message,
          name: signInError.name,
          code: signInError instanceof AuthApiError ? signInError.code : undefined
        });

        if (signInError instanceof AuthApiError) {
          switch (signInError.status) {
            case 400:
              throw new Error("Invalid email or password");
            case 422:
              throw new Error("Missing email or password");
            case 500:
              throw new Error("Server error - please try again later");
            default:
              throw new Error(signInError.message);
          }
        }
        throw signInError;
      }

      if (!authData?.user) {
        throw new Error("Login failed - please try again");
      }

      console.log("Authentication successful, fetching user profile...");

      // Fetch user profile with retry
      let profile = null;
      let retryCount = 0;
      while (retryCount < 3) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (profileError) {
          console.warn(`Profile fetch attempt ${retryCount + 1} failed:`, profileError);
          retryCount++;
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          }
          throw new Error("Could not fetch user profile");
        }

        profile = profileData;
        break;
      }

      console.log("Profile fetched successfully:", profile);

      // Navigate based on role
      navigate(profile?.role === "admin" ? "/admin" : "/");
      
      toast({ 
        title: "Success", 
        description: "Logged in successfully"
      });
    } catch (error) {
      console.error("Login error:", error);
      let message = "An unexpected error occurred";
      
      if (error instanceof AuthApiError) {
        message = error.message;
      } else if (error instanceof Error) {
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