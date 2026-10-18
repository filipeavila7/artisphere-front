import { useCallback, useEffect, useState } from "react";

export function useCountdown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = window.setTimeout(
      () => setRemaining((current) => current - 1),
      1000
    );

    return () => window.clearTimeout(timer);
  }, [remaining]);

  const start = useCallback((seconds: number) => {
    setRemaining(seconds);
  }, []);

  return { remaining, start };
}