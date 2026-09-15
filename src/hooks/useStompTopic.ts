import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

function getWebSocketUrl() {
  const configuredUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (configuredUrl) return configuredUrl;

  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  return apiUrl ? `${apiUrl.replace(/^http/, "ws")}/ws` : "ws://localhost:8080/ws";
}

/** Subscribes to one STOMP topic and releases the connection when the owner unmounts. */
export function useStompTopic<T>(destination: string | undefined, onEvent: (event: T) => void, enabled = true) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!destination || !enabled) return;

    const token = localStorage.getItem("accessToken");
    const client = new Client({
      brokerURL: getWebSocketUrl(),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(destination, (frame) => {
          try {
            handlerRef.current(JSON.parse(frame.body) as T);
          } catch {
            // Ignore malformed events; a later valid event can still be processed.
          }
        });
      },
    });

    client.activate();
    return () => { void client.deactivate(); };
  }, [destination, enabled]);
}
