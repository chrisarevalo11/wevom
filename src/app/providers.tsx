"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingGate } from "@/components/loading/loading-gate";
import { LoadingProvider } from "@/components/loading/loading-provider";
import "@/lib/gsap";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <LoadingGate>{children}</LoadingGate>
      </LoadingProvider>
    </QueryClientProvider>
  );
}
