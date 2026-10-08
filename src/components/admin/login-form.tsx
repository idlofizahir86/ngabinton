"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: LoginState = { error: null };

type LoginFormProps = {
  /** Tujuan setelah login sukses (dari param `redirect`). */
  redirectTo?: string;
};

/** Form login admin — COMPONENTS.md §6.6, konten dari CONTENT.md §5.1. */
export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="username"
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      {state.error ? (
        <p role="alert" aria-live="polite" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Memuat..." : "Masuk"}
      </Button>
    </form>
  );
}
