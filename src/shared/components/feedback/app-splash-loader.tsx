import { GraduationCap, Loader2 } from "lucide-react";

export function AppSplashLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
          <GraduationCap className="h-8 w-8 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground tracking-tight">
            Edu Workshop Platform
          </h1>
          <p className="text-muted-foreground text-xs">
            Đang khởi tạo môi trường làm việc & kiểm tra phiên đăng nhập...
          </p>
        </div>
        <Loader2 className="mt-2 h-5 w-5 animate-spin text-primary" />
      </div>
    </div>
  );
}
