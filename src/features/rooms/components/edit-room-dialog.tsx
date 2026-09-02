import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { AlertCircle, Edit3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateRoomMutation } from "@/features/rooms/hooks/useRoomQueries";
import type { RoomDetailView, RoomSummaryView } from "@/features/rooms/types";
import {
  type EditRoomFormValues,
  editRoomSchema,
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

interface EditRoomDialogProps {
  room: RoomSummaryView | RoomDetailView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoomDialog({
  room,
  open,
  onOpenChange,
}: EditRoomDialogProps) {
  const updateMutation = useUpdateRoomMutation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditRoomFormValues>({
    resolver: zodResolver(editRoomSchema),
    defaultValues: {
      building: "",
      floor: 1,
      code: 101,
      name: "",
      capacity: 30,
    },
  });

  useEffect(() => {
    if (room) {
      reset({
        building: room.building,
        floor: room.floor,
        code: Number(room.code),
        name: room.name,
        capacity: room.capacity,
      });
      setGeneralError(null);
    }
  }, [room, reset]);

  const onSubmit = async (values: EditRoomFormValues) => {
    if (!room) return;
    setGeneralError(null);

    try {
      await updateMutation.mutateAsync({
        id: room.id,
        original: {
          building: room.building,
          floor: room.floor,
          code: room.code,
          name: room.name,
          capacity: room.capacity,
        },
        newValues: {
          building: values.building.trim(),
          floor: values.floor,
          code: values.code,
          name: values.name.trim(),
          capacity: values.capacity,
        },
      });

      toast.success("Đã cập nhật thông tin phòng học thành công!");
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const problem = err.response.data;
        if (Array.isArray(problem.errors)) {
          for (const fe of problem.errors) {
            if (fe.field) {
              setError(fe.field as keyof EditRoomFormValues, {
                message: fe.message || problem.detail,
              });
            }
          }
        }
        const msg =
          problem.detail ||
          problem.title ||
          "Không thể cập nhật thông tin do xung đột dữ liệu.";
        setGeneralError(msg);
        toast.error(msg);
      } else {
        const msg = "Đã xảy ra lỗi không xác định khi cập nhật phòng học.";
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Chỉnh Sửa Thông Tin Phòng Học
              </DialogTitle>
              <DialogDescription>
                Hệ thống sẽ cập nhật tuần tự các thông số vật lý thay đổi.
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
          <div className="grid grid-cols-2 gap-3">
            {/* Tòa nhà */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-building">Tòa Nhà *</Label>
              <Input
                id="edit-building"
                {...register("building")}
                disabled={isSubmitting}
              />
              {errors.building && (
                <p className="text-[11px] text-destructive">
                  {errors.building.message}
                </p>
              )}
            </div>

            {/* Tầng */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-floor">Tầng *</Label>
              <Input
                id="edit-floor"
                type="number"
                {...register("floor", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.floor && (
                <p className="text-[11px] text-destructive">
                  {errors.floor.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Mã phòng */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-code">Mã Số Phòng (Tọa Độ) *</Label>
              <Input
                id="edit-code"
                type="number"
                {...register("code", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.code && (
                <p className="text-[11px] text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Sức chứa */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-capacity">Sức Chứa Tối Đa *</Label>
              <Input
                id="edit-capacity"
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.capacity && (
                <p className="text-[11px] text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>
          </div>

          {/* Tên phòng */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Tên Hiển Thị Của Phòng *</Label>
            <Input
              id="edit-name"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">
                {errors.name.message}
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
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
