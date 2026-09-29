// Conversa do site com o Back4App (a API REST do Parse).
// Só roda no servidor do Next (as páginas são Server Components), então as chaves
// do .env.local nunca chegam ao navegador. É como uma classe DAO do Java.

const SERVIDOR = (process.env.PARSE_SERVER_URL || '').replace(/\/$/, '');

const CABECALHOS = {
  'X-Parse-Application-Id': process.env.PARSE_APP_ID,
  'X-Parse-JavaScript-Key': process.env.PARSE_JS_KEY,
  'Content-Type': 'application/json',
};

// cache: 'no-store' = buscar de novo a cada visita (sem isso o Next guardaria os dados do dia do build).
async function pedir(caminho, metodo = 'GET') {
  const resposta = await fetch(SERVIDOR + caminho, { method: metodo, headers: CABECALHOS, cache: 'no-store' });
  const json = await resposta.json();
  if (!resposta.ok) throw new Error(json.error || 'Erro ' + resposta.status + ' no Back4App');
  return json;
}

// Lista uma classe inteira (limit=1000: sem isso o Back4App devolve só 100).
async function listar(classe, parametros = '') {
  const json = await pedir('/classes/' + classe + '?limit=1000' + parametros);
  return json.results;
}

// Chama uma das 9 perguntas (relatorios.js). Ex.: chamarPergunta(1) → POST /functions/pergunta1
export async function chamarPergunta(numero) {
  const json = await pedir('/functions/pergunta' + numero, 'POST');
  return json.result;
}

// "Pizza Calabresa (G)" — mesmo texto do relatorios.js
function descricao(produto) {
  return (produto.categoria === 'PIZZA' ? 'Pizza ' : 'Bebida ') + produto.nome + ' (' + produto.tamanho + ')';
}

// Agrupa os itens pelo pedido ou evento dono (como um HashMap<String, List<Item>>).
async function itensPor(campo) {
  const where = encodeURIComponent(JSON.stringify({ [campo]: { $exists: true } }));
  const itens = await listar('ItemProduto', '&include=produto&where=' + where);
  const mapa = {};
  for (const item of itens) {
    const dono = item[campo].objectId;
    if (!mapa[dono]) mapa[dono] = [];
    mapa[dono].push({ descricao: descricao(item.produto), quantidade: item.quantidade, preco: item.precoUnitario });
  }
  return mapa;
}

function somaItens(itens) {
  return itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

// Vendas do salão, da mais recente para a mais antiga, já com itens e total.
export async function listarVendas() {
  const [pedidos, itens] = await Promise.all([listar('Pedido', '&order=-numPedido'), itensPor('pedido')]);
  return pedidos.map((p) => {
    const lista = itens[p.objectId] || [];
    return { ...p, itens: lista, total: somaItens(lista) };
  });
}

// Eventos, do mais recente para o mais antigo, com buffet e valor total.
export async function listarEventos() {
  const [eventos, itens] = await Promise.all([listar('Evento', '&order=-numEvento'), itensPor('evento')]);
  return eventos.map((e) => {
    const buffet = somaItens(itens[e.objectId] || []);
    const ingressos = (e.precoIngresso || 0) * (e.ingressosVendidos || 0);
    return { ...e, buffet, ingressos, total: ingressos + buffet };
  });
}

// ---- Formatação para a tela (o back-end devolve só números) ----

export function real(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function decimal(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// "2026-03-06" → "06/03/2026"
export function dataBR(data) {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return dia + '/' + mes + '/' + ano;
}

export const NOMES = {
  SERVIDO: 'Servido', CANCELADO: 'Cancelado', AGENDADO: 'Agendado', REALIZADO: 'Realizado',
  PIX: 'Pix', DINHEIRO: 'Dinheiro', CARTAO: 'Cartão',
};

// ---- Escrita (registrar venda) ----

async function enviar(caminho, corpo, metodo = 'POST') {
  const resposta = await fetch(SERVIDOR + caminho, {
    method: metodo,
    headers: CABECALHOS,
    body: corpo ? JSON.stringify(corpo) : undefined,
    cache: 'no-store',
  });
  const json = await resposta.json();
  if (!resposta.ok) throw new Error(json.error || 'Erro ' + resposta.status + ' no Back4App');
  return json;
}

// Cardápio para o select da tela de venda.
export async function listarProdutos() {
  const produtos = await listar('Produto', '&order=categoria,nome');
  return produtos.map((p) => ({ ...p, descricao: descricao(p) }));
}

// Grava o pedido e depois os itens. O beforeSave do Back4App preenche numPedido,
// diaSemana (a partir da data) e o precoUnitario (do cardápio) e valida o resto.
export async function criarVenda({ data, cliente, formaPagamento, status, avaliacao, motivoCancelamento, itens }) {
  const pedido = await enviar('/classes/Pedido', {
    data, cliente, formaPagamento, status,
    avaliacao: status === 'SERVIDO' ? avaliacao : 0,
    motivoCancelamento: status === 'CANCELADO' ? motivoCancelamento : '',
  });

  try {
    await Promise.all(
      itens.map((item) =>
        enviar('/classes/ItemProduto', {
          produto: { __type: 'Pointer', className: 'Produto', objectId: item.produtoId },
          quantidade: item.quantidade,
          pedido: { __type: 'Pointer', className: 'Pedido', objectId: pedido.objectId },
        })
      )
    );
  } catch (erro) {
    // Se algum item falhar, remove o pedido (o afterDelete apaga os itens já gravados).
    await enviar('/classes/Pedido/' + pedido.objectId, null, 'DELETE').catch(() => {});
    throw erro;
  }
  return pedido;
}