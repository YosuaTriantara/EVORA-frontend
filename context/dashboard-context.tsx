// CREATED: 2025-01-11 - Unified Sidebar Implementation
// Dashboard Context untuk menyimpan state global dashboard
// - managedEvents: data event yang di-fetch sekali di layout
// - mobileDrawerOpen: state untuk mobile drawer
// - currentEventId: event yang sedang aktif (untuk event context)

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ManagedEvent } from "@/services/event-management-service";
import { UserProfile } from "@/lib/auth";

// Types
interface DashboardContextType {
  // User data
  user: UserProfile;
  
  // Data
  managedEvents: ManagedEvent[];
  setManagedEvents: (events: ManagedEvent[]) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Mobile drawer state
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
  
  // Current event context (for event detail pages)
  currentEventId: string | null;
  setCurrentEventId: (eventId: string | null) => void;
  
  // Helper: Get event by ID
  getEventById: (eventId: string) => ManagedEvent | undefined;
  
  // Helper: Check if user has any event roles
  hasAnyEventRole: boolean;
}

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

// Provider component
interface DashboardProviderProps {
  children: ReactNode;
  user: UserProfile;
  managedEvents: ManagedEvent[];
}

export function DashboardProvider({ 
  children, 
  user, 
  managedEvents: initialManagedEvents 
}: DashboardProviderProps) {
  const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>(initialManagedEvents);
  const [isLoading, setIsLoading] = useState(false); // Sudah di-fetch di layout
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpen((prev) => !prev);
  }, []);

  const getEventById = useCallback(
    (eventId: string) => {
      return managedEvents.find((e) => e.event.id === eventId);
    },
    [managedEvents]
  );

  const hasAnyEventRole = managedEvents.length > 0;

  const value: DashboardContextType = {
    user,
    managedEvents,
    setManagedEvents,
    isLoading,
    setIsLoading,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    toggleMobileDrawer,
    currentEventId,
    setCurrentEventId,
    getEventById,
    hasAnyEventRole,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook untuk menggunakan context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

// Hook khusus untuk event context (di event detail pages)
export function useEventContext() {
  const { currentEventId, getEventById, managedEvents } = useDashboard();
  
  const currentEvent = currentEventId ? getEventById(currentEventId) : undefined;
  
  return {
    eventId: currentEventId,
    event: currentEvent?.event,
    role: currentEvent?.role,
    metaData: currentEvent?.meta_data,
    isLoading: !currentEvent && !!currentEventId,
  };
}