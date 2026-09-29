import Link from 'next/link';
import styles from './pages.module.css';
import { listarVendas, real, dataBR, NOMES } from '@/lib/backend';

export default async function VendasPage() {
  let vendas = [];
  let erro = null;
  try {
    vendas = await listarVendas();
  } catch (e) {
    erro = e.message;
  }

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

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Avaliação / motivo</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {vendas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyState}>
                      <strong>{erro ? 'Não foi possível carregar as vendas' : 'Nenhuma venda para exibir'}</strong>
                      <span>{erro || 'As vendas aparecerão aqui quando forem registradas.'}</span>
                    </td>
                  </tr>
                ) : (
                  vendas.map((v) => (
                    <tr key={v.objectId}>
                      <td>{v.numPedido}</td>
                      <td>{dataBR(v.data)}</td>
                      <td>{v.cliente || '—'}</td>
                      <td className={styles.longText}>
                        {v.itens.map((i) => i.quantidade + '× ' + i.descricao).join(', ') || '—'}
                      </td>
                      <td>{NOMES[v.formaPagamento] || '—'}</td>
                      <td>{NOMES[v.status] || v.status}</td>
                      <td>
                        {v.status === 'CANCELADO' ? v.motivoCancelamento : v.avaliacao > 0 ? v.avaliacao + ' de 5' : '—'}
                      </td>
                      <td>{real(v.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
