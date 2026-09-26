"use client";

import { Loader2 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { ChatApp } from "@/components/chat/chat-app";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { account, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return <LoginForm />;
  }

  return <ChatApp />;
}
