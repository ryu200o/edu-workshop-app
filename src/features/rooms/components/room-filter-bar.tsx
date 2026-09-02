import { RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useBuildingsQuery } from "@/features/rooms/hooks/useRoomQueries";
import type { RoomFilterParams, RoomStatus } from "@/features/rooms/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface RoomFilterBarProps {
  filters: RoomFilterParams;
  onFilterChange: (newFilters: Partial<RoomFilterParams>) => void;
  onReset: () => void;
}

export function RoomFilterBar({
  filters,
  onFilterChange,
  onReset,
}: RoomFilterBarProps) {
  const { data: buildingsData, isLoading: isLoadingBuildings } =
    useBuildingsQuery();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        onFilterChange({ search: searchTerm.trim() || undefined, page: 1 });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, onFilterChange]);

  // Available floors based on selected building
  const selectedBuildingData = buildingsData?.find(
    (b) => b.building === filters.building,
  );
  const availableFloors = selectedBuildingData?.floors || [];

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.building ||
      filters.floor !== undefined ||
      filters.status ||
      filters.minCapacity !== undefined ||
      filters.maxCapacity !== undefined,
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* Search input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc mã phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Building select */}
        <div>
          <select
            value={filters.building || ""}
            onChange={(e) => {
              const val = e.target.value || undefined;
              onFilterChange({ building: val, floor: undefined, page: 1 });
            }}
            disabled={isLoadingBuildings}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Tất Cả Tòa Nhà</option>
            {buildingsData?.map((b) => (
              <option key={b.building} value={b.building}>
                {b.building} ({b.totalRooms} phòng)
              </option>
            ))}
          </select>
        </div>

        {/* Floor select */}
        <div>
          <select
            value={filters.floor !== undefined ? String(filters.floor) : ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onFilterChange({ floor: val, page: 1 });
            }}
            disabled={!filters.building || availableFloors.length === 0}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="">Tất Cả Tầng</option>
            {availableFloors.map((fl) => (
              <option key={fl} value={fl}>
                Tầng {fl}
              </option>
            ))}
          </select>
        </div>

        {/* Status select */}
        <div>
          <select
            value={filters.status || ""}
            onChange={(e) => {
              const val = (e.target.value as RoomStatus) || undefined;
              onFilterChange({ status: val, page: 1 });
            }}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Tất Cả Trạng Thái</option>
            <option value="ACTIVE">Sẵn Sàng</option>
            <option value="MAINTENANCE">Đang Bảo Trì</option>
            <option value="DEACTIVATED">Vô Hiệu Hóa</option>
          </select>
        </div>

        {/* Capacity filter range & reset */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={1}
            value={filters.minCapacity ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onFilterChange({ minCapacity: val, page: 1 });
            }}
            className="w-1/2 px-2 text-center text-xs"
            title="Sức chứa tối thiểu"
          />
          <span className="text-muted-foreground text-xs">-</span>
          <Input
            type="number"
            placeholder="Max"
            min={1}
            value={filters.maxCapacity ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onFilterChange({ maxCapacity: val, page: 1 });
            }}
            className="w-1/2 px-2 text-center text-xs"
            title="Sức chứa tối đa"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
          <span className="text-muted-foreground">
            Đang áp dụng bộ lọc tùy chỉnh
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              onReset();
            }}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
