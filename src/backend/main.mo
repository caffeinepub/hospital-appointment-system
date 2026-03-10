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
import Blob "mo:core/Blob";


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
    #dentistry;
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
      Nat.compare(profile1.id, profile2.id);
    };
  };

  type PatientProfile = {
    id : Blob;
    name : Text;
    phoneNumber : Text;
    email : Text;
  };

  module PatientProfile {
    public func compare(profile1 : PatientProfile, profile2 : PatientProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  type Appointment = {
    id : Nat;
    patientId : Blob;
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
  let patientProfiles = Map.empty<Blob, PatientProfile>();
  let appointments = Map.empty<Nat, Appointment>();
  var nextAppointmentId = 1;

  // List of well-known hospital names in India
  let hospitalNames = [
    "Apollo Hospitals",
    "AIIMS New Delhi",
    "Fortis Healthcare",
    "Max Super Speciality Hospital",
    "Medanta - The Medicity",
    "Kokilaben Dhirubhai Ambani Hospital",
    "Narayana Health",
    "Manipal Hospitals",
    "Tata Memorial Hospital",
    "Christian Medical College Vellore"
  ];

  // Initialize doctor profiles on system startup
  private func initializeDoctors() {
    let doctorsList = List.empty<DoctorProfile>();

    func getHospitalName(index : Nat) : Text {
      let hospitalCount = hospitalNames.size();
      let hospitalIndex = index % hospitalCount;
      hospitalNames[hospitalIndex];
    };

    // Cardiology (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Devi Prasad Shetty";
      specialization = #cardiology;
      experienceYears = 30;
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
      name = "Dr. Naresh Trehan";
      specialization = #cardiology;
      experienceYears = 35;
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
      name = "Dr. Suresh Advani";
      specialization = #neurology;
      experienceYears = 28;
      availableSlots = [
        { day = "Monday"; startTime = "14:00"; endTime = "15:00" },
        { day = "Wednesday"; startTime = "10:00"; endTime = "11:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Sudha Seshayyan";
      specialization = #neurology;
      experienceYears = 22;
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
      name = "Dr. Indira Hinduja";
      specialization = #pediatrics;
      experienceYears = 25;
      availableSlots = [
        { day = "Monday"; startTime = "11:00"; endTime = "12:00" },
        { day = "Wednesday"; startTime = "16:00"; endTime = "17:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Ashok Seth";
      specialization = #pediatrics;
      experienceYears = 18;
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
      name = "Dr. K. M. Cherian";
      specialization = #orthopedics;
      experienceYears = 32;
      availableSlots = [
        { day = "Monday"; startTime = "15:00"; endTime = "16:00" },
        { day = "Wednesday"; startTime = "09:00"; endTime = "10:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Prathap C Reddy";
      specialization = #orthopedics;
      experienceYears = 20;
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
      name = "Dr. Anjali Mahto";
      specialization = #dermatology;
      experienceYears = 15;
      availableSlots = [
        { day = "Monday"; startTime = "10:00"; endTime = "11:00" },
        { day = "Wednesday"; startTime = "13:00"; endTime = "14:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Aparna Santhanam";
      specialization = #dermatology;
      experienceYears = 18;
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
      name = "Dr. Nandita Palshetkar";
      specialization = #gynecology;
      experienceYears = 24;
      availableSlots = [
        { day = "Monday"; startTime = "13:00"; endTime = "14:00" },
        { day = "Wednesday"; startTime = "11:00"; endTime = "12:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Hrishikesh Pai";
      specialization = #gynecology;
      experienceYears = 20;
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
      name = "Dr. Gullapalli N. Rao";
      specialization = #ophthalmology;
      experienceYears = 30;
      availableSlots = [
        { day = "Monday"; startTime = "16:00"; endTime = "17:00" },
        { day = "Wednesday"; startTime = "15:00"; endTime = "16:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Rajendra Prasad";
      specialization = #ophthalmology;
      experienceYears = 22;
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
      name = "Dr. B. M. Hegde";
      specialization = #generalPractice;
      experienceYears = 40;
      availableSlots = [
        { day = "Monday"; startTime = "08:00"; endTime = "09:00" },
        { day = "Wednesday"; startTime = "08:00"; endTime = "09:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Shyam Aggarwal";
      specialization = #generalPractice;
      experienceYears = 20;
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
      name = "Dr. Sanjay Gupta";
      specialization = #internalMedicine;
      experienceYears = 22;
      availableSlots = [
        { day = "Monday"; startTime = "12:00"; endTime = "13:00" },
        { day = "Wednesday"; startTime = "12:00"; endTime = "13:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Randeep Guleria";
      specialization = #internalMedicine;
      experienceYears = 28;
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
      name = "Dr. Trehan Suresh";
      specialization = #generalSpecialist;
      experienceYears = 16;
      availableSlots = [
        { day = "Monday"; startTime = "17:00"; endTime = "18:00" },
        { day = "Wednesday"; startTime = "17:00"; endTime = "18:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Kamini Rao";
      specialization = #generalSpecialist;
      experienceYears = 19;
      availableSlots = [
        { day = "Tuesday"; startTime = "17:00"; endTime = "18:00" },
        { day = "Thursday"; startTime = "17:00"; endTime = "18:00" },
        { day = "Friday"; startTime = "17:00"; endTime = "18:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    // Dentistry (2 doctors)
    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Mridula Bhide";
      specialization = #dentistry;
      experienceYears = 14;
      availableSlots = [
        { day = "Wednesday"; startTime = "15:00"; endTime = "16:00" },
        { day = "Friday"; startTime = "10:00"; endTime = "11:00" },
      ];
      hospitalName = getHospitalName(nextDoctorId);
    });
    nextDoctorId += 1;

    doctorsList.add({
      id = nextDoctorId;
      name = "Dr. Anil Kohli";
      specialization = #dentistry;
      experienceYears = 20;
      availableSlots = [
        { day = "Monday"; startTime = "10:00"; endTime = "11:00" },
        { day = "Thursday"; startTime = "14:00"; endTime = "15:00" },
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

  // Helper function to validate session token
  private func validateSessionToken(token : Blob) {
    if (token.size() == 0) {
      Runtime.trap("Invalid session token: token cannot be empty");
    };
    if (token.size() < 16) {
      Runtime.trap("Invalid session token: token too short");
    };
  };

  public shared ({ caller }) func system_install_was() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize the system");
    };
    initializeDoctors();
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfileInput, clientSessionToken : Blob) : async () {
    validateSessionToken(clientSessionToken);

    if (
      profile.name.size() == 0 or profile.phoneNumber.size() == 0 or profile.email.size() == 0
    ) {
      Runtime.trap("Invalid profile data: name, phone, and email are required");
    };

    patientProfiles.add(
      clientSessionToken,
      {
        id = clientSessionToken;
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
    clientSessionToken : Blob,
  ) : async () {
    validateSessionToken(clientSessionToken);

    if (name.size() == 0 or phoneNumber.size() == 0 or email.size() == 0) {
      Runtime.trap("Invalid profile data: name, phone, and email are required");
    };

    patientProfiles.add(
      clientSessionToken,
      {
        id = clientSessionToken;
        name;
        phoneNumber;
        email;
      },
    );
  };

  public shared ({ caller }) func updatePatientProfile(
    name : Text,
    phoneNumber : Text,
    email : Text,
    clientSessionToken : Blob,
  ) : async () {
    validateSessionToken(clientSessionToken);

    switch (patientProfiles.get(clientSessionToken)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?_) {
        let updatedProfile = {
          id = clientSessionToken;
          name;
          phoneNumber;
          email;
        };
        patientProfiles.add(clientSessionToken, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getCallerPatientProfile(clientSessionToken : Blob) : async PatientProfile {
    validateSessionToken(clientSessionToken);

    switch (patientProfiles.get(clientSessionToken)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getPatientProfile(clientSessionToken : Blob) : async PatientProfile {
    validateSessionToken(clientSessionToken);

    switch (patientProfiles.get(clientSessionToken)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getCallerUserProfile(clientSessionToken : Blob) : async ?PatientProfile {
    validateSessionToken(clientSessionToken);
    patientProfiles.get(clientSessionToken);
  };

  public query ({ caller }) func getUserProfile(clientSessionToken : Blob) : async ?PatientProfile {
    validateSessionToken(clientSessionToken);
    patientProfiles.get(clientSessionToken);
  };

  // DOCTOR MANAGEMENT
  public query func getAllDoctors() : async [DoctorProfile] {
    doctorProfiles.values().toArray().sort();
  };

  public query func getDoctorById(doctorId : Nat) : async DoctorProfile {
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

  public shared ({ caller }) func bookAppointment(appointmentInput : AppointmentInput, clientSessionToken : Blob) : async Nat {
    validateSessionToken(clientSessionToken);

    switch (patientProfiles.get(clientSessionToken)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?_) {
        switch (doctorProfiles.get(appointmentInput.doctorId)) {
          case (null) { Runtime.trap("Doctor profile not found") };
          case (?_) {
            let isSlotAvailable = not appointments.any(
              func(_, appointment) {
                appointment.doctorId == appointmentInput.doctorId and
                appointment.timeSlot.day == appointmentInput.timeSlot.day and
                appointment.timeSlot.startTime == appointmentInput.timeSlot.startTime and
                appointment.status != #cancelled
              }
            );
            if (not isSlotAvailable) {
              Runtime.trap("Selected time slot is already booked.");
            };

            let appointmentId = nextAppointmentId;
            nextAppointmentId += 1;

            let newAppointment : Appointment = {
              id = appointmentId;
              patientId = clientSessionToken;
              doctorId = appointmentInput.doctorId;
              timeSlot = appointmentInput.timeSlot;
              createdAt = Time.now();
              status = #booked;
            };
            appointments.add(appointmentId, newAppointment);
            appointmentId;
          };
        };
      };
    };
  };

  public shared ({ caller }) func rescheduleAppointment(appointmentId : Nat, newTimeSlot : TimeSlot, clientSessionToken : Blob) : async () {
    validateSessionToken(clientSessionToken);

    switch (patientProfiles.get(clientSessionToken)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?_) {
        switch (appointments.get(appointmentId)) {
          case (null) { Runtime.trap("Appointment not found") };
          case (?existingAppointment) {
            if (existingAppointment.patientId != clientSessionToken) {
              Runtime.trap("Unauthorized: Only the appointment owner can reschedule");
            };

            let isSlotAvailable = not appointments.any(
              func(_, appointment) {
                appointment.doctorId == existingAppointment.doctorId and
                appointment.timeSlot.day == newTimeSlot.day and
                appointment.timeSlot.startTime == newTimeSlot.startTime and
                appointment.status != #cancelled
              }
            );
            if (not isSlotAvailable) {
              Runtime.trap("New time slot is already booked.");
            };

            let updatedAppointment = {
              id = appointmentId;
              patientId = existingAppointment.patientId;
              doctorId = existingAppointment.doctorId;
              timeSlot = newTimeSlot;
              createdAt = existingAppointment.createdAt;
              status = #rescheduled;
            };
            appointments.add(appointmentId, updatedAppointment);
          };
        };
      };
    };
  };

  public shared ({ caller }) func cancelAppointment(appointmentId : Nat, clientSessionToken : Blob) : async () {
    validateSessionToken(clientSessionToken);

    switch (patientProfiles.get(clientSessionToken)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?_) {
        switch (appointments.get(appointmentId)) {
          case (null) { Runtime.trap("Appointment not found") };
          case (?existingAppointment) {
            if (existingAppointment.patientId != clientSessionToken) {
              Runtime.trap("Unauthorized: Only the appointment owner can cancel");
            };

            switch (existingAppointment.status) {
              case (#cancelled) {
                Runtime.trap("Appointment is already cancelled!");
              };
              case (_) {
                let updatedAppointment = {
                  id = appointmentId;
                  patientId = existingAppointment.patientId;
                  doctorId = existingAppointment.doctorId;
                  timeSlot = existingAppointment.timeSlot;
                  createdAt = existingAppointment.createdAt;
                  status = #cancelled;
                };
                appointments.add(appointmentId, updatedAppointment);
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getPatientAppointments(clientSessionToken : Blob) : async [Appointment] {
    validateSessionToken(clientSessionToken);

    switch (patientProfiles.get(clientSessionToken)) {
      case (null) { Runtime.trap("Patient profile does not exist!") };
      case (?_) {
        appointments.values().toArray().filter(
          func(appointment) { appointment.patientId == clientSessionToken }
        );
      };
    };
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

  func toLower(text : Text) : Text {
    text.map(
      func(c : Char) : Char {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else { c };
      }
    );
  };

  public shared ({ caller }) func askMedicalChatbot(question : Text) : async Text {
    let lowerQuestion = toLower(question);
    let trimmedQuestion = lowerQuestion.trim(#char ' ');

    // Greetings
    if (
      trimmedQuestion == "hi" or
      trimmedQuestion == "hello" or
      trimmedQuestion == "hey" or
      trimmedQuestion == "good morning" or
      trimmedQuestion == "good evening"
    ) {
      return "Hello! I am your medical assistant. Please describe your symptoms and I will guide you to the right doctor.";
    };

    // Fever
    if (trimmedQuestion.contains(#text "fever") or trimmedQuestion.contains(#text "temperature") or trimmedQuestion.contains(#text "chills")) {
      return "Based on your symptoms (fever/high temperature), I suggest:\n\nHome Remedies:\n- Drink plenty of water and fluids\n- Rest and avoid physical activity\n- Use a cool damp cloth on forehead\n\nConsult: Dr. Sanjay Gupta or Dr. Randeep Guleria\nDepartment: Internal Medicine or General Practice\n\nIf fever is above 103F or lasts more than 3 days, please visit immediately.";
    };

    // Tooth pain
    if (trimmedQuestion.contains(#text "tooth") or trimmedQuestion.contains(#text "teeth") or trimmedQuestion.contains(#text "dental") or trimmedQuestion.contains(#text "gum")) {
      return "Based on your symptoms (tooth/dental pain), I suggest:\n\nHome Remedies:\n- Rinse with warm salt water\n- Apply clove oil on the affected tooth\n- Avoid very hot or cold food\n\nConsult: Dr. Mridula Bhide or Dr. Anil Kohli\nDepartment: Dentistry\n\nDo not delay dental treatment as infections can spread.";
    };

    // Headache
    if (trimmedQuestion.contains(#text "headache") or trimmedQuestion.contains(#text "migraine") or trimmedQuestion.contains(#text "head pain")) {
      return "Based on your symptoms (headache/migraine), I suggest:\n\nHome Remedies:\n- Rest in a quiet, dark room\n- Drink water - dehydration causes headaches\n- Apply cold or warm compress on forehead\n\nConsult: Dr. Suresh Advani or Dr. Sudha Seshayyan\nDepartment: Neurology\n\nIf headache is very severe or sudden, seek emergency care.";
    };

    // Chest pain
    if (trimmedQuestion.contains(#text "chest") or trimmedQuestion.contains(#text "heart") or trimmedQuestion.contains(#text "breathless") or trimmedQuestion.contains(#text "palpitation")) {
      return "Based on your symptoms (chest pain/heart issues), I suggest:\n\nImportant: Chest pain can be serious. Do not ignore it.\n\nConsult Immediately: Dr. Devi Prasad Shetty or Dr. Naresh Trehan\nDepartment: Cardiology\n\nIf you have severe chest pain, call emergency services right away.";
    };

    // Stomach pain
    if (trimmedQuestion.contains(#text "stomach") or trimmedQuestion.contains(#text "abdomen") or trimmedQuestion.contains(#text "gastric") or trimmedQuestion.contains(#text "nausea") or trimmedQuestion.contains(#text "vomit")) {
      return "Based on your symptoms (stomach/gastric issues), I suggest:\n\nHome Remedies:\n- Drink ginger tea or warm water\n- Avoid spicy or oily food\n- Rest and do not eat heavy meals\n\nConsult: Dr. Shyam Aggarwal or Dr. B. M. Hegde\nDepartment: General Practice or Internal Medicine";
    };

    // Skin issues
    if (trimmedQuestion.contains(#text "skin") or trimmedQuestion.contains(#text "rash") or trimmedQuestion.contains(#text "itch") or trimmedQuestion.contains(#text "acne") or trimmedQuestion.contains(#text "allergy")) {
      return "Based on your symptoms (skin issues), I suggest:\n\nHome Remedies:\n- Apply aloe vera gel on affected area\n- Avoid scratching\n- Keep the area clean and dry\n\nConsult: Dr. Anjali Mahto or Dr. Aparna Santhanam\nDepartment: Dermatology";
    };

    // Eye issues
    if (trimmedQuestion.contains(#text "eye") or trimmedQuestion.contains(#text "vision") or trimmedQuestion.contains(#text "blur") or trimmedQuestion.contains(#text "sight")) {
      return "Based on your symptoms (eye/vision issues), I suggest:\n\nHome Remedies:\n- Rest your eyes and avoid screens\n- Use cold water compress\n- Avoid rubbing your eyes\n\nConsult: Dr. Gullapalli N. Rao or Dr. Rajendra Prasad\nDepartment: Ophthalmology";
    };

    // Joint/bone pain
    if (trimmedQuestion.contains(#text "joint") or trimmedQuestion.contains(#text "bone") or trimmedQuestion.contains(#text "knee") or trimmedQuestion.contains(#text "back pain") or trimmedQuestion.contains(#text "fracture")) {
      return "Based on your symptoms (joint/bone pain), I suggest:\n\nHome Remedies:\n- Rest the affected joint\n- Apply ice pack for swelling\n- Gentle stretching if no fracture\n\nConsult: Dr. K. M. Cherian or Dr. Prathap C Reddy\nDepartment: Orthopedics";
    };

    // Default response
    "I am here to help you find the right doctor! Please describe your symptoms more clearly. For example: fever, headache, tooth pain, chest pain, stomach pain, skin rash, eye problem, or joint pain. I will guide you to the right specialist.";
  };

  public shared ({ caller }) func runScheduledNotifications() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can run scheduler");
    };
  };
};
