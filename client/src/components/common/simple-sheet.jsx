import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

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
        {children}
      </SheetContent>
    </Sheet>
  );
}
