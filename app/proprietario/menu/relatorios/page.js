import styles from './page.module.css';
import Cabecalho from '@/app/components/Cabecalho';
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
    <main className={styles.page}>
      <Cabecalho area="Proprietário" painel="/proprietario/menu" pagina="Relatórios" />

      <div className={styles.content}>
        <section className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>GESTÃO · ANÁLISE DO NEGÓCIO</p>
            <h1>Relatórios</h1>
            <p className={styles.intro}>Indicadores do salão e dos eventos em uma visão integrada.</p>
          </div>
          {error && <span className={styles.errorTag} title={error}>Dados indisponíveis</span>}
        </section>

        {/* ---------- Financeiro ---------- */}
        <section className={styles.section} aria-labelledby="financeiro-title">
          <h2 id="financeiro-title">Financeiro</h2>

          <div className={styles.grid}>
            <article className={`${styles.card} ${styles.totalCard}`}>
              <h3>Faturamento total combinado</h3>
              <p className={styles.detail}>Salão + eventos</p>
              <p className={styles.bigValue}>{valorOuTraco(respostas?.[8].faturamento)}</p>
            </article>

            <article className={`${styles.card} ${styles.wide}`}>
              <h3>Ticket médio</h3>
              <p className={styles.detail}>Comparativo por origem da receita</p>
              <div className={styles.boxes}>
                <div><span>Salão</span><strong>{valorOuTraco(respostas?.[0].salao)}</strong></div>
                <div><span>Buffet de eventos</span><strong>{valorOuTraco(respostas?.[0].eventos)}</strong></div>
                <div><span>Combinado</span><strong>{valorOuTraco(respostas?.[0].combinado)}</strong></div>
              </div>
            </article>

            <article className={styles.card}>
              <h3>Eventos com buffet do restaurante</h3>
              <p className={styles.detail}>Eventos realizados que contrataram o buffet</p>
              <div className={styles.boxes}>
                <div><strong>{numeroOuTraco(respostas?.[3].comBuffet)}</strong><span>eventos</span></div>
                <div><strong>{valorOuTraco(respostas?.[3].receitaMedia)}</strong><span>receita média</span></div>
              </div>
            </article>

            <article className={styles.card}>
              <h3>Faturamento do salão</h3>
              <p className={styles.detail}>Nos dias em que houve eventos</p>
              <p className={styles.value}>{valorOuTraco(respostas?.[4].faturamento)}</p>
            </article>

            <article className={styles.card}>
              <h3>Maior receita de buffet</h3>
              <p className={styles.detail}>Entre os buffets do restaurante</p>
              <p className={styles.winner}>{respostas?.[6] ? respostas[6].tipo || respostas[6].nome : 'Evento —'}</p>
              {respostas?.[6]?.nome && <p className={styles.detail}>Evento: {respostas[6].nome}</p>}
              <p className={styles.value}>{respostas?.[6] ? real(respostas[6].valorBuffet) : 'R$ —'}</p>
            </article>
          </div>

          <article className={styles.card}>
            <h3>Receita por dia da semana</h3>
            <p className={styles.detail}>Visão combinada e participação de cada origem</p>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr><th>Dia</th><th>Salão</th><th>Eventos</th><th>Combinado</th></tr>
                </thead>
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

        {/* ---------- Produtos mais consumidos ---------- */}
        <section className={styles.section} aria-labelledby="produtos-title">
          <h2 id="produtos-title">Produtos mais consumidos</h2>

          <div className={styles.grid}>
            <article className={`${styles.card} ${styles.wide}`}>
              <h3>Mais consumido por dia da semana</h3>
              <p className={styles.detail}>Salão, eventos e visão combinada</p>
              <div className={styles.tableWrap}>
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

            <article className={`${styles.card} ${styles.top}`}>
              <h3>Sabores mais servidos</h3>
              <p className={styles.detail}>Salão e eventos somados</p>
              <ol className={styles.ranking}>
                {[0, 1, 2].map((index) => {
                  const sabor = respostas?.[2][index];
                  return (
                    <li key={index}>
                      <span className={styles.position}>{index + 1}º</span>
                      <span>
                        <strong>{sabor ? sabor.sabor : respostas ? '—' : 'Aguardando dados'}</strong>
                        <small>{sabor ? sabor.quantidade : '—'} servidas</small>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </article>
          </div>
        </section>

        {/* ---------- Satisfação média ---------- */}
        <section className={styles.section} aria-labelledby="satisfacao-title">
          <h2 id="satisfacao-title">Satisfação média</h2>
          <div className={styles.grid}>
            {[
              ['Salão', 'salao'],
              ['Eventos', 'eventos'],
              ['Combinado', 'combinado'],
            ].map(([label, field]) => (
              <article className={styles.card} key={field}>
                <h3>{label}</h3>
                <p className={styles.bigValue}>{respostas && respostas[5][field] > 0 ? decimal(respostas[5][field]) : '—'}</p>
                <p className={styles.detail}>{respostas && respostas[5][field] > 0 ? 'de 5' : 'aguardando avaliações'}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
