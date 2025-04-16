"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PowerPlant } from "@/types/power-plant";
import { createPlant } from "@/lib/api";

// 발전소 유형 목록
const plantTypes = ["태양광", "풍력", "수력", "바이오매스", "지열"];

// 발전소 상태 목록
const plantStatus = ["정상", "점검중", "가동중", "수리중", "고장", "중지"];

// 폼 검증 스키마
const formSchema = z.object({
  // 기본 정보
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  type: z.string().min(1, "발전소 유형을 선택해 주세요"),
  status: z.string().min(1, "발전소 상태를 선택해 주세요"),
  address: z.string().min(5, "주소는 5자 이상이어야 합니다"),

  // 위치 정보
  latitude: z.coerce.number().min(33, "유효한 위도를 입력해 주세요").max(38),
  longitude: z.coerce.number().min(125, "유효한 경도를 입력해 주세요").max(130),
  altitude: z.coerce.number().optional(),

  // 용량 정보
  capacity: z.coerce.number().min(1, "설비 용량을 입력해 주세요"),
  installDate: z.string().optional(),

  // 계약 정보
  contractType: z.string().optional(),
  contractDate: z.string().optional(),
  rtuId: z.string().optional(),
});

export default function NewPlantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 설정
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "태양광",
      status: "정상",
      address: "",
      latitude: 36.5,
      longitude: 127.5,
      altitude: 0,
      capacity: 1000,
      installDate: new Date().toISOString().split("T")[0],
      contractType: "",
      contractDate: "",
      rtuId: "",
    },
  });

  // 폼 제출 처리
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setError(null);

    try {
      // 발전소 데이터 구성
      const newPlant: Partial<PowerPlant> = {
        modified_at: new Date().toISOString(),
        status: values.status,
        infra: {
          id: 0, // 임시 ID, 서버에서 할당됨
          carrier_fk: 1, // 임시 값, 서버에서 할당됨
          name: values.name,
          type: values.type,
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          altitude: values.altitude || null,
          capacity: values.capacity,
          install_date: values.installDate || null,
          kpx_identifier: {
            id: 0, // 임시 ID, 서버에서 할당됨
            kpx_cbp_gen_id: values.rtuId || "",
          },
          inverter: [
            {
              id: 0, // 임시 ID, 서버에서 할당됨
              capacity: values.capacity,
              tilt: 0,
              azimuth: 180,
              install_type: null,
              module_type: null,
            },
          ],
          ess: [],
        },
        monitoring: {
          id: 0, // 임시 ID, 서버에서 할당됨
          company: 1,
          rtu_id: values.rtuId || "",
          resource: 0,
        },
        contract: {
          id: 0, // 임시 ID, 서버에서 할당됨
          modified_at: new Date().toISOString(),
          resource: 0,
          contract_type: values.contractType || "일반",
          contract_date: values.contractDate || "",
          weight: 1.0,
          fixed_contract_type: null,
          fixed_contract_price: null,
          fixed_contract_agreement_date: null,
        },
        substation: 1,
        dl: 1,
        guaranteed_capacity: 0,
      };

      // API 호출
      await createPlant(newPlant);

      // 성공 시 목록 페이지로 이동
      router.push("/plants");
      router.refresh();
    } catch (err) {
      setError("발전소 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>새 발전소 등록</CardTitle>
          <CardDescription>
            새로운 발전소 정보를 입력해 주세요. 필수 항목을 모두 입력해야 등록이
            가능합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">기본 정보</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>발전소 이름</FormLabel>
                      <FormControl>
                        <Input placeholder="발전소 이름" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>발전소 유형</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plantTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>운영 상태</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="상태 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plantStatus.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="발전소 주소"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">위치 정보</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>위도</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.000001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>경도</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.000001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="altitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>고도 (선택사항)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="해발 고도(m)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-muted rounded-md mt-4">
                  <p className="text-sm text-muted-foreground">
                    정확한 위치 정보는 지도에서 발전소 위치 표시에 사용됩니다.
                    한국 내 좌표를 입력해 주세요. (위도: 33~38, 경도: 125~130)
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">용량 및 계약</h3>

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설비 용량 (kW)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="installDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설치 일자 (선택사항)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>계약 유형 (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="계약 유형" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>계약 기간 (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 1차 (24-06)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rtuId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RTU ID (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="RTU ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <div className="bg-destructive/20 text-destructive p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "등록 중..." : "발전소 등록"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// 이 페이지는 동적으로 렌더링됩니다 (SSR)
export const dynamic = "force-dynamic";
