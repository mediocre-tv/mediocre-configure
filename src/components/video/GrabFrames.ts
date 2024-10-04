import { Frame } from "../frame-context/FrameContext.ts";

async function setup(url: string, signal?: AbortSignal) {
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context");
  }

  video.src = url;
  video.crossOrigin = "anonymous";
  video.muted = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject("Failed to load video");
    if (signal?.aborted) {
      reject("Aborted video load");
    }
  });

  return { video, canvas, ctx };
}

async function getFrames(
  times: number[],
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  signal: AbortSignal,
) {
  const frames: Frame[] = [];
  for (const time of times) {
    await new Promise<void>((resolve, reject) => {
      video.currentTime = time;
      video.onseeked = () => {
        if (signal.aborted) {
          reject("Aborted frame capture");
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push({ time: time, image: canvas.toDataURL() });
        resolve();
      };
    });
  }
  return frames;
}

export async function getFramesFromVideo(
  url: string,
  times: number[],
  signal: AbortSignal,
) {
  const { video, canvas, ctx } = await setup(url, signal);

  const frames = await getFrames(times, video, canvas, ctx, signal);

  video.remove();
  canvas.remove();

  return frames;
}

export function getRandomTimestamps(start: number, end: number, count: number) {
  const duration = end - start;
  return Array(count)
    .fill(0)
    .map(() => start + Math.random() * duration);
}

export async function getVideoDuration(url: string) {
  const { video } = await setup(url);
  return video.duration;
}
