import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Breadcrumbs } from "./breadcrumbs";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Drawer Trigger */}
        <div className="md:hidden">
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="fixed inset-y-0 left-0 top-0 z-50 h-full w-72 p-0 translate-x-0 translate-y-0 rounded-none border-r border-border bg-card duration-200">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
