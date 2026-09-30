import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Alert, Button, NumberInput, TextInput } from '@mantine/core';
import styles from './page.module.css';

const pageUrl = '/funcionario/menu/agendarEvento'; 

async function agendarEvento(formData) {
	'use server';

	const data = String(formData.get('data') || '').trim();
	const responsavel = String(formData.get('responsavel') || '').trim();
	const capacidade = Number(formData.get('capacidade'));
	const precoIngressoInput = String(formData.get('precoIngresso') || '').trim();
	const precoIngresso = Number(precoIngressoInput);
	const dataEvento = new Date(`${data}T12:00:00Z`);
	const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data)
		&& !Number.isNaN(dataEvento.getTime())
		&& dataEvento.toISOString().slice(0, 10) === data;

	if (
		!responsavel
		|| !dataValida
		|| !Number.isSafeInteger(capacidade)
		|| capacidade < 1
		|| capacidade > 10000
		|| !precoIngressoInput
		|| !Number.isFinite(precoIngresso)
		|| precoIngresso < 0
	) {
		redirect(`${pageUrl}?erro=${encodeURIComponent('Preencha todos os campos com valores válidos.')}`);
	}

	const servidor = (process.env.PARSE_SERVER_URL || '').replace(/\/$/, '');
	const appId = process.env.PARSE_APP_ID;
	const javascriptKey = process.env.PARSE_JS_KEY;

	if (!servidor || !appId || !javascriptKey) {
		redirect(`${pageUrl}?erro=${encodeURIComponent('A conexão com o serviço de eventos não está configurada.')}`);
	}

	let erro = null;
	let numeroEvento = null;
	let idEvento = null;
	try {
		const resposta = await fetch(`${servidor}/classes/Evento`, {
			method: 'POST',
			headers: {
				'X-Parse-Application-Id': appId,
				'X-Parse-JavaScript-Key': javascriptKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ data, responsavel, capacidade, precoIngresso, status: 'AGENDADO' }),
			cache: 'no-store',
		});
		const resultado = await resposta.json();
		if (!resposta.ok) {
			erro = resultado.error || 'Não foi possível agendar o evento.';
		} else {
			numeroEvento = resultado.numEvento;
			idEvento = resultado.objectId;
		}
	} catch {
		erro = 'Não foi possível conectar ao serviço de eventos. Tente novamente.';
	}

	if (erro) redirect(`${pageUrl}?erro=${encodeURIComponent(erro)}`);
	if (!Number.isSafeInteger(numeroEvento) && idEvento) {
		try {
			const detalhesResposta = await fetch(`${servidor}/classes/Evento/${idEvento}?keys=numEvento`, {
				headers: {
					'X-Parse-Application-Id': appId,
					'X-Parse-JavaScript-Key': javascriptKey,
				},
				cache: 'no-store',
			});
			if (detalhesResposta.ok) {
				const detalhes = await detalhesResposta.json();
				numeroEvento = detalhes.numEvento;
			}
		} catch {
			numeroEvento = null;
		}
	}
	const queryNumero = Number.isSafeInteger(numeroEvento) ? `&numero=${numeroEvento}` : '';
	redirect(`${pageUrl}?sucesso=1${queryNumero}`);
}

export default async function AgendarEventoPage({ searchParams }) {
	const params = await searchParams;
	const erro = typeof params.erro === 'string' ? params.erro : null;
	const sucesso = params.sucesso === '1';
	const numeroEvento = typeof params.numero === 'string' && /^\d+$/.test(params.numero) ? params.numero : null;

	return (
		<main className={styles.page}>
			<header className={styles.topbar}>
				<Link className={styles.brand} href="/funcionario/menu">Massa Mia <span>/</span> Funcionário</Link>
				<Link className={styles.menuLink} href="/funcionario/menu">Menu do funcionário <span aria-hidden="true">↗</span></Link>
			</header>

			<div className={styles.content}>
				<p className={styles.eyebrow}>ROTINA DO RESTAURANTE <span>/</span> EVENTOS</p>
				<div className={styles.heading}>
					<div>
						<h1>Agendar evento</h1>
						<p className={styles.description}>Cadastre os detalhes do próximo evento.</p>
					</div>
					<span className={styles.step}>NOVO AGENDAMENTO</span>
				</div>

				{sucesso && (
					<Alert className={styles.alert} color="massaAzul" title="Evento agendado" variant="light">
						{numeroEvento ? `O evento ${numeroEvento} foi salvo com sucesso.` : 'O evento foi salvo com sucesso.'}
					</Alert>
				)}
				{erro && (
					<Alert className={styles.alert} color="massaVermelho" title="Não foi possível salvar" variant="light">
						{erro}
					</Alert>
				)}

				<form action={agendarEvento} className={styles.form}>
					<div className={styles.sectionHeading}>
						<div>
							<span className={styles.sectionIndex}>01</span>
							<h2>Informações do evento</h2>
						</div>
						<span className={styles.requiredNote}>* Campos obrigatórios</span>
					</div>

					<div className={styles.fields}>
						<div className={`${styles.field} ${styles.generatedField}`}>
							<span>Número do evento</span>
							<strong>{numeroEvento || 'Gerado ao salvar'}</strong>
							<small>Numeração definida automaticamente pelo sistema.</small>
						</div>
						<TextInput
							className={styles.field}
							label="Data do evento"
							name="data"
							required
							type="date"
						/>
						<TextInput
							autoComplete="name"
							className={styles.field}
							label="Nome do responsável"
							maxLength={100}
							name="responsavel"
							placeholder="Nome completo"
							required
						/>
						<NumberInput
							className={styles.field}
							clampBehavior="strict"
							label="Capacidade de pessoas"
							max={10000}
							min={1}
							name="capacidade"
							placeholder="Ex.: 120"
							required
							step={1}
						/>
						<TextInput
							className={styles.field}
							label="Valor do ingresso (R$)"
							min="0"
							name="precoIngresso"
							placeholder="Ex.: 45,00"
							required
							step="0.01"
							type="number"
						/>
						<div className={`${styles.field} ${styles.statusField}`}>
							<span>Status inicial</span>
							<strong>Agendado</strong>
							<small>Eventos novos começam com este status.</small>
						</div>
					</div>

					<div className={styles.formFooter}>
						<span>O número do evento é atribuído pelo backend após o cadastro.</span>
						<Button className={styles.submitButton} color="massaVermelho" type="submit">
							Agendar evento <span aria-hidden="true">↗</span>
						</Button>
					</div>
				</form>
			</div>
		</main>
	);
}
