"use client";

import {
  createContext,
  type RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type LoadingContextValue = {
  logoTargetRef: RefObject<HTMLDivElement | null>;
  isReady: boolean;
  navItemsVisible: boolean;
  revealNavItems: () => void;
  completeLoading: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const logoTargetRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [navItemsVisible, setNavItemsVisible] = useState(false);

  const revealNavItems = useCallback(() => {
    setNavItemsVisible(true);
  }, []);

  const completeLoading = useCallback(() => {
    setNavItemsVisible(true);
    setIsReady(true);
    document.body.style.overflow = "";
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        logoTargetRef,
        isReady,
        navItemsVisible,
        revealNavItems,
        completeLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
