import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  Appointment,
  AppointmentInput,
  DoctorProfile,
  PatientProfile,
  TimeSlot,
} from "../backend";
import { getClientSessionToken } from "../utils/clientSessionToken";
import { useActor } from "./useActor";

interface PatientProfileInput {
  name: string;
  phoneNumber: string;
  email: string;
}

// Helper to create consistent profile query key
function getProfileQueryKey(sessionToken: Uint8Array) {
  return ["currentPatientProfile", Array.from(sessionToken).join(",")];
}

// Helper to create consistent appointments query key
function getAppointmentsQueryKey(sessionToken: Uint8Array) {
  return ["patientAppointments", Array.from(sessionToken).join(",")];
}

// Patient Profile Queries
export function useGetCallerPatientProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const sessionToken = getClientSessionToken();

  const query = useQuery<PatientProfile | null>({
    queryKey: getProfileQueryKey(sessionToken),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        const profile = await actor.getCallerUserProfile(sessionToken);
        return profile;
      } catch (error: any) {
        if (error.message?.includes("does not exist")) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 0,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionToken = getClientSessionToken();

  return useMutation({
    mutationFn: async (profileInput: PatientProfileInput) => {
      if (!actor) throw new Error("Actor not available");

      await actor.saveCallerUserProfile(
        {
          name: profileInput.name,
          phoneNumber: profileInput.phoneNumber,
          email: profileInput.email,
        },
        sessionToken,
      );

      return profileInput;
    },
    onSuccess: async (profileInput) => {
      const profileKey = getProfileQueryKey(sessionToken);

      // Optimistically update the cache immediately
      queryClient.setQueryData<PatientProfile>(profileKey, {
        id: sessionToken,
        name: profileInput.name,
        phoneNumber: profileInput.phoneNumber,
        email: profileInput.email,
      });

      // Then invalidate and refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: profileKey });
      await queryClient.refetchQueries({ queryKey: profileKey });

      // Also invalidate appointments since they depend on profile
      const appointmentsKey = getAppointmentsQueryKey(sessionToken);
      queryClient.invalidateQueries({ queryKey: appointmentsKey });

      toast.success("Profile saved successfully!");
    },
    onError: (error: any) => {
      console.error("Profile save error:", error);
      if (!error.message?.includes("Unauthorized")) {
        toast.error(error.message || "Failed to save profile");
      }
    },
  });
}

export function useCreatePatientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionToken = getClientSessionToken();

  return useMutation({
    mutationFn: async (profileInput: PatientProfileInput) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createPatientProfile(
        profileInput.name,
        profileInput.phoneNumber,
        profileInput.email,
        sessionToken,
      );
      return profileInput;
    },
    onSuccess: async (profileInput) => {
      const profileKey = getProfileQueryKey(sessionToken);

      // Optimistically update the cache
      queryClient.setQueryData<PatientProfile>(profileKey, {
        id: sessionToken,
        name: profileInput.name,
        phoneNumber: profileInput.phoneNumber,
        email: profileInput.email,
      });

      await queryClient.invalidateQueries({ queryKey: profileKey });
      await queryClient.refetchQueries({ queryKey: profileKey });
      toast.success("Profile created successfully!");
    },
    onError: (error: any) => {
      if (!error.message?.includes("Unauthorized")) {
        toast.error(error.message || "Failed to create profile");
      }
    },
  });
}

export function useUpdatePatientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionToken = getClientSessionToken();

  return useMutation({
    mutationFn: async (profileInput: PatientProfileInput) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updatePatientProfile(
        profileInput.name,
        profileInput.phoneNumber,
        profileInput.email,
        sessionToken,
      );
      return profileInput;
    },
    onSuccess: async (profileInput) => {
      const profileKey = getProfileQueryKey(sessionToken);

      // Optimistically update the cache
      queryClient.setQueryData<PatientProfile>(profileKey, {
        id: sessionToken,
        name: profileInput.name,
        phoneNumber: profileInput.phoneNumber,
        email: profileInput.email,
      });

      await queryClient.invalidateQueries({ queryKey: profileKey });
      await queryClient.refetchQueries({ queryKey: profileKey });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      if (!error.message?.includes("Unauthorized")) {
        toast.error(error.message || "Failed to update profile");
      }
    },
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
        console.log("Initializing backend with doctor data...");
        await actor.system_install_was();
        hasInitialized.current = true;
        setInitComplete(true);
        console.log("Backend initialization complete");
      } catch (error) {
        console.error("Backend initialization error:", error);
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
    queryKey: ["doctors"],
    queryFn: async () => {
      if (!actor) {
        console.log("Actor not available for getAllDoctors");
        throw new Error("Actor not available");
      }
      try {
        console.log("Fetching all doctors...");
        const doctors = await actor.getAllDoctors();
        console.log("Doctors fetched:", doctors.length);
        return doctors;
      } catch (error) {
        console.error("Error fetching doctors:", error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && initComplete,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    ...query,
    isLoading: actorFetching || isInitializing || query.isLoading,
    isFetched: initComplete && query.isFetched,
  };
}

export function useGetDoctorById(doctorId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DoctorProfile | null>({
    queryKey: ["doctor", doctorId?.toString()],
    queryFn: async () => {
      if (!actor || !doctorId) return null;
      try {
        return await actor.getDoctorById(doctorId);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && doctorId !== null,
  });
}

export function useGetDoctorAvailability(doctorId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TimeSlot[]>({
    queryKey: ["doctorAvailability", doctorId?.toString()],
    queryFn: async () => {
      if (!actor || !doctorId) return [];
      try {
        return await actor.getDoctorAvailability(doctorId);
      } catch (error) {
        console.error("Error fetching doctor availability:", error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && doctorId !== null,
  });
}

// Appointment Queries
export function useGetPatientAppointments() {
  const { actor, isFetching: actorFetching } = useActor();
  const sessionToken = getClientSessionToken();

  return useQuery<Appointment[]>({
    queryKey: getAppointmentsQueryKey(sessionToken),
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPatientAppointments(sessionToken);
      } catch (error: any) {
        // Handle profile missing/incomplete error
        if (error.message?.includes("does not exist")) {
          console.log(
            "Patient profile does not exist, cannot fetch appointments",
          );
          return [];
        }
        if (error.message?.includes("Unauthorized")) {
          return [];
        }
        console.error("Error fetching appointments:", error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionToken = getClientSessionToken();

  return useMutation({
    mutationFn: async (appointmentInput: AppointmentInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.bookAppointment(appointmentInput, sessionToken);
    },
    onSuccess: () => {
      const appointmentsKey = getAppointmentsQueryKey(sessionToken);
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      queryClient.invalidateQueries({ queryKey: ["doctorAvailability"] });
      toast.success("Appointment booked successfully!");
    },
    onError: (error: any) => {
      console.error("Booking error:", error);
      if (error.message?.includes("does not exist")) {
        // Profile missing error - don't show toast, let UI handle it
        throw error;
      }
      if (!error.message?.includes("Unauthorized")) {
        toast.error(error.message || "Failed to book appointment");
      }
    },
  });
}

export function useRescheduleAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionToken = getClientSessionToken();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      newTimeSlot,
    }: { appointmentId: bigint; newTimeSlot: TimeSlot }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rescheduleAppointment(
        appointmentId,
        newTimeSlot,
        sessionToken,
      );
    },
    onSuccess: () => {
      const appointmentsKey = getAppointmentsQueryKey(sessionToken);
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      queryClient.invalidateQueries({ queryKey: ["doctorAvailability"] });
      toast.success("Appointment rescheduled successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reschedule appointment");
    },
  });
}

export function useCancelAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionToken = getClientSessionToken();

  return useMutation({
    mutationFn: async (appointmentId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelAppointment(appointmentId, sessionToken);
    },
    onSuccess: () => {
      const appointmentsKey = getAppointmentsQueryKey(sessionToken);
      queryClient.invalidateQueries({ queryKey: appointmentsKey });
      queryClient.invalidateQueries({ queryKey: ["doctorAvailability"] });
      toast.success("Appointment cancelled successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel appointment");
    },
  });
}

// Chatbot Query with timeout
const CHATBOT_TIMEOUT_MS = 12000; // 12 seconds

export function useAskChatbot() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (question: string) => {
      if (!actor) throw new Error("Actor not available");

      // Create a timeout promise that rejects after the specified time
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "Request timed out. The server took too long to respond. Please try again.",
            ),
          );
        }, CHATBOT_TIMEOUT_MS);
      });

      try {
        // Race the actual request against the timeout
        const response = await Promise.race([
          actor.askMedicalChatbot(question),
          timeoutPromise,
        ]);

        // Ensure we always return a non-empty string
        if (!response || response.trim().length === 0) {
          throw new Error("Empty response received");
        }

        return response;
      } catch (error: any) {
        console.error("Chatbot mutation error:", error);
        throw error;
      }
    },
    retry: false,
  });
}
