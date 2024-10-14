import { PropsWithChildren } from "react";
import { ZoneResultsProvider } from "./zone-results/ZoneResultsProvider.tsx";
import { ZoneResultProvider } from "./zone-result/ZoneResultProvider.tsx";
import { RegionResultsProvider } from "./region-results/RegionResultsProvider.tsx";
import { RegionResultProvider } from "./region-result/RegionResultProvider.tsx";

export function ResultsProviders({ children }: PropsWithChildren) {
  return (
    <ZoneResultsProvider>
      <ZoneResultProvider>
        <RegionResultsProvider>
          <RegionResultProvider>{children}</RegionResultProvider>
        </RegionResultsProvider>
      </ZoneResultProvider>
    </ZoneResultsProvider>
  );
}
