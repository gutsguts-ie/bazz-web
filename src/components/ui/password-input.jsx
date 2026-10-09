"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "./input"
import { cn } from "../../lib/utils"

/**
 * Password field with a show/hide toggle. Accepts all Input props except
 * `type` (managed internally). Pass className through to the underlying input.
 */
const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
  const { t } = useTranslation()
  const [show, setShow] = React.useState(false)

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
        aria-label={show ? t("common.hidePassword") : t("common.showPassword")}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-brand-navy-700"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
