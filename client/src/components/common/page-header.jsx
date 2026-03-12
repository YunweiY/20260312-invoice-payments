import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function PageHeader({
  title,
  enableButton = false,
  buttonIcon,
  buttonText,
  buttonOnClick,
}) {
  return (
    <div className="flex w-full items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      {enableButton && (
        <div className="flex items-center gap-2">
          <Button onClick={buttonOnClick}>
            {buttonIcon && <span>{buttonIcon}</span>}
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
}
