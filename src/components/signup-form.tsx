"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/providers/context/auth-context"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth"
import { auth } from "@/lib/auth"
import { useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp, loading } = useAuth()
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    setFormError(null)
    setFormSuccess(null)

    const { error, needsEmailConfirmation, isExistingUser } = await signUp(data.email, data.password, {
      full_name: data.fullName,
    })

    if (error) {
      if (isExistingUser) {
        setFormError("이미 가입된 이메일입니다. 로그인해주세요.")
        toast.error("이미 가입된 이메일입니다. 로그인해주세요.", {
          action: {
            label: "로그인하기",
            onClick: () => window.location.href = "/login"
          }
        })
      } else {
        setFormError(error.message || "회원가입에 실패했습니다.")
        toast.error(error.message || "회원가입에 실패했습니다.")
      }
    } else if (needsEmailConfirmation) {
      setFormSuccess("회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.")
      toast.success("회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.", {
        duration: 5000
      })
    } else {
      setFormSuccess("회원가입이 완료되었습니다!")
      toast.success("회원가입이 완료되었습니다!")
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    try {
      setFormError(null)
      setFormSuccess(null)
      setSocialLoading(provider)
      const { error } = await auth.signInWithSocial(provider)
      if (error) {
        console.error('Social login error:', error)
        const errorMessage = error.message || "소셜 로그인에 실패했습니다."
        setFormError(errorMessage)
        toast.error(errorMessage)
        setSocialLoading(null)
      }
      // 성공 시 리다이렉트되므로 setSocialLoading(null)은 호출되지 않음
    } catch (err) {
      console.error('Social login exception:', err)
      const errorMessage = "소셜 로그인 중 오류가 발생했습니다."
      setFormError(errorMessage)
      toast.error(errorMessage)
      setSocialLoading(null)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">계정을 만들어보세요</h1>
                <p className="text-muted-foreground text-balance">
                  새 계정을 생성하여 시작하세요
                </p>
              </div>
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              {formSuccess && (
                <Alert className="border-green-500 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{formSuccess}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3">
                <Label htmlFor="fullName">이름 (선택사항)</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="홍길동"
                  {...register("fullName")}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="영문, 숫자 포함 8자 이상"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  {...register("confirmPassword")}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
                {loading || isSubmitting ? "회원가입 중..." : "회원가입"}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  또는 소셜 계정으로 계속하기
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === 'kakao' ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                      <path
                        d="M12 3C6.477 3 2 6.463 2 10.691c0 2.633 1.73 4.962 4.35 6.314-.143.528-.548 1.97-.627 2.28-.098.39.143.385.302.28.124-.082 1.98-1.349 2.785-1.898.387.057.785.087 1.19.087 5.523 0 10-3.463 10-7.063C20 6.463 15.523 3 12 3z"
                        fill="#3C1E1E"
                      />
                    </svg>
                  )}
                  <span className="sr-only">카카오로 가입</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === 'google' ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  <span className="sr-only">Google로 가입</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                이미 계정이 있으신가요?{" "}
                <a href="/login" className="underline underline-offset-4">
                  로그인
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/dlemon.png"
              alt="D-Lemon"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        계속 진행하시면 <a href="#">서비스 약관</a>과{" "}
        <a href="#">개인정보 처리방침</a>에 동의하는 것으로 간주됩니다.
      </div>
    </div>
  )
}
