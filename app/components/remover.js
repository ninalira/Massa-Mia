'use server';

import { removerVenda, removerEvento } from '@/lib/backend';

// Roda no servidor do Next (onde estão as chaves), chamada pelo BotaoRemover.
// tipo: 'venda' ou 'evento'; id: objectId no Back4App.
export async function remover(tipo, id) {
  try {
    if (tipo === 'venda') await removerVenda(id);
    else await removerEvento(id);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}
