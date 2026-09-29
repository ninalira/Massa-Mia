import Link from 'next/link';
import styles from './pages.module.css';
import SortableTable from './SortableTable';
import { listarEventos, real, dataBR, NOMES } from '@/lib/backend';

const columns = [
  { key: 'number', label: 'Nº', type: 'number', sortable: true },
  { key: 'date', label: 'Data', type: 'text', sortable: true },
  { key: 'eventType', label: 'Evento', type: 'text', sortable: true, subKey: 'eventName' },
  { key: 'responsible', label: 'Responsável', type: 'text', sortable: true },
  { key: 'attendance', label: 'Público / capacidade', type: 'number', sortable: true },
  { key: 'buffet', label: 'Buffet', type: 'number', sortable: true },
  { key: 'total', label: 'Valor (ingressos + buffet)', type: 'number', sortable: true },
  { key: 'assessment', label: 'Avaliação', sortable: false },
  { key: 'status', label: 'Status', type: 'text', sortable: true },
];

export default async function EventosPage() {
  let eventos = [];
  let erro = null;
  try {
    eventos = await listarEventos();
  } catch (e) {
    erro = e.message;
  }

  const rows = eventos.map((e) => {
    const status = NOMES[e.status] || e.status;
    const realizado = e.status === 'REALIZADO';

    return {
      id: e.objectId,
      number: e.numEvento,
      date: dataBR(e.data),
      eventType: e.tipo || e.nome,
      eventName: e.nome || '',
      responsible: e.responsavel || '—',
      attendance: (realizado ? e.publicoReal : '—') + ' / ' + (e.capacidade ?? '—'),
      buffet: e.buffet > 0 ? real(e.buffet) : 'Sem buffet',
      total: real(e.total),
      assessment: e.avaliacao > 0 ? e.avaliacao + ' de 5' : '—',
      status,
      sortValues: {
        number: e.numEvento,
        date: e.data || '',
        eventType: e.tipo || e.nome || '',
        responsible: e.responsavel || '',
        attendance: realizado ? e.publicoReal : 0,
        buffet: e.buffet,
        total: e.total,
        status,
      },
    };
  });

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

          <SortableTable
            columns={columns}
            emptyMessage="Os eventos aparecerão aqui quando forem registrados."
            emptyTitle="Nenhum evento para exibir"
            error={erro}
            rows={rows}
          />
        </section>
      </div>
    </main>
  );
}
