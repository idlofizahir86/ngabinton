"use client";

import { Trash2 } from "lucide-react";

import { deleteFinanceTransferAction } from "@/actions/finance";

export type DeleteTransferButtonProps = {
  transferId: string;
  description: string;
};

/** Hapus catatan pindah dana Cash ↔ Rekening Bank. */
export function DeleteTransferButton({ transferId, description }: DeleteTransferButtonProps) {
  return (
    <form
      action={deleteFinanceTransferAction}
      onSubmit={(event) => {
        if (!window.confirm(`Hapus pindah dana "${description}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="transferId" value={transferId} />
      <button
        type="submit"
        aria-label={`Hapus pindah dana ${description}`}
        className="rounded-md p-2 text-text-muted transition hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
