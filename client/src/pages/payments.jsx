import { useEffect, useRef, useState } from 'react';
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
import { formatAmount } from '@/lib/utils';
import { useAutoPageSize } from '@/hooks/useAutoPageSize';
import { CompactPagination } from '@/components/common/compact-pagination';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const scrollAreaRef = useRef(null);
  const limit = useAutoPageSize({
    containerRef: scrollAreaRef,
    rowHeight: 48,
    initialLimit: 15,
  });

  async function loadPayments() {
    getAllPayments(page, limit)
      .then(({ payments, meta }) => {
        setPayments(payments);
        setTotalPages(meta.totalPages);
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
  }, [page, limit]);

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
            <div ref={scrollAreaRef} className="min-h-0 flex-1">
              <ScrollArea className="size-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid At</TableHead>
                    </TableRow>
                  </TableHeader>
                  {payments.length > 0 && (
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow className="h-12" key={payment.id}>
                          <TableCell>
                            <CopyText text={payment.id} />
                          </TableCell>
                          <TableCell>
                            <CopyText text={payment.invoice_id} />
                          </TableCell>
                          <TableCell>
                            {formatAmount(payment.amount)}{' '}
                            {payment.invoice.currency}
                          </TableCell>
                          <TableCell>
                            {new Date(payment.paid_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
                {payments.length === 0 && (
                  <p className="py-6 text-center text-gray-600 text-lg font-medium">
                    No payments found
                  </p>
                )}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div className="border-t p-2">
              <CompactPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
