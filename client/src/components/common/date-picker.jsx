import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';

export function DatePicker({ value, setValue, minDate, maxDate }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-36 justify-start font-normal"
        >
          {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={value}
          onSelect={setValue}
          defaultMonth={value}
          captionLayout="dropdown"
          disabled={(date) => {
            if (minDate && date < new Date(minDate)) return true;
            if (maxDate && date > new Date(maxDate)) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
