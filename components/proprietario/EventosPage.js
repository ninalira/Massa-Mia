import Link from 'next/link';
import styles from './pages.module.css';
import { listarEventos, real, dataBR, NOMES } from '@/lib/backend';

export default async function EventosPage() {
  let eventos = [];
  let erro = null;
  try {
    eventos = await listarEventos();
  } catch (e) {
    erro = e.message;
  }

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
            <span>{erro ? '—' : eventos.length} registros</span>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Data</th>
                  <th>Evento</th>
                  <th>Responsável</th>
                  <th>Público / capacidade</th>
                  <th>Buffet</th>
                  <th>Valor (ingressos + buffet)</th>
                  <th>Avaliação</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {eventos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className={styles.emptyState}>
                      <strong>{erro ? 'Não foi possível carregar os eventos' : 'Nenhum evento para exibir'}</strong>
                      <span>{erro || 'Os eventos aparecerão aqui quando forem registrados.'}</span>
                    </td>
                  </tr>
                ) : (
                  eventos.map((e) => (
                    <tr key={e.objectId}>
                      <td>{e.numEvento}</td>
                      <td>{dataBR(e.data)}</td>
                      <td>
                        {e.nome}
                        <span className={styles.subText}>{e.tipo}</span>
                      </td>
                      <td>{e.responsavel || '—'}</td>
                      <td>{e.status === 'REALIZADO' ? e.publicoReal : '—'} / {e.capacidade ?? '—'}</td>
                      <td>{e.buffet > 0 ? real(e.buffet) : 'Sem buffet'}</td>
                      <td>{real(e.total)}</td>
                      <td>{e.avaliacao > 0 ? e.avaliacao + ' de 5' : '—'}</td>
                      <td>{NOMES[e.status] || e.status}</td>
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
