import { DialogHeader as Header, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface DialogHeaderProps {
  anime: Anime;
}

export function DialogHeader({ anime }: DialogHeaderProps) {
  return (
    <Header>
      <DialogTitle className="text-2xl font-bold mb-4">{anime.title}</DialogTitle>
      <DialogDescription>
        View details and manage favorites for this anime
      </DialogDescription>
    </Header>
  );
}