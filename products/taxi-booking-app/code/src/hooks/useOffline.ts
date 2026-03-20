/**
 * useOffline Hook
 *
 * Provides offline status for the app.
 */

import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable
      setIsOffline(!online)
      onlineManager.setOnline(online)

      if (online) {
        setLastSyncTime(new Date())
      }
    })

    return () => unsubscribe()
  }, [])

  return { isOffline, lastSyncTime }
}
