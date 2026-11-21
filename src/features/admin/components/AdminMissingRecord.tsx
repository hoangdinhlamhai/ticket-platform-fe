import { AdminPageHeader } from './AdminCommon.tsx';

export function AdminMissingRecord({
  title,
  navigate,
}: {
  readonly title: string;
  readonly navigate: (path: string) => void;
}) {
  return (
    <section className="rounded-lg border border-dashed border-line bg-surface p-8">
      <AdminPageHeader eyebrow="KHÔNG TÌM THẤY" title={title}>
        Bản ghi không tồn tại trong fixture Admin hiện tại.
      </AdminPageHeader>
      <button
        className="mt-5 min-h-11 rounded bg-pine px-4 font-extrabold text-paper"
        type="button"
        onClick={() => navigate('/admin')}
      >
        Về Tổng quan
      </button>
    </section>
  );
}
