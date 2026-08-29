import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, QrCode } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/attendance/")({
  component: AttendancePlaceholderPage,
});

function AttendancePlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Điểm Danh & Check-in
          </h1>
          <p className="text-muted-foreground text-sm">
            Quét mã QR sinh viên, cập nhật danh sách và đối soát dữ liệu.
          </p>
        </div>
        <Button
          onClick={() => toast.info("Tính năng quét mã QR đang được chuẩn bị")}
        >
          <QrCode className="mr-2 h-4 w-4" />
          <span>Quét Mã QR</span>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CheckSquare className="h-6 w-6" />
          </div>
          <CardTitle>Phân Hệ Điểm Danh Đang Được Chuẩn Bị</CardTitle>
          <CardDescription>
            Cơ chế check-in sinh viên và đối soát danh sách điểm danh.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Badge variant="secondary">Feature Module Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
