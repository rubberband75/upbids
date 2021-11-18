import Header from "./header"
import UpBidsAppBar from "./UpBidsAppBar"
import UpBidsFooter from "./UpBidsFooter"
import { Container } from "@mui/material"
import { Box } from "@mui/system"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
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

        <Container component="main" sx={{ mt: 0, mb: 2 }} maxWidth="sm">
          <Header />
          {children}
        </Container>
        <UpBidsFooter />
      </Box>
    </>
  )
}
