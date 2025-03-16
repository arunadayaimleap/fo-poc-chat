import { redirect } from "next/navigation"

export default function LoginPage() {
  // Simply redirect to dashboard without auth check
  redirect("/dashboard")
  
  // This code will never run due to the redirect above
  return null
}
