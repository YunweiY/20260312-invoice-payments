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
      <main className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
        <PageHeader
          title={title}
          enableButton={enableButton}
          buttonIcon={buttonIcon}
          buttonText={buttonText}
          buttonOnClick={buttonOnClick}
        />
        <section className="flex-1 min-h-0 overflow-hidden">{children}</section>
      </main>
    </SidebarProvider>
  );
}
