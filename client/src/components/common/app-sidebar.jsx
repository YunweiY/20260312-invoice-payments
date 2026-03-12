import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Users, FileText, CreditCard, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <div className="text-3xl font-semibold">Welcome!</div>
      </SidebarHeader>

      <SidebarContent className="gap-2">
        <SidebarMenuButton asChild>
          <Link to="/">
            <SidebarGroupLabel className="text-md font-medium">
              <Home className="h-4 w-4 mr-2" />
              <span className="text-md font-medium">Home</span>
            </SidebarGroupLabel>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <Link to="/invoices">
            <SidebarGroupLabel className="text-md font-medium">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-md font-medium">Invoices</span>
            </SidebarGroupLabel>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <Link to="/customers">
            <SidebarGroupLabel className="text-md font-medium">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-md font-medium">Customers</span>
            </SidebarGroupLabel>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <Link to="/payments">
            <SidebarGroupLabel className="text-md font-medium">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="text-md font-medium">Payments</span>
            </SidebarGroupLabel>
          </Link>
        </SidebarMenuButton>
      </SidebarContent>
    </Sidebar>
  );
}
