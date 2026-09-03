import { Loader2 } from "lucide-react";

export function RoutePendingComponent() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}
