import Link from 'next/link';
import styles from './pages.module.css';
import SortableTable from './SortableTable';
import { listarVendas, real, dataBR, NOMES } from '@/lib/backend';

const columns = [
  { key: 'number', label: 'Nº', type: 'number', sortable: true },
  { key: 'date', label: 'Data', type: 'text', sortable: true },
  { key: 'client', label: 'Cliente', type: 'text', sortable: true },
  { key: 'items', label: 'Itens', sortable: false, className: styles.longText },
  { key: 'payment', label: 'Pagamento', type: 'text', sortable: true },
  { key: 'status', label: 'Status', type: 'text', sortable: true },
  { key: 'assessment', label: 'Avaliação / motivo', sortable: false },
  { key: 'total', label: 'Total', type: 'number', sortable: true },
];

export default async function VendasPage() {
  let vendas = [];
  let erro = null;
  try {
    vendas = await listarVendas();
  } catch (e) {
    erro = e.message;
  }

  const rows = vendas.map((v) => {
    const status = NOMES[v.status] || v.status;
    const pagamento = NOMES[v.formaPagamento] || '—';

    return {
      id: v.objectId,
      number: v.numPedido,
      date: dataBR(v.data),
      client: v.cliente || '—',
      items: v.itens.map((i) => i.quantidade + '× ' + i.descricao).join(', ') || '—',
      payment: pagamento,
      status,
      assessment: v.status === 'CANCELADO' ? v.motivoCancelamento : v.avaliacao > 0 ? v.avaliacao + ' de 5' : '—',
      total: real(v.total),
      sortValues: {
        number: v.numPedido,
        date: v.data || '',
        client: v.cliente || '',
        payment: pagamento,
        status,
        total: v.total,
      },
    };
  });

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/proprietario/menu">Massa Mia <span>/</span> Vendas</Link>
        <Link className={styles.menuLink} href="/proprietario/menu">Menu do proprietário <span aria-hidden="true">↗</span></Link>
      </header>

      <div className={styles.content}>
        <p className={styles.eyebrow}>GESTÃO DO RESTAURANTE</p>
        <h1>Vendas</h1>
        <p className={styles.description}>Acompanhe as vendas realizadas no restaurante.</p>

        <section className={styles.listSection} aria-labelledby="sales-list-title">
          <div className={styles.sectionHeading}>
            <h2 id="sales-list-title">Todas as vendas</h2>
            <span>{erro ? '—' : vendas.length} registros</span>
          </div>

          <SortableTable
            columns={columns}
            emptyMessage="As vendas aparecerão aqui quando forem registradas."
            emptyTitle="Nenhuma venda para exibir"
            error={erro}
            rows={rows}
          />
        </section>
      </div>
    </main>
  );
}
