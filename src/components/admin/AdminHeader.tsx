import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AdminHeaderProps {
  onSignOut: () => Promise<void>;
}

export const AdminHeader = ({ onSignOut }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Admin Console</h1>
      <Button onClick={onSignOut} variant="outline">
        Sign Out
      </Button>
    </div>
  );
};