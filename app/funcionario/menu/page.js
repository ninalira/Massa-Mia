import Link from 'next/link';
import styles from './page.module.css';

// As telas ainda não existem: cada opção aparece com "Em breve".
// Quando uma tela ficar pronta, é só colocar o href dela aqui (vira link).
const pages = [
  {
    href: null,
    number: '01',
    title: 'Registrar venda',
    description: 'Lance uma venda do salão com os itens e a forma de pagamento.',
  },
  {
    href: '/funcionario/menu/vendas',
    number: '02',
    title: 'Vendas',
    description: 'Consulte as vendas registradas e remova uma venda lançada errada.',
  },
  {
    href: null,
    number: '03',
    title: 'Agendar evento',
    description: 'Cadastre um novo evento com capacidade, ingresso e buffet.',
  },
  {
    href: '/funcionario/menu/eventos',
    number: '04',
    title: 'Eventos',
    description: 'Atualize o status dos eventos (realizado ou cancelado) e remova eventos.',
  },
];

export default function FuncionarioMenuPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">Massa Mia <span>/</span> Funcionário</Link>
        <span className={styles.pending}><i /> Área em preparação</span>
      </header>

      <div className={styles.content}>
        <p className={styles.eyebrow}>ROTINA DO RESTAURANTE</p>
        <h1>Área do funcionário</h1>
        <p className={styles.description}>Registre vendas e cuide dos eventos do restaurante.</p>

        <nav className={styles.menu} aria-label="Menu do funcionário">
          {pages.map((page) => {
            const conteudo = (
              <>
                <span className={styles.number}>{page.number}</span>
                <span className={styles.itemCopy}>
                  <strong>{page.title}</strong>
                  <span>{page.description}</span>
                </span>
              </>
            );

            return page.href ? (
              <Link className={styles.menuItem} href={page.href} key={page.number}>
                {conteudo}
                <span className={styles.arrow} aria-hidden="true">↗</span>
              </Link>
            ) : (
              <div className={`${styles.menuItem} ${styles.disabled}`} aria-disabled="true" key={page.number}>
                {conteudo}
                <span className={styles.soon}>Em breve</span>
              </div>
            );
          })}
        </nav>
      </div>
    </main>
  );
}