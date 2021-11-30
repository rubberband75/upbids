import express, { Express, Request, Response } from "express"
import * as http from "http"
import next, { NextApiHandler } from "next"
import createSocketServer from "../sockets/SocketServer"

const port: number = parseInt(process.env.PORT || "3000", 10)
const dev: boolean = process.env.NODE_ENV !== "production"
const nextApp = next({ dev })
const nextHandler: NextApiHandler = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  const app: Express = express()
  const server: http.Server = http.createServer(app)
  const io = createSocketServer(server)

  app.use("/api", (req: any, res: any, next: any) => {
    req.io = io
    next()
  })

  app.all("*", (req: any, res: any) => nextHandler(req, res))

  server.listen(port, () => {
    console.info(`\n * Listening at http://localhost:${port}\n`)
  })
})
