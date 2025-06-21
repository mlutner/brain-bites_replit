import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { MoreHorizontal } from "lucide-react";

interface NavigationProps {
  user?: any;
  onLogout?: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          My Library
        </Link>
        <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          Settings
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">My Library</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-muted-foreground">
            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
          </span>
        </div>
        
        {onLogout && (
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sign out
          </Button>
        )}
      </div>
    </>
  );
}