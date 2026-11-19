export const DEVICE_ID_KEY = "bvtalent_device_id";

/**
 * Retrieves the persistent browser device ID from localStorage,
 * or generates and stores a new UUID if none exists.
 * Safe for Server-Side Rendering (returns empty string if executed on server).
 */
export function getDeviceId(): string {
  if (typeof window === "undefined" || !window.localStorage) {
    return "";
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        deviceId = crypto.randomUUID();
      } else {
        // Fallback for non-secure mobile browser contexts (e.g. http://192.168.x.x)
        deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (err) {
    console.warn("localStorage access denied or unavailable:", err);
    return "";
  }
}

/**
 * Validates whether a device ID string is a valid UUID format
 */
export function isValidDeviceId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  // Standard UUID v4 regex check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id.trim());
}
