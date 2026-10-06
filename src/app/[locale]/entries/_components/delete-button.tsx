"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确定删除这条心事吗？此操作不可撤销。")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      router.push("/entries");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg bg-white px-3 py-1.5 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? "删除中…" : "删除"}
    </button>
  );
}
