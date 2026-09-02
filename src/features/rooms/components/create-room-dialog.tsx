import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { AlertCircle, DoorOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateRoomMutation } from "@/features/rooms/hooks/useRoomQueries";
import {
  type CreateRoomFormValues,
  createRoomSchema,
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

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomDialog({
  open,
  onOpenChange,
}: CreateRoomDialogProps) {
  const createMutation = useCreateRoomMutation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      building: "",
      floor: 1,
      code: 101,
      name: "",
      capacity: 30,
    },
  });

  const onSubmit = async (values: CreateRoomFormValues) => {
    setGeneralError(null);
    try {
      // Crucial: Generate Idempotency-Key exactly once inside onSubmit handler
      const idempotencyKey = crypto.randomUUID();

      await createMutation.mutateAsync({
        payload: {
          building: values.building.trim(),
          floor: values.floor,
          code: values.code,
          name: values.name.trim(),
          capacity: values.capacity,
        },
        idempotencyKey,
      });

      toast.success(`Đã khởi tạo phòng học "${values.name}" thành công!`);
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const problem = err.response.data;

        // If backend returns field-level validation errors
        if (Array.isArray(problem.errors)) {
          for (const fe of problem.errors) {
            if (fe.field) {
              setError(fe.field as keyof CreateRoomFormValues, {
                message: fe.message || problem.detail,
              });
            }
          }
        }

        const msg =
          problem.detail ||
          problem.title ||
          "Không thể tạo phòng học do vi phạm ràng buộc dữ liệu.";
        setGeneralError(msg);
        toast.error(msg);
      } else {
        const msg = "Đã xảy ra lỗi không xác định khi tạo phòng học.";
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
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Tạo Phòng Học Mới
              </DialogTitle>
              <DialogDescription>
                Khai báo thông số vật lý và chỉ số định vị mặt bằng.
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
              <Label htmlFor="building">Tòa Nhà *</Label>
              <Input
                id="building"
                placeholder="Ví dụ: Tòa A2"
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
              <Label htmlFor="floor">Tầng *</Label>
              <Input
                id="floor"
                type="number"
                placeholder="1"
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
            {/* Mã phòng (Tọa độ) */}
            <div className="space-y-1.5">
              <Label htmlFor="code">Mã Số Phòng (Tọa Độ) *</Label>
              <Input
                id="code"
                type="number"
                placeholder="401"
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
              <Label htmlFor="capacity">Sức Chứa Tối Đa *</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="45"
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
            <Label htmlFor="name">Tên Hiển Thị Của Phòng *</Label>
            <Input
              id="name"
              placeholder="Ví dụ: Phòng Lab Máy Tính A2-401"
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
                  <span>Đang Khởi Tạo...</span>
                </>
              ) : (
                <span>Tạo Phòng Học</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
