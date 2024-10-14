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
    video.onloadeddata = () => resolve();
    video.onerror = () => reject("Failed to load video");
    if (signal?.aborted) {
      reject("Aborted video load");
    }
  });

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  return {
    video,
    canvas,
    ctx,
  };
}

export async function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  signal?: AbortSignal,
) {
  // We must wait for the video to seek to the correct time
  return await new Promise<string>((resolve, reject) =>
    video.requestVideoFrameCallback(() => {
      if (signal?.aborted) {
        reject("Aborted frame capture");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject("Failed to capture frame");
          return;
        }

        const url = URL.createObjectURL(blob);
        resolve(url);
      });
    }),
  );
}

export async function captureFramesAtTimestamps(
  times: number[],
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  addFrame: (time: number, frame: string) => void,
  signal: AbortSignal,
) {
  for (const time of times) {
    video.currentTime = time;
    const frame = await captureFrame(video, canvas, context, signal);
    addFrame(time, frame);
  }
}

export async function getFramesFromVideo(
  url: string,
  times: number[],
  addFrame: (time: number, frame: string) => void,
  signal: AbortSignal,
) {
  const { canvas, ctx, video } = await setup(url, signal);

  try {
    await captureFramesAtTimestamps(
      times,
      video,
      canvas,
      ctx,
      addFrame,
      signal,
    );
  } finally {
    video.remove();
    canvas.remove();
  }
}

export function getRandomTimestamps(start: number, end: number, count: number) {
  const duration = end - start;
  return Array(count)
    .fill(0)
    .map(() => start + Math.random() * duration)
    .sort((a, b) => a - b);
}

export async function getVideoDuration(url: string) {
  const { video } = await setup(url);
  return video.duration;
}
