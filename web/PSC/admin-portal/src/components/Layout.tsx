import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../../config/apis";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const {mutate} = useMutation({
    mutationFn: logout,
    onSuccess: ()=>{
     toast({
        title: "Success",
        description: "Logout success",
        })
        queryClient.invalidateQueries({queryKey: ["currentUser"]});
        navigate("/auth")
    },
    onError:(err)=>  toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
        })
  })

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl font-bold text-foreground">
                Admin Portal
              </h1>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={()=> mutate()}><LogOut/></Button>
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 bg-background overflow-auto">
            <div className="max-w-[100vw]">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
