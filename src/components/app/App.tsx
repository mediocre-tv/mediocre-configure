import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangles } from "../shapes/Rectangle.tsx";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import styles from "./App.module.css";

function App() {
  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");

  return (
    <div className={styles.container}>
      <ImageLabeller
        image={snapshotImage}
        rectangles={rectangles}
        setRectangles={setRectangles}
      />
    </div>
  );
}

export default App;
