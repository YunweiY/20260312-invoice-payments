import { useEffect, useState } from 'react';
import { AlertTriangleIcon, PlusIcon } from 'lucide-react';

import DashboardLayout from '@/layout/dashboard';
import { getAllCustomers } from '@/api/customers.api';
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadCustomers() {
    getAllCustomers()
      .then((data) => {
        setCustomers(data);
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
    loadCustomers();
  }, []);

  return (
    <DashboardLayout title="Customers" enableButton={false}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center gap-2">
          <Spinner className="size-10" />
          <p className="text-gray-600 text-center text-lg font-medium">
            Loading customers...
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
              loadCustomers();
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
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
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
