import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const pages = [
  {
    href: '/proprietario/menu/vendas',
    number: '01',
    title: 'Vendas',
    description: 'Consulte as vendas realizadas no restaurante.',
  },
  {
    href: '/proprietario/menu/eventos',
    number: '02',
    title: 'Eventos',
    description: 'Acompanhe eventos realizados e informações de buffet.',
  },
  {
    href: '/proprietario/menu/relatorios',
    number: '03',
    title: 'Relatórios',
    description: 'Acesse os indicadores de vendas, eventos e satisfação.',
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

export default function ProprietarioMenuPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Link href="/" aria-label="Massa Mia — voltar ao início">
            <Image src="/logo.jpg" alt="Massa Mia" width={1584} height={396} priority className={styles.logo} />
          </Link>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.role}>Proprietário</span>
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
        <p className={styles.eyebrow}>GESTÃO DO RESTAURANTE</p>
        <h1>Área do proprietário</h1>
        <p className={styles.description}>Acesse as informações do restaurante.</p>

        <nav className={styles.menu} aria-label="Menu do proprietário">
          {pages.map((page) => (
            <Link className={styles.menuItem} href={page.href} key={page.href}>
              <span className={styles.number}>{page.number}</span>
              <span className={styles.itemCopy}>
                <strong>{page.title}</strong>
                <span>{page.description}</span>
              </span>
              <Seta />
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
