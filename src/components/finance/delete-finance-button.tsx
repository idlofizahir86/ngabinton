"use client";

import { Trash2 } from "lucide-react";

import { deleteFinanceEntryAction } from "@/actions/finance";

export type DeleteFinanceButtonProps = {
  entryId: string;
  description: string;
};

/** Hapus satu transaksi keuangan (admin/staf keuangan). */
export function DeleteFinanceButton({ entryId, description }: DeleteFinanceButtonProps) {
  return (
    <form
      action={deleteFinanceEntryAction}
      onSubmit={(event) => {
        if (!window.confirm(`Hapus transaksi "${description}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="entryId" value={entryId} />
      <button
        type="submit"
        aria-label={`Hapus transaksi ${description}`}
        className="rounded-md p-2 text-text-muted transition hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
