import { toast } from "@/hooks/use-toast";

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { ...init, credentials: "include" });
  if (res.status === 401) {
    toast({
      title: "Session expired",
      description: "Please log in again.",
      variant: "destructive",
    });
    window.location.href = "/auth?mode=login";
    throw new Error("Unauthorized");
  }
  return res;
}
