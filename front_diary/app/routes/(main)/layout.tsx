import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
   return (
      <SidebarProvider>
         <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 w-full">
               <SidebarTrigger />
               {children}
            </main>
         </div>
      </SidebarProvider>
   )
}