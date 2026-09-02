import { Clock, Wrench } from "lucide-react";
import type {
  MaintenanceScheduleView,
  RoomStatus,
} from "@/features/rooms/types";
import { Badge } from "@/shared/components/ui/badge";

interface RoomStatusBadgeProps {
  state: RoomStatus;
  currentMaintenanceSchedule?: MaintenanceScheduleView | null;
  className?: string;
}

export function RoomStatusBadge({
  state,
  currentMaintenanceSchedule,
  className,
}: RoomStatusBadgeProps) {
  if (state === "ACTIVE") {
    return (
      <Badge variant="success" className={className}>
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Sẵn Sàng
      </Badge>
    );
  }

  if (state === "MAINTENANCE") {
    return (
      <div className="flex flex-col gap-0.5">
        <Badge
          variant="secondary"
          className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        >
          <Wrench className="mr-1 h-3 w-3 text-amber-600 dark:text-amber-400" />
          Đang Bảo Trì
        </Badge>
        {currentMaintenanceSchedule && (
          <span
            className="flex items-center gap-1 text-[11px] text-muted-foreground"
            title={currentMaintenanceSchedule.reason || "Bảo trì định kỳ"}
          >
            <Clock className="h-2.5 w-2.5" />
            <span className="max-w-[120px] truncate">
              {currentMaintenanceSchedule.reason || "Bảo trì"}
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge variant="destructive" className={className}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
      Vô Hiệu Hóa
    </Badge>
  );
}
