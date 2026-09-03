import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Home, LogIn, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function RouteErrorComponent({ error, reset }: ErrorComponentProps) {
  const [showDetails, setShowDetails] = useState(false);

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Đã xảy ra lỗi không xác định trong quá trình kết xuất giao diện.";

  const stackTrace = error instanceof Error ? error.stack : null;

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive/30 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Đã Xảy Ra Sự Cố Giao Diện
          </CardTitle>
          <CardDescription className="text-sm">
            Hệ thống đã bắt chặn lỗi an toàn và ngăn chặn hiện tượng sập ứng
            dụng.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive font-mono break-words">
            {errorMessage}
          </div>

          {stackTrace && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showDetails ? "Ẩn chi tiết kỹ thuật" : "Xem chi tiết kỹ thuật"}
              </Button>
              {showDetails && (
                <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-muted p-3 text-[11px] font-mono text-muted-foreground">
                  {stackTrace}
                </pre>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (reset) reset();
              else window.location.reload();
            }}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            <span>Thử Lại</span>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Home className="mr-1.5 h-4 w-4" />
              <span>Về Trang Chủ</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <LogIn className="mr-1.5 h-4 w-4" />
              <span>Đăng Nhập Lại</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
