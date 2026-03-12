import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/common/app-sidebar';
import { PageHeader } from '@/components/common/page-header';

export default function DashboardLayout({
  title,
  buttonText,
  buttonIcon,
  buttonOnClick,
  children,
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <PageHeader
          title={title}
          enableButton={true}
          buttonIcon={buttonIcon}
          buttonText={buttonText}
          buttonOnClick={buttonOnClick}
        />
        {children}
      </main>
    </SidebarProvider>
  );
}
