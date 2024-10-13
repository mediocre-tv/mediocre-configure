import { useStages } from "../stage/useStages.ts";
import { useZones } from "../zone/useZones.ts";
import { useRegions } from "../region/useRegions.ts";

export function useExpandedId(collapsedId: string) {
  const { stages } = useStages();
  const { zones } = useZones();
  const { regions } = useRegions();

  const ids = [
    ...Array.from(stages.keys()),
    ...Array.from(zones.keys()),
    ...Array.from(regions.keys()),
  ];

  const id = expandId(collapsedId, ids);

  if (!id) {
    throw new Error(`No id found for ${collapsedId}`);
  }

  return id;
}

export function expandId(
  collapsedId: string,
  possibleIds: string[],
): string | null {
  return (
    possibleIds.find((possibleId) => possibleId.startsWith(collapsedId)) ?? null
  );
}
