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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { createPayment } from '@/api/payments.api';
import { AlertTriangleIcon } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { toast } from 'sonner';

export function PaymentForm({ invoice, open, setOpen, onSuccessSubmit }) {
  const [amount, setAmount] = useState(0);

  const [invalidReasons, setInvalidReasons] = useState([]);
  const [_isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit() {
    setSubmitError(null);
    setIsFormSubmitting(true);
    try {
      await createPayment(invoice.id, amount);
      clearForm();
      setOpen(false);
      toast.success('Payment created successfully');
      onSuccessSubmit();
    } catch (error) {
      setSubmitError(error?.response?.data?.error?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
      setIsSubmitButtonEnabled(false);
    }
  }

  async function clearForm() {
    setAmount(0);
    setSubmitError(null);
    setInvalidReasons([]);
  }

  const isFormValid = useMemo(() => {
    // convert the amount and remaining amount to cents to avoid floating point precision issues
    const toCents = (v) => Math.round(Number(v) * 100);
    const amountNum = Number(amount);
    const remainingNum = Number(invoice?.remaining_amount);
    const isAmountValid =
      Number.isFinite(amountNum) &&
      Number.isFinite(remainingNum) &&
      toCents(amountNum) > 0 &&
      toCents(amountNum) <= toCents(remainingNum);

    const reasons = [];
    if (!isAmountValid)
      reasons.push(
        'Amount must be a positive number and less than or equal to the outstanding amount'
      );
    setInvalidReasons(reasons);
    return isAmountValid;
  }, [amount, invoice?.remaining_amount]);

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
            <DialogTitle>Create Payment</DialogTitle>
            <DialogDescription>
              Create a new payment for the selected invoice.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="flex flex-col gap-4">
            <div className="flex flex-row gap-2">
              {/* Amount Input */}
              <Field>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
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
                <p className="text-sm text-gray-500">
                  Outstanding Amount:{' '}
                  {Number(invoice?.remaining_amount).toLocaleString()}{' '}
                  {invoice?.currency}
                </p>
              </Field>
              {/* Currency Select */}
              <Field>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  id="currency"
                  name="currency"
                  value={invoice?.currency || 'USD'}
                  disabled
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
                      Create Payment
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
                Create Payment
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
