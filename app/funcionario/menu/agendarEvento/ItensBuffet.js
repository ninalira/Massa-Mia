'use client';

import { useState } from 'react';
import { Button, NumberInput, Select } from '@mantine/core';
import styles from './page.module.css';

const itemVazio = (id) => ({ id, produtoId: null, quantidade: 1 });
const real = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ItensBuffet({ produtos }) {
	const [itens, setItens] = useState([itemVazio(0)]);
	const opcoes = produtos.map((produto) => ({
		value: produto.objectId,
		label: `${produto.descricao} — ${real(produto.preco)}`,
	}));
	const precoDe = (id) => produtos.find((produto) => produto.objectId === id)?.preco || 0;
	const total = itens.reduce((soma, item) => soma + precoDe(item.produtoId) * (Number(item.quantidade) || 0), 0);

	function alterarItem(id, campo, valor) {
		setItens(itens.map((item) => item.id === id ? { ...item, [campo]: valor } : item));
	}

	return (
		<section className={styles.buffet} aria-labelledby="buffet-title">
			<div className={styles.sectionHeading}>
				<div>
					<span className={styles.sectionIndex}>02</span>
					<h2 id="buffet-title">Buffet do evento</h2>
				</div>
				<span className={styles.requiredNote}>Opcional</span>
			</div>

			<div className={styles.items}>
				{itens.map((item) => (
					<div className={styles.itemRow} key={item.id}>
						<Select
                         classNames={{
                            dropdown: styles.dropdown,
                            option: styles.option,
                         }}
                            
							className={styles.productSelect}
							data={opcoes}
							label="Produto"
							nothingFoundMessage="Nenhum produto encontrado"
							placeholder="Selecione o produto"
							searchable
							value={item.produtoId}
							onChange={(value) => alterarItem(item.id, 'produtoId', value)}
						/>
						<input name="buffetProduto" type="hidden" value={item.produtoId || ''} />
						<NumberInput
							allowDecimal={false}
							clampBehavior="strict"
							className={styles.quantityInput}
							label="Quantidade"
							max={999}
							min={1}
							name="buffetQuantidade"
							value={item.quantidade}
							onChange={(value) => alterarItem(item.id, 'quantidade', value)}
						/>
						<Button
							className={styles.removeItemButton}
							color="massaVermelho"
							disabled={itens.length === 1}
							type="button"
							variant="light"
							onClick={() => setItens(itens.filter((linha) => linha.id !== item.id))}
						>
							Remover
						</Button>
					</div>
				))}

				<Button
					className={styles.addItemButton}
					color="massaAzul"
					disabled={opcoes.length === 0}
					type="button"
					variant="outline"
					onClick={() => setItens([...itens, itemVazio(Date.now())])}
				>
					+ Adicionar item
				</Button>

				<div className={styles.totalBox}>
					<span>Total do buffet</span>
					<strong>{real(total)}</strong>
				</div>
			</div>
		</section>
	);
}