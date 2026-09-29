import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// Opção sem href aparece com "Em breve" (a tela ainda não existe).
// Quando uma tela ficar pronta, é só colocar o href dela aqui (vira link).
const pages = [
  {
    href: 'funcionario/menu/registrarVendas',
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

// Seta "→" desenhada em SVG (fica igual em qualquer computador, ao contrário do caractere ↗)
function Seta() {
  return (
    <svg className={styles.arrow} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function FuncionarioMenuPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Link href="/" aria-label="Massa Mia — voltar ao início">
            <Image src="/logo.jpg" alt="Massa Mia" width={1584} height={396} priority className={styles.logo} />
          </Link>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.role}>Funcionário</span>
        </div>
        <Link className={styles.exit} href="/">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </Link>
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
                <Seta />
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
