import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimeSlot {
    day: string;
    startTime: string;
    endTime: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface DoctorProfile {
    id: bigint;
    name: string;
    experienceYears: bigint;
    availableSlots: Array<TimeSlot>;
    specialization: Specialization;
    hospitalName: string;
}
export interface AppointmentInput {
    doctorId: bigint;
    timeSlot: TimeSlot;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PatientProfile {
    id: Uint8Array;
    name: string;
    email: string;
    phoneNumber: string;
}
export interface Appointment {
    id: bigint;
    status: AppointmentStatus;
    doctorId: bigint;
    patientId: Uint8Array;
    createdAt: Time;
    timeSlot: TimeSlot;
}
export interface UserProfileInput {
    name: string;
    email: string;
    phoneNumber: string;
}
export enum AppointmentStatus {
    cancelled = "cancelled",
    rescheduled = "rescheduled",
    booked = "booked"
}
export enum Specialization {
    ophthalmology = "ophthalmology",
    cardiology = "cardiology",
    internalMedicine = "internalMedicine",
    generalPractice = "generalPractice",
    orthopedics = "orthopedics",
    pediatrics = "pediatrics",
    dermatology = "dermatology",
    generalSpecialist = "generalSpecialist",
    gynecology = "gynecology",
    dentistry = "dentistry",
    neurology = "neurology"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    askMedicalChatbot(question: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(appointmentInput: AppointmentInput, clientSessionToken: Uint8Array): Promise<bigint>;
    cancelAppointment(appointmentId: bigint, clientSessionToken: Uint8Array): Promise<void>;
    createPatientProfile(name: string, phoneNumber: string, email: string, clientSessionToken: Uint8Array): Promise<void>;
    getAllDoctors(): Promise<Array<DoctorProfile>>;
    getCallerPatientProfile(clientSessionToken: Uint8Array): Promise<PatientProfile>;
    getCallerUserProfile(clientSessionToken: Uint8Array): Promise<PatientProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDoctorAvailability(doctorId: bigint): Promise<Array<TimeSlot>>;
    getDoctorById(doctorId: bigint): Promise<DoctorProfile>;
    getPatientAppointments(clientSessionToken: Uint8Array): Promise<Array<Appointment>>;
    getPatientProfile(clientSessionToken: Uint8Array): Promise<PatientProfile>;
    getUserProfile(clientSessionToken: Uint8Array): Promise<PatientProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rescheduleAppointment(appointmentId: bigint, newTimeSlot: TimeSlot, clientSessionToken: Uint8Array): Promise<void>;
    runScheduledNotifications(): Promise<void>;
    saveCallerUserProfile(profile: UserProfileInput, clientSessionToken: Uint8Array): Promise<void>;
    system_install_was(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePatientProfile(name: string, phoneNumber: string, email: string, clientSessionToken: Uint8Array): Promise<void>;
}
