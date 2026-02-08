import { Clock8Icon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TimerPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
}

const TimerPicker = ({ value, onChange, id }: TimerPickerProps) => {
  // Parse the time value (HH:MM format or HH:MM:SS)
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { hour: '12', minute: '00', period: 'AM' };
    
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour24 = parseInt(hourStr, 10);
    const minute = minuteStr || '00';
    
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    
    return {
      hour: hour12.toString().padStart(2, '0'),
      minute: minute.padStart(2, '0'),
      period,
    };
  };

  // Convert 12-hour format to 24-hour format (HH:MM)
  const formatTime = (hour: string, minute: string, period: string) => {
    let hour24 = parseInt(hour, 10);
    
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  const { hour, minute, period } = parseTime(value);

  const handleHourChange = (newHour: string) => {
    onChange?.(formatTime(newHour, minute, period));
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange?.(formatTime(hour, newMinute, period));
  };

  const handlePeriodChange = (newPeriod: string) => {
    onChange?.(formatTime(hour, minute, newPeriod));
  };

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  
  // Generate minute options (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div id={id} className='relative w-full flex items-center gap-2'>
      <div className='text-muted-foreground flex items-center justify-center'>
        <Clock8Icon className='size-4' />
      </div>
      
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="h-11 rounded-xl border-border/40 bg-muted/30 focus:bg-muted/50 transition-all font-medium w-[80px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="z-[110]">
          <ScrollArea className="h-72">
            {hours.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>

      <span className="text-muted-foreground font-bold">:</span>

      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="h-11 rounded-xl border-border/40 bg-muted/30 focus:bg-muted/50 transition-all font-medium w-[80px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="z-[110] max-h-[300px]">
          <ScrollArea className="h-72">
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="h-11 rounded-xl border-border/40 bg-muted/30 focus:bg-muted/50 transition-all font-medium w-[80px]">
          <SelectValue placeholder="AM" />
        </SelectTrigger>
        <SelectContent className="z-[110]">
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default TimerPicker
