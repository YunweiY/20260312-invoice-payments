import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SimpleSheet({
  maxWidth = '1200px',
  title,
  description,
  children,
  open,
  setOpen,
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* SheetContent is written to be w-3/4 by default, so we need to override it */}
      <SheetContent
        side="right"
        className={`data-[side=right]:w-[90vw] data-[side=right]:sm:max-w-[${maxWidth}]`}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
