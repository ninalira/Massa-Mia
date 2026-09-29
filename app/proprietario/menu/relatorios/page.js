import Link from 'next/link';
import styles from './page.module.css';
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

function maisConsumido(resultado) {
  if (!resultado) return '—';
  return resultado.produtos.join(' / ') + ' · ' + resultado.quantidade;
}

export default async function RelatoriosPage() {
  let respostas = null;
  let error = null;

  try {
    respostas = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9].map(chamarPergunta));
  } catch (requestError) {
    error = requestError.message;
  }

  const valorOuTraco = (valor) => (respostas ? real(valor) : 'R$ —');
  const numeroOuTraco = (valor) => (respostas ? valor : '—');

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
            {error && <span className={styles.comingSoon} title={error}><span /> Dados indisponíveis</span>}
          </section>

          <section className={styles.reportSection} aria-labelledby="financeiro-title">
            <div className={styles.sectionHeading}><h2 id="financeiro-title">Financeiro</h2></div>

            <div className={styles.metricGrid}>
              <article className={styles.metricCard}>
                <h3>Ticket médio</h3>
                <p className={styles.metricDetail}>Comparativo por origem da receita</p>
                <div className={styles.valueTriplet}>
                  <div><span>Salão</span><strong>{valorOuTraco(respostas?.[0].salao)}</strong></div>
                  <div><span>Buffet de eventos</span><strong>{valorOuTraco(respostas?.[0].eventos)}</strong></div>
                  <div><span>Combinado</span><strong>{valorOuTraco(respostas?.[0].combinado)}</strong></div>
                </div>
              </article>

              <article className={styles.metricCard}>
                <h3>Eventos com buffet do restaurante</h3>
                <p className={styles.metricDetail}>Eventos realizados que contrataram o buffet</p>
                <div className={styles.valuePair}>
                  <div><strong>{numeroOuTraco(respostas?.[3].comBuffet)}</strong><span>eventos</span></div>
                  <div><strong>{valorOuTraco(respostas?.[3].receitaMedia)}</strong><span>receita média</span></div>
                </div>
              </article>

              <article className={styles.metricCard}>
                <h3>Faturamento do salão</h3>
                <p className={styles.metricDetail}>Nos dias em que houve eventos</p>
                <p className={styles.metricValue}>{valorOuTraco(respostas?.[4].faturamento)}</p>
              </article>

              <article className={styles.metricCard}>
                <h3>Evento com maior receita de buffet</h3>
                <p className={styles.metricDetail}>Maior receita entre os buffets do restaurante</p>
                <div className={styles.winnerResult}>
                  <strong>{respostas?.[6] ? respostas[6].tipo || respostas[6].nome : 'Evento —'}</strong>
                  {respostas?.[6]?.nome && <span className={styles.winnerName}>Evento: {respostas[6].nome}</span>}
                  <span>Receita do buffet</span>
                  <b>{respostas?.[6] ? real(respostas[6].valorBuffet) : 'R$ —'}</b>
                </div>
              </article>

              <article className={`${styles.metricCard} ${styles.totalCard}`}>
                <h3>Faturamento total combinado</h3>
                <p className={styles.metricDetail}>Salão + eventos</p>
                <p className={styles.metricValue}>{valorOuTraco(respostas?.[8].faturamento)}</p>
              </article>
            </div>

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
                  <tbody>{weekdays.map((day, index) => (
                    <tr key={day}>
                      <th scope="row">{day}</th>
                      <td>{valorOuTraco(respostas?.[7][index].salao)}</td>
                      <td>{valorOuTraco(respostas?.[7][index].eventos)}</td>
                      <td>{valorOuTraco(respostas?.[7][index].total)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </article>
          </section>

          <section className={styles.reportSection} aria-labelledby="produtos-title">
            <div className={styles.sectionHeading}><h2 id="produtos-title">Produtos mais consumidos</h2></div>

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
                  <tbody>{weekdays.map((day, index) => (
                    <tr key={day}>
                      <th scope="row">{day}</th>
                      <td>{respostas ? maisConsumido(respostas[1][index].salao) : '—'}</td>
                      <td>{respostas ? maisConsumido(respostas[1][index].eventos) : '—'}</td>
                      <td>{respostas ? maisConsumido(respostas[1][index].combinado) : '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </article>

            <article className={styles.flavorsPanel}>
              <div className={styles.panelHeading}>
                <div>
                  <h3>Sabores de pizza mais servidos</h3>
                  <p>Salão e eventos somados</p>
                </div>
                <span className={styles.pendingCount}>TOP 3</span>
              </div>
              <div className={styles.flavorList}>
                {[0, 1, 2].map((index) => {
                  const sabor = respostas?.[2][index];
                  return (
                    <div className={styles.flavorRow} key={index}>
                      <span className={styles.flavorPosition}>0{index + 1}</span>
                      <strong>{sabor ? sabor.sabor : respostas ? '—' : 'Aguardando dados'}</strong>
                      <span>{sabor ? sabor.quantidade : '—'} servidas</span>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <section className={styles.reportSection} aria-labelledby="experiencia-title">
            <div className={styles.sectionHeading}><h2 id="experiencia-title">Satisfação média</h2></div>
            <article className={styles.satisfactionPanel}>
              {[
                ['Salão', 'salao'],
                ['Eventos', 'eventos'],
                ['Combinado', 'combinado'],
              ].map(([label, field]) => (
                <div key={field}>
                  <span>{label}</span>
                  <strong>{respostas && respostas[5][field] > 0 ? decimal(respostas[5][field]) : '—'}</strong>
                  <small>{respostas && respostas[5][field] > 0 ? 'de 5' : 'aguardando avaliações'}</small>
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