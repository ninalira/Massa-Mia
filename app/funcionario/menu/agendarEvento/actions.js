'use server';

import { buscarFeriado } from '@/lib/apis';

// Devolve o nome do feriado da data (ou null).
export async function consultarFeriado(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  return buscarFeriado(data);
}