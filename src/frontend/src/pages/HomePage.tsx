import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import ChatbotWidget from "../components/ChatbotWidget";

type Page = "home" | "doctors" | "appointments" | "profile";

interface HomePageProps {
  onNavigate?: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [showChatbot, setShowChatbot] = useState(false);

  const handleNavigate = (page: Page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
        <p className="text-muted-foreground">
          Manage your healthcare appointments
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => handleNavigate("doctors")}
          className="w-full h-auto py-4 justify-start"
          variant="outline"
        >
          <div className="text-left">
            <div className="font-semibold">Find a Doctor</div>
            <div className="text-sm text-muted-foreground">
              Browse specialists and book appointments
            </div>
          </div>
        </Button>

        <Button
          onClick={() => handleNavigate("appointments")}
          className="w-full h-auto py-4 justify-start"
          variant="outline"
        >
          <div className="text-left">
            <div className="font-semibold">My Appointments</div>
            <div className="text-sm text-muted-foreground">
              View and manage your bookings
            </div>
          </div>
        </Button>

        <Button
          onClick={() => handleNavigate("profile")}
          className="w-full h-auto py-4 justify-start"
          variant="outline"
        >
          <div className="text-left">
            <div className="font-semibold">My Profile</div>
            <div className="text-sm text-muted-foreground">
              Update your personal information
            </div>
          </div>
        </Button>

        <Button
          onClick={() => setShowChatbot(true)}
          className="w-full h-auto py-4 justify-start"
          variant="outline"
        >
          <div className="text-left">
            <div className="font-semibold">Medical Assistant</div>
            <div className="text-sm text-muted-foreground">
              Get help finding the right specialist
            </div>
          </div>
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-24 right-4 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open chatbot"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {showChatbot && <ChatbotWidget onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
