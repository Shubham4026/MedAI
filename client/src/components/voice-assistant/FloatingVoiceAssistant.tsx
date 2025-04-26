import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface FloatingVoiceAssistantProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const FloatingVoiceAssistant = ({
  position = "bottom-right",
}: FloatingVoiceAssistantProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : "User";

  useEffect(() => {
    // Define configuration for Convai
    const convaiConfig = {
      userConfig: {
        userName: userName,
        userId: user?.id?.toString() || "guest",
      },
    };

    // Add the configuration to the window
    window.convaiConfig = convaiConfig;

    // Create convai element
    const convaiElement = document.createElement("elevenlabs-convai");
    convaiElement.setAttribute("agent-id", "3ds8oBhrrN21e0ZkXwjP");

    // Set data attributes directly
    convaiElement.setAttribute("data-user-name", userName);
    convaiElement.setAttribute("data-user-id", user?.id?.toString() || "guest");

    // Create script element for the Convai script
    const script = document.createElement("script");
    script.src = "https://elevenlabs.io/convai-widget/index.js";
    script.async = true;
    script.type = "text/javascript";

    // Append elements if they don't exist
    if (!document.querySelector("elevenlabs-convai")) {
      document.body.appendChild(convaiElement);
      document.body.appendChild(script);
      setIsInitialized(true);
    }

    // Add styles to override the widget's default appearance
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      .convai-launcher-icon {
        display: none !important;
      }
      .convai-launcher-button {
        opacity: 0 !important;
        cursor: pointer;
        position: fixed !important;
        z-index: 50 !important;
      }
      .convai-window {
        border-radius: 12px !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Create an initialization script that runs after the widget loads
    const initScript = document.createElement("script");
    initScript.id = "convai-init-script";
    initScript.innerHTML = `
      // Function to initialize Convai with user information
      function initConvai() {
        if (window.convai && window.convai.init) {
          // Initialize with user data
          window.convai.init({
            userName: "${userName}",
            userId: "${user?.id || "guest"}"
          });
        }
        
        // Try to directly modify Convai's context
        if (window.convai && window.convai.setContext) {
          window.convai.setContext({
            user_name: "${userName}",
            user_id: "${user?.id || "guest"}"
          });
        }
        
        // Try to set welcome message
        if (window.convai && window.convai.setWelcomeMessage) {
          window.convai.setWelcomeMessage("Hello ${userName}, how can I help you today?");
        }
      }
      
      // Execute on load and also set a timeout to handle delay in widget initialization
      window.addEventListener('convai-widget-loaded', initConvai);
      
      // Also try after a short delay in case the event didn't fire
      setTimeout(initConvai, 1000);
      setTimeout(initConvai, 2000);
    `;
    document.head.appendChild(initScript);

    return () => {
      // Cleanup if component unmounts
      if (isInitialized) {
        const existingConvai = document.querySelector("elevenlabs-convai");
        const existingScript = document.querySelector(
          'script[src="https://elevenlabs.io/convai-widget/index.js"]'
        );
        const existingStyles = document.querySelector("style");
        const existingInitScript =
          document.getElementById("convai-init-script");

        // Delete the window config
        delete window.convaiConfig;

        if (existingConvai) document.body.removeChild(existingConvai);
        if (existingScript) document.body.removeChild(existingScript);
        if (existingStyles) document.head.removeChild(existingStyles);
        if (existingInitScript) document.head.removeChild(existingInitScript);
      }
    };
  }, [userName, user]);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  const handleClick = () => {
    const convaiBtn = document.querySelector(
      ".convai-launcher-button"
    ) as HTMLElement;
    if (convaiBtn) {
      convaiBtn.click();
      setIsOpen(!isOpen);

      // Try to reinitialize Convai with user's name
      if (window.convai && window.convai.setContext) {
        window.convai.setContext({
          user_name: userName,
          user_id: user?.id || "guest",
        });
      }
    }
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col items-center`}
    >
      <button
        className={`w-14 h-14 rounded-full ${
          isOpen ? "bg-purple-700" : "bg-purple-600"
        } hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center ${
          isOpen ? "scale-110" : "scale-100"
        }`}
        aria-label="Voice Assistant"
        onClick={handleClick}
      >
        <Mic
          className={`h-6 w-6 text-white ${isOpen ? "animate-pulse" : ""}`}
        />
        <span className="absolute -inset-0.5 rounded-full border-2 border-purple-400 animate-pulse opacity-75" />
      </button>
      <span className="mt-2 bg-white text-xs px-2 py-1 rounded-md shadow-md font-medium">
        Voice AI
      </span>
    </div>
  );
};

// Add type declaration for window.convaiConfig and window.convai
declare global {
  interface Window {
    convaiConfig?: {
      userConfig: {
        userName: string;
        userId: string;
      };
    };
    convai?: {
      init: (config: any) => void;
      setContext: (context: any) => void;
      setWelcomeMessage: (message: string) => void;
    };
  }
}

export default FloatingVoiceAssistant;
