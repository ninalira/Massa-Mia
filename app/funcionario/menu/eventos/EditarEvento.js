'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EditarEvento } from './actions';
import styles from './editarEvento.module.css';

export default function EditarEvento({ id, numero, campoTipo, inicial }) {
	const router = useRouter();
	const dialogo = useRef(null);
	const [erro, setErro] = useState('');
	const [salvando, iniciarTransicao] = useTransition();

	function abrir() {
		setErro('');
		dialogo.current.showModal();
	}

	function fechar() {
		dialogo.current.close();
	}

	function salvar(event) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const dados = {
			data: form.get('data'),
			[campoTipo]: String(form.get('tipo')).trim(),
			responsavel: String(form.get('responsavel')).trim(),
			capacidade: Number(form.get('capacidade')),
			precoIngresso: Number(form.get('precoIngresso')),
			ingressosVendidos: Number(form.get('ingressosVendidos')),
			publicoReal: Number(form.get('publicoReal')),
			avaliacao: Number(form.get('avaliacao')),
		};

		setErro('');
		iniciarTransicao(async () => {
			const resultado = await EditarEvento(id, dados);
			if (resultado.ok) {
				fechar();
				router.refresh();
			} else {
				setErro(resultado.erro);
			}
		});
	}

	return (
		<>
			<button className={styles.botao} onClick={abrir} type="button">
				Editar<span className={styles.srOnly}> evento {numero}</span>
			</button>

			<dialog aria-labelledby={'editar-evento-' + id} className={styles.dialogo} ref={dialogo}>
				<h2 id={'editar-evento-' + id}>Editar evento {numero}</h2>
				<form onSubmit={salvar}>
					<div className={styles.grade}>
						<label className={styles.campo}>
							Data
							<input defaultValue={inicial.data} name="data" required type="date" />
						</label>
						<label className={styles.campo}>
							Evento
							<input defaultValue={inicial.tipo} name="tipo" required type="text" />
						</label>
						<label className={`${styles.campo} ${styles.larga}`}>
							Responsável
							<input defaultValue={inicial.responsavel} name="responsavel" required type="text" />
						</label>
						<label className={styles.campo}>
							Capacidade
							<input defaultValue={inicial.capacidade} min="0" name="capacidade" required step="1" type="number" />
						</label>
						<label className={styles.campo}>
							Preço do ingresso (R$)
							<input defaultValue={inicial.precoIngresso} min="0" name="precoIngresso" required step="0.01" type="number" />
						</label>
						<label className={styles.campo}>
							Ingressos vendidos
							<input defaultValue={inicial.ingressosVendidos} min="0" name="ingressosVendidos" required step="1" type="number" />
						</label>
						<label className={styles.campo}>
							Público real
							<input defaultValue={inicial.publicoReal} min="0" name="publicoReal" required step="1" type="number" />
						</label>
						<label className={styles.campo}>
							Avaliação (0 a 5)
							<input defaultValue={inicial.avaliacao} max="5" min="0" name="avaliacao" required step="1" type="number" />
						</label>
					</div>

					{erro && <p className={styles.erro} role="alert">{erro}</p>}

					<div className={styles.rodape}>
						<button className={styles.botao} disabled={salvando} onClick={fechar} type="button">Cancelar</button>
						<button aria-busy={salvando} className={`${styles.botao} ${styles.primario}`} disabled={salvando} type="submit">
							{salvando ? 'Salvando...' : 'Salvar'}
						</button>
					</div>
				</form>
			</dialog>
		</>
	);
}