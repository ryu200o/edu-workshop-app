import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface RoomPaginationProps {
  page: number; // 1-indexed for UI display
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
}

export function RoomPagination({
  page,
  size,
  totalElements,
  totalPages,
  first,
  last,
  onPageChange,
  onSizeChange,
}: RoomPaginationProps) {
  const fromRecord = totalElements === 0 ? 0 : (page - 1) * size + 1;
  const toRecord = Math.min(page * size, totalElements);

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-3 sm:flex-row">
      <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
        <span>
          Hiển thị{" "}
          <span className="font-semibold text-foreground">{fromRecord}</span> -{" "}
          <span className="font-semibold text-foreground">{toRecord}</span> trên
          tổng số{" "}
          <span className="font-semibold text-foreground">{totalElements}</span>{" "}
          phòng
        </span>
        <div className="ml-2 flex items-center gap-1.5">
          <span className="text-xs">Cỡ trang:</span>
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={first || totalElements === 0}
          className="h-8 w-8 rounded-lg"
          title="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Trang đầu</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={first || totalElements === 0}
          className="h-8 w-8 rounded-lg"
          title="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Trang trước</span>
        </Button>

        <div className="flex items-center px-2 text-xs font-medium text-foreground">
          Trang {page} / {Math.max(1, totalPages)}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={last || totalElements === 0}
          className="h-8 w-8 rounded-lg"
          title="Trang tiếp"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Trang tiếp</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={last || totalElements === 0}
          className="h-8 w-8 rounded-lg"
          title="Trang cuối"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Trang cuối</span>
        </Button>
      </div>
    </div>
  );
}
