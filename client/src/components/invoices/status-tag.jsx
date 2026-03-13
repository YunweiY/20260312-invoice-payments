import { Badge } from '@/components/ui/badge';

export const statusTag = (status) => {
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
