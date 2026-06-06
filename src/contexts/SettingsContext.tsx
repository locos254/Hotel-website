import { createContext, useContext, type ReactNode } from "react";
import { useGetSettings } from "@workspace/api-client-react";
import type { HotelSettings } from "@workspace/api-client-react";

export type SiteSettings = HotelSettings & {
  websiteUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  taxRate?: string;
  maxGuests?: number;
  cancellationPolicy?: string;
  maintenanceMode?: boolean;
  emailNotifications?: boolean;
  updatedAt?: string;
};

interface SettingsContextValue {
  settings: SiteSettings | null;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({ settings: null, isLoading: true });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useGetSettings();
  return (
    <SettingsContext.Provider value={{ settings: (data as SiteSettings) ?? null, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
