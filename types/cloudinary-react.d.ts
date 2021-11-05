interface CloudinaryContextProps {
  cloudName: string
}

interface ImageProps extends JSX.IntrinsicElements.img {
  publicId: string
  crop: string
}

interface VideoProps extends JSX.IntrinsicElements.video {
  publicId: string
}

interface TransformationProps {
  quality?: string
  crop?: string
  width?: string
  radius?: string
}

declare module "cloudinary-react" {
  class CloudinaryComponent {
    constructor(props, context) {}

    getChildContext() {}

    render() {}

    getChildTransformations(children) {}

    getTransformations() {}

    normalizeOptions(...options) {}

    getURL(extendedProps) {}

    typesFrom(configParams) {}
  }

  export const CloudinaryContext: React.FC<CloudinaryContextProps>

  export const Image: React.FC<PropsWithChildren<ImageProps>>

  export const Video: React.FC<PropsWithChildren<VideoProps>>

  export const Transformation: React.FC<TransformationProps>
}
