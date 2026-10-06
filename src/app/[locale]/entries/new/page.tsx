import EntryForm from "../_components/entry-form";

export default function NewEntryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">写心事</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntryForm mode="create" />
      </div>
    </div>
  );
}
