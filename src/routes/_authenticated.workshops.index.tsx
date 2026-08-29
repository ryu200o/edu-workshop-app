import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export const Route = createFileRoute("/_authenticated/workshops/")({
  component: WorkshopsPlaceholderPage,
});

function WorkshopsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Quản Lý Workshop
          </h1>
          <p className="text-muted-foreground text-sm">
            Lên lịch, xuất bản và theo dõi trạng thái các phiên hội thảo.
          </p>
        </div>
        <Button
          onClick={() =>
            toast.info(
              "Tính năng tạo Workshop đang được phát triển trong TASK-04",
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Tạo Workshop</span>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <CardTitle>Phân Hệ Workshop Đang Được Chuẩn Bị</CardTitle>
          <CardDescription>
            Module quản lý Workshop sẽ được triển khai chi tiết trong các task
            tiếp theo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Badge variant="secondary">TASK-04 Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
