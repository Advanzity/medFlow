import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appointmentTypes } from '@/lib/appointment-types';
import { checkScheduleConflicts } from '@/app/actions/appointments';
import { useClinicStore } from '@/hooks/use-clinic';
import { addHours, addMinutes, format, parse, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SmartSchedulerProps {
  onSlotSelect: (startTime: Date, endTime: Date) => void;
}

const CLINIC_HOURS = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};

export function SmartScheduler({ onSlotSelect }: SmartSchedulerProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [appointmentTypeId, setAppointmentTypeId] = useState('');
  const [suggestions, setSuggestions] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { selectedClinic } = useClinicStore();

  // Reset validation error when inputs change
  useEffect(() => {
    setValidationError('');
  }, [date, time, appointmentTypeId]);

  const validateDateTime = (selectedDateTime: Date, duration: number) => {
    const now = new Date();
    const endTime = addMinutes(selectedDateTime, duration);
    const dayStart = setHours(setMinutes(selectedDateTime, 0), CLINIC_HOURS.start);
    const dayEnd = setHours(setMinutes(selectedDateTime, 0), CLINIC_HOURS.end);

    if (isBefore(selectedDateTime, now)) {
      return 'Cannot schedule appointments in the past';
    }

    if (isBefore(selectedDateTime, dayStart) || isAfter(selectedDateTime, dayEnd)) {
      return `Appointments must be between ${format(dayStart, 'h:mm a')} and ${format(dayEnd, 'h:mm a')}`;
    }

    if (isAfter(endTime, dayEnd)) {
      return 'Appointment duration exceeds clinic hours';
    }

    return '';
  };

  const generateAlternativeSlots = (selectedDateTime: Date, duration: number) => {
    const slots: Date[] = [];
    const dayStart = setHours(startOfDay(selectedDateTime), CLINIC_HOURS.start);
    const dayEnd = setHours(startOfDay(selectedDateTime), CLINIC_HOURS.end);

    // Try slots before the requested time
    for (let i = 1; i <= 3; i++) {
      const slot = addMinutes(selectedDateTime, -duration * i);
      if (!isBefore(slot, dayStart)) {
        slots.push(slot);
      }
    }

    // Try slots after the requested time
    for (let i = 1; i <= 3; i++) {
      const slot = addMinutes(selectedDateTime, duration * i);
      if (!isAfter(addMinutes(slot, duration), dayEnd)) {
        slots.push(slot);
      }
    }

    // Try the next day if not enough slots found
    if (slots.length < 3) {
      const nextDayStart = addHours(dayStart, 24);
      slots.push(nextDayStart);
    }

    return slots.slice(0, 5); // Return max 5 alternatives
  };

  const findAvailableSlots = async () => {
    if (!date || !time || !appointmentTypeId || !selectedClinic) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setValidationError('');
    
    try {
      const selectedDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
      const appointmentType = appointmentTypes.find(t => t.id === appointmentTypeId);
      
      if (!appointmentType) {
        toast.error('Invalid appointment type');
        return;
      }

      // Validate date and time
      const validationError = validateDateTime(selectedDateTime, appointmentType.duration);
      if (validationError) {
        setValidationError(validationError);
        return;
      }

      const endTime = addMinutes(selectedDateTime, appointmentType.duration);
      
      // Check for conflicts
      const result = await checkScheduleConflicts({
        startTime: selectedDateTime,
        endTime,
        vetId: 'any',
        clinicId: selectedClinic.id
      });

      console.log(result)

      if (result.success) {
        if (result.hasConflicts) {
          // Generate smarter alternative slots
          const alternatives = generateAlternativeSlots(selectedDateTime, appointmentType.duration);
          
          // Verify each alternative slot
          const validSlots: Date[] = [];
          for (const slot of alternatives) {
            const slotEnd = addMinutes(slot, appointmentType.duration);
            const slotCheck = await checkScheduleConflicts({
              startTime: slot,
              endTime: slotEnd,
              vetId: 'any',
              clinicId: selectedClinic.id
            });
            
            if (slotCheck.success && !slotCheck.hasConflicts) {
              validSlots.push(slot);
            }
          }
          
          setSuggestions(validSlots);
          toast.info('Original time slot is not available. Here are some alternatives.');
        } else {
          onSlotSelect(selectedDateTime, endTime);
          setSuggestions([]);
          toast.success('Time slot is available!');
        }
      } else {
        toast.error('Failed to check schedule');
      }
    } catch (error) {
      toast.error('Error checking schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Smart Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step="900" // 15-minute intervals
          />
        </div>

        <Select value={appointmentTypeId} onValueChange={setAppointmentTypeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select appointment type" />
          </SelectTrigger>
          <SelectContent>
            {appointmentTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name} ({type.duration} mins)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={findAvailableSlots} 
          disabled={isLoading || !date || !time || !appointmentTypeId}
          className="w-full"
        >
          {isLoading ? 'Checking...' : 'Find Available Slots'}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Alternative time slots:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((slot, i) => {
                const appointmentType = appointmentTypes.find(t => t.id === appointmentTypeId);
                const endTime = addMinutes(slot, appointmentType?.duration || 30);
                
                return (
                  <Button
                    key={i}
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      onSlotSelect(slot, endTime);
                      setSuggestions([]);
                    }}
                  >
                    <Clock className="h-4 w-4" />
                    {format(slot, 'MMM d, h:mm a')}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SmartScheduler;