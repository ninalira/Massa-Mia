import Link from 'next/link';
import styles from './page.module.css';

const weekdays = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export default function ReportsPage() {
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
            <span className={styles.comingSoon}><span /> Aguardando dados</span>
          </section>

          <section className={styles.reportSection} aria-labelledby="financeiro-title">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>01 · RESULTADOS</p>
              <h2 id="financeiro-title">Financeiro</h2>
            </div>

            <div className={styles.metricGrid}>
              <article className={styles.metricCard}>
                <h3>Ticket médio</h3>
                <p className={styles.metricDetail}>Comparativo por origem da receita</p>
                <div className={styles.valueTriplet}>
                  <div><span>Salão</span><strong>R$ —</strong></div>
                  <div><span>Buffet de eventos</span><strong>R$ —</strong></div>
                  <div><span>Combinado</span><strong>R$ —</strong></div>
                </div>
              </article>

              <article className={styles.metricCard}>
                <h3>Eventos com buffet do restaurante</h3>
                <p className={styles.metricDetail}>Eventos realizados que contrataram o buffet</p>
                <div className={styles.valuePair}>
                  <div><strong>—</strong><span>eventos</span></div>
                  <div><strong>R$ —</strong><span>receita média</span></div>
                </div>
              </article>

              <article className={styles.metricCard}>
                <h3>Faturamento do salão</h3>
                <p className={styles.metricDetail}>Nos dias em que houve eventos</p>
                <p className={styles.metricValue}>R$ —</p>
              </article>

              <article className={styles.metricCard}>
                <h3>Evento com maior receita de buffet</h3>
                <p className={styles.metricDetail}>Maior receita entre os buffets do restaurante</p>
                <div className={styles.winnerResult}>
                  <strong>Evento —</strong>
                  <span>Receita do buffet</span>
                  <b>R$ —</b>
                </div>
              </article>

              <article className={`${styles.metricCard} ${styles.totalCard}`}>
                <h3>Faturamento total combinado</h3>
                <p className={styles.metricDetail}>Salão + eventos</p>
                <p className={styles.metricValue}>R$ —</p>
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
                  <tbody>{weekdays.map((day) => (
                    <tr key={day}><th scope="row">{day}</th><td>R$ —</td><td>R$ —</td><td>R$ —</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </article>
          </section>

          <section className={styles.reportSection} aria-labelledby="produtos-title">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>02 · CONSUMO</p>
              <h2 id="produtos-title">Produtos mais consumidos</h2>
            </div>

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
                  <tbody>{weekdays.map((day) => (
                    <tr key={day}><th scope="row">{day}</th><td>—</td><td>—</td><td>—</td></tr>
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
                {[1, 2, 3].map((position) => (
                  <div className={styles.flavorRow} key={position}>
                    <span className={styles.flavorPosition}>0{position}</span>
                    <strong>Aguardando dados</strong>
                    <span>— servidas</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className={styles.reportSection} aria-labelledby="experiencia-title">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>03 · EXPERIÊNCIA</p>
              <h2 id="experiencia-title">Satisfação média</h2>
            </div>
            <article className={styles.satisfactionPanel}>
              <div><span>Salão</span><strong>—</strong><small>aguardando avaliações</small></div>
              <div><span>Eventos</span><strong>—</strong><small>aguardando avaliações</small></div>
              <div><span>Combinado</span><strong>—</strong><small>aguardando avaliações</small></div>
            </article>
          </section>

          <footer className={styles.footer}>MASSA MIA <span>·</span> RELATÓRIOS</footer>
        </div>
      </main>
    </div>
  );
}