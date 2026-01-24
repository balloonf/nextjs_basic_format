"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/context/auth-context"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth"
import { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"

export function ForgotForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { resetPassword } = useAuth()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const { error } = await resetPassword(data.email)

    if (error) {
      toast.error(error.message || "비밀번호 재설정 이메일 발송에 실패했습니다.")
    } else {
      setIsSubmitted(true)
      toast.success("비밀번호 재설정 이메일을 발송했습니다.")
    }
  }

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>이메일을 확인해주세요</CardTitle>
            <CardDescription>
              <strong>{getValues("email")}</strong>로 비밀번호 재설정 링크를 발송했습니다.
              이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              이메일이 도착하지 않았나요? 스팸 폴더를 확인하거나 다시 시도해주세요.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                다시 시도
              </Button>
              <a href="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인으로 돌아가기
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>비밀번호를 잊으셨나요?</CardTitle>
          <CardDescription>
            가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "발송 중..." : "재설정 링크 보내기"}
            </Button>
            <div className="text-center">
              <a
                href="/login"
                className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                로그인으로 돌아가기
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
