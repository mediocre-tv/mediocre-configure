import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangles } from "../shapes/Rectangle.tsx";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import styles from "./App.module.css";
import { useState } from "react";
import GrpcConfig from "../grpc/GrpcConfig.tsx";
import { GrpcContextProps, GrpcProvider } from "../grpc/GrpcProvider.tsx";
import AppProviders from "../app-providers/AppProviders.tsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function App() {
  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );

  const [grpcContext, setGrpcContext] = useState<GrpcContextProps | null>(null);

  return (
    <AppProviders>
      <div className={styles.container}>
        {!grpcContext && (
          <GrpcConfig context={grpcContext} setContext={setGrpcContext} />
        )}
        <GrpcProvider context={grpcContext}>
          <ImageLabeller
            image={snapshotImage}
            rectangles={rectangles}
            setRectangles={setRectangles}
            selectedRectangleId={selectedRectangleId}
            setSelectedRectangleId={setSelectedRectangleId}
          />
        </GrpcProvider>
        <div>
          Selected rectangle: {selectedRectangleId}{" "}
          {selectedRectangleId &&
            `: ${JSON.stringify(rectangles[selectedRectangleId])}`}
        </div>
      </div>
    </AppProviders>
  );
}

export default App;
