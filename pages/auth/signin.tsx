import * as React from "react"
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  TextField,
} from "@mui/material"
import { Box } from "@mui/system"
import axios from "axios"
import { GetServerSideProps } from "next"
import { getProviders, signIn, useSession } from "next-auth/react"
import { useState } from "react"
import Layout from "../../components/layout"
import { useRouter } from "next/router"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  )
}

export default function SignIn({ providers }: { providers: any }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  React.useEffect(() => {
    if (session) {
      let callbackUrl = "/"
      if (router.query.callbackUrl) {
        if (typeof router.query.callbackUrl === "string")
          callbackUrl = router.query.callbackUrl
        else if (router.query.callbackUrl.length)
          callbackUrl = router.query.callbackUrl[0]
      }
      router.replace(callbackUrl)
    }

    if (router.query.error) {
      setErrorMessage(`Sign In Unsuccessful`)
    }
  }, [router.isReady, session])

  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const changeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
    setErrorMessage("")
  }

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")
    try {
      let response = await axios.post("/api/auth/with-credentials/signup", {
        name,
        email,
        phone,
        password,
        confirmPassword,
      })

      let valid = await axios.post("/api/auth/with-credentials/login", {
        email,
        password,
      })

      signIn("credentials", { email, password })
    } catch (error: any) {
      console.error({ e: error })
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
          my: 2,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            aria-label="basic tabs example"
            onChange={changeTab}
            variant="fullWidth"
          >
            <Tab
              label="Sign In"
              id={`simple-tab-${0}`}
              aria-controls={`simple-tabpanel-${0}`}
            />
            <Tab
              label="Sign Up"
              id={`simple-tab-${1}`}
              aria-controls={`simple-tabpanel-${1}`}
            />
          </Tabs>
        </Box>
        <Card>
          <CardContent>
            <TabPanel value={tab} index={0}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  signIn("credentials", { email, password })
                }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value)
                  }}
                  sx={{ my: 1 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.currentTarget.value)
                  }}
                  sx={{ my: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ my: 1 }}
                >
                  Sign In
                </Button>
              </form>
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <form onSubmit={signUp}>
                <TextField
                  fullWidth
                  label="Full Name"
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.currentTarget.value)
                  }}
                  sx={{ my: 1 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value)
                  }}
                  sx={{ my: 1 }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.currentTarget.value)
                  }}
                  sx={{ my: 1 }}
                />
                <Divider sx={{ my: 1 }} />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.currentTarget.value)
                  }}
                  sx={{ my: 1 }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="pconfirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.currentTarget.value)
                  }}
                  sx={{ my: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ my: 1 }}
                >
                  Sign Up
                </Button>
              </form>
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </TabPanel>

            <Divider sx={{ my: 2 }} />

            {["google", "facebook"].map((provider: string) => (
              <div key={provider}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ my: 1 }}
                  onClick={() => signIn(provider)}
                >
                  Sign {tab ? "up" : "in"} with {provider}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<{ providers: any }> =
  async (context) => {
    return {
      props: {
        providers: await getProviders(),
      },
    }
  }
