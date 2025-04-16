"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";

// 클라이언트 컴포넌트이므로 서버 사이드 오류가 발생하지 않습니다
export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();

  // 로그인 되어있으면 대시보드로 리다이렉트
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // URL에서 에러 파라미터 확인 및 처리
  const errorParam = searchParams.get("error");
  const errorMessage = errorParam ? getErrorMessage(errorParam) : null;

  // 구글 로그인 핸들러
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[380px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            발전소 관리 시스템
          </CardTitle>
          <CardDescription className="text-center">
            Google 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="flex flex-col items-center">
            {/* 구글 로그인 버튼 (구글 디자인 가이드라인 준수) */}
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-full h-10 px-4 py-2 
                         border border-gray-300 rounded-md bg-white text-gray-700 
                         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-blue-500 transition-colors shadow-sm"
            >
              <Image
                src="/google-logo.svg"
                alt="Google"
                width={18}
                height={18}
                className="mr-2"
              />
              <span className="text-sm font-medium">Google로 계속하기</span>
            </button>

            <p className="mt-6 text-xs text-center text-gray-500">
              로그인하면 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 에러 메시지 함수
function getErrorMessage(errorType: string): string {
  const errorMessages: Record<string, string> = {
    default: "로그인 중 오류가 발생했습니다.",
    configuration: "OAuth 설정에 문제가 있습니다.",
    accessdenied: "로그인 접근이 거부되었습니다.",
    verification: "이메일 인증에 실패했습니다.",
    oauthcallback: "OAuth 콜백 처리 중 오류가 발생했습니다.",
    oauthsignin: "OAuth 로그인 과정에서 오류가 발생했습니다.",
    sessionrequired: "이 페이지는 로그인이 필요합니다.",
  };

  return errorMessages[errorType] || errorMessages.default;
}
