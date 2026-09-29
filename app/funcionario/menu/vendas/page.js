import Link from 'next/link';
import styles from './page.module.css';
import { listarProdutos } from '@/lib/backend';
import FormVenda from './FormVenda';

export const dynamic = 'force-dynamic';

export default async function RegistrarVendaPage() {
  let produtos = [];
  let error = null;
  try {
    produtos = await listarProdutos();
  } catch (requestError) {
    error = requestError.message;
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/funcionario/menu">Massa Mia <span>/</span> Registrar venda</Link>
        <Link className={styles.menuLink} href="/funcionario/menu">Menu do funcionário <span aria-hidden="true">↗</span></Link>
      </header>

      <div className={styles.content}>
        <p className={styles.eyebrow}>ATENDIMENTO</p>
        <h1>Registrar venda</h1>
        <p className={styles.description}>Lance os dados do pedido atendido no restaurante.</p>

        <section className={styles.formSection} aria-labelledby="sale-form-title">
          <div className={styles.sectionHeading}>
            <h2 id="sale-form-title">Nova venda</h2>
          </div>

          {error ? (
            <div className={styles.emptyState}>
              <strong>Não foi possível carregar o cardápio</strong>
              <span>{error}</span>
            </div>
          ) : (
            <FormVenda produtos={produtos} />
          )}
        </section>
      </div>
    </main>
  );
}