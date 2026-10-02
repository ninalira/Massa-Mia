'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { remover } from './remover';
import styles from './BotaoRemover.module.css';

// Botão "Remover" de uma linha das tabelas Vendas e Eventos do funcionário.
export default function BotaoRemover({ tipo, id, numero }) {
  const router = useRouter();
  const [removendo, setRemovendo] = useState(false);

  async function clicar() {
    const pergunta = tipo === 'venda'
      ? 'Remover a venda nº ' + numero + '? Os itens dela também serão apagados.'
      : 'Remover o evento nº ' + numero + '? Os itens do buffet também serão apagados.';
    if (!window.confirm(pergunta)) return;

    setRemovendo(true);
    const resultado = await remover(tipo, id);
    setRemovendo(false);

    if (resultado.ok) {
      router.refresh(); // busca a lista de novo, já sem o registro
    } else {
      window.alert('Não foi possível remover: ' + resultado.erro);
    }
  }

  return (
    <button type="button" className={styles.remover} onClick={clicar} disabled={removendo}>
      {removendo ? 'Removendo…' : 'Remover'}
    </button>
  );
}
