import { Checkbox } from "@mui/material"
import axios from "axios"
import { useEffect, useState } from "react"
import Bid from "../models/Bid"

export default function ItemPaidToggle({
  bid,
}: {
  bid?: Bid | null | undefined
}) {
  const [tempState, setTempState] = useState(true)

  useEffect(() => {
    setTempState(!!bid?.paid)
  }, [bid])

  const togglePaid = async () => {
    if (bid) {
      setTempState(!bid?.paid)
      try {
        await axios.patch(`/api/bids/${bid?._id}`, { paid: !bid?.paid })
        setTempState(true)
      } catch (error) {
        setTempState(!!bid?.paid)
      }
    }
  }

  return (
    <>
      {bid && (
        <Checkbox
          name={bid?._id}
          checked={!!bid?.paid && tempState}
          onChange={async (e) => {
            await togglePaid()
          }}
        />
      )}
    </>
  )
}
