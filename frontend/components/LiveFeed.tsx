"use client";

import { useEffect, useRef } from "react";
import { connectWebSocket, disconnectWebSocket } from "@/lib/rum";

interface LiveEvent {
  type: string;
  metric_name?: string;
  value?: number;
  rating?: string;
  url?: string;
  message?: string;
  score?: number;
}

interface LiveFeedProps {
  onEvent: (event: LiveEvent) => void;
}

export default function LiveFeed({ onEvent }: LiveFeedProps) {
  const onEventRef = useRef(onEvent);
  
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const ws = connectWebSocket((event) => onEventRef.current(event));
    return () => disconnectWebSocket();
  }, []);

  return null; // headless component
}
