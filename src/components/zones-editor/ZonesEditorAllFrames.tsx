import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { ZoneView } from "./ZonesEditor.tsx";

export interface ZonesEditorAllFramesProps {
  stageId: string;
  onChangeView: (view: ZoneView) => void;
}

export function ZonesEditorAllFrames() {
  return (
    <LongOrSideBySideLayout
      leftChild={<ZonesEditorAllFramesLeft />}
      rightChild={<ZonesEditorAllFramesRight />}
    />
  );
}

function ZonesEditorAllFramesLeft() {
  return <div>ZonesEditorAllFramesLeft</div>;
}

function ZonesEditorAllFramesRight() {
  return <div>ZonesEditorAllFramesRight</div>;
}
