# 발전소 관리 시스템

발전소 관리 시스템은 발전소의 실시간 모니터링 및 관리를 위한 웹 애플리케이션입니다.

## 기술 스택

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- NextAuth.js (Google 소셜 로그인)
- React Hook Form
- Redux Toolkit
- Leaflet (지도 기능)

## 설치 및 실행 방법

1. 저장소 클론:

```bash
git clone https://github.com/yourusername/plants-management.git
cd plants-management
```

2. 의존성 설치:

```bash
npm install
```

3. 환경 변수 설정:
   `.env.example` 파일을 `.env.local`로 복사하고 필요한 값을 입력하세요:

```bash
cp .env.example .env.local
```

4. 개발 서버 실행:

```bash
npm run dev
```

5. 브라우저에서 `http://localhost:3000` 접속

## 주요 기능

1. 대시보드: 발전소 현황 및 주요 지표 확인
2. 발전소 관리:
   - 리스트 뷰: 모든 발전소 목록 및 상세 정보
   - 지도 뷰: 지도 기반 발전소 위치 및 상태 확인
3. 구글 소셜 로그인

## 화면 구성

- 로그인 화면
- 대시보드
- 발전소 리스트
- 발전소 지도

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
