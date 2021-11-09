import type { ApiRequest, ApiResponse } from "../types/api"

const runMiddleware = (req: ApiRequest, res: ApiResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default runMiddleware
