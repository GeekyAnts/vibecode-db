import { type ReactNode } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persistOptions } from '../lib/queryClient'
import { ThemeProvider } from './ThemeProvider'
import { GluestackUIProvider } from '../../components/ui/gluestack-ui-provider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <GluestackUIProvider mode="system">
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          {children}
        </PersistQueryClientProvider>
      </GluestackUIProvider>
    </ThemeProvider>
  )
}
