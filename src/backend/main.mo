import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Char "mo:core/Char";
import Migration "migration";

(with migration = Migration.run)
actor {
  // VARIABLES
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextDoctorId = 0;

  // TYPES

  type Specialization = {
    #cardiology;
    #neurology;
    #pediatrics;
    #orthopedics;
    #dermatology;
    #gynecology;
    #ophthalmology;
    #generalPractice;
    #internalMedicine;
    #generalSpecialist;
  };

  type TimeSlot = {
    day : Text;
    startTime : Text;
    endTime : Text;
  };

  type DoctorProfile = {
    id : Nat;
    name : Text;
    specialization : Specialization;
    experienceYears : Nat;
    availableSlots : [TimeSlot];
    hospitalName : Text;
  };

  module DoctorProfile {
    public func compare(profile1 : DoctorProfile, profile2 : DoctorProfile) : Order.Order {
      Nat.compare(profile1.id, profile2.id); // Compare by id for consistency
    };
  };

  type PatientProfile = {
    id : Principal;
    name : Text;
    phoneNumber : Text;
    email : Text;
  };

  module PatientProfile {
    public func compare(profile1 : PatientProfile, profile2 : PatientProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name); // Compare by name
    };
  };

  type Appointment = {
    id : Nat;
    patientId : Principal;
    doctorId : Nat;
    timeSlot : TimeSlot;
    createdAt : Time.Time;
    status : AppointmentStatus;
  };

  type AppointmentStatus = { #booked; #rescheduled; #cancelled };

  type UserProfileInput = {
    name : Text;
    phoneNumber : Text;
    email : Text;
  };

  let doctorProfiles = Map.empty<Nat, DoctorProfile>();
  let patientProfiles = Map.empty<Principal, PatientProfile>();
  let appointments = Map.empty<Nat, Appointment>();
  var nextAppointmentId = 1;

  // List of hospital names
  let hospitalNames = [
    "City Care Hospital",
    "Sunrise Medical Center",
    "Green Valley Clinic",
    "Lakeview Medical Plaza",
    "Pinecrest Health Center",
    "Horizon Hospital",
    "Maplewood Medical Group",
    "Riverbend Health Center",
    "Summit Healthcare",
    "Parkside Hospital"
  ];

  // Initialize 20 doctor profiles on system startup
  private func initializeDoctors() {
    let doctorsList = List.empty<DoctorProfile>();

    // Helper function to get hospital name by index (cycle if needed)
    func getHospitalName(index : Nat) : Text {
      let hospitalCount = hospitalNames.size();
      let hospitalIndex = index % hospitalCount;
      hospitalNames[hospitalIndex];
    };

    // Cardiology (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. John Smith";
      specialization = #cardiology;
      experienceYears = 12;
      availableSlots = [
        { day = "Monday"; startTime = "09:00"; endTime = "10:00" },
        { day = "Wednesday"; startTime = "14:00"; endTime = "15:00" },
        { day = "Friday"; startTime = "11:00"; endTime = "12:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Sarah Johnson";
      specialization = #cardiology;
      experienceYears = 8;
      availableSlots = [
        { day = "Tuesday"; startTime = "10:00"; endTime = "11:00" },
        { day = "Thursday"; startTime = "15:00"; endTime = "16:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Neurology (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Michael Chen";
      specialization = #neurology;
      experienceYears = 15;
      availableSlots = [
        { day = "Monday"; startTime = "14:00"; endTime = "15:00" },
        { day = "Wednesday"; startTime = "10:00"; endTime = "11:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Emily Rodriguez";
      specialization = #neurology;
      experienceYears = 10;
      availableSlots = [
        { day = "Tuesday"; startTime = "09:00"; endTime = "10:00" },
        { day = "Thursday"; startTime = "13:00"; endTime = "14:00" },
        { day = "Friday"; startTime = "14:00"; endTime = "15:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Pediatrics (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. David Williams";
      specialization = #pediatrics;
      experienceYears = 9;
      availableSlots = [
        { day = "Monday"; startTime = "11:00"; endTime = "12:00" },
        { day = "Wednesday"; startTime = "16:00"; endTime = "17:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Lisa Anderson";
      specialization = #pediatrics;
      experienceYears = 7;
      availableSlots = [
        { day = "Tuesday"; startTime = "14:00"; endTime = "15:00" },
        { day = "Thursday"; startTime = "10:00"; endTime = "11:00" },
        { day = "Friday"; startTime = "09:00"; endTime = "10:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Orthopedics (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Robert Taylor";
      specialization = #orthopedics;
      experienceYears = 13;
      availableSlots = [
        { day = "Monday"; startTime = "15:00"; endTime = "16:00" },
        { day = "Wednesday"; startTime = "09:00"; endTime = "10:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Jennifer Martinez";
      specialization = #orthopedics;
      experienceYears = 11;
      availableSlots = [
        { day = "Tuesday"; startTime = "11:00"; endTime = "12:00" },
        { day = "Thursday"; startTime = "14:00"; endTime = "15:00" },
        { day = "Friday"; startTime = "10:00"; endTime = "11:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Dermatology (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. James Brown";
      specialization = #dermatology;
      experienceYears = 6;
      availableSlots = [
        { day = "Monday"; startTime = "10:00"; endTime = "11:00" },
        { day = "Wednesday"; startTime = "13:00"; endTime = "14:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Patricia Davis";
      specialization = #dermatology;
      experienceYears = 8;
      availableSlots = [
        { day = "Tuesday"; startTime = "15:00"; endTime = "16:00" },
        { day = "Thursday"; startTime = "09:00"; endTime = "10:00" },
        { day = "Friday"; startTime = "13:00"; endTime = "14:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Gynecology (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Christopher Wilson";
      specialization = #gynecology;
      experienceYears = 14;
      availableSlots = [
        { day = "Monday"; startTime = "13:00"; endTime = "14:00" },
        { day = "Wednesday"; startTime = "11:00"; endTime = "12:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Barbara Moore";
      specialization = #gynecology;
      experienceYears = 10;
      availableSlots = [
        { day = "Tuesday"; startTime = "13:00"; endTime = "14:00" },
        { day = "Thursday"; startTime = "11:00"; endTime = "12:00" },
        { day = "Friday"; startTime = "15:00"; endTime = "16:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Ophthalmology (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Daniel Garcia";
      specialization = #ophthalmology;
      experienceYears = 9;
      availableSlots = [
        { day = "Monday"; startTime = "16:00"; endTime = "17:00" },
        { day = "Wednesday"; startTime = "15:00"; endTime = "16:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Nancy Thomas";
      specialization = #ophthalmology;
      experienceYears = 7;
      availableSlots = [
        { day = "Tuesday"; startTime = "16:00"; endTime = "17:00" },
        { day = "Thursday"; startTime = "16:00"; endTime = "17:00" },
        { day = "Friday"; startTime = "16:00"; endTime = "17:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // General Practice (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Matthew Jackson";
      specialization = #generalPractice;
      experienceYears = 11;
      availableSlots = [
        { day = "Monday"; startTime = "08:00"; endTime = "09:00" },
        { day = "Wednesday"; startTime = "08:00"; endTime = "09:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Karen White";
      specialization = #generalPractice;
      experienceYears = 6;
      availableSlots = [
        { day = "Tuesday"; startTime = "08:00"; endTime = "09:00" },
        { day = "Thursday"; startTime = "08:00"; endTime = "09:00" },
        { day = "Friday"; startTime = "08:00"; endTime = "09:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Internal Medicine (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Steven Harris";
      specialization = #internalMedicine;
      experienceYears = 12;
      availableSlots = [
        { day = "Monday"; startTime = "12:00"; endTime = "13:00" },
        { day = "Wednesday"; startTime = "12:00"; endTime = "13:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Susan Martin";
      specialization = #internalMedicine;
      experienceYears = 8;
      availableSlots = [
        { day = "Tuesday"; startTime = "12:00"; endTime = "13:00" },
        { day = "Thursday"; startTime = "12:00"; endTime = "13:00" },
        { day = "Friday"; startTime = "12:00"; endTime = "13:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // General Specialist (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Paul Thompson";
      specialization = #generalSpecialist;
      experienceYears = 10;
      availableSlots = [
        { day = "Monday"; startTime = "17:00"; endTime = "18:00" },
        { day = "Wednesday"; startTime = "17:00"; endTime = "18:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Betty Lee";
      specialization = #generalSpecialist;
      experienceYears = 5;
      availableSlots = [
        { day = "Tuesday"; startTime = "17:00"; endTime = "18:00" },
        { day = "Thursday"; startTime = "17:00"; endTime = "18:00" },
        { day = "Friday"; startTime = "17:00"; endTime = "18:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Convert list to array and store in Map
    let doctorsArray = doctorsList.toArray();
    for (doctor in doctorsArray.values()) {
      doctorProfiles.add(doctor.id, doctor);
    };
  };

  system func preupgrade() {};
  system func postupgrade() { initializeDoctors() };

  // AUTHENTICATION & PROFILE MANAGEMENT
  // Only users can create, view, and manage profiles and appointments (not for anonymous users)

  public shared ({ caller }) func system_install_was() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize the system");
    };
    initializeDoctors();
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfileInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (profile.name.size() == 0 or profile.phoneNumber.size() == 0 or profile.email.size() == 0) {
      Runtime.trap("Invalid profile data: name, phone, and email are required");
    };

    patientProfiles.add(
      caller,
      {
        id = caller;
        name = profile.name;
        phoneNumber = profile.phoneNumber;
        email = profile.email;
      },
    );
  };

  public shared ({ caller }) func createPatientProfile(
    name : Text,
    phoneNumber : Text,
    email : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    if (name.size() == 0 or phoneNumber.size() == 0 or email.size() == 0) {
      Runtime.trap("Invalid profile data: name, phone, and email are required");
    };

    patientProfiles.add(
      caller,
      {
        id = caller;
        name;
        phoneNumber;
        email;
      },
    );
  };

  public shared ({ caller }) func updatePatientProfile(name : Text, phoneNumber : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (patientProfiles.get(caller)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?_) {
        let updatedProfile = {
          id = caller;
          name;
          phoneNumber;
          email;
        };
        patientProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getCallerPatientProfile() : async PatientProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (patientProfiles.get(caller)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getPatientProfile(user : Principal) : async PatientProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (patientProfiles.get(user)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?PatientProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    patientProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?PatientProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    patientProfiles.get(user);
  };

  // DOCTOR MANAGEMENT
  public query func getAllDoctors() : async [DoctorProfile] {
    // Public directory accessible to all users and guests
    doctorProfiles.values().toArray().sort();
  };

  public query func getDoctorById(doctorId : Nat) : async DoctorProfile {
    // Public directory, no restriction for guests
    switch (doctorProfiles.get(doctorId)) {
      case (null) { Runtime.trap("Doctor profile not found") };
      case (?profile) { profile };
    };
  };

  // APPOINTMENT MANAGEMENT
  type AppointmentInput = {
    doctorId : Nat;
    timeSlot : TimeSlot;
  };

  public shared ({ caller }) func bookAppointment(appointmentInput : AppointmentInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book appointments");
    };

    if (
      appointments.any(
        func(_, appointment) {
          appointment.doctorId == appointmentInput.doctorId and
          appointment.timeSlot.day == appointmentInput.timeSlot.day and
          appointment.timeSlot.startTime == appointmentInput.timeSlot.startTime and
          appointment.status != #cancelled
        }
      )
    ) {
      Runtime.trap("Time slot already booked");
    };

    let appointmentId = nextAppointmentId;
    let currentTime = Time.now();

    let newAppointment = {
      id = appointmentId;
      patientId = caller;
      doctorId = appointmentInput.doctorId;
      timeSlot = appointmentInput.timeSlot;
      createdAt = currentTime;
      status = #booked;
    };

    appointments.add(appointmentId, newAppointment);
    nextAppointmentId += 1;

    appointmentId;
  };

  public shared ({ caller }) func rescheduleAppointment(appointmentId : Nat, newTimeSlot : TimeSlot) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reschedule appointments");
    };

    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        // Only the appointment owner can reschedule
        if (appointment.patientId != caller) {
          Runtime.trap("Unauthorized: Can only reschedule your own appointments");
        };

        // Check if new time slot is available
        if (
          appointments.any(
            func(_, appt) {
              appt.doctorId == appointment.doctorId and
              appt.timeSlot.day == newTimeSlot.day and
              appt.timeSlot.startTime == newTimeSlot.startTime and
              appt.status != #cancelled and
              appt.id != appointmentId
            }
          )
        ) {
          Runtime.trap("Time slot already booked");
        };

        appointments.add(appointmentId, {
          id = appointment.id;
          patientId = appointment.patientId;
          doctorId = appointment.doctorId;
          timeSlot = newTimeSlot;
          createdAt = appointment.createdAt;
          status = #rescheduled;
        });
      };
    };
  };

  public shared ({ caller }) func cancelAppointment(appointmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel appointments");
    };

    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        // Only the appointment owner can cancel
        if (appointment.patientId != caller) {
          Runtime.trap("Unauthorized: Can only cancel your own appointments");
        };

        appointments.add(appointmentId, {
          id = appointment.id;
          patientId = appointment.patientId;
          doctorId = appointment.doctorId;
          timeSlot = appointment.timeSlot;
          createdAt = appointment.createdAt;
          status = #cancelled;
        });
      };
    };
  };

  public query ({ caller }) func getPatientAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view appointments");
    };

    appointments.values().toArray().filter(
      func(appointment) { appointment.patientId == caller }
    );
  };

  public query func getDoctorAvailability(doctorId : Nat) : async [TimeSlot] {
    switch (doctorProfiles.get(doctorId)) {
      case (null) { Runtime.trap("Doctor profile not found") };
      case (?doctorProfile) {
        let available = List.fromArray<TimeSlot>(doctorProfile.availableSlots).filter(
          func(slot) {
            not appointments.any(
              func(_, appointment) {
                appointment.doctorId == doctorId and
                appointment.timeSlot.day == slot.day and
                appointment.timeSlot.startTime == slot.startTime and
                appointment.status != #cancelled
              }
            );
          }
        );
        available.toArray();
      };
    };
  };

  // AI CHATBOT INTEGRATION
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Remove call to Text.toLowercase.
  func urlEncode(text : Text) : Text {
    let encoded = text.map(func(c : Char) : Char {
      if (c == ' ') { '%' } else if (c == '?') { '%' } else if (c == '&') { '%' } else if (c == '=') { '%' } else { c };
    });
    encoded;
  };

  func findMatchingSpecialization(question : Text) : Text {
    // Only lower-case matching supported in current scope.
    if (question.contains(#text "fever")) { "General Practice (family physician), Internal Medicine" }
    else if (question.contains(#text "headache")) { "Neurology (neurologist)" }
    else if (question.contains(#text "cold")) { "General Practice (family physician), Internal Medicine" }
    else if (question.contains(#text "cough")) { "Pulmonology (pulmonologist), General Practice (family physician), Internal Medicine" }
    else if (question.contains(#text "abdominal pain")) { "Internal Medicine (general internist), Gastroenterology (gastroenterologist), General Practice (family physician)" }
    else if (question.contains(#text "chest pain")) { "Cardiology (cardiologist)" }
    else if (question.contains(#text "rash")) { "Dermatology (dermatologist)" }
    else if (question.contains(#text "eye discomfort")) { "Ophthalmology (ophthalmologist)" }
    else if (question.contains(#text "pediatric")) { "Pediatrics (pediatrician)" }
    else if (question.contains(#text "musculoskeletal pain")) { "Orthopedics (orthopedist)" }
    else if (question.contains(#text "gynecological symptoms")) { "Gynecology" }
    else { "General Practice (family physician), Internal Medicine" };
  };

  // Backoffice logic for recommendation
  func findMatchingDoctorForSpecialization(specialization : Text) : ?DoctorProfile {
    let normalizedSpecialization = specialization.replace(#text "general practice (family physician)", "generalpractice").replace(#text "internal medicine", "internalmedicine");

    let docs = doctorProfiles.values().toArray();

    for (d in docs.vals()) {
      if (normalizedSpecialization.contains(#text "generalpractice")) {
        if (d.specialization == #generalPractice) { return ?d };
      } else if (normalizedSpecialization.contains(#text "internalmedicine")) {
        if (d.specialization == #internalMedicine) { return ?d };
      } else if (normalizedSpecialization.contains(#text "cardiology")) {
        if (d.specialization == #cardiology) { return ?d };
      } else if (normalizedSpecialization.contains(#text "neurology")) {
        if (d.specialization == #neurology) { return ?d };
      } else if (normalizedSpecialization.contains(#text "pediatrics")) {
        if (d.specialization == #pediatrics) { return ?d };
      } else if (normalizedSpecialization.contains(#text "orthopedics")) {
        if (d.specialization == #orthopedics) { return ?d };
      } else if (normalizedSpecialization.contains(#text "dermatology")) {
        if (d.specialization == #dermatology) { return ?d };
      } else if (normalizedSpecialization.contains(#text "gynecology")) {
        if (d.specialization == #gynecology) { return ?d };
      } else if (normalizedSpecialization.contains(#text "ophthalmology")) {
        if (d.specialization == #ophthalmology) { return ?d };
      } else if (normalizedSpecialization.contains(#text "general specialist")) {
        if (d.specialization == #generalSpecialist) { return ?d };
      };
    };

    null;
  };

  public shared func askMedicalChatbot(question : Text) : async Text {
    // Check for matching symptoms and specialization.
    let matchingSpecialization = findMatchingSpecialization(question);

    // If no match is found, proceed with default generic response and fallback to general practice/internist
    let modernGeneralAdvice = "(Safe general advice. Not a diagnosis, please consult a medical professional for a diagnosis. Diagnosis based on online answers is not permitted!) Answers are compliant with the General Data Protection Regulation (GDPR), take data privacy seriously, and never store, share, or use any user data for commercial purposes. \n\n**General Recommendations:** \n1. If you develop any new, unexpected, or prolonged symptoms, closely monitor whether you develop any of the following critical symptoms and see a doctor promptly regardless in case of: \na. Persistent high fever over 48h that does not break, \nb. Signs of dehydration (no liquid intake, no reduction in symptoms, signs of unconsciousness, significant somnolence, neurological symptoms, prolonged vomiting, unexplained diarrhea, suspected seizures ) \nc. Severe fever in infants, who are unable to regulate heat (in this case please consult a pediatrician immediately) \n2. For adults without severe underlying conditions, you can try to manage fever and headaches with generally available medication while securely monitoring symptoms. \n3. If you develop any persistent or acute symptoms, also in relation to a COVID-19 or flu infection or other infection, please consult your primary care physician, or an internal medicine specialist for a proper diagnosis. All other conditions should also be directed at these specializations. They can refer you to the right specialization where needed. \n\nSome recommended specializations for your symptoms: " # matchingSpecialization;

    // Find a doctor who fits the specialization the best
    let matchingDoctor = findMatchingDoctorForSpecialization(matchingSpecialization);

    // Compose the final response using switch for pattern matching
    let finalResponse = modernGeneralAdvice #
      "\nIf you would like to book an appointment, search the directory for the right doctor. " # (switch matchingDoctor {
        case (null) { "" };
        case (?doctor) {
          "\nHere's a recommended doctor for your symptoms: " # doctor.name # " (" #
          (switch (doctor.specialization) {
            case (#cardiology) { "Cardiology" };
            case (#neurology) { "Neurology" };
            case (#pediatrics) { "Pediatrics" };
            case (#orthopedics) { "Orthopedics" };
            case (#dermatology) { "Dermatology" };
            case (#gynecology) { "Gynecology" };
            case (#ophthalmology) { "Ophthalmology" };
            case (#generalPractice) { "General Practice" };
            case (#internalMedicine) { "Internal Medicine" };
            case (#generalSpecialist) { "General Specialist" };
          }) #
          " at " # doctor.hospitalName # ").";
        };
      });

    // URL encode user question for backend queries
    let encodedQuestion = urlEncode(question);

    // Perform outcall
    let url = "https://medical-chatbot.ai/service?question=" # encodedQuestion # "&language=en";
    let aiResponse = await OutCall.httpGetRequest(
      url,
      [],
      transform,
    );
    finalResponse # aiResponse;
  };

  // NOTIFICATION SCHEDULER (FUTURE EXTENSION PLACEHOLDER)
  public shared ({ caller }) func runScheduledNotifications() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can run scheduler");
    };
  };
};

