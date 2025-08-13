
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./input";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  disabled?: React.ComponentProps<typeof Calendar>['disabled'];
}

export function DateTimePicker({ date, setDate, disabled }: DateTimePickerProps) {
  const [time, setTime] = React.useState(format(date, "HH:mm"));

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    const [hours, minutes] = time.split(":").map(Number);
    newDate.setHours(hours, minutes);
    setDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    const [hours, minutes] = newTime.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      setDate(newDate);
    }
  };

  React.useEffect(() => {
    setTime(format(date, "HH:mm"));
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>Seleccionar fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          disabled={disabled}
          initialFocus
        />
        <div className="p-3 border-t border-border">
            <Input type="time" value={time} onChange={handleTimeChange} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
