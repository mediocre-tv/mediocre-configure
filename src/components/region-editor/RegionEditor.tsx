import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Box } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { RegionEditorLeft } from "./RegionEditorLeft.tsx";
import { RegionEditorRight } from "./RegionEditorRight.tsx";

export default function RegionEditor() {
  const [regions, setRegions] = useLocalState<Region[]>([], "regions");
  const image = snapshotImage;
  return (
    <Box width={1} height={1} display="flex" justifyContent="center" p={10}>
      <Grid2 container width={1} spacing={10}>
        <Grid2 xs={12} lg={6}>
          <RegionEditorLeft
            image={image}
            regions={regions}
            setRegions={setRegions}
          />
        </Grid2>
        <Grid2 height={1} xs={12} lg={6}>
          <RegionEditorRight
            image={image}
            regions={regions}
            setRegions={setRegions}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}
