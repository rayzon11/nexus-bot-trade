'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d1421',
            color: '#c8d8f0',
            border: '1px solid #1a2540',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
          },
          success: {
            iconTheme: { primary: '#00ff9f', secondary: '#080c14' },
          },
          error: {
            iconTheme: { primary: '#ff3d6b', secondary: '#080c14' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
