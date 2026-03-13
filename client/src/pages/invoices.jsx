import { useState, useEffect } from 'react';
import { getAllInvoices } from '@/api/invoices.api';
import DashboardLayout from '@/layout/dashboard';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, AlertTriangleIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadInvoices() {
    getAllInvoices()
      .then((data) => {
        setInvoices(data);
        setError(null);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const showActionButtons = (invoice) => {
    return invoice.status === 'DRAFT';
  };

  const statusTag = (status) => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge variant="outline" className="bg-yellow-200 text-yellow-700">
            Draft
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-blue-200 text-blue-700">
            Pending
          </Badge>
        );
      case 'PAID':
        return (
          <Badge variant="outline" className="bg-green-200 text-green-700">
            Paid
          </Badge>
        );
      case 'VOID':
        return (
          <Badge variant="outline" className="bg-red-200 text-red-700">
            Void
          </Badge>
        );

      default:
        return (
          <Badge variant="outline" className="bg-gray-200 text-gray-700">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout
      title="Invoices"
      enableButton={true}
      buttonText="New Invoice"
      buttonIcon={<PlusIcon className="h-4 w-4" />}
      buttonOnClick={() => {}}
    >
      {isLoading ? (
        <div className="flex h-full items-center justify-center gap-2">
          <Spinner className="size-10" />
          <p className="text-gray-600 text-center text-lg font-medium">
            Loading invoices...
          </p>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center flex-col gap-2">
          <AlertTriangleIcon className="size-10 text-red-600" />
          <p className="text-red-600 text-center text-lg font-medium">
            {error.message}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              loadInvoices();
              setIsLoading(true);
            }}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="flex h-full min-h-0 p-4">
          <Card className="flex h-full min-h-0 flex-1 flex-col p-2">
            <ScrollArea className="h-full w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued At</TableHead>
                    <TableHead>Due At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.customer.name}</TableCell>
                      <TableCell>
                        {invoice.amount.toLocaleString()} {invoice.currency}
                      </TableCell>
                      <TableCell>{statusTag(invoice.status)}</TableCell>
                      <TableCell>
                        {new Date(invoice.issued_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.due_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {showActionButtons(invoice) && (
                          <Button variant="outline">Confirm</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
