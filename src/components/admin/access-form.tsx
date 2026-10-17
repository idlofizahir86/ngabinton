"use client";

import { useActionState, useState } from "react";

import { updateMenuAccessAction } from "@/actions/access";
import { Button } from "@/components/ui/button";
import {
  MENU_DESCRIPTIONS,
  MENU_KEYS,
  MENU_LABELS,
  type MenuKey,
} from "@/lib/constants";
import { INITIAL_ACCESS_STATE } from "@/lib/forms/states";
import { cn } from "@/lib/utils/cn";

export type AccessFormProps = {
  userId: number;
  initialMenus: MenuKey[];
};

/** Form assign menu untuk satu anggota (RULES.md §5.5). */
export function AccessForm({ userId, initialMenus }: AccessFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateMenuAccessAction,
    INITIAL_ACCESS_STATE,
  );
  const [selected, setSelected] = useState<MenuKey[]>(initialMenus);

  function toggle(menu: MenuKey) {
    setSelected((current) =>
      current.includes(menu) ? current.filter((item) => item !== menu) : [...current, menu],
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />

      <div className="grid gap-2 sm:grid-cols-2">
        {MENU_KEYS.map((menu) => {
          const checked = selected.includes(menu);
          return (
            <label
              key={menu}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition",
                checked
                  ? "border-primary/60 bg-primary/10"
                  : "border-border bg-background-elevated hover:bg-surface-hover",
              )}
            >
              <input
                type="checkbox"
                name="menu"
                value={menu}
                checked={checked}
                onChange={() => toggle(menu)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-text">{MENU_LABELS[menu]}</span>
                <span className="mt-0.5 block text-xs text-text-muted">
                  {MENU_DESCRIPTIONS[menu]}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Akses menu tersimpan.
        </p>
      ) : null}

      <div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Akses"}
        </Button>
      </div>
    </form>
  );
}
