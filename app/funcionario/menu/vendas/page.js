import Link from 'next/link';
import styles from '../../../proprietario/menu/vendas/page.module.css';
import Cabecalho from '@/app/components/Cabecalho';
import { listarVendas, real, dataBR, NOMES } from '@/lib/backend';

const columns = [
  { key: 'number', label: 'Nº', sortable: true },
  { key: 'date', label: 'Data', sortable: true },
  { key: 'client', label: 'Cliente', sortable: true },
  { key: 'items', label: 'Itens', sortable: false },
  { key: 'payment', label: 'Pagamento', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'assessment', label: 'Avaliação / motivo', sortable: false },
  { key: 'total', label: 'Total', sortable: true },
];

export default async function VendasRoute({ searchParams }) {
  const params = await searchParams;
  const sortBy = columns.find((column) => column.key === params.sort && column.sortable)?.key || 'number';
  const direction = params.direction === 'asc' ? 'asc' : 'desc';

  let vendas = [];
  let error = null;
  try {
    vendas = await listarVendas();
  } catch (requestError) {
    error = requestError.message;
  }

  const rows = vendas.map((venda) => {
    const payment = NOMES[venda.formaPagamento] || '—';
    const status = NOMES[venda.status] || venda.status;

    return {
      id: venda.objectId,
      values: {
        number: venda.numPedido,
        date: dataBR(venda.data),
        client: venda.cliente || '—',
        items: venda.itens.map((item) => item.quantidade + '× ' + item.descricao).join(', ') || '—',
        payment,
        status,
        assessment: venda.status === 'CANCELADO'
          ? venda.motivoCancelamento
          : venda.avaliacao > 0 ? venda.avaliacao + ' de 5' : '—',
        total: real(venda.total),
      },
      sortValues: {
        number: venda.numPedido,
        date: venda.data || '',
        client: venda.cliente || '',
        payment,
        status,
        total: venda.total,
      },
    };
  });

  const sortedRows = [...rows].sort((left, right) => {
    const leftValue = left.sortValues[sortBy];
    const rightValue = right.sortValues[sortBy];
    const comparison = typeof leftValue === 'number'
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue), 'pt-BR', { numeric: true, sensitivity: 'base' });

    return direction === 'asc' ? comparison : -comparison;
  });

  return (
    <main className={styles.page}>
      <Cabecalho area="Funcionário" painel="/funcionario/menu" pagina="Vendas" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>ROTINA DO RESTAURANTE</p>
        <h1>Vendas</h1>
        <p className={styles.description}>Consulte as vendas registradas no restaurante.</p>

        <section className={styles.listSection} aria-labelledby="sales-list-title">
          <div className={styles.sectionHeading}>
            <h2 id="sales-list-title">Todas as vendas</h2>
            <span>{error ? '—' : vendas.length} registros</span>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  {columns.map((column) => {
                    const active = sortBy === column.key;
                    const nextDirection = active && direction === 'asc' ? 'desc' : 'asc';

                    return (
                      <th
                        aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                        key={column.key}
                        scope="col"
                      >
                        {column.sortable ? (
                          <Link className={styles.sortLink} href={`?sort=${column.key}&direction=${nextDirection}`}>
                            {column.label}
                            <span aria-hidden="true">{active ? (direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                          </Link>
                        ) : column.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className={styles.emptyState}>
                      <strong>{error ? 'Não foi possível carregar as vendas' : 'Nenhuma venda para exibir'}</strong>
                      <span>{error || 'As vendas aparecerão aqui quando forem registradas.'}</span>
                    </td>
                  </tr>
                ) : sortedRows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td className={column.key === 'items' ? styles.longText : undefined} key={column.key}>
                        {row.values[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}