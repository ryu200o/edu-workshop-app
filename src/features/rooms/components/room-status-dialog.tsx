import { AlertCircle, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRoomStatusMutation } from "@/features/rooms/hooks/useRoomQueries";
import type {
  RoomDetailView,
  RoomStatus,
  RoomSummaryView,
} from "@/features/rooms/types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface RoomStatusDialogProps {
  room: RoomSummaryView | RoomDetailView | null;
  targetStatus: RoomStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomStatusDialog({
  room,
  targetStatus,
  open,
  onOpenChange,
}: RoomStatusDialogProps) {
  const statusMutation = useRoomStatusMutation();

  if (!room || !targetStatus) return null;

  const handleConfirm = async () => {
    try {
      await statusMutation.mutateAsync({
        id: room.id,
        targetStatus,
      });

      const label =
        targetStatus === "ACTIVE"
          ? "sẵn sàng hoạt động"
          : targetStatus === "MAINTENANCE"
            ? "bảo trì"
            : "vô hiệu hóa";

      toast.success(`Đã chuyển trạng thái phòng "${room.name}" sang ${label}!`);
      onOpenChange(false);
    } catch {
      toast.error("Không thể thay đổi trạng thái phòng học. Vui lòng thử lại.");
    }
  };

  const getTitleAndDescription = () => {
    if (targetStatus === "MAINTENANCE") {
      return {
        title: "Đưa Phòng Học Vào Diện Bảo Trì?",
        description: `Phòng "${room.name}" sẽ tạm ngưng nhận lịch workshop mới trong thời gian bảo trì.`,
        variant: "default" as const,
        icon: AlertTriangle,
        btnText: "Xác Nhận Bảo Trì",
      };
    }
    if (targetStatus === "ACTIVE") {
      return {
        title: "Kích Hoạt Lại Phòng Học?",
        description: `Phòng "${room.name}" sẽ được chuyển sang trạng thái sẵn sàng đón tiếp workshop.`,
        variant: "default" as const,
        icon: CheckCircle,
        btnText: "Kích Hoạt Lại",
      };
    }
    return {
      title: "Vô Hiệu Hóa Phòng Học?",
      description: `Phòng "${room.name}" sẽ bị vô hiệu hóa hoàn toàn và không thể tái kích hoạt lại. Hãy cân nhắc kỹ.`,
      variant: "destructive" as const,
      icon: AlertCircle,
      btnText: "Vô Hiệu Hóa",
    };
  };

  const info = getTitleAndDescription();
  const Icon = info.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                info.variant === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {info.title}
              </DialogTitle>
              <DialogDescription>{info.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={statusMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant={info.variant}
            onClick={handleConfirm}
            disabled={statusMutation.isPending}
          >
            {statusMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Đang Xử Lý...</span>
              </>
            ) : (
              <span>{info.btnText}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
