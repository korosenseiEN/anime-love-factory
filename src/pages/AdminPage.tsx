import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AnimeForm } from "@/components/admin/AnimeForm";

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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    navigate("/");
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
      <AdminHeader onSignOut={handleSignOut} />
      <div className="space-y-8">
        {animes.map((anime) => (
          <AnimeForm
            key={anime.id}
            anime={anime}
            onUpdate={handleUpdate}
            onVideoUpload={handleVideoUpload}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminPage;