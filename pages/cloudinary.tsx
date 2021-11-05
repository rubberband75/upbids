import Layout from "../components/layout"
import { CloudinaryContext, Image, Transformation } from "cloudinary-react"

export default function Page() {
  return (
    <Layout>
      <CloudinaryContext cloudName="upbids">
        <h1>Cloudinary Image</h1>
        <Image publicId="olympic_flag.jpg" width="200" />
        <hr />
        <Image publicId="olympic_flag.jpg">
          <Transformation radius="150" />
          <Transformation crop="scale" width="200" />
        </Image>
        <hr />
        <img src="https://res.cloudinary.com/upbids/image/upload/w_200,c_scale/olympic_flag.jpg" />
      </CloudinaryContext>
    </Layout>
  )
}
