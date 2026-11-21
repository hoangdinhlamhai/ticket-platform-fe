import { AdminDecisionDialog } from './AdminCommon.tsx';
import type { AdminSensitiveOperation } from '../helpers/admin-transitions.ts';

export type AdminDecision = {
  readonly title: string;
  readonly description: string;
  readonly confirm: string;
  readonly operation: AdminSensitiveOperation;
  readonly submit: (reason: string) => void;
};

export function AdminSensitiveDecisionDialog({
  decision,
  onClose,
}: {
  readonly decision: AdminDecision | null;
  readonly onClose: () => void;
}) {
  return (
    <AdminDecisionDialog
      open={Boolean(decision)}
      title={decision?.title ?? ''}
      description={decision?.description ?? ''}
      confirmLabel={decision?.confirm ?? ''}
      operation={decision?.operation ?? 'approve_event'}
      onCancel={onClose}
      onConfirm={(reason) => {
        decision?.submit(reason);
        onClose();
      }}
    />
  );
}
