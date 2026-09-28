import Link from 'next/link';
import styles from './pages.module.css';

export default function EventosPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/proprietario/menu">Massa Mia <span>/</span> Eventos</Link>
        <Link className={styles.menuLink} href="/proprietario/menu">Menu do proprietário <span aria-hidden="true">↗</span></Link>
      </header>

      <div className={styles.content}>
        <p className={styles.eyebrow}>GESTÃO DO RESTAURANTE</p>
        <h1>Eventos</h1>
        <p className={styles.description}>Consulte os eventos realizados e seus detalhes.</p>

        <section className={styles.listSection} aria-labelledby="events-list-title">
          <div className={styles.sectionHeading}>
            <h2 id="events-list-title">Todos os eventos</h2>
            <span>— registros</span>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Evento</th>
                  <th>Responsável</th>
                  <th>Convidados</th>
                  <th>Buffet</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <strong>Nenhum evento para exibir</strong>
                    <span>Os eventos aparecerão aqui quando os dados estiverem disponíveis.</span>
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