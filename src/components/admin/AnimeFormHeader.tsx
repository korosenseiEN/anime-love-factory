import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface AnimeFormHeaderProps {
  isCreating: boolean;
  selectedAnime: any;
  onCreateToggle: () => void;
  onDelete: () => void;
}

export const AnimeFormHeader = ({ 
  isCreating, 
  selectedAnime, 
  onCreateToggle, 
  onDelete 
}: AnimeFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button
        onClick={onCreateToggle}
        className="mb-4"
      >
        {isCreating ? "Cancel" : "Add New Anime"}
      </Button>
      {selectedAnime && (
        <Button
          variant="destructive"
          onClick={onDelete}
          className="mb-4"
        >
          <Trash2 className="mr-2" />
          Delete Anime
        </Button>
      )}
    </div>
  );
};