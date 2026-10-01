// API externa: BrasilAPI (feriados nacionais). Não precisa de chave.
// Roda só no servidor. Se a API falhar, devolve null e o formulário segue normal.

// "2026-12-25" → "Natal" (ou null se não for feriado)
export async function buscarFeriado(data) {
  try {
    const ano = data.slice(0, 4);
    const resposta = await fetch('https://brasilapi.com.br/api/feriados/v1/' + ano, {
      next: { revalidate: 86400 }, // a lista do ano muda pouco: cache de 1 dia
    });
    if (!resposta.ok) return null;
    const feriados = await resposta.json();
    return feriados.find((f) => f.date === data)?.name ?? null;
  } catch {
    return null;
  }
}