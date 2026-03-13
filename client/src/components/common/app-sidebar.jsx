import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Users, FileText, CreditCard, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const tabs = [
    {
      label: 'Home',
      icon: Home,
      to: '/',
    },
    {
      label: 'Invoices',
      icon: FileText,
      to: '/invoices',
    },
    {
      label: 'Customers',
      icon: Users,
      to: '/customers',
    },
    {
      label: 'Payments',
      icon: CreditCard,
      to: '/payments',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <div className="text-3xl font-semibold">Welcome!</div>
      </SidebarHeader>

      <SidebarContent className="gap-2">
        {tabs.map((tab) => (
          <SidebarMenuButton
            asChild
            key={tab.to}
            isActive={pathname === tab.to}
          >
            <Link to={tab.to}>
              <SidebarGroupLabel className="text-md font-medium">
                <tab.icon className="h-4 w-4 mr-2" />
                <span className="text-md font-medium">{tab.label}</span>
              </SidebarGroupLabel>
            </Link>
          </SidebarMenuButton>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
