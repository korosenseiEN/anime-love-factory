import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

const AdminPage = () => {
  const [session, setSession] = useState(null);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/");
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (session) {
      fetchAnimes();
    }
  }, [session]);

  const fetchAnimes = async () => {
    const { data, error } = await supabase.from("anime").select("*");
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch anime data",
        variant: "destructive",
      });
      return;
    }
    setAnimes(data);
  };

  const handleUpdate = async (id: number, updates: Partial<Anime>) => {
    const { error } = await supabase
      .from("anime")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update anime",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Anime updated successfully",
    });
    fetchAnimes();
  };

  const handleVideoUpload = async (id: number, file: File) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("anime-videos")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
      return;
    }

    const { data } = supabase.storage
      .from("anime-videos")
      .getPublicUrl(filePath);

    await handleUpdate(id, { video_url: data.publicUrl });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-md p-8">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <Button
          onClick={() => supabase.auth.signOut()}
          variant="outline"
        >
          Sign Out
        </Button>
      </div>

      <div className="space-y-8">
        {animes.map((anime) => (
          <div
            key={anime.id}
            className="bg-card p-6 rounded-lg shadow-sm border"
          >
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  defaultValue={anime.title}
                  onBlur={(e) =>
                    handleUpdate(anime.id, { title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Synopsis</label>
                <Textarea
                  defaultValue={anime.synopsis || ""}
                  onBlur={(e) =>
                    handleUpdate(anime.id, { synopsis: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Score</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  defaultValue={anime.score || ""}
                  onBlur={(e) =>
                    handleUpdate(anime.id, {
                      score: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  defaultValue={anime.image_url || ""}
                  onBlur={(e) =>
                    handleUpdate(anime.id, { image_url: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Video Upload</label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleVideoUpload(anime.id, file);
                    }
                  }}
                />
                {anime.video_url && (
                  <div className="mt-2">
                    <video
                      src={anime.video_url}
                      controls
                      className="w-full max-w-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;