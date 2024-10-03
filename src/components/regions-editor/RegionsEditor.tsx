import snapshotImage from "../../assets/snapshot-2.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { RegionsEditorLeft } from "./RegionsEditorLeft.tsx";
import { RegionsEditorRight } from "./RegionsEditorRight.tsx";
import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";

export function RegionsEditor() {
  const [regions, setRegions] = useLocalState<Region[]>([], "regions");
  const image = snapshotImage;
  return (
    <LongOrSideBySideLayout
      leftChild={
        <RegionsEditorLeft
          image={image}
          regions={regions}
          setRegions={setRegions}
        />
      }
      rightChild={
        <RegionsEditorRight
          image={image}
          regions={regions}
          setRegions={setRegions}
        />
      }
    />
  );
}
