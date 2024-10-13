import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { Video } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/test_pb";
import VideoDialog from "./VideoDialog.tsx";

export interface VideoProviderProps {
  video?: Video;
  setVideo: (video: Video, duration: number) => void;
}

export function VideoProvider({
  children,
  video,
  setVideo,
}: PropsWithChildren<VideoProviderProps>) {
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean>(false);

  const getVideoDuration = async (video: Video): Promise<number> => {
    return new Promise((resolve, reject) => {
      const htmlVideo = document.createElement("video");
      htmlVideo.src = video.url;

      htmlVideo.addEventListener("loadedmetadata", () => {
        resolve(htmlVideo.duration);
        htmlVideo.remove();
      });

      htmlVideo.addEventListener("error", (error) => {
        reject("Error loading video metadata: " + error.message);
        htmlVideo.remove();
      });
    });
  };

  const validateVideo = useCallback(async (video: Video) => {
    return getVideoDuration(video)
      .then((duration) => {
        setValid(true);
        setError(null);
        return duration;
      })
      .catch((error) => {
        setValid(false);
        setError(error.message);
      });
  }, []);

  const onSelectVideo = async (name: string, url: string) => {
    if (!video || video.name === name) {
      const video = { name, url: url };
      const duration = await validateVideo(video);
      if (duration) {
        setVideo(video, duration);
      }
    } else {
      setError("Name of video must match the name of the video in the test");
    }
  };

  useEffect(() => {
    if (!video) {
      setValid(false);
      return;
    }

    validateVideo(video);
  }, [validateVideo, video]);

  if (!valid) {
    return (
      <VideoDialog
        open={true}
        error={error}
        video={video}
        onSelectVideo={onSelectVideo}
      />
    );
  }

  return children;
}
