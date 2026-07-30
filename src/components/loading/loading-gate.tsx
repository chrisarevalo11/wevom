"use client";

import { useLoading } from "@/components/loading/loading-provider";
import { PageLoader } from "@/components/loading/page-loader";

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const { isReady } = useLoading();

  return (
    <>
      {!isReady ? <PageLoader /> : null}
      {children}
    </>
  );
}
