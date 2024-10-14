import { PropsWithChildren } from "react";
import { ZoneResultsProvider } from "./zone-results/ZoneResultsProvider.tsx";
import { ZoneResultProvider } from "./zone-result/ZoneResultProvider.tsx";
import { RegionResultsProvider } from "./region-results/RegionResultsProvider.tsx";

export function ResultsProviders({ children }: PropsWithChildren) {
  return (
    <ZoneResultsProvider>
      <ZoneResultProvider>
        <RegionResultsProvider>{children}</RegionResultsProvider>
      </ZoneResultProvider>
    </ZoneResultsProvider>
  );
}
