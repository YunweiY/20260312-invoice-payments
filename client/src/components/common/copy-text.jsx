import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function CopyText({ text }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <span className="font-medium">{text}</span>

      {/* need to prevent the click event from bubbling up to the parent table row */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleCopy();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="rounded hover:bg-muted"
      >
        <Copy className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
