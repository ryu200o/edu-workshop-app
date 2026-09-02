import { createFileRoute } from "@tanstack/react-router";
import { Building, CheckCircle2, DoorOpen, Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { CreateRoomDialog } from "@/features/rooms/components/create-room-dialog";
import { EditRoomDialog } from "@/features/rooms/components/edit-room-dialog";
import { RoomDetailModal } from "@/features/rooms/components/room-detail-modal";
import { RoomFilterBar } from "@/features/rooms/components/room-filter-bar";
import { RoomPagination } from "@/features/rooms/components/room-pagination";
import { RoomStatusDialog } from "@/features/rooms/components/room-status-dialog";
import { RoomTable } from "@/features/rooms/components/room-table";
import { ScheduleMaintenanceDialog } from "@/features/rooms/components/schedule-maintenance-dialog";
import { useRoomsQuery } from "@/features/rooms/hooks/useRoomQueries";
import type {
  RoomFilterParams,
  RoomStatus,
  RoomSummaryView,
} from "@/features/rooms/types";
import { roomSearchParamsSchema } from "@/features/rooms/types/schemas";
import { Button } from "@/shared/components/ui/button";

export const Route = createFileRoute("/_authenticated/rooms/")({
  validateSearch: (search: Record<string, unknown>) =>
    roomSearchParamsSchema.parse(search),
  component: RoomsManagementPage,
});

function RoomsManagementPage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user } = useAuth();

  // RBAC permission check
  const canManage = Boolean(
    user?.roles?.some((r) => r === "FACILITY_MANAGER" || r === "ADMIN"),
  );

  // Dialog & Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailRoomId, setDetailRoomId] = useState<string | null>(null);
  const [editRoom, setEditRoom] = useState<RoomSummaryView | null>(null);
  const [scheduleRoom, setScheduleRoom] = useState<RoomSummaryView | null>(
    null,
  );
  const [statusRoom, setStatusRoom] = useState<RoomSummaryView | null>(null);
  const [targetStatus, setTargetStatus] = useState<RoomStatus | null>(null);

  // Query rooms from backend with current search filters
  const { data: roomsPage, isLoading } = useRoomsQuery({
    page: searchParams.page,
    size: searchParams.size,
    sort: searchParams.sort,
    search: searchParams.search,
    building: searchParams.building,
    floor: searchParams.floor,
    status: searchParams.status,
    minCapacity: searchParams.minCapacity,
    maxCapacity: searchParams.maxCapacity,
  });

  // URL search sync handlers
  const handleFilterChange = (newFilters: Partial<RoomFilterParams>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...newFilters,
      }),
      replace: true,
    });
  };

  const handleResetFilters = () => {
    navigate({
      search: {
        page: 1,
        size: searchParams.size || 10,
        sort: "building,asc",
      },
      replace: true,
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPage,
      }),
    });
  };

  const handleSizeChange = (newSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        size: newSize,
        page: 1,
      }),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
            Quản Lý Phòng Học & Cơ Sở Vật Chất
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Theo dõi tình trạng vật lý, điều phối sức chứa và lên lịch bảo trì
            định kỳ.
          </p>
        </div>

        {canManage && (
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            <span>Tạo Phòng Mới</span>
          </Button>
        )}
      </div>

      {/* Mini Stat Summary Badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <DoorOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Tổng Số Phòng
            </p>
            <p className="font-bold text-lg text-foreground">
              {roomsPage?.totalElements ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Trang Hiện Tại
            </p>
            <p className="font-bold text-lg text-foreground">
              {roomsPage ? roomsPage.page + 1 : 1} /{" "}
              {roomsPage ? Math.max(1, roomsPage.totalPages) : 1}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Đang Bảo Trì
            </p>
            <p className="font-bold text-lg text-foreground">
              {roomsPage?.content?.filter((r) => r.state === "MAINTENANCE")
                .length ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Tòa Nhà Đang Lọc
            </p>
            <p className="font-bold text-sm text-foreground truncate max-w-[120px]">
              {searchParams.building || "Tất cả"}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <RoomFilterBar
        filters={{
          search: searchParams.search,
          building: searchParams.building,
          floor: searchParams.floor,
          status: searchParams.status,
          minCapacity: searchParams.minCapacity,
          maxCapacity: searchParams.maxCapacity,
        }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Data Table */}
      <RoomTable
        rooms={roomsPage?.content || []}
        isLoading={isLoading}
        onViewDetail={(room) => setDetailRoomId(room.id)}
        onEditRoom={(room) => setEditRoom(room)}
        onScheduleMaintenance={(room) => setScheduleRoom(room)}
        onChangeStatus={(room, status) => {
          setStatusRoom(room);
          setTargetStatus(status);
        }}
      />

      {/* Pagination */}
      {roomsPage && roomsPage.totalElements > 0 && (
        <RoomPagination
          page={roomsPage.page + 1}
          size={roomsPage.size}
          totalElements={roomsPage.totalElements}
          totalPages={roomsPage.totalPages}
          first={roomsPage.first}
          last={roomsPage.last}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
        />
      )}

      {/* Modals & Dialogs */}
      <CreateRoomDialog open={createOpen} onOpenChange={setCreateOpen} />

      <RoomDetailModal
        roomId={detailRoomId}
        open={Boolean(detailRoomId)}
        onOpenChange={(open) => {
          if (!open) setDetailRoomId(null);
        }}
      />

      <EditRoomDialog
        room={editRoom}
        open={Boolean(editRoom)}
        onOpenChange={(open) => {
          if (!open) setEditRoom(null);
        }}
      />

      <ScheduleMaintenanceDialog
        room={scheduleRoom}
        open={Boolean(scheduleRoom)}
        onOpenChange={(open) => {
          if (!open) setScheduleRoom(null);
        }}
      />

      <RoomStatusDialog
        room={statusRoom}
        targetStatus={targetStatus}
        open={Boolean(statusRoom && targetStatus)}
        onOpenChange={(open) => {
          if (!open) {
            setStatusRoom(null);
            setTargetStatus(null);
          }
        }}
      />
    </div>
  );
}
