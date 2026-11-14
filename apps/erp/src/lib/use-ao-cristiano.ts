import { useEffect, useState } from "react";
import {
  AO_CRISTIANO_SETTINGS_KEY,
  defaultAoCristianoSettings,
  getModuleAccessMessage,
  isRouteAllowedForProfile,
  readAoCristianoSettings,
  writeAoCristianoSettings,
  type AoCristianoSettings,
} from "@/lib/ao-cristiano-profile";

const SETTINGS_EVENT = "ao-erp:ao-cristiano:settings-change";

export function useAoCristianoSettings() {
  const [settings, setSettings] = useState<AoCristianoSettings>(() => readAoCristianoSettings());

  useEffect(() => {
    const sync = () => setSettings(readAoCristianoSettings());
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key === AO_CRISTIANO_SETTINGS_KEY) sync();
    };
    const onCustom = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener(SETTINGS_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SETTINGS_EVENT, onCustom);
    };
  }, []);

  const updateSettings = (changes: Partial<AoCristianoSettings>) => {
    const next = { ...settings, ...changes, terminology: { ...settings.terminology, ...(changes.terminology ?? {}) } };
    setSettings(next);
    writeAoCristianoSettings(next);
  };

  const canAccessPath = (path: string) => isRouteAllowedForProfile(path, settings.profile);
  const accessMessage = (path: string) => getModuleAccessMessage(path, settings.profile);

  return { settings, updateSettings, canAccessPath, accessMessage };
}