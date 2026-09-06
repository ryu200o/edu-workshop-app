import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { AlertCircle, CalendarClock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useScheduleMaintenanceMutation } from "@/features/rooms/hooks/useRoomQueries";
import type { RoomDetailView, RoomSummaryView } from "@/features/rooms/types";
import {
  type ScheduleMaintenanceFormValues,
  scheduleMaintenanceSchema,
} from "@/features/rooms/types/schemas";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface ScheduleMaintenanceDialogProps {
  room: RoomSummaryView | RoomDetailView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleMaintenanceDialog({
  room,
  open,
  onOpenChange,
}: ScheduleMaintenanceDialogProps) {
  const scheduleMutation = useScheduleMaintenanceMutation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Helper to get formatted default date strings (e.g. tomorrow)
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowEnd = new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000);

  const formatForInput = (d: Date) => d.toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleMaintenanceFormValues>({
    resolver: zodResolver(scheduleMaintenanceSchema),
    defaultValues: {
      startTime: formatForInput(tomorrow),
      endTime: formatForInput(tomorrowEnd),
      reason: "Bảo trì và kiểm tra định kỳ thiết bị",
    },
  });

  const onSubmit = async (values: ScheduleMaintenanceFormValues) => {
    if (!room) return;
    setGeneralError(null);

    try {
      // Crucial: Generate Idempotency-Key exactly once inside onSubmit handler
      const idempotencyKey = crypto.randomUUID();

      await scheduleMutation.mutateAsync({
        id: room.id,
        payload: {
          startTime: new Date(values.startTime).toISOString(),
          endTime: new Date(values.endTime).toISOString(),
          reason: values.reason?.trim() || undefined,
        },
        idempotencyKey,
        version: room.version,
      });

      toast.success(`Đã lên lịch bảo trì thành công cho phòng "${room.name}"!`);
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const problem = err.response.data;
        const msg =
          problem.detail ||
          problem.title ||
          "Xung đột lịch bảo trì: Khung giờ đã chọn bị trùng với lịch bảo trì khác.";

        if (err.response.status === 409) {
          setError("endTime", { message: msg });
        }
        setGeneralError(msg);
        toast.error(msg);
      } else {
        const msg = "Đã xảy ra lỗi khi lên lịch bảo trì phòng.";
        setGeneralError(msg);
        toast.error(msg);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) {
          setGeneralError(null);
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Lên Lịch Bảo Trì Phòng
              </DialogTitle>
              <DialogDescription>
                Phòng: {room?.name} (#{room?.code})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {generalError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="startTime">Thời Gian Bắt Đầu *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register("startTime")}
              disabled={isSubmitting}
            />
            {errors.startTime && (
              <p className="text-[11px] text-destructive">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endTime">Thời Gian Kết Thúc Dự Kiến *</Label>
            <Input
              id="endTime"
              type="datetime-local"
              {...register("endTime")}
              disabled={isSubmitting}
            />
            {errors.endTime && (
              <p className="text-[11px] text-destructive">
                {errors.endTime.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Lý Do / Hạng Mục Bảo Trì</Label>
            <Input
              id="reason"
              placeholder="Ví dụ: Nâng cấp máy chiếu, sửa hệ thống mạng..."
              {...register("reason")}
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="text-[11px] text-destructive">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Đang Lên Lịch...</span>
                </>
              ) : (
                <span>Xác Nhận Lên Lịch</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
