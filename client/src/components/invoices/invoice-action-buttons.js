import { CheckIcon, TrashIcon } from 'lucide-react';

export function getInvoiceActionButtonTypes(invoice, onStatusUpdate) {
  if (invoice.status === 'DRAFT') {
    return [
      {
        type: 'confirm',
        label: 'Confirm',
        icon: <CheckIcon />,
        variant: 'default',
        onClick: async () => onStatusUpdate(invoice.id, 'PENDING'),
      },
      {
        type: 'void',
        label: 'Void',
        icon: <TrashIcon />,
        variant: 'destructive',
        onClick: async () => onStatusUpdate(invoice.id, 'VOID'),
      },
    ];
  }

  if (invoice.status === 'PENDING' && (invoice._count?.payments ?? 0) === 0) {
    return [
      {
        type: 'void',
        label: 'Void',
        icon: <TrashIcon />,
        variant: 'destructive',
        onClick: async () => onStatusUpdate(invoice.id, 'VOID'),
      },
    ];
  }

  return [];
}
