import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Maximize2, Minimize2 } from "lucide-react";

const VideoPlayerPage = () => {
  const { id } = useParams();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: anime, isLoading } = useQuery({
    queryKey: ["anime", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      
      const { data, error } = await supabase
        .from("anime")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (error) throw error;
      return data;
    },
  });

  const toggleFullscreen = (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return;

    if (!document.fullscreenElement) {
      videoElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!anime?.video_url) {
    return <div>No video available</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{anime.title}</h1>
      <div className="relative">
        <video
          src={anime.video_url}
          controls
          className="w-full rounded-lg"
          id="video-player"
        />
        <Button
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
          onClick={() => toggleFullscreen(document.querySelector("#video-player"))}
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>
    </div>
  );
};

export default VideoPlayerPage;