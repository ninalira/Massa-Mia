import Image from 'next/image';
import Link from 'next/link';
import styles from './Cabecalho.module.css';

// Cabeçalho usado em várias telas (como uma classe reaproveitada no Java).
// Recebe 3 informações: area ("Proprietário"), painel (link do painel) e pagina ("Vendas").
export default function Cabecalho({ area, painel, pagina }) {
  return (
    <header className={styles.cabecalho}>
      <Link href="/">
        <Image src="/logo.jpg" alt="Massa Mia" width={176} height={44} />
      </Link>

      <p className={styles.caminho}>
        <Link href={painel}>{area}</Link> › {pagina}
      </p>

      <Link href={painel} className={styles.voltar}>← Voltar ao painel</Link>
      <Link href="/" className={styles.sair}>Sair</Link>
    </header>
  );
}
