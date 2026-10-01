'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { editarVenda, carregarProdutos } from './actions';
import styles from './editarVenda.module.css';

const PAGAMENTOS = [
	{ value: 'PIX', label: 'Pix' },
	{ value: 'DINHEIRO', label: 'Dinheiro' },
	{ value: 'CARTAO', label: 'Cartão' },
];

export default function EditarVenda({ id, numero, inicial }) {
	const router = useRouter();
	const dialogo = useRef(null);
	const contador = useRef(0);
	const [produtos, setProdutos] = useState(null);
	const [itens, setItens] = useState([]);
	const [status, setStatus] = useState(inicial.status);
	const [erro, setErro] = useState('');
	const [salvando, iniciarTransicao] = useTransition();

	function novaLinha(item) {
		contador.current += 1;
		return { chave: contador.current, produtoId: item?.produtoId || '', quantidade: item?.quantidade || 1 };
	}

	async function abrir() {
		setErro('');
		setStatus(inicial.status);
		setItens(inicial.itens.map((item) => novaLinha(item)));
		dialogo.current.showModal();

		if (!produtos) {
			const resultado = await carregarProdutos();
			if (resultado.ok) setProdutos(resultado.produtos);
			else setErro(resultado.erro);
		}
	}

	function fechar() {
		dialogo.current.close();
	}

	function alterarItem(chaveLinha, campo, valor) {
		setItens((atual) => atual.map((item) => (item.chave === chaveLinha ? { ...item, [campo]: valor } : item)));
	}

	function removerItem(chaveLinha) {
		setItens((atual) => atual.filter((item) => item.chave !== chaveLinha));
	}

	function salvar(event) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);

		if (itens.some((item) => !item.produtoId || !(Number(item.quantidade) >= 1))) {
			setErro('Escolha o produto e uma quantidade de pelo menos 1 em cada item.');
			return;
		}

		const dados = {
			data: form.get('data'),
			cliente: String(form.get('cliente')).trim(),
			formaPagamento: form.get('formaPagamento'),
			status,
			avaliacao: Number(form.get('avaliacao') || 0),
			motivoCancelamento: String(form.get('motivoCancelamento') || '').trim(),
			itens: itens.map((item) => ({ produtoId: item.produtoId, quantidade: Number(item.quantidade) })),
		};

		setErro('');
		iniciarTransicao(async () => {
			const resultado = await editarVenda(id, dados);
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
				Editar<span className={styles.srOnly}> venda {numero}</span>
			</button>

			<dialog aria-labelledby={'editar-venda-' + id} className={styles.dialogo} ref={dialogo}>
				<h2 id={'editar-venda-' + id}>Editar venda {numero}</h2>
				<form onSubmit={salvar}>
					<div className={styles.grade}>
						<label className={styles.campo}>
							Data
							<input defaultValue={inicial.data} name="data" required type="date" />
						</label>
						<label className={styles.campo}>
							Cliente
							<input defaultValue={inicial.cliente} name="cliente" type="text" />
						</label>
						<label className={styles.campo}>
							Pagamento
							<select defaultValue={inicial.formaPagamento} name="formaPagamento" required>
								<option value="">Selecione</option>
								{PAGAMENTOS.map((opcao) => <option key={opcao.value} value={opcao.value}>{opcao.label}</option>)}
							</select>
						</label>
						<label className={styles.campo}>
							Status
							<select onChange={(event) => setStatus(event.target.value)} value={status}>
								<option value="SERVIDO">Servido</option>
								<option value="CANCELADO">Cancelado</option>
							</select>
						</label>
						{status === 'SERVIDO' && (
							<label className={`${styles.campo} ${styles.larga}`}>
								Avaliação (0 a 5)
								<input defaultValue={inicial.avaliacao} max="5" min="0" name="avaliacao" step="1" type="number" />
							</label>
						)}
						{status === 'CANCELADO' && (
							<label className={`${styles.campo} ${styles.larga}`}>
								Motivo do cancelamento
								<input defaultValue={inicial.motivoCancelamento} name="motivoCancelamento" required type="text" />
							</label>
						)}
					</div>

					<fieldset className={styles.itens}>
						<legend>Itens do pedido</legend>
						{!produtos ? (
							!erro && <p className={styles.carregando}>Carregando produtos...</p>
						) : (
							<>
								{itens.map((item, indice) => (
									<div className={styles.item} key={item.chave}>
										<select
											aria-label={'Produto do item ' + (indice + 1)}
											onChange={(event) => alterarItem(item.chave, 'produtoId', event.target.value)}
											required
											value={item.produtoId}
										>
											<option value="">Selecione o produto</option>
											{produtos.map((produto) => <option key={produto.id} value={produto.id}>{produto.descricao}</option>)}
										</select>
										<input
											aria-label={'Quantidade do item ' + (indice + 1)}
											min="1"
											onChange={(event) => alterarItem(item.chave, 'quantidade', event.target.value)}
											required
											step="1"
											type="number"
											value={item.quantidade}
										/>
										<button className={styles.botao} disabled={itens.length === 1} onClick={() => removerItem(item.chave)} type="button">
											Remover
										</button>
									</div>
								))}
								<button className={styles.botao} onClick={() => setItens((atual) => [...atual, novaLinha()])} type="button">
									Adicionar item
								</button>
							</>
						)}
					</fieldset>

					{erro && <p className={styles.erro} role="alert">{erro}</p>}

					<div className={styles.rodape}>
						<button className={styles.botao} disabled={salvando} onClick={fechar} type="button">Cancelar</button>
						<button aria-busy={salvando} className={`${styles.botao} ${styles.primario}`} disabled={salvando || !produtos} type="submit">
							{salvando ? 'Salvando...' : 'Salvar'}
						</button>
					</div>
				</form>
			</dialog>
		</>
	);
}