import { useStages } from "../stage/useStages.ts";
import { useZones } from "../zone/useZones.ts";
import { useRegions } from "../region/useRegions.ts";

export function useCollapsedId(id: string) {
  const { stages } = useStages();
  const { zones } = useZones();
  const { regions } = useRegions();

  const ids = [
    ...Array.from(stages.keys()),
    ...Array.from(zones.keys()),
    ...Array.from(regions.keys()),
  ];

  return collapseId(id, ids);
}

function collapseId(id: string, otherIds: string[]): string {
  for (let i = 1; i <= id.length; i++) {
    const prefix = id.slice(0, i);
    if (
      otherIds
        .filter((otherId) => otherId !== id)
        .every((otherId) => !otherId.startsWith(prefix))
    ) {
      return prefix;
    }
  }
  return id;
}
