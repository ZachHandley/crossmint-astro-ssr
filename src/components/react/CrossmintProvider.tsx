import { type ReactNode, useEffect, useState, useRef } from "react";
import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintCheckoutProvider,
} from "@crossmint/client-sdk-react-ui";
import { CROSSMINT_API_KEY } from "astro:env/client";
import { useOnceEffect } from "@reactuses/core";
import React from "react";

// Import the client-side component dynamically
const ClientOnlyAuthContent = React.lazy(
  () => import("./ClientOnlyAuthContent.tsx")
);

// Skeleton component that doesn't use any hooks directly
function AuthenticatedContent({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Only check if we're client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state initially
  if (!isClient) {
    return <div>Loading...</div>;
  }

  // Once we confirm we're on the client, render the client-only component
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ClientOnlyAuthContent>{children}</ClientOnlyAuthContent>
    </React.Suspense>
  );
}

// Main provider component
interface ProviderProps {
  children: ReactNode;
  skipAuthCheck?: boolean;
}

// Export raw providers for reuse
export function RawCrossmintProviders({ children }: { children: ReactNode }) {
  return (
    <CrossmintProvider apiKey={CROSSMINT_API_KEY}>
      <CrossmintAuthProvider
        authModalTitle="Connect or create your StreamFi account"
        loginMethods={["email", "google"]}
        refreshRoute={`${import.meta.env.SITE}/api/refresh.json`}
        logoutRoute={`${import.meta.env.SITE}/api/logout.json`}
        embeddedWallets={{
          type: "evm-smart-wallet",
          createOnLogin: "all-users",
        }}
      >
        {children}
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}

// Full provider with authentication
export default function CrossmintProviders({
  children,
  skipAuthCheck,
}: ProviderProps) {
  const [clientLoaded, setClientLoaded] = useState(false);

  useOnceEffect(() => {
    console.log("CrossmintProviders mounted");
    setClientLoaded(true);
  });

  if (!clientLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <RawCrossmintProviders>
      {skipAuthCheck ? (
        children
      ) : (
        <AuthenticatedContent>{children}</AuthenticatedContent>
      )}
    </RawCrossmintProviders>
  );
}
