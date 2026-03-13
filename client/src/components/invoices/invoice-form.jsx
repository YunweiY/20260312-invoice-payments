import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/common/date-picker';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { getAllCustomers } from '@/api/customers.api';
import { createInvoice } from '@/api/invoices.api';
import { AlertTriangleIcon } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { toast } from 'sonner';

export function InvoiceForm({ open, setOpen, onSuccessSubmit }) {
  const [customers, setCustomers] = useState([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [_loadError, setLoadError] = useState(null);

  const [customerId, setCustomerId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [dueAt, setDueAt] = useState(undefined);

  const [invalidReasons, setInvalidReasons] = useState([]);
  const [_isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit() {
    setSubmitError(null);
    setIsFormSubmitting(true);
    try {
      await createInvoice(
        customerId,
        amount,
        currency,
        new Date(dueAt).toISOString()
      );
      clearForm();
      setOpen(false);
      toast.success('Invoice created successfully');
      onSuccessSubmit();
    } catch (error) {
      setSubmitError(error?.response?.data?.error?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
      setIsSubmitButtonEnabled(false);
    }
  }

  async function loadCustomers() {
    setIsLoading(true);
    setLoadError(null);
    setCustomers([{ id: 'initial', name: 'Loading customers...' }]);
    getAllCustomers()
      .then(({ customers }) => {
        setCustomers(customers);
      })
      .catch((error) => {
        setLoadError(error);
        setCustomers([{ id: 'error', name: 'Error loading customers' }]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function clearForm() {
    setCustomerId(null);
    setAmount(0);
    setCurrency('USD');
    setDueAt(undefined);
    setSubmitError(null);
    setInvalidReasons([]);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const isFormValid = useMemo(() => {
    const isDateValid = dueAt && dueAt > new Date();
    // convert the amount to a number to avoid floating point precision issues
    const amountNum = Number(amount);
    const isAmountValid = Number.isFinite(amountNum) && amountNum > 0;
    const isCurrencyValid =
      currency && ['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY'].includes(currency);
    const isCustomerValid =
      customerId &&
      customers.some((customer) => customer.id === customerId) &&
      customerId !== 'initial' &&
      customerId !== 'error';
    const reasons = [];
    if (!isDateValid) reasons.push('Due date must be in the future');
    if (!isCurrencyValid)
      reasons.push('Currency must be a valid ISO 4217 currency code');
    if (!isCustomerValid) reasons.push('Customer must be selected');
    if (!isAmountValid) reasons.push('Amount must be a positive number');
    setInvalidReasons(reasons);
    return isDateValid && isCurrencyValid && isCustomerValid && isAmountValid;
  }, [dueAt, amount, currency, customerId, customers]);

  useEffect(() => {
    setIsSubmitButtonEnabled(isFormValid);
  }, [isFormValid]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) clearForm();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a customer.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="flex flex-col gap-4">
            <div className="flex flex-row gap-2">
              {/* Customer Select */}
              <Field>
                <Label htmlFor="name-1">Customer</Label>
                <Select
                  id="customer_id"
                  name="customer_id"
                  value={customerId}
                  onValueChange={setCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {/* Due At Date Picker */}
              <Field>
                <Label htmlFor="due_at">Due At</Label>
                <DatePicker
                  id="due_at"
                  name="due_at"
                  value={dueAt}
                  setValue={setDueAt}
                  minDate={new Date()}
                />
              </Field>
            </div>
            <div className="flex flex-row gap-2">
              {/* Amount Input */}
              <Field>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={(e) => {
                    // remove leading zeros from the amount
                    const raw = e.target.value;
                    if (!raw) return;
                    const [intPart, decPart] = raw.split('.');
                    const normalizedInt = String(parseInt(intPart || '0', 10));
                    const normalized =
                      decPart !== undefined
                        ? `${normalizedInt}.${decPart}`
                        : normalizedInt;

                    setAmount(normalized);
                  }}
                />
              </Field>
              {/* Currency Select */}
              <Field>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  id="currency"
                  name="currency"
                  value={currency}
                  onValueChange={setCurrency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD (CA$)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CNY">CNY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            {submitError && (
              <div className="flex flex-row gap-2 items-center text-red-500 text-sm font-medium">
                <AlertTriangleIcon className="size-4 text-red-500" />
                {submitError}
              </div>
            )}
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isFormSubmitting}
                onClick={() => {
                  clearForm();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            {/* Submit Button with Hover Card about invalid reasons*/}
            {/* not using Tooltip because it has to be configured at the root level of the app */}
            {open && !isFormSubmitting && invalidReasons.length > 0 ? (
              <HoverCard openDelay={10} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <span className="inline-block">
                    <Button type="submit" disabled>
                      Create Invoice
                    </Button>
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="flex w-64 flex-col gap-0.5">
                  {invalidReasons.map((reason) => (
                    <p key={reason} className="text-sm text-red-800">
                      · {reason}
                    </p>
                  ))}
                </HoverCardContent>
              </HoverCard>
            ) : (
              <Button type="submit" disabled={isFormSubmitting}>
                Create Invoice
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
