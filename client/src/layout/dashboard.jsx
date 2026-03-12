import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/common/app-sidebar';
import { PageHeader } from '@/components/common/page-header';

export default function DashboardLayout({
  title,
  enableButton = false,
  buttonText,
  buttonIcon,
  buttonOnClick,
  children,
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <PageHeader
          title={title}
          enableButton={enableButton}
          buttonIcon={buttonIcon}
          buttonText={buttonText}
          buttonOnClick={buttonOnClick}
        />
        {children}
      </main>
    </SidebarProvider>
  );
}
