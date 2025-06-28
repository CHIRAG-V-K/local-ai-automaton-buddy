
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "light") {
      return <Sun className="h-4 w-4" />;
    } else if (theme === "dark") {
      return <Moon className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme} 
      className="gap-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {getIcon()}
      <span className="capitalize text-sm">{theme}</span>
    </Button>
  );
}
