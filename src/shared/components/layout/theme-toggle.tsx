import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useTheme } from "@/shared/lib/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          title={`Chế độ giao diện: ${theme}`}
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4 text-sky-400 transition-all" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4 text-amber-500 transition-all" />
          ) : (
            <Laptop className="h-4 w-4 text-muted-foreground transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent font-medium" : ""}
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span>Sáng (Light)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent font-medium" : ""}
        >
          <Moon className="mr-2 h-4 w-4 text-sky-400" />
          <span>Tối (Dark)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent font-medium" : ""}
        >
          <Laptop className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Hệ thống (System)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
