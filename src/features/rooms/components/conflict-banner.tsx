import {
  AlertTriangle,
  ArrowRight,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";
import type { RoomDetailView } from "@/features/rooms/types";
import type { EditRoomFormValues } from "@/features/rooms/types/schemas";
import { Button } from "@/shared/components/ui/button";

interface ConflictBannerProps {
  serverData: RoomDetailView;
  baseValues: EditRoomFormValues;
  clientValues: EditRoomFormValues;
  dirtyFields: Partial<Record<keyof EditRoomFormValues, boolean>>;
  onDiscardAndSync: () => void;
  onForceOverwrite: () => void;
  isSubmitting: boolean;
}

const FIELD_LABELS: Record<keyof EditRoomFormValues, string> = {
  name: "Tên phòng",
  building: "Tòa nhà",
  floor: "Tầng",
  code: "Mã phòng",
  capacity: "Sức chứa",
};

export function ConflictBanner({
  serverData,
  baseValues,
  clientValues,
  dirtyFields,
  onDiscardAndSync,
  onForceOverwrite,
  isSubmitting,
}: ConflictBannerProps) {
  // Map server fields to matching form value types
  const serverFormValues: EditRoomFormValues = {
    name: serverData.name,
    building: serverData.building,
    floor: serverData.floor,
    code: Number(serverData.code),
    capacity: serverData.capacity,
  };

  const fields = Object.keys(FIELD_LABELS) as (keyof EditRoomFormValues)[];

  // Direct collision: user edited this field AND server value changed compared to base
  const directCollisions = fields.filter((field) => {
    const isDirty = Boolean(dirtyFields[field]);
    const serverChanged =
      String(serverFormValues[field]) !== String(baseValues[field]);
    return isDirty && serverChanged;
  });

  // Non-colliding drift: user didn't edit this field BUT server value changed compared to base
  const nonCollidingDrifts = fields.filter((field) => {
    const isDirty = Boolean(dirtyFields[field]);
    const serverChanged =
      String(serverFormValues[field]) !== String(baseValues[field]);
    return !isDirty && serverChanged;
  });

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="conflict-banner"
      className="space-y-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm leading-tight text-amber-900 dark:text-amber-100">
            Phát Hiện Xung Đột Phiên Bản Dữ Liệu (HTTP 412)
          </h4>
          <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/90">
            Thông tin phòng học này vừa được quản trị viên khác cập nhật lên
            phiên bản #{serverData.version}. Dữ liệu bạn đang nhập dở bên dưới
            được giữ nguyên vẹn.
          </p>
        </div>
      </div>

      {/* Direct Collisions: The 3-Value Matrix */}
      {directCollisions.length > 0 && (
        <div className="space-y-2 rounded-lg bg-amber-500/15 p-3 dark:bg-amber-950/40">
          <p className="font-medium text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-200">
            Xung Đột Trực Tiếp (Bạn và người khác cùng thay đổi):
          </p>
          <ul className="space-y-1.5 text-xs">
            {directCollisions.map((field) => {
              const base = baseValues[field];
              const server = serverFormValues[field];
              const client = clientValues[field];
              return (
                <li
                  key={field}
                  className="flex flex-wrap items-center gap-1.5"
                  data-testid={`direct-collision-${field}`}
                >
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    {FIELD_LABELS[field]}:
                  </span>
                  <span className="text-muted-foreground line-through decoration-destructive/60">
                    {String(base)}
                  </span>
                  <ArrowRight className="h-3 w-3 text-amber-700 dark:text-amber-400" />
                  <span className="font-semibold text-amber-900 underline decoration-amber-500 underline-offset-2 dark:text-amber-200">
                    {String(server)} (Máy chủ)
                  </span>
                  <span className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.5 font-medium text-[11px] text-amber-900 dark:text-amber-100">
                    Bạn đang nhập: {String(client)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Non-colliding Drifts */}
      {nonCollidingDrifts.length > 0 && (
        <div className="space-y-1.5 rounded-lg bg-amber-500/10 p-2.5 text-xs dark:bg-amber-950/30">
          <p className="font-medium text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Thay Đổi Ngầm Từ Người Khác (Trường bạn không chỉnh sửa):
          </p>
          <ul className="list-disc space-y-1 pl-4 text-amber-800/90 dark:text-amber-300/90">
            {nonCollidingDrifts.map((field) => (
              <li key={field} data-testid={`non-colliding-drift-${field}`}>
                <span className="font-medium">{FIELD_LABELS[field]}</span> vừa
                được cập nhật thành{" "}
                <strong className="text-amber-900 dark:text-amber-100">
                  "{String(serverFormValues[field])}"
                </strong>
                .
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deterministic Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDiscardAndSync}
          disabled={isSubmitting}
          data-testid="discard-sync-button"
          className="h-8 border-amber-500/40 bg-background/80 text-xs hover:bg-amber-500/10"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Hủy & Đồng bộ
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onForceOverwrite}
          disabled={isSubmitting}
          data-testid="force-overwrite-button"
          className="h-8 bg-amber-600 text-white text-xs hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Đang Ghi Đè...
            </>
          ) : (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Ghi đè bằng dữ liệu của tôi
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
