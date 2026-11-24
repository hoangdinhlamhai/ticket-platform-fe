import type { AdminPath } from "../../../../routes/admin-route.ts";
import { useResaleTransactions } from "../hooks/use-resale-transactions.ts";
import { ResaleTransactionDetail } from "../components/ResaleTransactionDetail.tsx";
import { ResaleTransactionList } from "../components/ResaleTransactionList.tsx";

type Props = {
  transactionId?: string | null;
  navigate: (path: AdminPath) => void;
};

export function ResaleTransactionsPage({ transactionId, navigate }: Props) {
  const data = useResaleTransactions(transactionId);
  if (transactionId) {
    return (
      <ResaleTransactionDetail
        {...data}
        transactionId={transactionId}
        navigate={navigate}
      />
    );
  }
  return (
    <ResaleTransactionList
      rows={data.rows}
      total={data.total}
      page={data.page}
      setPage={data.setPage}
      pageSize={data.pageSize}
      q={data.q}
      setQ={data.setQ}
      status={data.status}
      setStatus={data.setStatus}
      from={data.from}
      setFrom={data.setFrom}
      to={data.to}
      setTo={data.setTo}
      loading={data.loading}
      error={data.error}
      open={(id) => navigate(`/admin/resale/transactions/${id}` as AdminPath)}
      navigate={navigate}
    />
  );
}
