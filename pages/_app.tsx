import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import "./styles.css"

import * as React from "react"
import Head from "next/head"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { CacheProvider, EmotionCache } from "@emotion/react"
import theme from "../components/theme"
import createEmotionCache from "../components/createEmotionCache"

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
      <SessionProvider session={session} refetchInterval={5 * 60}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  )
}
