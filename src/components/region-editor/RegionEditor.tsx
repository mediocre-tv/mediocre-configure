import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { RegionEditorLeft } from "./RegionEditorLeft.tsx";
import { RegionEditorRight } from "./RegionEditorRight.tsx";
import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";

export function RegionEditor() {
  const [regions, setRegions] = useLocalState<Region[]>([], "regions");
  const image = snapshotImage;
  return (
    <LongOrSideBySideLayout
      leftChild={
        <RegionEditorLeft
          image={image}
          regions={regions}
          setRegions={setRegions}
        />
      }
      rightChild={
        <RegionEditorRight
          image={image}
          regions={regions}
          setRegions={setRegions}
        />
      }
    />
  );
}
