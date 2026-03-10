import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorsPage from "./pages/DoctorsPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

type Page = "home" | "doctors" | "appointments" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [showSplash, setShowSplash] = useState(true);

  // Handle URL parameters for PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get("page");

    if (
      pageParam &&
      ["home", "doctors", "appointments", "profile"].includes(pageParam)
    ) {
      setCurrentPage(pageParam as Page);
    }
  }, []);

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Register service worker for PWA functionality
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        // Use relative path for service worker registration
        const swUrl = new URL("sw.js", window.location.href).href;

        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log(
              "Service Worker registered successfully:",
              registration.scope,
            );

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  if (showSplash) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <SplashScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex flex-col h-screen bg-white">
        <main className="flex-1 overflow-y-auto pb-20">
          {currentPage === "home" && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === "doctors" && (
            <DoctorsPage onNavigate={setCurrentPage} />
          )}
          {currentPage === "appointments" && <AppointmentsPage />}
          {currentPage === "profile" && <ProfilePage />}
        </main>

        <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
