'use server';

import { atualizarStatusEvento, atualizarEvento } from '@/lib/backend';

export async function alterarStatusEvento(id, status) {
	try {
		await atualizarStatusEvento(id, status);
		return { ok: true };
	} catch (erro) {
		return { ok: false, erro: erro.message };
	}
}

export async function editarEvento(id, dados) {
	try {
		await atualizarEvento(id, dados);
		return { ok: true };
	} catch (erro) {
		return { ok: false, erro: erro.message };
	}
}