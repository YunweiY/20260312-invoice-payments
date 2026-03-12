import DashboardLayout from '@/layout/dashboard';
import { PlusIcon } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <DashboardLayout
      title="Invoices"
      enableButton={true}
      buttonText="New Invoice"
      buttonIcon={<PlusIcon className="h-4 w-4" />}
      buttonOnClick={() => {}}
    >
      <div>Placeholder for invoices list</div>
    </DashboardLayout>
  );
}
