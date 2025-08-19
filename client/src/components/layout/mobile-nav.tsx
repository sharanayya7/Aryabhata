import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Newspaper, 
  BookOpen, 
  Target, 
  TrendingUp, 
  User 
} from "lucide-react";

export default function MobileNav() {
  const [location, navigate] = useLocation();

  const navItems = [
    { 
      href: "/", 
      label: "News", 
      icon: Newspaper,
      active: location === "/" || location === "/current-affairs"
    },
    { 
      href: "/syllabus", 
      label: "Syllabus", 
      icon: BookOpen,
      active: location === "/syllabus"
    },
    { 
      href: "/practice", 
      label: "Practice", 
      icon: Target,
      active: location === "/practice"
    },
    { 
      href: "/progress", 
      label: "Progress", 
      icon: TrendingUp,
      active: location === "/progress"
    },
    { 
      href: "/profile", 
      label: "Profile", 
      icon: User,
      active: location === "/profile"
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              onClick={() => navigate(item.href)}
              className={`h-full rounded-none flex flex-col items-center justify-center space-y-1 ${
                item.active
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
