import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangles } from "../shapes/Rectangle.tsx";
import { useState } from "react";

export default function RegionEditor() {
  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );

  return (
    <>
      <ImageLabeller
        image={snapshotImage}
        rectangles={rectangles}
        setRectangles={setRectangles}
        selectedRectangleId={selectedRectangleId}
        setSelectedRectangleId={setSelectedRectangleId}
      />
      <div>
        Selected rectangle: {selectedRectangleId}{" "}
        {selectedRectangleId &&
          `: ${JSON.stringify(rectangles[selectedRectangleId])}`}
      </div>
    </>
  );
}
