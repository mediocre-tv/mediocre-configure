import { useEffect, useState } from "react";

export function useImageData(source: string | null) {
  const [imageData, setImageData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    if (source) {
      fetch(source)
        .then((res) => res.arrayBuffer())
        .then((buffer) => new Uint8Array(buffer))
        .then(setImageData);
    }
  }, [source]);

  return imageData;
}
