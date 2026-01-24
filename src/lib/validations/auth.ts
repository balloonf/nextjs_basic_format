import { z } from 'zod'

// 이메일 검증 스키마
const emailSchema = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .email('올바른 이메일 형식이 아닙니다')

// 비밀번호 검증 스키마 (기본)
const passwordSchema = z
  .string()
  .min(1, '비밀번호를 입력해주세요')
  .min(6, '비밀번호는 최소 6자 이상이어야 합니다')

// 비밀번호 검증 스키마 (강화 - 회원가입용)
const strongPasswordSchema = z
  .string()
  .min(1, '비밀번호를 입력해주세요')
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 포함해야 합니다')

// 로그인 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// 회원가입 스키마
export const signupSchema = z
  .object({
    fullName: z.string().optional(),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })

// 비밀번호 찾기 스키마
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// 비밀번호 재설정 스키마
export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })

// 타입 추출
export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
