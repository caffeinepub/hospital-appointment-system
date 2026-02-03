import { useState } from 'react';
import { useGetDoctorAvailability, useBookAppointment, useGetCallerPatientProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { type DoctorProfile, type TimeSlot, Specialization } from '../backend';

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

interface BookingModalProps {
  doctor: DoctorProfile;
  onClose: () => void;
  onProfileRequired?: () => void;
}

export default function BookingModal({ doctor, onClose, onProfileRequired }: BookingModalProps) {
  const { data: availableSlots = [], isLoading } = useGetDoctorAvailability(doctor.id);
  const { data: userProfile } = useGetCallerPatientProfile();
  const bookAppointment = useBookAppointment();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [authError, setAuthError] = useState(false);

  const handleBook = async () => {
    if (!selectedSlot) return;

    try {
      setAuthError(false);
      await bookAppointment.mutateAsync({
        doctorId: doctor.id,
        timeSlot: selectedSlot
      });
      onClose();
    } catch (error: any) {
      if (error.message?.includes('Unauthorized')) {
        setAuthError(true);
      }
    }
  };

  const handleProfileSetup = () => {
    onClose();
    if (onProfileRequired) {
      onProfileRequired();
    }
  };

  // Check if profile is incomplete
  const isProfileIncomplete = !userProfile || !userProfile.name || !userProfile.phoneNumber || !userProfile.email;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>Select an available time slot</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please complete your profile before booking appointments.
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold ml-1"
                  onClick={handleProfileSetup}
                >
                  Go to Profile
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isProfileIncomplete && !authError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your profile is complete before booking.
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold ml-1"
                  onClick={handleProfileSetup}
                >
                  Complete Profile
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">{doctor.name}</h3>
            <p className="text-sm text-muted-foreground">
              {specializationLabels[doctor.specialization]}
            </p>
            <p className="text-sm text-muted-foreground">
              {doctor.experienceYears.toString()} years experience
            </p>
          </div>

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
              onClick={handleBook}
              disabled={!selectedSlot || bookAppointment.isPending}
              className="flex-1"
            >
              {bookAppointment.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
