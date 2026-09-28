import Link from 'next/link';
import styles from './page.module.css';

const metrics = [
  { label: 'Faturamento', detail: 'Total do período selecionado' },
  { label: 'Pedidos', detail: 'Pedidos concluídos no período' },
  { label: 'Ticket médio', detail: 'Valor médio por pedido' },
];

const reportTypes = [
  { number: '01', title: 'Vendas por período', detail: 'Faturamento, pedidos e comparação entre períodos.' },
  { number: '02', title: 'Desempenho de produtos', detail: 'Itens mais vendidos e participação no faturamento.' },
  { number: '03', title: 'Operação de entregas', detail: 'Prazos, volume de entregas e desempenho operacional.' },
];

export default function ReportsPage() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/" aria-label="Massa Mia, página inicial">
          <span className={styles.brandMark}>M</span>
          <span className={styles.brandName}>massa mia<span>GESTÃO</span></span>
        </Link>

        <div className={styles.navLabel}>ESPAÇO DE TRABALHO</div>
        <nav className={styles.navigation} aria-label="Navegação principal">
          <Link className={styles.navLink} href="/">
            <span className={styles.navIcon} aria-hidden="true">⌂</span>
            Visão geral
          </Link>
          <span className={`${styles.navLink} ${styles.navActive}`} aria-current="page">
            <span className={styles.navIcon} aria-hidden="true">▤</span>
            Relatórios
          </span>
        </nav>

        <div className={styles.sidebarNote}>
          <span className={styles.statusDot} />
          <span>Área de relatórios<br /><strong>Em preparação</strong></span>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.breadcrumb}>Gestão <span>/</span> Relatórios</span>
          <Link className={styles.backLink} href="/">Voltar ao início <span aria-hidden="true">↗</span></Link>
        </header>

        <div className={styles.content}>
          <section className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>ANÁLISE DO NEGÓCIO</p>
              <h1>Relatórios</h1>
              <p className={styles.intro}>Acompanhe os resultados da Massa Mia em um só lugar.</p>
            </div>
            <span className={styles.comingSoon}><span /> Em construção</span>
          </section>

          <section className={styles.metrics} aria-label="Indicadores do período">
            {metrics.map((metric) => (
              <article className={styles.metric} key={metric.label}>
                <div className={styles.metricTop}>
                  <h2>{metric.label}</h2>
                  <span className={styles.metricGlyph} aria-hidden="true">↗</span>
                </div>
                <p className={styles.metricValue}>—</p>
                <p className={styles.metricDetail}>{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className={styles.analytics} aria-label="Prévia de análises">
            <article className={styles.chartPanel}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>Evolução das vendas</h2>
                  <p>Faturamento ao longo do tempo</p>
                </div>
                <span className={styles.period}>Período —</span>
              </div>
              <div className={styles.chartPlaceholder} role="status">
                <div className={styles.chartGrid} aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
                <div className={styles.chartMessage}>
                  <span className={styles.chartGlyph} aria-hidden="true">⌁</span>
                  <strong>Seus dados aparecerão aqui</strong>
                  <span>Aguardando integração com os dados de vendas.</span>
                </div>
                <div className={styles.chartAxis} aria-hidden="true"><span>—</span><span>—</span><span>—</span><span>—</span></div>
              </div>
            </article>

            <article className={styles.productsPanel}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>Mais vendidos</h2>
                  <p>Produtos em destaque</p>
                </div>
                <span className={styles.panelArrow} aria-hidden="true">↗</span>
              </div>
              <div className={styles.productsPlaceholder} role="status">
                <span className={styles.productGlyph} aria-hidden="true">◌</span>
                <strong>Ranking em breve</strong>
                <span>Os produtos serão listados quando os dados estiverem disponíveis.</span>
              </div>
            </article>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>CENTRO DE ANÁLISE</p>
                <h2>Relatórios disponíveis</h2>
              </div>
              <span className={styles.pendingCount}>03 planejados</span>
            </div>
            <div className={styles.reportList}>
              {reportTypes.map((report) => (
                <article className={styles.reportRow} key={report.number}>
                  <span className={styles.reportNumber}>{report.number}</span>
                  <div className={styles.reportCopy}>
                    <h3>{report.title}</h3>
                    <p>{report.detail}</p>
                  </div>
                  <span className={styles.reportStatus}>Em breve</span>
                  <span className={styles.reportArrow} aria-hidden="true">↗</span>
                </article>
              ))}
            </div>
          </section>

          <footer className={styles.footer}>MASSA MIA <span>·</span> PAINEL DE GESTÃO</footer>
        </div>
      </main>
    </div>
  );
}