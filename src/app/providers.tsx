"use client";

import { AuthProvider } from "./contexts/AuthContext"; // Adjust this import path to where your AuthContext is defined

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}