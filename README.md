# Next.js Basic Format

Next.js 15 + shadcn/ui + Tailwind CSS 4를 사용한 모던 웹 애플리케이션 템플릿입니다.

## 🚀 기술 스택

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Hooks
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/) + [Tabler Icons](https://tabler.io/icons)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Font**: Paperlogy (Custom Font)

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트
│   │   ├── login/         # 로그인 페이지
│   │   ├── signup/        # 회원가입 페이지
│   │   └── forgot/        # 비밀번호 찾기
│   ├── main/              # 메인 대시보드
│   ├── sample/            # 샘플 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   └── globals.css        # 전역 스타일
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── custom/            # 커스텀 컴포넌트
│   └── *.tsx              # 기타 컴포넌트
├── hooks/                 # 커스텀 훅
├── lib/                   # 유틸리티 함수
├── types/                 # TypeScript 타입 정의
└── utils/                 # 헬퍼 함수
```

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd nextjs_basic_format
```

### 2. 의존성 설치
```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 3. 환경 변수 설정
```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local

# .env.local 파일을 열어 환경 변수 설정
# 예시:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# DATABASE_URL=your-database-url
# NEXTAUTH_SECRET=your-secret-key
```

### 4. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 📝 환경 변수 설정 가이드

프로젝트에서 사용하는 주요 환경 변수들:

| 변수명 | 설명 | 필수 여부 | 예시 |
|--------|------|----------|------|
| `NEXT_PUBLIC_API_URL` | API 엔드포인트 URL | ✅ | `http://localhost:3000/api` |
| `DATABASE_URL` | 데이터베이스 연결 URL | ✅ | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth 비밀 키 | 인증 사용시 필수 | 랜덤 문자열 |
| `NEXTAUTH_URL` | NextAuth 콜백 URL | 인증 사용시 필수 | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL | ❌ | `http://localhost:3000` |

### 환경 변수 생성 방법:
1. `.env.example` 파일을 복사하여 `.env.local` 파일 생성
2. 각 변수에 실제 값 입력
3. `.env.local`은 Git에 커밋되지 않으므로 안전하게 관리 가능

## 🎨 UI 컴포넌트 추가

shadcn/ui 컴포넌트 추가:
```bash
# 단일 컴포넌트 추가
npx shadcn@latest add button

# 여러 컴포넌트 추가
npx shadcn@latest add dialog card select

# 모든 컴포넌트 추가
npx shadcn@latest add --all
```

## 📦 스크립트 명령어

```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint
```

## 🔧 설정 파일

- `next.config.ts` - Next.js 설정
- `tailwind.config.js` - Tailwind CSS 설정
- `components.json` - shadcn/ui 설정
- `tsconfig.json` - TypeScript 설정
- `.prettierrc` - Prettier 코드 포맷터 설정
- `.vscode/settings.json` - VS Code 에디터 설정

## 📄 페이지 라우트

- `/` - 홈 페이지
- `/login` - 로그인 페이지
- `/signup` - 회원가입 페이지
- `/forgot` - 비밀번호 찾기 페이지
- `/main` - 메인 대시보드
- `/sample` - 샘플 페이지

## 🎯 주요 기능

1. **인증 시스템**
   - 로그인/로그아웃
   - 회원가입
   - 비밀번호 찾기

2. **다크 모드**
   - 시스템 설정 연동
   - 수동 토글 지원

3. **반응형 디자인**
   - 모바일, 태블릿, 데스크톱 지원
   - 사이드바 네비게이션

4. **폼 처리**
   - React Hook Form 통합
   - Zod 스키마 검증
   - 에러 처리

## 🚀 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 도커 배포
```bash
# 도커 이미지 빌드
docker build -t nextjs-basic-format .

# 컨테이너 실행
docker run -p 3000:3000 nextjs-basic-format
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.
