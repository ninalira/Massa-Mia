'use client';

import { useState } from 'react';
import { Alert, Button, NumberInput, Select, Textarea, TextInput } from '@mantine/core';
import styles from './page.module.css';
import { registrarVenda } from './actions';

const hoje = () => new Date().toISOString().slice(0, 10);
const itemVazio = () => ({ produtoId: null, quantidade: 1 });
const real = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FormVenda({ produtos }) {
	const [data, setData] = useState(hoje());
	const [cliente, setCliente] = useState('');
	const [formaPagamento, setFormaPagamento] = useState('PIX');
	const [status, setStatus] = useState('SERVIDO');
	const [avaliacao, setAvaliacao] = useState('5');
	const [motivo, setMotivo] = useState('');
	const [itens, setItens] = useState([itemVazio()]);
	const [mensagem, setMensagem] = useState(null); // { tipo: 'ok' | 'erro', texto }
	const [numero, setNumero] = useState(null);
	const [enviando, setEnviando] = useState(false);

	const opcoesProduto = produtos.map((p) => ({ value: p.objectId, label: `${p.descricao} — ${real(p.preco)}` }));
	const precoDe = (id) => produtos.find((p) => p.objectId === id)?.preco || 0;
	const total = itens.reduce((soma, item) => soma + precoDe(item.produtoId) * (Number(item.quantidade) || 0), 0);
	const servido = status === 'SERVIDO';

	function alterarItem(indice, campo, valor) {
		setItens(itens.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
	}

	async function enviar(e) {
		e.preventDefault();
		setMensagem(null);

		const validos = itens
			.filter((item) => item.produtoId)
			.map((item) => ({ produtoId: item.produtoId, quantidade: Number(item.quantidade) }));

		if (servido && validos.length === 0) {
			setMensagem({ tipo: 'erro', texto: 'Adicione pelo menos um item à venda.' });
			return;
		}

		setEnviando(true);
		const resultado = await registrarVenda({
			data,
			cliente: cliente.trim(),
			formaPagamento,
			status,
			avaliacao: Number(avaliacao),
			motivoCancelamento: motivo,
			itens: servido ? validos : [],
		});
		setEnviando(false);

		if (resultado.ok) {
			setNumero(resultado.numero ?? null);
			setMensagem({
				tipo: 'ok',
				texto: resultado.numero ? `A venda ${resultado.numero} foi registrada com sucesso.` : 'A venda foi registrada com sucesso.',
			});
			setCliente('');
			setMotivo('');
			setItens([itemVazio()]);
		} else {
			setMensagem({ tipo: 'erro', texto: resultado.erro });
		}
	}

	return (
		<>
			{mensagem?.tipo === 'ok' && (
				<Alert className={styles.alert} color="massaAzul" title="Venda registrada" variant="light">
					{mensagem.texto}
				</Alert>
			)}
			{mensagem?.tipo === 'erro' && (
				<Alert className={styles.alert} color="massaVermelho" title="Não foi possível salvar" variant="light">
					{mensagem.texto}
				</Alert>
			)}

			<form onSubmit={enviar} className={styles.form}>
				<div className={styles.sectionHeading}>
					<div>
						<span className={styles.sectionIndex}>01</span>
						<h2>Informações da venda</h2>
					</div>
					<span className={styles.requiredNote}>* Campos obrigatórios</span>
				</div>

				<div className={styles.fields}>
					<div className={`${styles.field} ${styles.generatedField}`}>
						<span>Número da venda</span>
						<strong>{numero || 'Gerado ao salvar'}</strong>
						<small>Numeração definida automaticamente pelo sistema.</small>
					</div>
					<TextInput
						className={styles.field}
						label="Data da venda"
						required
						type="date"
						value={data}
						onChange={(e) => setData(e.currentTarget.value)}
					/>
					<TextInput
						autoComplete="name"
						className={styles.field}
						label="Nome do cliente"
						maxLength={100}
						placeholder="Nome completo"
						required
						value={cliente}
						onChange={(e) => setCliente(e.currentTarget.value)}
					/>
					<Select
            classNames={{ dropdown: styles.dropdown, option: styles.option }}
						allowDeselect={false}
						className={styles.field}
						data={[
							{ value: 'PIX', label: 'Pix' },
							{ value: 'DINHEIRO', label: 'Dinheiro' },
							{ value: 'CARTAO', label: 'Cartão' },
						]}
						label="Forma de pagamento"
						value={formaPagamento}
						onChange={setFormaPagamento}
					/>
					<Select
            classNames={{ dropdown: styles.dropdown, option: styles.option }}
						allowDeselect={false}
						className={styles.field}
						data={[
							{ value: 'SERVIDO', label: 'Servido' },
							{ value: 'CANCELADO', label: 'Cancelado' },
						]}
						label="Status da venda"
						value={status}
						onChange={setStatus}
					/>
					{servido && (
						<Select
              classNames={{ dropdown: styles.dropdown, option: styles.option }}
							allowDeselect={false}
							className={styles.field}
							data={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} de 5` }))}
							label="Avaliação do cliente"
							value={avaliacao}
							onChange={setAvaliacao}
						/>
					)}
				</div>

				<div className={`${styles.sectionHeading} ${styles.sectionDivider}`}>
					<div>
						<span className={styles.sectionIndex}>02</span>
						<h2>{servido ? 'Itens do pedido' : 'Cancelamento'}</h2>
					</div>
				</div>

				{servido ? (
					<div className={styles.items}>
						{itens.map((item, i) => (
							<div className={styles.itemRow} key={i}>
								<Select
                  classNames={{ dropdown: styles.dropdown, option: styles.option }}
									data={opcoesProduto}
									label="Produto"
									nothingFoundMessage="Nenhum produto encontrado"
									placeholder="Selecione o produto"
									searchable
									value={item.produtoId}
									onChange={(v) => alterarItem(i, 'produtoId', v)}
								/>
								<NumberInput
									allowDecimal={false}
									clampBehavior="strict"
									label="Quantidade"
									max={999}
									min={1}
									value={item.quantidade}
									onChange={(v) => alterarItem(i, 'quantidade', v)}
								/>
								<Button
									className={styles.removeButton}
									color="massaVermelho"
									disabled={itens.length === 1}
									variant="light"
									onClick={() => setItens(itens.filter((_, j) => j !== i))}
								>
									Remover
								</Button>
							</div>
						))}

						<Button className={styles.addButton} color="massaAzul" variant="outline" onClick={() => setItens([...itens, itemVazio()])}>
							+ Adicionar item
						</Button>

						<div className={styles.totalBox}>
							<span>Total da venda</span>
							<strong>{real(total)}</strong>
						</div>
					</div>
				) : (
					<div className={styles.cancelBlock}>
						<Textarea
							label="Motivo do cancelamento"
							maxLength={200}
							placeholder="Ex.: Cliente desistiu"
							value={motivo}
							onChange={(e) => setMotivo(e.currentTarget.value)}
						/>
					</div>
				)}

				<div className={styles.formFooter}>
					<Button className={styles.submitButton} color="massaVermelho" loading={enviando} type="submit">
						Registrar venda <span aria-hidden="true">↗</span>
					</Button>
				</div>
			</form>
		</>
	);
}