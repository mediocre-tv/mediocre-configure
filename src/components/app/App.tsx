import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangles } from "../shapes/Rectangle.tsx";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import styles from "./App.module.css";
import { useState } from "react";
import GrpcConfig from "../grpc/GrpcConfig.tsx";
import AppProviders from "../app-providers/AppProviders.tsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import GrpcProvider from "../grpc/GrpcProvider.tsx";
import { GrpcContextProps } from "../grpc/GrpcContext.tsx";

function App() {
  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );

  const [grpcContext, setGrpcContext] = useState<GrpcContextProps | null>(null);

  return (
    <AppProviders>
      <div className={styles.container}>
        {grpcContext ? (
          <GrpcProvider context={grpcContext}>
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
          </GrpcProvider>
        ) : (
          <GrpcConfig context={grpcContext} setContext={setGrpcContext} />
        )}
      </div>
    </AppProviders>
  );
}

export default App;
