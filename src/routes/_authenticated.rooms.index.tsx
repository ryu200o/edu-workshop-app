import { createFileRoute } from "@tanstack/react-router";
import { DoorOpen, Plus } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/rooms/")({
  component: RoomsPlaceholderPage,
});

function RoomsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Quản Lý Phòng Học
          </h1>
          <p className="text-muted-foreground text-sm">
            Điều phối sức chứa, cơ sở vật chất và xử lý xung đột phòng học.
          </p>
        </div>
        <Button
          onClick={() =>
            toast.info("Tính năng thêm phòng học đang được phát triển")
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Thêm Phòng Học</span>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <DoorOpen className="h-6 w-6" />
          </div>
          <CardTitle>Phân Hệ Phòng Học Đang Được Chuẩn Bị</CardTitle>
          <CardDescription>
            Module quản lý tài nguyên phòng học sẽ được tích hợp với Staging
            Backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Badge variant="secondary">Feature Module Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
