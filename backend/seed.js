// Popula o Back4App com os dados de exemplo do Massa Mia.
// Tradução do carregarDadosExemplo() do Main.java

// 1. Endereço e chaves do Back4App 
const SERVIDOR = process.env.PARSE_SERVER_URL.replace(/\/$/, '');
const CABECALHOS = {
  'X-Parse-Application-Id': process.env.PARSE_APP_ID,
  'X-Parse-Master-Key': process.env.PARSE_MASTER_KEY,
  'Content-Type': 'application/json',
};

const SABORES_PIZZA = ['Margherita', 'Calabresa', 'Frango com Catupiry', 'Quatro Queijos', 'Portuguesa', 'Pepperoni'];
const BEBIDAS = ['Refrigerante Cola', 'Suco de Laranja', 'Água com Gás', 'Chá Gelado', 'Refrigerante Limão', 'Suco de Uva'];
const MOTIVOS_CANCELAMENTO = ['Cliente desistiu', 'Pagamento não aprovado', 'Pedido duplicado'];
const TIPOS_EVENTO = ['Show', 'Aniversário', 'Workshop', 'Palestra', 'Conferência', 'Casamento'];
const PRECO_CARDAPIO = { M: 30, G: 38, Lata: 6, '1L': 9 };
const CLIENTES = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Castro',
  'Felipe Nunes', 'Gabriela Alves', 'Henrique Dias', 'Isabela Pires', 'João Martins'];
const PAGAMENTOS = ['PIX', 'DINHEIRO', 'CARTAO'];
const RESPONSAVEIS = ['Marina Costa', 'Rafael Teixeira', 'Juliana Freitas', 'Lucas Barbosa', 'Paula Ribeiro'];
const PRIMEIRA_SEGUNDA = '2026-03-02';

// Soma dias a uma data "AAAA-MM-DD" 
function somarDias(data, dias) {
  const d = new Date(data + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

const produtos = {}; // cardápio
const pedidos = [];
const eventos = [];
const itens = [];

// Devolve o Produto do cardápio; cria na primeira vez que aparece.
function buscarProduto(categoria, nome, tamanho) {
  const chave = categoria + nome + tamanho;
  if (!produtos[chave]) {
    produtos[chave] = { categoria, nome, tamanho, preco: PRECO_CARDAPIO[tamanho] };
  }
  return produtos[chave];
}

// Cria um item (pizza ou bebida) ligado a um pedido ou a um evento.
function criarItem(produto, quantidade, precoUnitario, classeDono, dono) {
  itens.push({ produto, quantidade, precoUnitario, classeDono, dono });
}

// 2. Montar os 160 pedidos 
for (let id = 1; id <= 160; id++) {
  const pedido = {
    numPedido: id,
    diaSemana: ((id - 1) % 7) + 1,
    // Um pedido por dia a partir de uma segunda
    data: somarDias(PRIMEIRA_SEGUNDA, id - 1),
    cliente: CLIENTES[id % 10],
    formaPagamento: PAGAMENTOS[id % 3],
  };

  if (id % 5 !== 0) {
    pedido.status = 'SERVIDO';
    pedido.avaliacao = Math.min(2 + (id % 4), 5);
    pedido.motivoCancelamento = '';

    const sabor = SABORES_PIZZA[id % 6];
    const tamanho = id % 2 === 0 ? 'G' : 'M';
    criarItem(buscarProduto('PIZZA', sabor, tamanho), 1 + (id % 3), 28 + (id % 5) * 2.5, 'Pedido', pedido);

    if (id % 2 === 0) {
      const bebida = BEBIDAS[id % 6];
      const tamanhoBebida = id % 3 === 0 ? '1L' : 'Lata';
      criarItem(buscarProduto('BEBIDA', bebida, tamanhoBebida), 1 + (id % 2), 5 + (id % 4), 'Pedido', pedido);
    }
  } else {
    pedido.status = 'CANCELADO';
    pedido.avaliacao = 0;
    pedido.motivoCancelamento = MOTIVOS_CANCELAMENTO[id % 3];
  }
  pedidos.push(pedido);
}

// 3. Montar os 40 eventos 
for (let id = 1; id <= 40; id++) {
  const capacidade = 60 + (id % 6) * 15;
  const evento = {
    numEvento: id,
    nome: 'Evento Modelo ' + id,
    tipo: TIPOS_EVENTO[id % 6],
    diaSemana: ((id + 1) % 7) + 1,
    // Um evento por semana; (id + 1) % 7 dias depois da segunda cai no diaSemana acima
    data: somarDias(PRIMEIRA_SEGUNDA, 7 * (id - 1) + ((id + 1) % 7)),
    responsavel: RESPONSAVEIS[id % 5],
    capacidade,
    precoIngresso: 40 + (id % 5) * 5,
  };

  let status = 'REALIZADO';
  if (id % 6 === 0) status = 'CANCELADO';
  else if (id % 5 === 0) status = 'AGENDADO';
  evento.status = status;

  if (id % 4 !== 0) {
    const sabor = SABORES_PIZZA[id % 6];
    criarItem(buscarProduto('PIZZA', sabor, 'G'), 10 + (id % 6) * 2, 29 + (id % 4) * 3, 'Evento', evento);

    if (id % 2 === 0) {
      const bebida = BEBIDAS[(id + 1) % 6];
      criarItem(buscarProduto('BEBIDA', bebida, '1L'), 12 + (id % 5) * 3, 4.5 + (id % 5), 'Evento', evento);
    }
  }

  if (status === 'REALIZADO') {
    const ingressos = Math.min(capacidade, 40 + (id % 25));
    evento.ingressosVendidos = ingressos;
    evento.publicoReal = ingressos - (id % 4);
    evento.avaliacao = Math.min(3 + (id % 3), 5);
  } else {
    evento.ingressosVendidos = 0;
    evento.publicoReal = 0;
    evento.avaliacao = 0;
  }
  eventos.push(evento);
}

// 4. Conversar com o Back4App

// Faz uma chamada HTTP e devolve a resposta em JSON. se o Back4App recusar, lança erro.
async function chamar(metodo, caminho, corpo) {
  const resposta = await fetch(SERVIDOR + caminho, {
    method: metodo,
    headers: CABECALHOS,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const json = await resposta.json();
  if (!resposta.ok) throw new Error(json.error);
  return json;
}

// Grava a lista de 50 em 50 (limite do Back4App por chamada) e anota o objectId de cada um.
async function salvarTodos(classe, lista, montarCorpo) {
  const prefixo = new URL(SERVIDOR).pathname.replace(/\/$/, '');
  for (let i = 0; i < lista.length; i += 50) {
    const lote = lista.slice(i, i + 50);
    const pedidosHttp = lote.map((obj) => ({
      method: 'POST',
      path: prefixo + '/classes/' + classe,
      body: montarCorpo ? montarCorpo(obj) : obj,
    }));
    const resultados = await chamar('POST', '/batch', { requests: pedidosHttp });
    resultados.forEach((r, j) => {
      if (r.error) throw new Error(r.error.error);
      lote[j].objectId = r.success.objectId;
    });
  }
}

// Um "ponteiro" 
function ponteiro(classe, obj) {
  return { __type: 'Pointer', className: classe, objectId: obj.objectId };
}

async function gravar() {
  // Proteção: se já existem pedidos, não grava de novo (evita dados duplicados).
  const contagem = await chamar('GET', '/classes/Pedido?count=1&limit=0');
  if (contagem.count > 0) {
    console.log('O Back4App já tem dados. Nada foi gravado.');
    return;
  }

  // Ordem 
  await salvarTodos('Produto', Object.values(produtos));
  await salvarTodos('Pedido', pedidos);
  await salvarTodos('Evento', eventos);
  await salvarTodos('ItemProduto', itens, (item) => ({
    produto: ponteiro('Produto', item.produto),
    quantidade: item.quantidade,
    precoUnitario: item.precoUnitario,
    [item.classeDono.toLowerCase()]: ponteiro(item.classeDono, item.dono),
  }));

  console.log('Gravados:', Object.values(produtos).length, 'produtos,', pedidos.length, 'pedidos,',
    eventos.length, 'eventos,', itens.length, 'itens.');
}

gravar().catch((erro) => console.log('Erro:', erro.message));
