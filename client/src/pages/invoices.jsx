import { useState, useEffect } from 'react';
import {
  getAllInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} from '@/api/invoices.api';
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
import { statusTag } from '@/components/invoices/status-tag';
import { PlusIcon, AlertTriangleIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DatePicker } from '@/components/common/date-picker';
import { Label } from '@/components/ui/label';
import { SimpleSheet } from '@/components/common/simple-sheet';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { CopyText } from '@/components/common/copy-text';
import { PaymentForm } from '@/components/invoices/payment-form';
import { formatAmount } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { CheckIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetLoading, setIsSheetLoading] = useState(true);
  const [sheetError, setSheetError] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  const [isUpdatingInvoiceStatus, setIsUpdatingInvoiceStatus] = useState(false);

  async function loadInvoices(filters = {}) {
    // Use undefined instead of ?? to check the filter values so we can pass null to reset filters
    const nextStatus = filters.status !== undefined ? filters.status : status;
    const nextFromDate =
      filters.fromDate !== undefined ? filters.fromDate : fromDate;
    const nextToDate = filters.toDate !== undefined ? filters.toDate : toDate;

    const data = await getAllInvoices(nextStatus, nextFromDate, nextToDate);
    setInvoices(data);
  }

  async function runLoad(filters = {}) {
    setIsLoading(true);
    setError(null);
    try {
      await loadInvoices(filters);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadInvoiceById(id) {
    setSelectedInvoiceId(id);
    setIsSheetLoading(true);
    setSheetError(null);
    setIsSheetOpen(true);
    try {
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch (error) {
      setSheetError(error);
    } finally {
      setIsSheetLoading(false);
    }
  }

  useEffect(() => {
    runLoad();
  }, []);

  function resetFilters() {
    setStatus(null);
    setFromDate(null);
    setToDate(null);
    runLoad({ status: null, fromDate: null, toDate: null });
  }

  async function handleUpdateInvoiceStatus(id, status) {
    try {
      setIsUpdatingInvoiceStatus(true);
      await updateInvoiceStatus(id, status);
      toast.success(`Invoice status updated to ${status}`);
      await runLoad();
    } catch (error) {
      toast.error(error?.response?.data?.error?.message || error.message);
    } finally {
      setIsUpdatingInvoiceStatus(false);
    }
  }

  function actionButtonTypes(invoice) {
    if (invoice.status === 'DRAFT') {
      return [
        {
          type: 'confirm',
          label: 'Confirm',
          icon: <CheckIcon />,
          variant: 'default',
          onClick: async () => handleUpdateInvoiceStatus(invoice.id, 'PENDING'),
        },
        {
          type: 'void',
          label: 'Void',
          icon: <TrashIcon />,
          variant: 'destructive',
          onClick: async () => handleUpdateInvoiceStatus(invoice.id, 'VOID'),
        },
      ];
    }
    if (invoice.status === 'PENDING' && invoice._count.payments === 0) {
      return [
        {
          type: 'void',
          label: 'Void',
          icon: <TrashIcon />,
          variant: 'destructive',
          onClick: async () => handleUpdateInvoiceStatus(invoice.id, 'VOID'),
        },
      ];
    }
    return [];
  }

  return (
    <DashboardLayout
      title="Invoices"
      enableButton={true}
      buttonText="New Invoice"
      buttonIcon={<PlusIcon className="h-4 w-4" />}
      buttonOnClick={() => {
        setIsFormOpen(true);
      }}
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
            {error?.response?.data?.error?.message || error.message}
          </p>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsLoading(true);
                runLoad();
              }}
            >
              Try Again
            </Button>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 h-full min-h-0 p-4">
          {/* filters */}
          <div className="flex flex-wrap items-end gap-2">
            {/* filter by status */}
            <div className="flex flex-row gap-2">
              <Label>Status: </Label>
              <Select
                value={status ?? undefined}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger className="min-w-36">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="VOID">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* filter by issued_at date range */}
            <div className="flex flex-row gap-2">
              <Label>From: </Label>
              <DatePicker
                value={fromDate}
                setValue={setFromDate}
                maxDate={toDate}
              />
              <Label>To: </Label>
              <DatePicker
                value={toDate}
                setValue={setToDate}
                minDate={fromDate}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Button onClick={() => runLoad()}>Filter</Button>
              <Button onClick={resetFilters} variant="outline">
                Reset
              </Button>
            </div>
          </div>
          {/* invoices table */}
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
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      onClick={() => loadInvoiceById(invoice.id)}
                    >
                      <TableCell>
                        <CopyText text={invoice.id} />
                      </TableCell>
                      <TableCell>{invoice.customer.name}</TableCell>
                      <TableCell>
                        {formatAmount(invoice.amount)} {invoice.currency}
                      </TableCell>
                      <TableCell>{statusTag(invoice.status)}</TableCell>
                      <TableCell>
                        {new Date(invoice.issued_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.due_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        // prevent the click event from bubbling up to the parent table row
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {/* action buttons */}
                        {(() => {
                          const buttons = actionButtonTypes(invoice);
                          return buttons.length > 0 ? (
                            isUpdatingInvoiceStatus ? (
                              <Button
                                className="w-full"
                                variant="outline"
                                disabled
                              >
                                <Spinner className="size-4" />
                                Updating...
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button className="w-full" variant="outline">
                                    Update
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuGroup>
                                    {buttons.map((button) => (
                                      <DropdownMenuItem
                                        key={button.type}
                                        variant={button.variant}
                                        onSelect={(e) => {
                                          e.stopPropagation();
                                          button.onClick();
                                        }}
                                        onPointerDown={(e) =>
                                          e.stopPropagation()
                                        }
                                        disabled={isUpdatingInvoiceStatus}
                                      >
                                        {button.icon}
                                        {button.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )
                          ) : null;
                        })()}
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
      {/* invoice details sheet */}
      <SimpleSheet
        maxWidth="900px"
        title="Invoice Details"
        description="View invoice details"
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
      >
        <div>
          {isSheetLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="size-10" />
              <p className="text-gray-600 text-center text-lg font-medium">
                Loading invoice details...
              </p>
            </div>
          ) : sheetError ? (
            <div className="flex h-full items-center justify-center flex-col gap-2">
              <AlertTriangleIcon className="size-10 text-red-600" />
              <p className="text-red-600 text-center text-lg font-medium">
                {sheetError?.response?.data?.error?.message ||
                  sheetError.message}
              </p>
              <div className="flex flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedInvoiceId) {
                      loadInvoiceById(selectedInvoiceId);
                    } else {
                      setIsSheetOpen(false);
                    }
                  }}
                >
                  Try Again
                </Button>
                <Button onClick={() => setIsSheetOpen(false)}>Close</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {/* basic information */}
              <div className="grid grid-cols-[max-content_1fr] items-start gap-x-3 gap-y-2">
                <p className="font-medium text-left">Invoice ID:</p>
                <div>
                  <CopyText text={invoice.id} />
                </div>
                <p className="font-medium text-left">Customer:</p>
                <p>{invoice.customer.name}</p>
                <p className="font-medium text-left">Amount:</p>
                <p>
                  {formatAmount(invoice.amount)} {invoice.currency}
                </p>
                <p className="font-medium text-left">Outstanding Amount:</p>
                <p>
                  {formatAmount(invoice.remaining_amount)} {invoice.currency}
                </p>
                <p className="font-medium text-left">Status:</p>
                <p>{statusTag(invoice.status)}</p>
                <p className="font-medium text-left">Issued At:</p>
                <p>{new Date(invoice.issued_at).toLocaleDateString()}</p>
                <p className="font-medium text-left">Due At:</p>
                <p>{new Date(invoice.due_at).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col gap-2 border rounded-md p-2">
                {/* actions */}
                <div className="flex flex-row gap-2 justify-end">
                  <Button
                    onClick={() => setIsPaymentFormOpen(true)}
                    disabled={invoice.status !== 'PENDING'}
                  >
                    <PlusIcon className="h-4 w-4" /> Create Payment
                  </Button>
                </div>
                {/* payments table */}
                {invoice.payments.length > 0 && (
                  <Table className="border">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.id}</TableCell>
                          <TableCell>
                            {formatAmount(payment.amount)} {invoice.currency}
                          </TableCell>
                          <TableCell>
                            {new Date(payment.paid_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {invoice.payments.length === 0 && (
                  <p className="text-gray-600 text-center text-lg font-medium">
                    No related payments found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </SimpleSheet>
      <InvoiceForm
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccessSubmit={() => {
          runLoad();
        }}
      />
      <PaymentForm
        invoice={invoice || null}
        open={isPaymentFormOpen}
        setOpen={setIsPaymentFormOpen}
        onSuccessSubmit={() => {
          loadInvoiceById(invoice.id);
          runLoad();
        }}
      />
    </DashboardLayout>
  );
}
