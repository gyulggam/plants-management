"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RequestLog {
  id: string;
  url: string;
  method: string;
  status: number | null;
  timestamp: number;
  request: {
    url: string;
    method: string;
    headers: unknown;
    body?: unknown;
  };
  response: {
    status?: number;
    headers?: unknown;
    body?: unknown;
    error?: string;
  } | null;
  error?: Error;
}

export function DevPanel() {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoOpenEnabled, setIsAutoOpenEnabled] = useState(false);
  const pendingRequestsRef = useRef<
    { add?: RequestLog; update?: { id: string; data: Partial<RequestLog> } }[]
  >([]);

  // 요청 로그 추가 (실제 업데이트는 useEffect에서 처리)
  const addRequest = useCallback((request: RequestLog) => {
    pendingRequestsRef.current.push({ add: request });
  }, []);

  // 요청 로그 업데이트 (실제 업데이트는 useEffect에서 처리)
  const updateRequest = useCallback((id: string, data: Partial<RequestLog>) => {
    pendingRequestsRef.current.push({ update: { id, data } });
  }, []);

  // 대기 중인 요청 처리
  useEffect(() => {
    if (pendingRequestsRef.current.length > 0) {
      const pendingRequests = [...pendingRequestsRef.current];
      pendingRequestsRef.current = [];

      setRequests((prevRequests) => {
        let updatedRequests = [...prevRequests];

        pendingRequests.forEach((pending) => {
          if (pending.add) {
            updatedRequests = [pending.add, ...updatedRequests].slice(0, 50);
          } else if (pending.update) {
            updatedRequests = updatedRequests.map((req) =>
              req.id === pending.update?.id
                ? { ...req, ...pending.update.data }
                : req
            );
          }
        });

        return updatedRequests;
      });
    }
  });

  // Fetch API 가로채기
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input, init?) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      const method =
        init?.method ||
        (typeof input === "string" || input instanceof URL
          ? "GET"
          : input.method) ||
        "GET";

      const requestId = Math.random().toString(36).substring(2, 9);
      const timestamp = Date.now();

      // 요청 로깅
      const requestData: RequestLog = {
        id: requestId,
        url,
        method,
        status: null,
        timestamp,
        request: {
          url,
          method,
          headers: init?.headers || {},
          body: init?.body,
        },
        response: null,
      };

      addRequest(requestData);

      try {
        const response = await originalFetch(input, init);

        // 응답 복제 (응답 본문은 한 번만 읽을 수 있으므로)
        const clonedResponse = response.clone();
        let responseBody;

        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          responseBody = await clonedResponse.json();
        } catch {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            responseBody = await clonedResponse.text();
          } catch {
            responseBody = "응답 본문을 읽을 수 없습니다.";
          }
        }

        // 응답 로깅
        updateRequest(requestId, {
          status: response.status,
          response: {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
          },
        });

        return response;
      } catch (error) {
        // 오류 로깅
        updateRequest(requestId, {
          status: 0,
          error: error as Error,
          response: {
            status: 0,
            error: (error as Error).message,
          },
        });

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [addRequest, updateRequest]);

  // 요청 모두 지우기
  const clearRequests = () => {
    setRequests([]);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
          DEV 패널 {requests.length > 0 && `(${requests.length})`}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-4xl h-[80vh] flex flex-col max-h-[80vh] overflow-hidden"
          hideCloseButton
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>API 요청 로그</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearRequests}
                  className="h-8"
                >
                  로그 지우기
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Switch
                    id="auto-open"
                    checked={isAutoOpenEnabled}
                    onCheckedChange={setIsAutoOpenEnabled}
                  />
                  <Label htmlFor="auto-open" className="text-sm">
                    자동 열기
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col gap-4 overflow-y-auto h-full max-h-[calc(80vh-180px)] p-2">
              {requests.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  아직 요청 내역이 없습니다.
                </div>
              ) : (
                requests.map((req) => (
                  <Card
                    key={req.id}
                    className={
                      req.status === 200 ? "border-green-200" : "border-red-200"
                    }
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              req.method === "GET"
                                ? "bg-blue-100 text-blue-800"
                                : req.method === "POST"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {req.method}
                          </span>
                          <span className="truncate max-w-[300px]">
                            {req.url}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              req.status === 200
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {req.status || "오류"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(req.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xs">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-7"
                            >
                              상세 정보 보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="max-w-3xl max-h-[80vh]"
                            hideCloseButton
                          >
                            <DialogHeader>
                              <DialogTitle>요청 상세 정보</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium mb-1">
                                    요청
                                  </h3>
                                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(req.request, null, 2)}
                                  </pre>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium mb-1">
                                    응답
                                  </h3>
                                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(req.response, null, 2)}
                                  </pre>
                                </div>
                                {req.error && (
                                  <div>
                                    <h3 className="text-sm font-medium mb-1 text-red-500">
                                      오류
                                    </h3>
                                    <pre className="bg-red-50 p-2 rounded text-xs overflow-auto text-red-700">
                                      {req.error.message}
                                      {req.error.stack &&
                                        `\n\n${req.error.stack}`}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
