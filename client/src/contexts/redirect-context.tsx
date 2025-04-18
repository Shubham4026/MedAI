import { createContext, useContext, useState } from "react";

interface RedirectContextType {
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
}

const RedirectContext = createContext<RedirectContextType | undefined>(undefined);

export function RedirectProvider({ children }: { children: React.ReactNode }) {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  return (
    <RedirectContext.Provider value={{ redirectPath, setRedirectPath }}>
      {children}
    </RedirectContext.Provider>
  );
}

export function useRedirect() {
  const context = useContext(RedirectContext);
  if (context === undefined) {
    throw new Error("useRedirect must be used within a RedirectProvider");
  }
  return context;
}
