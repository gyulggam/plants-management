import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 발전소</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24개</div>
          <p className="text-xs text-muted-foreground">
            전국에 위치한 발전소 총 개수
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">현재 발전량</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">256.4 MW</div>
          <p className="text-xs text-muted-foreground">전체 발전소 총 발전량</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">발전 효율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">85.2%</div>
          <p className="text-xs text-muted-foreground">
            이번 달 평균 발전 효율
          </p>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>발전소 현황</CardTitle>
          <CardDescription>
            전체 발전소의 가동 상태 및 현황을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full rounded-md bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">
              발전소 현황 차트가 표시됩니다
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            최근 업데이트: {new Date().toLocaleString("ko-KR")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
