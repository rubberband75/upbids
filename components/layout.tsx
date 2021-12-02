import UpBidsAppBar from "./UpBidsAppBar"
import UpBidsFooter from "./UpBidsFooter"
import { Container } from "@mui/material"
import { Box } from "@mui/system"

interface LayoutProps {
  children: React.ReactNode
  fullWidth?: boolean
}

export default function Layout({ children, fullWidth }: LayoutProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <UpBidsAppBar />

        {fullWidth ? (
          <Box
            component="main"
            sx={{
              mt: 8,
              mb: 10,
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            {children}
          </Box>
        ) : (
          <Container
            component="main"
            sx={{
              mt: 8,
              mb: 10,
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
            maxWidth="sm"
          >
            {children}
          </Container>
        )}
        <UpBidsFooter />
      </Box>
    </>
  )
}
