import { type ReactNode, useEffect, useState, useRef } from "react";
import {
  useAuth as useCrossmintAuth,
  useWallet,
} from "@crossmint/client-sdk-react-ui";

// Mock placeholder components
const AuthLoading = ({ isVisible }) => (
  <div className={isVisible ? "block" : "hidden"}>Loading...</div>
);
const Login = () => <div>Login Component</div>;
const Sidebar = () => <div>Sidebar Component</div>;

export default function ClientOnlyAuthContent({
  children,
}: {
  children: ReactNode;
}) {
  const { status, user, jwt } = useCrossmintAuth();
  const { wallet } = useWallet();
  const [showContent, setShowContent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reconnectAttempted, setReconnectAttempted] = useState<boolean>(false);
  
  // Generic auth state tracking (replaces useStore/useAuth)
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    connectionPending: false
  });
  
  // Simplified refs to track connection attempts
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionAttemptRef = useRef({
    inProgress: false,
    lastAttempt: 0,
    count: 0,
    success: false
  });

  // Simplified timeout effect (replacing Appwrite-specific code)
  useEffect(() => {
    if (authState.connectionPending) {
      console.log("Connection pending detected, setting safety timeout");

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      connectionTimeoutRef.current = setTimeout(() => {
        console.log("Connection pending timeout - resetting flag");
        setAuthState(prev => ({ ...prev, connectionPending: false }));
        connectionAttemptRef.current.inProgress = false;
      }, 15000);

      return () => {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
      };
    }
  }, [authState.connectionPending]);

  // Main authentication effect (simplified)
  useEffect(() => {
    // Log current auth state for debugging
    console.log("Auth State:", {
      status,
      hasJwt: !!jwt,
      hasUser: !!user,
      isLoggedIn: authState.isLoggedIn,
      connectionPending: authState.connectionPending
    });

    // Already authenticated case
    if (status === "logged-in" && jwt && authState.isLoggedIn) {
      console.log("Already fully authenticated");
      if (isLoading) {
        setIsLoading(false);
        setShowContent(true);
      }
      return;
    }

    // Handle Crossmint login
    if (status === "logged-in" && jwt) {
      // Update auth state with Crossmint data
      setAuthState(prev => ({ ...prev, isLoggedIn: true }));
      
      // Example wallet connection logic
      if (user?.email && user?.id && wallet?.address && !authState.connectionPending) {
        console.log("Starting wallet connection process...");
        
        setAuthState(prev => ({ ...prev, connectionPending: true }));
        
        // Simulate connection (replaces Appwrite-specific code)
        setTimeout(() => {
          console.log("Connection successful");
          setAuthState(prev => ({ ...prev, connectionPending: false }));
          
          // Example navigation
          // navigate(import.meta.env.SITE, { history: "replace" });
        }, 1000);
      }
    } else if (status === "logged-out") {
      // Reset auth state
      setAuthState({ isLoggedIn: false, connectionPending: false });
      connectionAttemptRef.current.success = false;
    }

    // Exit loading state when auth status is known
    if (status !== "in-progress") {
      setIsLoading(false);
      setShowContent(true);
    }
  }, [status, jwt, user, wallet, isLoading, authState.isLoggedIn, authState.connectionPending]);

  // Simplified reconnection effect
  useEffect(() => {
    const needsReconnect =
      status === "logged-in" &&
      jwt &&
      !authState.isLoggedIn &&
      !authState.connectionPending &&
      !reconnectAttempted &&
      !connectionAttemptRef.current.inProgress;

    if (needsReconnect) {
      console.log("Detected auth desync - attempting reconnection");
      setReconnectAttempted(true);
      
      // Simulate reconnection (replaces Appwrite-specific code)
      setTimeout(() => {
        console.log("Reconnection successful");
        setAuthState(prev => ({ ...prev, isLoggedIn: true }));
        
        // Reset reconnect flag after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempted(false);
        }, 60000);
      }, 1000);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [
    status,
    jwt,
    authState.isLoggedIn,
    authState.connectionPending,
    reconnectAttempted
  ]);

  // Handle loading state
  if (isLoading) {
    console.log("Rendering loading state...");
    return <AuthLoading isVisible={true} />;
  }

  // Handle unauthenticated state
  const isAuthenticated = status === "logged-in" && jwt;
  if (!isAuthenticated) {
    return <Login />;
  }

  // Render authenticated content
  return (
    <div>
      <div className="relative flex">
        <div className="relative z-20">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col bg-[#08090C] pt-0">{children}</div>
      </div>
    </div>
  );
}