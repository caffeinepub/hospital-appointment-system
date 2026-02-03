import { useState } from 'react';
import { useGetDoctorAvailability, useRescheduleAppointment, useCancelAppointment } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Appointment, type TimeSlot, Specialization } from '../backend';

const specializationLabels: Record<Specialization, string> = {
  [Specialization.cardiology]: 'Cardiology',
  [Specialization.neurology]: 'Neurology',
  [Specialization.pediatrics]: 'Pediatrics',
  [Specialization.orthopedics]: 'Orthopedics',
  [Specialization.dermatology]: 'Dermatology',
  [Specialization.gynecology]: 'Gynecology',
  [Specialization.ophthalmology]: 'Ophthalmology',
  [Specialization.generalPractice]: 'General Practice',
  [Specialization.internalMedicine]: 'Internal Medicine',
  [Specialization.generalSpecialist]: 'General Specialist'
};

interface AppointmentActionModalProps {
  appointment: Appointment;
  doctorName: string;
  doctorSpecialization: Specialization;
  onClose: () => void;
}

export default function AppointmentActionModal({
  appointment,
  doctorName,
  doctorSpecialization,
  onClose
}: AppointmentActionModalProps) {
  const { data: availableSlots = [], isLoading } = useGetDoctorAvailability(appointment.doctorId);
  const rescheduleAppointment = useRescheduleAppointment();
  const cancelAppointment = useCancelAppointment();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const handleReschedule = async () => {
    if (!selectedSlot) return;

    await rescheduleAppointment.mutateAsync({
      appointmentId: appointment.id,
      newTimeSlot: selectedSlot
    });

    onClose();
  };

  const handleCancel = async () => {
    await cancelAppointment.mutateAsync(appointment.id);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Appointment</DialogTitle>
          <DialogDescription>Reschedule or cancel your appointment</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">{doctorName}</h3>
            <p className="text-sm text-muted-foreground">
              {specializationLabels[doctorSpecialization]}
            </p>
            <div className="mt-2 text-sm">
              <div className="font-medium">{appointment.timeSlot.day}</div>
              <div className="text-muted-foreground">
                {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
              </div>
            </div>
          </div>

          <Tabs defaultValue="reschedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reschedule">Reschedule</TabsTrigger>
              <TabsTrigger value="cancel">Cancel</TabsTrigger>
            </TabsList>

            <TabsContent value="reschedule" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Available Time Slots</h4>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No available slots</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64 pr-4">
                    <div className="space-y-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full p-3 rounded-lg border text-left ${
                            selectedSlot === slot
                              ? 'border-primary bg-accent'
                              : 'border-border hover:bg-accent'
                          }`}
                        >
                          <div className="font-medium text-sm">{slot.day}</div>
                          <div className="text-xs text-muted-foreground">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleReschedule}
                  disabled={!selectedSlot || rescheduleAppointment.isPending}
                  className="flex-1"
                >
                  {rescheduleAppointment.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Rescheduling...
                    </>
                  ) : (
                    'Confirm Reschedule'
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cancel" className="space-y-4">
              <div className="border rounded-lg p-4 bg-destructive/10">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Keep Appointment
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelAppointment.isPending}
                  className="flex-1"
                >
                  {cancelAppointment.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Appointment'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
