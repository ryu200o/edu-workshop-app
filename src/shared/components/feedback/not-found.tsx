import { Link } from "@tanstack/react-router";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-md">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FileQuestion className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Không Tìm Thấy Trang (404)
          </CardTitle>
          <CardDescription className="text-sm">
            Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển sang vị
            trí khác.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-2">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              <span>Về Trang Chủ</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
