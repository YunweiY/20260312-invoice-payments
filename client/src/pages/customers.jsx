import { useEffect, useRef, useState } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import DashboardLayout from '@/layout/dashboard';
import { getAllCustomers } from '@/api/customers.api';
import { getCustomerInvoices } from '@/api/customers.api';
import { updateInvoiceStatus } from '@/api/invoices.api';
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
import { SimpleSheet } from '@/components/common/simple-sheet';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DatePicker } from '@/components/common/date-picker';
import { CopyText } from '@/components/common/copy-text';
import { InvoiceTable } from '@/components/invoices/invoice-table';
import { useAutoPageSize } from '@/hooks/useAutoPageSize';
import { CompactPagination } from '@/components/common/compact-pagination';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { getInvoiceActionButtonTypes } from '@/components/invoices/invoice-action-buttons';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isUpdatingInvoiceStatus, setIsUpdatingInvoiceStatus] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetLoading, setIsSheetLoading] = useState(true);
  const [sheetError, setSheetError] = useState(null);

  const [status, setStatus] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const scrollAreaRef = useRef(null);
  const limit = useAutoPageSize({
    containerRef: scrollAreaRef,
    rowHeight: 48,
    initialLimit: 15,
  });

  const [sheetPage, setSheetPage] = useState(1);
  const [sheetTotalPages, setSheetTotalPages] = useState(0);
  const sheetScrollAreaRef = useRef(null);
  const sheetLimit = useAutoPageSize({
    containerRef: sheetScrollAreaRef,
    rowHeight: 48, // h-12
    initialLimit: 10,
  });

  async function loadInvoices(filters = {}) {
    const nextStatus = filters.status !== undefined ? filters.status : status;
    const nextFromDate =
      filters.fromDate !== undefined ? filters.fromDate : fromDate;
    const nextToDate = filters.toDate !== undefined ? filters.toDate : toDate;
    setIsSheetLoading(true);
    setSheetError(null);
    try {
      const { invoices, meta } = await getCustomerInvoices(
        selectedCustomer.id,
        nextStatus,
        nextFromDate,
        nextToDate,
        sheetPage,
        sheetLimit
      );
      setInvoices(invoices);
      setSheetTotalPages(meta.totalPages);
    } catch (error) {
      setSheetError(error);
    } finally {
      setIsSheetLoading(false);
    }
  }

  function resetFilters() {
    setStatus('');
    setFromDate(null);
    setToDate(null);
    loadInvoices({ status: null, fromDate: null, toDate: null });
  }

  async function loadInvoicesByCustomerId(id, pageOverride = sheetPage) {
    setIsSheetOpen(true);
    setIsSheetLoading(true);
    setSheetError(null);
    try {
      const { invoices, meta } = await getCustomerInvoices(
        id,
        status,
        fromDate,
        toDate,
        pageOverride,
        sheetLimit
      );
      setInvoices(invoices);
      setSheetTotalPages(meta.totalPages);
    } catch (error) {
      setSheetError(error);
    } finally {
      setIsSheetLoading(false);
    }
  }

  async function loadCustomers() {
    getAllCustomers(page, limit)
      .then(({ customers, meta }) => {
        setCustomers(customers);
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
    loadCustomers();
  }, [page, limit]);

  async function handleUpdateInvoiceStatus(id, targetStatus) {
    if (!selectedCustomer?.id) return;

    try {
      setIsUpdatingInvoiceStatus(true);
      await updateInvoiceStatus(id, targetStatus);
      toast.success(`Invoice status updated to ${targetStatus}`);
      await loadInvoicesByCustomerId(selectedCustomer.id);
    } catch (error) {
      toast.error(error?.response?.data?.error?.message || error.message);
    } finally {
      setIsUpdatingInvoiceStatus(false);
    }
  }

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
            <div ref={scrollAreaRef} className="min-h-0 flex-1">
              <ScrollArea className="size-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  {customers.length > 0 && (
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow
                          className="h-12"
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            loadInvoicesByCustomerId(customer.id);
                          }}
                        >
                          <TableCell>
                            <CopyText text={customer.id} />
                          </TableCell>
                          <TableCell>{customer.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
                {customers.length === 0 && (
                  <p className="py-6 text-center text-gray-600 text-lg font-medium">
                    No customers found
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
      <SimpleSheet
        maxWidth="900px"
        title="View Customer"
        description="View customer details"
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
      >
        {isSheetLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="size-10" />
            <p className="text-gray-600 text-center text-lg font-medium">
              Loading customer details...
            </p>
          </div>
        ) : sheetError ? (
          <div className="flex h-full items-center justify-center flex-col gap-2">
            <AlertTriangleIcon className="size-10 text-red-600" />
            <p className="text-red-600 text-center text-lg font-medium">
              {sheetError?.response?.data?.error?.message || sheetError.message}
            </p>
            <div className="flex flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  loadInvoicesByCustomerId(selectedCustomer.id);
                }}
              >
                Try Again
              </Button>
              <Button onClick={() => resetFilters()}>Reset Filters</Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col gap-2 p-4">
            {/* basic information */}
            <div className="grid grid-cols-[max-content_1fr] items-start gap-x-3 gap-y-2">
              <p className="font-medium text-left">Customer ID:</p>
              <p>
                <CopyText text={selectedCustomer?.id} />
              </p>
              <p className="font-medium text-left">Name:</p>
              <p>{selectedCustomer?.name}</p>
            </div>
            <div className="flex min-h-0 flex-col gap-2 rounded-md border p-4">
              {/* Filters */}
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
                  <Button onClick={() => loadInvoices()}>Filter</Button>
                  <Button
                    onClick={() => {
                      resetFilters();
                    }}
                    variant="outline"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              {/* Invoice table */}
              <Card className="flex min-h-0 flex-col p-2">
                <div ref={sheetScrollAreaRef} className="min-h-0">
                  <ScrollArea className="size-full">
                    <InvoiceTable
                      invoices={invoices}
                      showActions
                      renderActions={(invoice) => {
                        const buttons = getInvoiceActionButtonTypes(
                          invoice,
                          handleUpdateInvoiceStatus
                        );
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
                                      onSelect={button.onClick}
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
                      }}
                    />
                    {invoices.length === 0 && (
                      <p className="py-6 text-center text-gray-600 text-lg font-medium">
                        No invoices found
                      </p>
                    )}
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
                <div className="border-t p-2">
                  <CompactPagination
                    page={sheetPage}
                    totalPages={sheetTotalPages}
                    onPageChange={(nextPage) => {
                      setSheetPage(nextPage);
                      loadInvoicesByCustomerId(selectedCustomer.id, nextPage);
                    }}
                  />
                </div>
              </Card>
            </div>
          </div>
        )}
      </SimpleSheet>
    </DashboardLayout>
  );
}
