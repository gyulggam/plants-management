"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            발전소 관리 시스템
          </h1>
          <p className="text-sm text-muted-foreground">계정으로 로그인하세요</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>
              구글 계정으로 로그인하여 발전소 관리 시스템을 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2"
            >
              <Image
                src="/google-icon.svg"
                alt="Google"
                width={18}
                height={18}
                className="h-4 w-4"
                unoptimized
              />
              Google 계정으로 로그인
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center w-full text-muted-foreground">
              로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
