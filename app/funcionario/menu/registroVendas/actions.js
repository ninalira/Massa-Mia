'use server';

import { criarVenda } from '@/lib/backend';

export async function registrarVenda(dados) {
	try {
		const pedido = await criarVenda(dados);
		return { ok: true, id: pedido.objectId, numero: pedido.numPedido ?? null };
	} catch (e) {
		return { ok: false, erro: e.message };
	}
}