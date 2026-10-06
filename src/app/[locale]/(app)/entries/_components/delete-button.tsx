"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function DeleteButton({ entryId }: { entryId: string }) {
  const t = useTranslations("entries");
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(t("deleteError"));
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg bg-white px-3 py-1.5 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? t("deleting") : t("delete")}
    </button>
  );
}
