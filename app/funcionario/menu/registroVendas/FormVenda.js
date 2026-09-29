'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { registrarVenda } from './actions';

const hoje = () => new Date().toISOString().slice(0, 10);
const itemVazio = () => ({ produtoId: '', quantidade: 1 });
const real = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FormVenda({ produtos }) {
  const [data, setData] = useState(hoje());
  const [cliente, setCliente] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [status, setStatus] = useState('SERVIDO');
  const [avaliacao, setAvaliacao] = useState(5);
  const [motivo, setMotivo] = useState('');
  const [itens, setItens] = useState([itemVazio()]);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'ok' | 'erro', texto }
  const [enviando, setEnviando] = useState(false);

  const precoDe = (id) => produtos.find((p) => p.objectId === id)?.preco || 0;
  const total = itens.reduce((soma, item) => soma + precoDe(item.produtoId) * (Number(item.quantidade) || 0), 0);

  function alterarItem(indice, campo, valor) {
    setItens(itens.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  async function enviar(e) {
    e.preventDefault();
    const validos = itens
      .filter((item) => item.produtoId)
      .map((item) => ({ produtoId: item.produtoId, quantidade: Number(item.quantidade) }));

    if (status === 'SERVIDO' && validos.length === 0) {
      setMensagem({ tipo: 'erro', texto: 'Adicione pelo menos um item à venda.' });
      return;
    }

    setEnviando(true);
    const resultado = await registrarVenda({
      data,
      cliente: cliente.trim(),
      formaPagamento,
      status,
      avaliacao: Number(avaliacao),
      motivoCancelamento: motivo,
      itens: status === 'SERVIDO' ? validos : [],
    });
    setEnviando(false);

    if (resultado.ok) {
      setMensagem({ tipo: 'ok', texto: 'Venda registrada com sucesso.' });
      setCliente('');
      setMotivo('');
      setItens([itemVazio()]);
    } else {
      setMensagem({ tipo: 'erro', texto: resultado.erro });
    }
  }

  return (
    <form className={styles.form} onSubmit={enviar}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Data</span>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Cliente</span>
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Pagamento</span>
          <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
            <option value="PIX">Pix</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="CARTAO">Cartão</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="SERVIDO">Servido</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </label>
      </div>

      {status === 'SERVIDO' ? (
        <>
          <fieldset className={styles.items}>
            <legend>Itens</legend>
            {itens.map((item, i) => (
              <div className={styles.itemRow} key={i}>
                <label className={styles.field}>
                  <span>Produto</span>
                  <select value={item.produtoId} onChange={(e) => alterarItem(i, 'produtoId', e.target.value)}>
                    <option value="">Selecione…</option>
                    {produtos.map((p) => (
                      <option key={p.objectId} value={p.objectId}>{p.descricao} — {real(p.preco)}</option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Qtd.</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => alterarItem(i, 'quantidade', e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className={styles.buttonGhost}
                  disabled={itens.length === 1}
                  onClick={() => setItens(itens.filter((_, j) => j !== i))}
                >
                  Remover
                </button>
              </div>
            ))}

            <button type="button" className={styles.buttonGhost} onClick={() => setItens([...itens, itemVazio()])}>
              + Adicionar item
            </button>
          </fieldset>

          <label className={styles.field}>
            <span>Avaliação do cliente</span>
            <select value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} de 5</option>)}
            </select>
          </label>

          <p className={styles.total}>Total: <strong>{real(total)}</strong></p>
        </>
      ) : (
        <label className={styles.field}>
          <span>Motivo do cancelamento</span>
          <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </label>
      )}

      {mensagem && (
        <p className={mensagem.tipo === 'ok' ? styles.messageOk : styles.messageError} role="status">
          {mensagem.texto}
        </p>
      )}

      <button type="submit" className={styles.button} disabled={enviando}>
        {enviando ? 'Registrando…' : 'Registrar venda'}
      </button>
    </form>
  );
}