'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { alterarStatusEvento } from './actions';
import styles from './AtualizarStatusEvento.module.css';

const opcoes = [
	{ value: 'AGENDADO', label: 'Agendado' },
	{ value: 'REALIZADO', label: 'Concluído' },
	{ value: 'CANCELADO', label: 'Cancelado' },
];

export default function AtualizarStatusEvento({ id, status }) {
	const router = useRouter();
	const [statusAtual, setStatusAtual] = useState(status);
	const [erro, setErro] = useState('');
	const [salvando, iniciarTransicao] = useTransition();

	function alterar(event) {
		const novoStatus = event.currentTarget.value;
		setErro('');
		iniciarTransicao(async () => {
			const resultado = await alterarStatusEvento(id, novoStatus);
			if (resultado.ok) {
				setStatusAtual(novoStatus);
				router.refresh();
			} else {
				setErro(resultado.erro);
			}
		});
	}

	return (
		<div className={styles.wrap}>
			<label className={styles.label}>
				<span className={styles.srOnly}>Status do evento</span>
				<select aria-busy={salvando} disabled={salvando} onChange={alterar} value={statusAtual}>
					{opcoes.map((opcao) => <option key={opcao.value} value={opcao.value}>{opcao.label}</option>)}
				</select>
			</label>
			{erro && <span className={styles.error} role="alert">{erro}</span>}
		</div>
	);
}