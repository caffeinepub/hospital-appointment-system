import { useState } from 'react';
import { useGetAllDoctors } from '../hooks/useQueries';
import BookingModal from '../components/BookingModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, AlertCircle, Building2 } from 'lucide-react';
import { type DoctorProfile, Specialization } from '../backend';

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

type Page = 'home' | 'doctors' | 'appointments' | 'profile';

interface DoctorsPageProps {
  onNavigate?: (page: Page) => void;
}

export default function DoctorsPage({ onNavigate }: DoctorsPageProps) {
  const { data: doctors = [], isLoading, isFetched, isError, refetch } = useGetAllDoctors();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');

  const handleProfileRequired = () => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization =
      filterSpecialization === 'all' || doctor.specialization === filterSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  // Show loading state while initializing or fetching
  const showLoading = isLoading || !isFetched;
  // Only show empty state if query has completed and returned empty array
  const showEmptyState = isFetched && !isLoading && doctors.length === 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
        <p className="text-muted-foreground">Browse and book appointments with our specialists</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by doctor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={showLoading}
          />
        </div>

        <Select value={filterSpecialization} onValueChange={setFilterSpecialization} disabled={showLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {Object.entries(specializationLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading doctors...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Failed to load doctors</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No doctors available at the moment</p>
          <Button onClick={() => refetch()} className="mt-4">Refresh</Button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No doctors match your search criteria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id.toString()} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {specializationLabels[doctor.specialization]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.experienceYears.toString()} years experience
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">
                      {doctor.hospitalName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {doctor.availableSlots.length} slots available
                </p>
                <Button onClick={() => setSelectedDoctor(doctor)} className="w-full">
                  Book Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onProfileRequired={handleProfileRequired}
        />
      )}
    </div>
  );
}
