import { useEffect, useState } from 'react';
import { AlertTriangleIcon } from 'lucide-react';

import DashboardLayout from '@/layout/dashboard';
import { getAllPayments } from '@/api/payments.api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CopyText } from '@/components/common/copy-text';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadPayments() {
    getAllPayments()
      .then((data) => {
        setPayments(data);
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
    loadPayments();
  }, []);

  return (
    <DashboardLayout title="Payments" enableButton={false}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center gap-2">
          <Spinner className="size-10" />
          <p className="text-gray-600 text-center text-lg font-medium">
            Loading payments...
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
              loadPayments();
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
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <CopyText text={payment.id} />
                      </TableCell>
                      <TableCell>
                        <CopyText text={payment.invoice_id} />
                      </TableCell>
                      <TableCell>
                        {Number(payment.amount).toLocaleString()}{' '}
                        {payment.invoice.currency}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.paid_at).toLocaleDateString()}
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
