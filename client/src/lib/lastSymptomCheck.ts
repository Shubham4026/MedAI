// Utility functions for tracking the last symptom check

const STORAGE_KEY = "last_symptom_check";

// Function to save the current date as the last symptom check
export function saveLastSymptomCheck(): void {
  if (typeof window !== "undefined") {
    try {
      const now = new Date();
      localStorage.setItem(STORAGE_KEY, now.toISOString());
    } catch (error) {
      console.error("Error saving last symptom check date:", error);
    }
  }
}

// Function to get the last symptom check date
export function getLastSymptomCheck(): Date | null {
  if (typeof window !== "undefined") {
    try {
      const dateStr = localStorage.getItem(STORAGE_KEY);
      if (dateStr) {
        return new Date(dateStr);
      }
    } catch (error) {
      console.error("Error getting last symptom check date:", error);
    }
  }
  return null;
}

// Function to format the last symptom check relative to current time
export function formatLastSymptomCheck(): string {
  const lastCheck = getLastSymptomCheck();
  if (!lastCheck) {
    return "Not yet checked";
  }

  const now = new Date();
  const diffMs = now.getTime() - lastCheck.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}
