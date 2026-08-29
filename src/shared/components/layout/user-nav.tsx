import { useNavigate } from "@tanstack/react-router";
import { LogOut, Shield, User } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export function UserNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const initial =
    user?.fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-xl bg-primary/10 p-0 text-primary hover:bg-primary/20"
        >
          <span className="font-bold text-sm">{initial}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-semibold text-sm leading-none">
              {user?.fullName || "Người dùng"}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {user?.roles?.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px]"
                >
                  <Shield className="mr-1 h-2.5 w-2.5" />
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
