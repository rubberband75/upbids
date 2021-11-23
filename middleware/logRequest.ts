import { ApiRequest, ApiResponse } from "../types/api"

export default async function (
  req: ApiRequest,
  res: ApiResponse,
  next: Function
) {
  console.info(
    `\x1b[2m${req.headers["x-forwarded-for"] || "-"}\x1b[0m`, // [Dim]    IP Address
    `\x1b[32m[${new Date().toLocaleString("en-US", {
      timeZone: "America/Boise",
    })}]`, // [Green]  Timestamp
    `\x1b[35m${req.method}`, // [Purple] Method
    `\x1b[37m${req.url?.split("?").join("\x1b[36m?") || "-"}`, // [White]  Path [Cyan] ?RequestParams
    `\x1b[0m` // [Reset]
  )
  next(req, res)
}
