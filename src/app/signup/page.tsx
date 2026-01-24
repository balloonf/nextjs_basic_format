import { SignupForm } from "@/components/signup-form"
import { AuthGuard } from "@/components/auth-guard"

export default function SignupPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/main">
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <SignupForm />
        </div>
      </div>
    </AuthGuard>
  )
}
