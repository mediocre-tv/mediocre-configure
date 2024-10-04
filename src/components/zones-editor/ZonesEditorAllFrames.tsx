import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { ReactNode } from "react";

export interface ZonesEditorAllFramesProps {
  stageId: string;
  changeViewToggles: ReactNode;
}

export function ZonesEditorAllFrames({
  changeViewToggles,
}: ZonesEditorAllFramesProps) {
  return (
    <LongOrSideBySideLayout
      leftChild={
        <ZonesEditorAllFramesLeft changeViewToggles={changeViewToggles} />
      }
      rightChild={<ZonesEditorAllFramesRight />}
    />
  );
}

interface ZonesEditorAllFramesLeftProps {
  changeViewToggles: ReactNode;
}

function ZonesEditorAllFramesLeft({
  changeViewToggles,
}: ZonesEditorAllFramesLeftProps) {
  return (
    <>
      {changeViewToggles}
      <div>ZonesEditorAllFramesLeft</div>
    </>
  );
}

function ZonesEditorAllFramesRight() {
  return <div>ZonesEditorAllFramesRight</div>;
}
