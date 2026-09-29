import Link from 'next/link';
import styles from './relatorios.module.css';
import { chamarPergunta, real, decimal } from '@/lib/backend';

const weekdays = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

// Pergunta 2: produto(s) mais consumido(s) no dia, ou "—" se ninguém consumiu nada.
function maisConsumido(resultado) {
  if (!resultado) return '—';
  return resultado.produtos.join(' / ') + ' · ' + resultado.quantidade;
}

export default async function RelatoriosPage() {
  let p = null; // p[1] = resposta da pergunta 1, p[2] = da pergunta 2...
  let erro = null;
  try {
    const respostas = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9].map(chamarPergunta));
    p = [null, ...respostas];
  } catch (e) {
    erro = e.message;
  }

  // Sem dados (erro), todo valor aparece como "—", como na tela antes de ligar o back-end.
  const R = (valor) => (p ? real(valor) : 'R$ —');
  const N = (valor) => (p ? valor : '—');

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/proprietario/menu">Massa Mia <span>/</span> Relatórios</Link>
          <Link className={styles.homeLink} href="/proprietario/menu">Menu do proprietário <span aria-hidden="true">↗</span></Link>
        </header>

        <div className={styles.content}>
          <section className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>GESTÃO · ANÁLISE DO NEGÓCIO</p>
              <h1>Relatórios</h1>
              <p className={styles.intro}>Indicadores do salão e dos eventos em uma visão integrada.</p>
            </div>
            {erro && <span className={styles.comingSoon} title={erro}><span /> Dados indisponíveis</span>}
          </section>

          <section className={styles.reportSection} aria-labelledby="financeiro-title">
            <div className={styles.sectionHeading}>
              <h2 id="financeiro-title">Financeiro</h2>
            </div>

            <div className={styles.metricGrid}>
              {/* Pergunta 1 */}
              <article className={styles.metricCard}>
                <h3>Ticket médio</h3>
                <p className={styles.metricDetail}>Comparativo por origem da receita</p>
                <div className={styles.valueTriplet}>
                  <div><span>Salão</span><strong>{R(p?.[1].salao)}</strong></div>
                  <div><span>Buffet de eventos</span><strong>{R(p?.[1].eventos)}</strong></div>
                  <div><span>Combinado</span><strong>{R(p?.[1].combinado)}</strong></div>
                </div>
              </article>

              {/* Pergunta 4 */}
              <article className={styles.metricCard}>
                <h3>Eventos com buffet do restaurante</h3>
                <p className={styles.metricDetail}>Eventos realizados que contrataram o buffet</p>
                <div className={styles.valuePair}>
                  <div><strong>{N(p?.[4].comBuffet)}</strong><span>eventos</span></div>
                  <div><strong>{R(p?.[4].receitaMedia)}</strong><span>receita média</span></div>
                </div>
              </article>

              {/* Pergunta 5 */}
              <article className={styles.metricCard}>
                <h3>Faturamento do salão</h3>
                <p className={styles.metricDetail}>Nos dias em que houve eventos</p>
                <p className={styles.metricValue}>{R(p?.[5].faturamento)}</p>
              </article>

              {/* Pergunta 7 */}
              <article className={styles.metricCard}>
                <h3>Evento com maior receita de buffet</h3>
                <p className={styles.metricDetail}>Maior receita entre os buffets do restaurante</p>
                <div className={styles.winnerResult}>
                  <strong>{p?.[7] ? p[7].nome : 'Evento —'}</strong>
                  <span>Receita do buffet</span>
                  <b>{p?.[7] ? real(p[7].valorBuffet) : 'R$ —'}</b>
                </div>
              </article>

              {/* Pergunta 9 */}
              <article className={`${styles.metricCard} ${styles.totalCard}`}>
                <h3>Faturamento total combinado</h3>
                <p className={styles.metricDetail}>Salão + eventos</p>
                <p className={styles.metricValue}>{R(p?.[9].faturamento)}</p>
              </article>
            </div>

            {/* Pergunta 8 */}
            <article className={styles.tablePanel}>
              <div className={styles.panelHeading}>
                <div>
                  <h3>Receita por dia da semana</h3>
                  <p>Visão combinada e participação de cada origem</p>
                </div>
                <span className={styles.tableLegend}><i /> Salão <i /> Eventos</span>
              </div>
              <div className={styles.tableScroller}>
                <table>
                  <thead><tr><th>Dia</th><th>Salão</th><th>Eventos</th><th>Combinado</th></tr></thead>
                  <tbody>{weekdays.map((day, i) => (
                    <tr key={day}>
                      <th scope="row">{day}</th>
                      <td>{R(p?.[8][i].salao)}</td>
                      <td>{R(p?.[8][i].eventos)}</td>
                      <td>{R(p?.[8][i].total)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </article>
          </section>

          <section className={styles.reportSection} aria-labelledby="produtos-title">
            <div className={styles.sectionHeading}>
              <h2 id="produtos-title">Produtos mais consumidos</h2>
            </div>

            {/* Pergunta 2 */}
            <article className={styles.tablePanel}>
              <div className={styles.panelHeading}>
                <div>
                  <h3>Produto mais consumido por dia da semana</h3>
                  <p>Comparativo entre salão, eventos e visão combinada</p>
                </div>
              </div>
              <div className={styles.tableScroller}>
                <table>
                  <thead><tr><th>Dia</th><th>Salão</th><th>Eventos</th><th>Combinado</th></tr></thead>
                  <tbody>{weekdays.map((day, i) => (
                    <tr key={day}>
                      <th scope="row">{day}</th>
                      <td>{p ? maisConsumido(p[2][i].salao) : '—'}</td>
                      <td>{p ? maisConsumido(p[2][i].eventos) : '—'}</td>
                      <td>{p ? maisConsumido(p[2][i].combinado) : '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </article>

            {/* Pergunta 3 */}
            <article className={styles.flavorsPanel}>
              <div className={styles.panelHeading}>
                <div>
                  <h3>Sabores de pizza mais servidos</h3>
                  <p>Salão e eventos somados</p>
                </div>
                <span className={styles.pendingCount}>TOP 3</span>
              </div>
              <div className={styles.flavorList}>
                {[0, 1, 2].map((i) => {
                  const sabor = p?.[3][i];
                  return (
                    <div className={styles.flavorRow} key={i}>
                      <span className={styles.flavorPosition}>0{i + 1}</span>
                      <strong>{sabor ? sabor.sabor : p ? '—' : 'Aguardando dados'}</strong>
                      <span>{sabor ? sabor.quantidade : '—'} servidas</span>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          {/* Pergunta 6 */}
          <section className={styles.reportSection} aria-labelledby="experiencia-title">
            <div className={styles.sectionHeading}>
              <h2 id="experiencia-title">Satisfação média</h2>
            </div>
            <article className={styles.satisfactionPanel}>
              {[['Salão', 'salao'], ['Eventos', 'eventos'], ['Combinado', 'combinado']].map(([rotulo, campo]) => (
                <div key={campo}>
                  <span>{rotulo}</span>
                  <strong>{p && p[6][campo] > 0 ? decimal(p[6][campo]) : '—'}</strong>
                  <small>{p && p[6][campo] > 0 ? 'de 5' : 'aguardando avaliações'}</small>
                </div>
              ))}
            </article>
          </section>

          <footer className={styles.footer}>MASSA MIA <span>·</span> RELATÓRIOS</footer>
        </div>
      </main>
    </div>
  );
}
