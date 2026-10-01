import { redirect } from 'next/navigation';
import { Alert, Button, NumberInput, Select, TextInput } from '@mantine/core';
import Cabecalho from '@/app/components/Cabecalho';
import { listarProdutos } from '@/lib/backend';
import ItensBuffet from './ItensBuffet';
import styles from './page.module.css';
import CampoData from './CampoData';

const pageUrl = '/funcionario/menu/agendarEvento'; 
const TIPOS = ['Show', 'Aniversário', 'Workshop', 'Palestra', 'Conferência', 'Casamento'];

async function agendarEvento(formData) {
	'use server';

	const data = String(formData.get('data') || '').trim();
	const responsavel = String(formData.get('responsavel') || '').trim();
	const tipo = String(formData.get('tipo') || '').trim();
	const capacidade = Number(formData.get('capacidade'));
	const precoIngressoInput = String(formData.get('precoIngresso') || '').trim();
	const precoIngresso = Number(precoIngressoInput);
	const produtosBuffet = formData.getAll('buffetProduto').map((valor) => String(valor).trim());
	const quantidadesBuffet = formData.getAll('buffetQuantidade');
	const itensBuffet = [];
	for (let indice = 0; indice < produtosBuffet.length; indice++) {
		const produtoId = produtosBuffet[indice];
		if (!produtoId) continue;
		const quantidade = Number(quantidadesBuffet[indice]);
		if (!Number.isSafeInteger(quantidade) || quantidade < 1 || quantidade > 999) {
			redirect(`${pageUrl}?erro=${encodeURIComponent('Confira as quantidades dos itens do buffet.')}`);
		}
		itensBuffet.push({ produtoId, quantidade });
	}
	const dataEvento = new Date(`${data}T12:00:00Z`);
	const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data)
		&& !Number.isNaN(dataEvento.getTime())
		&& dataEvento.toISOString().slice(0, 10) === data;

	if (
		!responsavel
		|| !TIPOS.includes(tipo)
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

const servidor = (
	process.env.PARSE_SERVER_URL ||
	process.env.NEXT_PUBLIC_PARSE_URL ||
	'https://parseapi.back4app.com'
).replace(/\/$/, '');	
	const appId = process.env.PARSE_APP_ID;
	const javascriptKey = process.env.PARSE_JS_KEY;

	if (!servidor || !appId || !javascriptKey) {
		redirect(`${pageUrl}?erro=${encodeURIComponent('A conexão com o serviço de eventos não está configurada.')}`);
	}

	let erro = null;
	let numeroEvento = null;
	let idEvento = null;
	try {
		const cabecalhos = {
			'X-Parse-Application-Id': process.env.NEXT_PUBLIC_PARSE_APP_ID || appId,
			'X-Parse-JavaScript-Key': process.env.NEXT_PUBLIC_PARSE_JS_KEY || javascriptKey,
			'Content-Type': 'application/json',
		};
		const resposta = await fetch(`${servidor}/classes/Evento`, {
			method: 'POST',
			headers: cabecalhos,
			body: JSON.stringify({ data, tipo, responsavel, capacidade, precoIngresso, status: 'AGENDADO' }),
			cache: 'no-store',
		});
		const resultado = await resposta.json();
		if (!resposta.ok) {
			erro = resultado.error || 'Não foi possível agendar o evento.';
		} else {
			numeroEvento = resultado.numEvento;
			idEvento = resultado.objectId;
			for (const item of itensBuffet) {
				const respostaItem = await fetch(`${servidor}/classes/ItemProduto`, {
					method: 'POST',
					headers: cabecalhos,
					body: JSON.stringify({
						produto: { __type: 'Pointer', className: 'Produto', objectId: item.produtoId },
						evento: { __type: 'Pointer', className: 'Evento', objectId: idEvento },
						quantidade: item.quantidade,
					}),
					cache: 'no-store',
				});
				if (!respostaItem.ok) {
					const erroItem = await respostaItem.json();
					await fetch(`${servidor}/classes/Evento/${idEvento}`, {
						method: 'DELETE', headers: cabecalhos, cache: 'no-store',
					}).catch(() => {});
					throw new Error(erroItem.error || 'Não foi possível salvar os itens do buffet.');
				}
			}
		}
	} catch (erroRequisicao) {
		erro = erroRequisicao.message || 'Não foi possível conectar ao serviço de eventos. Tente novamente.';
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
	let produtos = [];
	let erroProdutos = null;
	try {
		produtos = await listarProdutos();
	} catch (erroRequisicao) {
		erroProdutos = erroRequisicao.message;
	}

	return (
		<main className={styles.page}>
			<Cabecalho area="Funcionário" painel="/funcionario/menu" pagina="Agendar evento" />

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
				{erroProdutos && (
					<Alert className={styles.alert} color="massaVermelho" title="Produtos indisponíveis" variant="light">
						Não foi possível carregar o cardápio para montar o buffet. {erroProdutos}
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
						<CampoData className={styles.field} />
						<Select
							allowDeselect={false}
							className={styles.field}
							classNames={{ dropdown: styles.dropdown, option: styles.option }}
							data={TIPOS}
							label="Tipo do evento"
							name="tipo"
							placeholder="Selecione o tipo"
							required
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
					<ItensBuffet produtos={produtos} />

					<div className={styles.formFooter}>
						<Button className={styles.submitButton} color="massaVermelho" type="submit">
							Agendar evento <span aria-hidden="true">↗</span>
						</Button>
					</div>
				</form>
			</div>
		</main>
	);
}
