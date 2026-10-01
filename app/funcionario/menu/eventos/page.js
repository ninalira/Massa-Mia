import Link from 'next/link';
import styles from '../../../proprietario/menu/eventos/page.module.css';
import Cabecalho from '@/app/components/Cabecalho';
import BotaoRemover from '@/app/components/BotaoRemover';
import remocao from '@/app/components/BotaoRemover.module.css';
import AtualizarStatusEvento from './AtualizarStatusEvento';
import EditarEvento from './EditarEvento';
import editar from './EditarEvento.module.css';
import { listarEventos, real, dataBR, NOMES } from '@/lib/backend';

const columns = [
  { key: 'actions', label: 'Ações', sortable: false },
  { key: 'number', label: 'Nº', sortable: true },
  { key: 'date', label: 'Data', sortable: true },
  { key: 'eventType', label: 'Evento', sortable: true },
  { key: 'responsible', label: 'Responsável', sortable: true },
  { key: 'attendance', label: 'Público / capacidade', sortable: true },
  { key: 'buffet', label: 'Buffet', sortable: true },
  { key: 'total', label: 'Valor (ingressos + buffet)', sortable: true },
  { key: 'assessment', label: 'Avaliação', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
];

export default async function EventosRoute({ searchParams }) {
  const params = await searchParams;
  const sortBy = columns.find((column) => column.key === params.sort && column.sortable)?.key || 'number';
  const direction = params.direction === 'asc' ? 'asc' : 'desc';

  let eventos = [];
  let error = null;
  try {
    eventos = await listarEventos();
  } catch (requestError) {
    error = requestError.message;
  }

  const rows = eventos.map((evento) => {
    const status = NOMES[evento.status] || evento.status;
    const realizado = evento.status === 'REALIZADO';
    const tipo = evento.tipo || evento.nome || '—';

    return {
      id: evento.objectId,
      campoTipo: 'tipo' in evento ? 'tipo' : 'nome',
      inicial: {
        data: evento.data || '',
        tipo: evento.tipo ?? evento.nome ?? '',
        responsavel: evento.responsavel || '',
        capacidade: evento.capacidade ?? 0,
        precoIngresso: evento.precoIngresso ?? 0,
        ingressosVendidos: evento.ingressosVendidos ?? 0,
        publicoReal: evento.publicoReal ?? 0,
        avaliacao: evento.avaliacao ?? 0,
      },
      values: {
        number: evento.numEvento,
        date: dataBR(evento.data),
        eventType: tipo,
        responsible: evento.responsavel || '—',
        attendance: (realizado ? evento.publicoReal : '—') + ' / ' + (evento.capacidade ?? '—'),
        buffet: evento.buffet > 0 ? real(evento.buffet) : 'Sem buffet',
        total: real(evento.total),
        statusControl: evento.status,
        assessment: evento.avaliacao > 0 ? evento.avaliacao + ' de 5' : '—',
        status,
      },
      sortValues: {
        number: evento.numEvento,
        date: evento.data || '',
        eventType: tipo,
        responsible: evento.responsavel || '',
        attendance: realizado ? evento.publicoReal : 0,
        buffet: evento.buffet,
        total: evento.total,
        status,
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
      <Cabecalho area="Funcionário" painel="/funcionario/menu" pagina="Eventos" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>ROTINA DO RESTAURANTE</p>
        <h1>Eventos</h1>
        <p className={styles.description}>Consulte e edite os eventos registrados e seus detalhes.</p>

        <section className={styles.listSection} aria-labelledby="events-list-title">
          <div className={styles.sectionHeading}>
            <h2 id="events-list-title">Todos os eventos</h2>
            <span>{error ? '—' : eventos.length} registros</span>
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
                      <strong>{error ? 'Não foi possível carregar os eventos' : 'Nenhum evento para exibir'}</strong>
                      <span>{error || 'Os eventos aparecerão aqui quando forem registrados.'}</span>
                    </td>
                  </tr>
                ) : sortedRows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td className={column.key === 'eventType' || column.key === 'responsible' ? remocao.quebra : undefined} key={column.key}>
                        {column.key === 'eventType' ? (
                          <>
                            <strong>{row.values.eventType}</strong>
                            <span className={styles.subText}></span>
                          </>
                        ) : column.key === 'actions' ? (
                          <div className={editar.acoes}>
                            <EditarEvento id={row.id} numero={row.values.number} campoTipo={row.campoTipo} inicial={row.inicial} />
                            <BotaoRemover tipo="evento" id={row.id} numero={row.values.number} />
                          </div>
            ) : column.key === 'status' ? (
              <AtualizarStatusEvento id={row.id} status={row.values.statusControl} />
                        ) : row.values[column.key]}
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