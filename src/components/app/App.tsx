import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangles } from "../shapes/Rectangle.tsx";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import styles from "./App.module.css";
import { useState } from "react";
import GrpcConfig from "../grpc/GrpcConfig.tsx";

function App() {
  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );

  const [grpcContext, setGrpcContext] = useState<GrpcContextProps | null>(null);

  return (
    <div className={styles.container}>
      <ImageLabeller
        image={snapshotImage}
        rectangles={rectangles}
        setRectangles={setRectangles}
        selectedRectangleId={selectedRectangleId}
        setSelectedRectangleId={setSelectedRectangleId}
      />
      {!grpcContext && (
        <GrpcConfig context={grpcContext} setContext={setGrpcContext} />
      )}
      <div>
        Selected rectangle: {selectedRectangleId}{" "}
        {selectedRectangleId &&
          `: ${JSON.stringify(rectangles[selectedRectangleId])}`}
      </div>
    </div>
  );
}

export default App;
