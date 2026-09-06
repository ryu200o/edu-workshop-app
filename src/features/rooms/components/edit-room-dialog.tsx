import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { AlertCircle, Edit3, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConflictBanner } from "@/features/rooms/components/conflict-banner";
import {
  fetchLatestRoomDetail,
  useUpdateRoomProfileMutation,
} from "@/features/rooms/hooks/useRoomQueries";
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
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateRoomProfileMutation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Track the expected version for the conditional If-Match request header
  const [currentVersion, setCurrentVersion] = useState<number>(0);

  // Conflict state when HTTP 412 is returned
  const [conflictState, setConflictState] = useState<{
    serverData: RoomDetailView;
    baseValues: EditRoomFormValues;
  } | null>(null);

  // Baseline values captured upon modal open / room load
  const baseValuesRef = useRef<EditRoomFormValues>({
    building: "",
    floor: 1,
    code: 101,
    name: "",
    capacity: 30,
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
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
    if (room && open) {
      const initialValues: EditRoomFormValues = {
        building: room.building,
        floor: room.floor,
        code: Number(room.code),
        name: room.name,
        capacity: room.capacity,
      };

      baseValuesRef.current = initialValues;
      reset(initialValues);
      setCurrentVersion(room.version ?? 0);
      setConflictState(null);
      setGeneralError(null);
    }
  }, [room, open, reset]);

  const handleSubmissionError = async (err: unknown) => {
    let status: number | undefined;
    let problem: Record<string, unknown> = {};

    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      typeof (err as { status: unknown }).status === "number"
    ) {
      const apiErr = err as {
        status: number;
        problem?: Record<string, unknown>;
      };
      status = apiErr.status;
      problem = apiErr.problem || {};
    } else if (isAxiosError(err) && err.response) {
      status = err.response.status;
      problem = (err.response.data as Record<string, unknown>) || {};
    }

    if (status !== undefined) {
      // 1. HTTP 412 Precondition Failed: Trigger In-Place Reconciliation
      if (status === 412) {
        if (!room) return;

        // Perform silent refetch directly from server to avoid stale query cache
        try {
          const freshServerData = await fetchLatestRoomDetail(
            queryClient,
            room.id,
          );
          // Tactical caveat #3: update currentVersion to fresh version
          setCurrentVersion(freshServerData.version);
          setConflictState({
            serverData: freshServerData,
            baseValues: baseValuesRef.current,
          });
          toast.warning(
            "Phòng học vừa được cập nhật từ một phiên làm việc khác. Vui lòng xem bảng hòa giải xung đột.",
          );
        } catch {
          toast.error(
            "Không thể tải dữ liệu phiên bản mới từ máy chủ. Vui lòng thử lại.",
          );
        }
        return;
      }

      // 2. HTTP 409 Conflict: Business Uniqueness Violation (Duplicate Name or Code)
      if (status === 409) {
        const code = String(problem.code || "");
        const detail = String(
          problem.detail || problem.title || "Dữ liệu bị trùng lặp.",
        );

        // Tactical caveat #2: Match exact code identifier first
        if (code === "DUPLICATE_ROOM_NAME" || /tên phòng/i.test(detail)) {
          setError("name", {
            message: detail || "Tên phòng học này đã tồn tại trong hệ thống.",
          });
        } else if (code === "DUPLICATE_ROOM_CODE" || /mã phòng/i.test(detail)) {
          setError("code", {
            message: detail || "Mã phòng học đã được sử dụng tại vị trí này.",
          });
        } else if (Array.isArray(problem.errors)) {
          for (const fe of problem.errors) {
            if (fe.field) {
              setError(fe.field as keyof EditRoomFormValues, {
                message: fe.message || detail,
              });
            }
          }
        } else {
          setGeneralError(detail);
        }

        toast.error(detail);
        return;
      }

      // 3. HTTP 428 Precondition Required
      if (status === 428) {
        const msg =
          "Yêu cầu thiếu điều kiện phiên bản (HTTP 428 Precondition Required).";
        setGeneralError(msg);
        toast.error(msg);
        return;
      }

      // 4. Other problem details (400, 500, etc.)
      const fallbackMsg = String(
        problem.detail ||
          problem.title ||
          "Không thể cập nhật thông tin phòng học.",
      );
      setGeneralError(fallbackMsg);
      toast.error(fallbackMsg);
    } else {
      const genericMsg = "Đã xảy ra lỗi không xác định khi cập nhật phòng học.";
      setGeneralError(genericMsg);
      toast.error(genericMsg);
    }
  };

  const onSubmit = async (values: EditRoomFormValues) => {
    if (!room) return;
    setGeneralError(null);

    try {
      await updateProfileMutation.mutateAsync({
        id: room.id,
        payload: {
          building: values.building.trim(),
          floor: values.floor,
          code: values.code,
          name: values.name.trim(),
          capacity: values.capacity,
        },
        version: currentVersion,
      });

      toast.success("Đã cập nhật thông tin phòng học thành công!");
      setConflictState(null);
      onOpenChange(false);
    } catch (err: unknown) {
      handleSubmissionError(err);
    }
  };

  // Reconciliation Action 1: Discard & Sync (Pure Client-side)
  const handleDiscardAndSync = () => {
    if (!conflictState) return;
    const { serverData } = conflictState;

    const syncedValues: EditRoomFormValues = {
      building: serverData.building,
      floor: serverData.floor,
      code: Number(serverData.code),
      name: serverData.name,
      capacity: serverData.capacity,
    };

    baseValuesRef.current = syncedValues;
    reset(syncedValues);
    setCurrentVersion(serverData.version);
    setConflictState(null);
    setGeneralError(null);
    toast.info("Đã đồng bộ biểu mẫu với dữ liệu mới nhất từ máy chủ.");
  };

  // Reconciliation Action 2: Force Overwrite
  const handleForceOverwrite = async () => {
    if (!room || !conflictState) return;
    const { serverData } = conflictState;
    const currentInputs = getValues();

    // Smart merge: keep dirty client values, adopt non-dirty fresh server values
    const mergedPayload = {
      building: dirtyFields.building
        ? currentInputs.building.trim()
        : serverData.building,
      floor: dirtyFields.floor ? currentInputs.floor : serverData.floor,
      code: dirtyFields.code ? currentInputs.code : Number(serverData.code),
      name: dirtyFields.name ? currentInputs.name.trim() : serverData.name,
      capacity: dirtyFields.capacity
        ? currentInputs.capacity
        : serverData.capacity,
    };

    try {
      await updateProfileMutation.mutateAsync({
        id: room.id,
        payload: mergedPayload,
        version: serverData.version,
      });

      toast.success("Đã ghi đè dữ liệu phòng học thành công!");
      setConflictState(null);
      onOpenChange(false);
    } catch (err: unknown) {
      handleSubmissionError(err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) {
          setGeneralError(null);
          setConflictState(null);
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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
                Cập nhật thông số hồ sơ phòng học theo chuẩn HTTP Conditional.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Visual Inline Conflict Banner (Triggered exclusively on HTTP 412) */}
        {conflictState && (
          <ConflictBanner
            serverData={conflictState.serverData}
            baseValues={conflictState.baseValues}
            clientValues={getValues()}
            dirtyFields={dirtyFields}
            onDiscardAndSync={handleDiscardAndSync}
            onForceOverwrite={handleForceOverwrite}
            isSubmitting={isSubmitting || updateProfileMutation.isPending}
          />
        )}

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
