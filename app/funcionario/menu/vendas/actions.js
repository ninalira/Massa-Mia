'use server';

// Se a pasta de vendas já tem um actions.js, NÃO crie outro:
// junte o import e as duas funções abaixo ao que já existe nele.
import { atualizarVenda, listarProdutos } from '@/lib/backend';

export async function editarVenda(id, dados) {
	try {
		await atualizarVenda(id, dados);
		return { ok: true };
	} catch (erro) {
		return { ok: false, erro: erro.message };
	}
}

// Cardápio para o select do formulário de edição (carregado ao abrir a janela)
export async function carregarProdutos() {
	try {
		const produtos = await listarProdutos();
		return { ok: true, produtos: produtos.map((produto) => ({ id: produto.objectId, descricao: produto.descricao })) };
	} catch (erro) {
		return { ok: false, erro: erro.message };
	}
}