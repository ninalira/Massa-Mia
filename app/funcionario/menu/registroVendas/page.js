import Link from 'next/link';
import { Alert } from '@mantine/core';
import styles from './page.module.css';
import { listarProdutos } from '@/lib/backend';
import FormVenda from './FormVenda';

export const dynamic = 'force-dynamic';

export default async function RegistrarVendaPage() {
	let produtos = [];
	let erro = null;
	try {
		produtos = await listarProdutos();
	} catch (requestError) {
		erro = requestError.message;
	}

	return (
		<main className={styles.page}>
			<header className={styles.topbar}>
				<Link className={styles.brand} href="/funcionario/menu">Massa Mia <span>/</span> Funcionário</Link>
				<Link className={styles.menuLink} href="/funcionario/menu">Menu do funcionário <span aria-hidden="true">↗</span></Link>
			</header>

			<div className={styles.content}>
				<p className={styles.eyebrow}>ROTINA DO RESTAURANTE <span>/</span> VENDAS</p>
				<div className={styles.heading}>
					<div>
						<h1>Registrar venda</h1>
						<p className={styles.description}>Lance os dados do pedido atendido no restaurante.</p>
					</div>
					<span className={styles.step}>NOVA VENDA</span>
				</div>

				{erro ? (
					<Alert className={styles.alert} color="massaVermelho" title="Não foi possível carregar o cardápio" variant="light">
						{erro}
					</Alert>
				) : (
					<FormVenda produtos={produtos} />
				)}
			</div>
		</main>
	);
}