import { Chip, Skeleton } from "@mui/material"

export default function ChipSkeleton({ icon }: { icon?: boolean }) {
  return (
    <Chip
      icon={
        icon ? (
          <Skeleton
            animation="wave"
            variant="circular"
            width={24}
            height={24}
          />
        ) : (
          <></>
        )
      }
      label={<Skeleton animation="wave" width="60px" />}
      variant="outlined"
    />
  )
}
