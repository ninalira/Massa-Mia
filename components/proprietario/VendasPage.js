import Link from 'next/link';
import styles from './pages.module.css';

export default function VendasPage() {
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
            <span>— registros</span>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Venda</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Pagamento</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <strong>Nenhuma venda para exibir</strong>
                    <span>As vendas aparecerão aqui quando os dados estiverem disponíveis.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}