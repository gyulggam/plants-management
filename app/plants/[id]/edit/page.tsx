"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { use } from "react";
import { PowerPlant } from "@/types/power-plant";

const formSchema = z.object({
  name: z.string().min(1, "발전소 이름을 입력해주세요"),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PlantEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [plant, setPlant] = useState<PowerPlant | null>(null);
  const resolvedParams = use(params);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      latitude: 0,
      longitude: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    async function fetchPlantData() {
      try {
        const response = await fetch(`/api/plants/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("발전소 정보를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        if (data.status === "success") {
          setPlant(data.data);
          form.reset({
            name: data.data.infra.name,
            description: data.data.infra.description || "",
            latitude: data.data.infra.latitude,
            longitude: data.data.infra.longitude,
            isActive: data.data.status === "정상",
          });
        }
      } catch (error) {
        console.error("Error fetching plant:", error);
        toast.error("발전소 정보를 불러오는데 실패했습니다.");
      }
    }

    fetchPlantData();
  }, [resolvedParams.id, form]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/plants/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: data.isActive ? "정상" : "비활성",
          infra: {
            name: data.name,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("발전소 수정에 실패했습니다");
      }

      toast.success("발전소가 성공적으로 수정되었습니다");
      router.push(`/plants/${resolvedParams.id}`);
    } catch (error) {
      console.error("Error updating plant:", error);
      toast.error("발전소 수정 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  if (!plant) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>발전소 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>발전소 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">발전소 이름</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="발전소 이름을 입력하세요"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="발전소에 대한 설명을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">위도</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...form.register("latitude", { valueAsNumber: true })}
                />
                {form.formState.errors.latitude && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.latitude.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">경도</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...form.register("longitude", { valueAsNumber: true })}
                />
                {form.formState.errors.longitude && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.longitude.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch("isActive")}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked)
                }
              />
              <Label htmlFor="isActive">활성화</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                수정
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
