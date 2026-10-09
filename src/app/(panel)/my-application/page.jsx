import { Suspense } from "react"
import MyApplication from "@/views/MyApplication"

// Merged home: form when no active application, status when there is.
export default function Page() {
  return (
    <Suspense>
      <MyApplication />
    </Suspense>
  )
}
