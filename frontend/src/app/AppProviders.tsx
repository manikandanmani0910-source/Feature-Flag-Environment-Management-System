import type { ReactNode } from "react";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { BrowserRouter } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { useState } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({
  children,
}: AppProvidersProps) {
  const [queryClient] =
    useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 30_000,
              retry: 1,
              refetchOnWindowFocus: false,
            },
          },
        }),
    );

  return (
    <QueryClientProvider
      client={queryClient}
    >
      <BrowserRouter>
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}