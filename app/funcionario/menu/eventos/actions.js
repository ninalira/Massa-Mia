'use server';

import { atualizarStatusEvento } from '@/lib/backend';

export async function alterarStatusEvento(id, status) {
	try {
		await atualizarStatusEvento(id, status);
		return { ok: true };
	} catch (erro) {
		return { ok: false, erro: erro.message };
	}
}