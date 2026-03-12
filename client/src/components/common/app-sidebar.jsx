import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Users, FileText, CreditCard } from 'lucide-react';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <div className="text-3xl font-semibold">Welcome!</div>
      </SidebarHeader>

      <SidebarContent className="gap-2">
        <SidebarMenuButton>
          <SidebarGroupLabel className="text-md font-medium">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-md font-medium">Invoices</span>
          </SidebarGroupLabel>
        </SidebarMenuButton>
        <SidebarMenuButton>
          <SidebarGroupLabel className="text-md font-medium">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-md font-medium">Customers</span>
          </SidebarGroupLabel>
        </SidebarMenuButton>
        <SidebarMenuButton>
          <SidebarGroupLabel className="text-md font-medium">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="text-md font-medium">Payments</span>
          </SidebarGroupLabel>
        </SidebarMenuButton>
      </SidebarContent>
    </Sidebar>
  );
}
