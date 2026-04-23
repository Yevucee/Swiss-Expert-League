import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { LeagueDataProvider } from '../contexts/LeagueDataContext'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LeagueDataProvider>
      <Component {...pageProps} />
    </LeagueDataProvider>
  )
}
