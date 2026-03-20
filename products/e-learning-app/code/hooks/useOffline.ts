import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      const wasOffline = !onlineManager.isOnline();

      onlineManager.setOnline(online);
      setIsOffline(!online);

      // Record sync time when connectivity is restored
      if (online && wasOffline) {
        setLastSyncTime(new Date());
      }
    });

    return () => unsubscribe();
  }, []);

  return { isOffline, lastSyncTime };
}
