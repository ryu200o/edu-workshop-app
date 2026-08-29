import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/users/")({
  component: UsersPlaceholderPage,
});

function UsersPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Quản Lý Người Dùng
          </h1>
          <p className="text-muted-foreground text-sm">
            Danh sách tài khoản, phân quyền vai trò (Roles) và trạng thái người
            dùng.
          </p>
        </div>
        <Button
          onClick={() =>
            toast.info("Tính năng quản lý người dùng đang được chuẩn bị")
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Thêm Người Dùng</span>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <CardTitle>Phân Hệ Người Dùng Đang Được Chuẩn Bị</CardTitle>
          <CardDescription>
            Quản lý tài khoản, gán quyền ADMIN/PLANNER/TRAINER/STUDENT.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Badge variant="secondary">Feature Module Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
