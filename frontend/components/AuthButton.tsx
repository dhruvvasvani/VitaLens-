"use client";

import { useEffect, useState } from "react";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check local storage for mock user
    const mockUser = localStorage.getItem("mock_user");
    if (mockUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(mockUser));
    }
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const fakeUser = {
      email: "demo@perfagent.dev",
      user_metadata: {
        user_name: "Demo User"
      }
    };
    
    localStorage.setItem("mock_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    localStorage.removeItem("mock_user");
    setUser(null);
  };

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(255,255,255,0.05)", padding: "0.25rem 0.5rem", borderRadius: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold" }}>
            {user.user_metadata?.user_name?.charAt(0) || "U"}
          </div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {user.user_metadata?.user_name || 'User'}
          </span>
        </div>
        <button className="btn btn-ghost" onClick={handleSignOut} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", color: "var(--text-muted)" }}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button className="btn btn-primary" onClick={handleSignIn} disabled={isLoading} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "20px" }}>
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
}
