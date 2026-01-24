import { LoginForm } from "@/components/login-form"
import { AuthGuard } from "@/components/auth-guard"

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/main">
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
      </div>
    </AuthGuard>
  )
}
