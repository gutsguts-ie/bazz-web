import PanelLayout from "@/components/PanelLayout"
import RequireAuth from "@/auth/RequireAuth"

// Signed-in applicant panel (minimal chrome, gated).
export default function ApplicantPanelLayout({ children }) {
  return (
    <RequireAuth>
      <PanelLayout>{children}</PanelLayout>
    </RequireAuth>
  )
}
