"use client";

import { useViewerSession } from "@/components/layout/session-provider";
import { SessionRsvpCard } from "@/components/match/session-rsvp-card";
import type { UpcomingSession } from "@/lib/api/matches";

/**
 * Daftar kartu RSVP sesi mendatang. Status login dibaca dari client agar
 * landing page tidak perlu membaca cookie (tetap bisa di-cache ISR).
 */
export function RsvpSessionList({ sessions }: { sessions: UpcomingSession[] }) {
  const { userId, user } = useViewerSession();
  const isLoggedIn = Boolean(user);

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {sessions.map((session) => (
        <SessionRsvpCard
          key={session.id}
          session={session}
          reveal={isLoggedIn}
          isLoggedIn={isLoggedIn}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}
