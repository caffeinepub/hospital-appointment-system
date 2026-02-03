import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  PatientProfile,
  DoctorProfile,
  Appointment,
  AppointmentInput,
  TimeSlot
} from '../backend';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';

interface PatientProfileInput {
  name: string;
  phoneNumber: string;
  email: string;
}

// Patient Profile Queries
export function useGetCallerPatientProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<PatientProfile | null>({
    queryKey: ['currentPatientProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const profile = await actor.getCallerUserProfile();
        return profile;
      } catch (error: any) {
        if (error.message?.includes('does not exist')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 0
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileInput: PatientProfileInput) => {
      if (!actor) throw new Error('Actor not available');
      
      await actor.saveCallerUserProfile({
        name: profileInput.name,
        phoneNumber: profileInput.phoneNumber,
        email: profileInput.email
      });
    },
    onSuccess: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await queryClient.invalidateQueries({ queryKey: ['currentPatientProfile'] });
      await queryClient.refetchQueries({ queryKey: ['currentPatientProfile'] });
      
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      
      toast.success('Profile saved successfully!');
    },
    onError: (error: any) => {
      console.error('Profile save error:', error);
      toast.error(error.message || 'Failed to save profile');
    }
  });
}

export function useCreatePatientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileInput: PatientProfileInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPatientProfile(
        profileInput.name,
        profileInput.phoneNumber,
        profileInput.email
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentPatientProfile'] });
      await queryClient.refetchQueries({ queryKey: ['currentPatientProfile'] });
      toast.success('Profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create profile');
    }
  });
}

export function useUpdatePatientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileInput: PatientProfileInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePatientProfile(
        profileInput.name,
        profileInput.phoneNumber,
        profileInput.email
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentPatientProfile'] });
      await queryClient.refetchQueries({ queryKey: ['currentPatientProfile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });
}

// Backend initialization hook with state tracking
export function useInitializeBackend() {
  const { actor } = useActor();
  const hasInitialized = useRef(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    const initializeBackend = async () => {
      if (!actor || hasInitialized.current || initComplete) return;
      
      setIsInitializing(true);
      try {
        console.log('Initializing backend with doctor data...');
        await actor.system_install_was();
        hasInitialized.current = true;
        setInitComplete(true);
        console.log('Backend initialization complete');
      } catch (error) {
        console.error('Backend initialization error:', error);
        // Don't block on initialization errors - backend may already be initialized
        setInitComplete(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeBackend();
  }, [actor, initComplete]);

  return { isInitializing, initComplete };
}

// Doctor Queries
export function useGetAllDoctors() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing, initComplete } = useInitializeBackend();

  const query = useQuery<DoctorProfile[]>({
    queryKey: ['doctors'],
    queryFn: async () => {
      if (!actor) {
        console.log('Actor not available for getAllDoctors');
        throw new Error('Actor not available');
      }
      try {
        console.log('Fetching all doctors...');
        const doctors = await actor.getAllDoctors();
        console.log('Doctors fetched:', doctors.length);
        return doctors;
      } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && initComplete,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  return {
    ...query,
    isLoading: actorFetching || isInitializing || query.isLoading,
    isFetched: initComplete && query.isFetched
  };
}

export function useGetDoctorById(doctorId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DoctorProfile | null>({
    queryKey: ['doctor', doctorId?.toString()],
    queryFn: async () => {
      if (!actor || !doctorId) return null;
      try {
        return await actor.getDoctorById(doctorId);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && doctorId !== null
  });
}

export function useGetDoctorAvailability(doctorId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TimeSlot[]>({
    queryKey: ['doctorAvailability', doctorId?.toString()],
    queryFn: async () => {
      if (!actor || !doctorId) return [];
      try {
        return await actor.getDoctorAvailability(doctorId);
      } catch (error) {
        console.error('Error fetching doctor availability:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && doctorId !== null
  });
}

// Appointment Queries
export function useGetPatientAppointments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['patientAppointments'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPatientAppointments();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        console.error('Error fetching appointments:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentInput: AppointmentInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookAppointment(appointmentInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] });
      toast.success('Appointment booked successfully!');
    },
    onError: (error: any) => {
      if (!error.message?.includes('Unauthorized')) {
        toast.error(error.message || 'Failed to book appointment');
      }
    }
  });
}

export function useRescheduleAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, newTimeSlot }: { appointmentId: bigint; newTimeSlot: TimeSlot }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rescheduleAppointment(appointmentId, newTimeSlot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] });
      toast.success('Appointment rescheduled successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reschedule appointment');
    }
  });
}

export function useCancelAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelAppointment(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] });
      toast.success('Appointment cancelled successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel appointment');
    }
  });
}

// Chatbot Query
export function useAskChatbot() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (question: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        const response = await actor.askMedicalChatbot(question);
        return response;
      } catch (error: any) {
        console.error('Chatbot mutation error:', error);
        throw error;
      }
    },
    retry: false
  });
}
