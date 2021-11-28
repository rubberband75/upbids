import * as React from "react"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@mui/material/styles"
import { CacheProvider, EmotionCache } from "@emotion/react"
import createEmotionCache from "../components/createEmotionCache"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "../components/theme"
import Head from "next/head"
import "./styles.css"
import { SocketContext, socket } from "../sockets/SocketClient"

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: MyAppProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <Head>
        <title>UpBids</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <SocketContext.Provider value={socket}>
        <SessionProvider session={session} refetchInterval={5 * 60}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </SessionProvider>
      </SocketContext.Provider>
    </CacheProvider>
  )
}
