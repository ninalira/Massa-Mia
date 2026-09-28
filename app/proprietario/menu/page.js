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

export default function ProprietarioMenuPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">Massa Mia <span>/</span> Proprietário</Link>
        <span className={styles.pending}><i /> Área em preparação</span>
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
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}