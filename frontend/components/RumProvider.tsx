"use client";

import { useEffect } from "react";
import { initRUM } from "@/lib/rum";

export default function RumProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initRUM();
  }, []);

  return <>{children}</>;
}
