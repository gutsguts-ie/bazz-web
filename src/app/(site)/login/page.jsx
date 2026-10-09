import { Suspense } from "react"
import FindApplication from "@/views/FindApplication"

export default function Page() {
  return (
    <Suspense>
      <FindApplication />
    </Suspense>
  )
}
