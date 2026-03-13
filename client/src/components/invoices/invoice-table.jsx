import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { CopyText } from '@/components/common/copy-text';
import { statusTag } from '@/components/invoices/status-tag';
import { formatAmount } from '@/lib/utils';

export function InvoiceTable({
  invoices,
  showCustomer = false,
  showActions = false,
  rowClassName = 'h-12',
  headerClassName,
  onRowClick,
  renderActions,
}) {
  return (
    <Table>
      <TableHeader className={headerClassName}>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          {showCustomer && <TableHead>Customer</TableHead>}
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Issued At</TableHead>
          <TableHead>Due At</TableHead>
          {showActions && <TableHead className="w-32">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            className={rowClassName}
            key={invoice.id}
            onClick={onRowClick ? () => onRowClick(invoice) : undefined}
          >
            <TableCell>
              <CopyText text={invoice.id} />
            </TableCell>
            {showCustomer && <TableCell>{invoice.customer?.name}</TableCell>}
            <TableCell>
              {formatAmount(invoice.amount)} {invoice.currency}
            </TableCell>
            <TableCell>{statusTag(invoice.status)}</TableCell>
            <TableCell>{new Date(invoice.issued_at).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(invoice.due_at).toLocaleDateString()}</TableCell>
            {showActions && (
              <TableCell
                onClick={onRowClick ? (e) => e.stopPropagation() : undefined}
                onPointerDown={onRowClick ? (e) => e.stopPropagation() : undefined}
              >
                {renderActions ? renderActions(invoice) : null}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
