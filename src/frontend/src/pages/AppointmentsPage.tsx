import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type Appointment,
  AppointmentStatus,
  Specialization,
} from "../backend";
import AppointmentActionModal from "../components/AppointmentActionModal";
import {
  useGetAllDoctors,
  useGetCallerPatientProfile,
  useGetPatientAppointments,
} from "../hooks/useQueries";

const specializationLabels: Record<Specialization, string> = {
  [Specialization.cardiology]: "Cardiology",
  [Specialization.neurology]: "Neurology",
  [Specialization.pediatrics]: "Pediatrics",
  [Specialization.orthopedics]: "Orthopedics",
  [Specialization.dermatology]: "Dermatology",
  [Specialization.gynecology]: "Gynecology",
  [Specialization.ophthalmology]: "Ophthalmology",
  [Specialization.generalPractice]: "General Practice",
  [Specialization.internalMedicine]: "Internal Medicine",
  [Specialization.dentistry]: "Dentistry",
  [Specialization.generalSpecialist]: "General Specialist",
};

type Page = "home" | "doctors" | "appointments" | "profile";

interface AppointmentsPageProps {
  onNavigate?: (page: Page) => void;
}

export default function AppointmentsPage({
  onNavigate,
}: AppointmentsPageProps) {
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerPatientProfile();
  const { data: appointments = [], isLoading: appointmentsLoading } =
    useGetPatientAppointments();
  const { data: doctors = [], isLoading: doctorsLoading } = useGetAllDoctors();
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const isLoading = profileLoading || appointmentsLoading || doctorsLoading;
  const isProfileIncomplete =
    !userProfile ||
    !userProfile.name ||
    !userProfile.phoneNumber ||
    !userProfile.email;

  useEffect(() => {
    console.log("Appointments:", appointments);
    console.log("Doctors:", doctors);
    console.log("Profile:", userProfile);
  }, [appointments, doctors, userProfile]);

  const upcomingAppointments = appointments.filter(
    (apt) =>
      apt.status === AppointmentStatus.booked ||
      apt.status === AppointmentStatus.rescheduled,
  );

  const historyAppointments = appointments.filter(
    (apt) => apt.status === AppointmentStatus.cancelled,
  );

  const getDoctorInfo = (doctorId: bigint) => {
    return doctors.find((doc) => doc.id === doctorId);
  };

  const handleGoToProfile = () => {
    if (onNavigate) {
      onNavigate("profile");
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const doctor = getDoctorInfo(appointment.doctorId);

    if (!doctor) {
      return (
        <div key={appointment.id.toString()} className="border rounded-lg p-4">
          <div className="mb-3">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <div key={appointment.id.toString()} className="border rounded-lg p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg">{doctor.name}</h3>
          <p className="text-sm text-muted-foreground">
            {specializationLabels[doctor.specialization]}
          </p>
          <div className="mt-2 space-y-1">
            <div className="text-sm">
              <span className="font-medium">Date: </span>
              <span className="text-muted-foreground">
                {appointment.timeSlot.day}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Time: </span>
              <span className="text-muted-foreground">
                {appointment.timeSlot.startTime} -{" "}
                {appointment.timeSlot.endTime}
              </span>
            </div>
          </div>
          {appointment.status === AppointmentStatus.rescheduled && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Rescheduled
              </span>
            </div>
          )}
          {appointment.status === AppointmentStatus.cancelled && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                Cancelled
              </span>
            </div>
          )}
        </div>
        {appointment.status !== AppointmentStatus.cancelled && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedAppointment(appointment)}
          >
            Manage Appointment
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your appointments
        </p>
      </div>

      {profileFetched && isProfileIncomplete && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete your profile to view and book appointments.
            <Button
              variant="link"
              className="p-0 h-auto font-semibold ml-1"
              onClick={handleGoToProfile}
            >
              Go to Profile
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({historyAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(renderAppointmentCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historyAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No appointment history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyAppointments.map(renderAppointmentCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {selectedAppointment && (
        <AppointmentActionModal
          appointment={selectedAppointment}
          doctorName={
            getDoctorInfo(selectedAppointment.doctorId)?.name || "Unknown"
          }
          doctorSpecialization={
            getDoctorInfo(selectedAppointment.doctorId)?.specialization ||
            Specialization.generalPractice
          }
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}
