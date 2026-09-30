// Relatórios do Massa Mia como Cloud Functions.

const NOMES_DIA = ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];


function arred2(valor) {
  return Math.round(valor * 100) / 100;
}


function valorItens(itens) {
  let soma = 0;
  for (const item of itens) soma += item.preco * item.quantidade;
  return soma;
}

// Lê as três classes e monta listas simples
async function carregarDados() {
  const opcoes = { useMasterKey: true };
  const listaPedidos = await new Parse.Query('Pedido').ascending('numPedido').limit(1000).find(opcoes);
  const listaEventos = await new Parse.Query('Evento').ascending('numEvento').limit(1000).find(opcoes);
  const listaItens = await new Parse.Query('ItemProduto').include('produto').limit(1000).find(opcoes);

  const pedidos = {}; 
  for (const p of listaPedidos) {
    pedidos[p.id] = { status: p.get('status'), diaSemana: p.get('diaSemana'), avaliacao: p.get('avaliacao') || 0, itens: [] };
  }
  const eventos = {};
  for (const e of listaEventos) {
    eventos[e.id] = {
      numEvento: e.get('numEvento'), nome: e.get('nome'), tipo: e.get('tipo'),
      status: e.get('status'), diaSemana: e.get('diaSemana'), avaliacao: e.get('avaliacao') || 0,
      precoIngresso: e.get('precoIngresso') || 0, ingressosVendidos: e.get('ingressosVendidos') || 0,
      buffet: [],
    };
  }

  // Cada item vai para a lista do seu pedido ou do buffet do seu evento.
  for (const i of listaItens) {
    const produto = i.get('produto');
    const categoria = produto.get('categoria');
    const item = {
      // "Pizza Calabresa (G)"
      descricao: (categoria === 'PIZZA' ? 'Pizza ' : 'Bebida ') + produto.get('nome') + ' (' + produto.get('tamanho') + ')',
      sabor: categoria === 'PIZZA' ? produto.get('nome') : null,
      quantidade: i.get('quantidade'),
      preco: i.get('precoUnitario'), // no Java, o preço vem do produto do item
    };
    const pedido = i.get('pedido');
    const evento = i.get('evento');
    if (pedido && pedidos[pedido.id]) pedidos[pedido.id].itens.push(item);
    if (evento && eventos[evento.id]) eventos[evento.id].buffet.push(item);
  }

  return { pedidos: Object.values(pedidos), eventos: Object.values(eventos) };
}

// Soma quantidades por chave
function somar(mapa, chave, quantidade) {
  mapa[chave] = (mapa[chave] || 0) + quantidade;
}

function maiores(mapa) {
  const chaves = Object.keys(mapa);
  if (chaves.length === 0) return null;
  const maior = Math.max(...Object.values(mapa));
  return { produtos: chaves.filter((k) => mapa[k] === maior), quantidade: maior };
}

// Média das avaliações
function mediaAvaliacoes(avaliacoes) {
  const validas = avaliacoes.filter((a) => a > 0);
  if (validas.length === 0) return 0;
  const media = validas.reduce((s, a) => s + a, 0) / validas.length;
  return arred2(Math.min(Math.max(media, 1), 5));
}

// Pergunta 1: ticket médio do salão, dos buffets de eventos realizados e combinado.
Parse.Cloud.define('pergunta1', async () => {
  const { pedidos, eventos } = await carregarDados();
  const salao = pedidos.filter((p) => p.status === 'SERVIDO').map((p) => valorItens(p.itens));
  // Igual ao Java: só evento REALIZADO e com buffet > 0
  const buffets = eventos.filter((e) => e.status === 'REALIZADO').map((e) => valorItens(e.buffet)).filter((v) => v > 0);
  const media = (lista) => (lista.length === 0 ? 0 : arred2(lista.reduce((s, v) => s + v, 0) / lista.length));
  return { salao: media(salao), eventos: media(buffets), combinado: media(salao.concat(buffets)) };
});

// Pergunta 2: produto mais consumido no salão, nos eventos e no combinado, em cada dia.
Parse.Cloud.define('pergunta2', async () => {
  const { pedidos, eventos } = await carregarDados();
  const dias = [];
  for (let dia = 1; dia <= 7; dia++) {
    const consumoSalao = {};
    const consumoEventos = {};
    for (const p of pedidos) {
      if (p.status === 'SERVIDO' && p.diaSemana === dia) {
        for (const item of p.itens) somar(consumoSalao, item.descricao, item.quantidade);
      }
    }
    for (const e of eventos) {
      if (e.diaSemana === dia && e.status !== 'CANCELADO') {
        for (const item of e.buffet) somar(consumoEventos, item.descricao, item.quantidade);
      }
    }
    const consumoCombinado = { ...consumoSalao };
    for (const chave in consumoEventos) somar(consumoCombinado, chave, consumoEventos[chave]);

    dias.push({
      dia, nomeDia: NOMES_DIA[dia],
      salao: maiores(consumoSalao), eventos: maiores(consumoEventos), combinado: maiores(consumoCombinado),
    });
  }
  return dias;
});

// Pergunta 3: os três sabores de pizza mais servidos somando salão e eventos.
Parse.Cloud.define('pergunta3', async () => {
  const { pedidos, eventos } = await carregarDados();
  const contagem = {};
  for (const p of pedidos) {
    if (p.status !== 'SERVIDO') continue;
    for (const item of p.itens) if (item.sabor) somar(contagem, item.sabor, item.quantidade);
  }
  for (const e of eventos) {
    if (e.status === 'CANCELADO') continue; // Igual ao Java: AGENDADO entra
    for (const item of e.buffet) if (item.sabor) somar(contagem, item.sabor, item.quantidade);
  }
  return Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sabor, quantidade]) => ({ sabor, quantidade }));
});

// Pergunta 4: entre os eventos realizados, quantos contrataram buffet e a receita média.
Parse.Cloud.define('pergunta4', async () => {
  const { eventos } = await carregarDados();
  const realizados = eventos.filter((e) => e.status === 'REALIZADO');
  const comBuffet = realizados.filter((e) => valorItens(e.buffet) > 0);
  const somaBuffet = comBuffet.reduce((s, e) => s + valorItens(e.buffet), 0);
  const totalItens = comBuffet.reduce((s, e) => s + e.buffet.reduce((t, i) => t + i.quantidade, 0), 0);
  return {
    eventosRealizados: realizados.length,
    comBuffet: comBuffet.length,
    percentual: realizados.length === 0 ? 0 : arred2((comBuffet.length / realizados.length) * 100),
    receitaMedia: comBuffet.length === 0 ? 0 : arred2(somaBuffet / comBuffet.length),
    itensMedios: comBuffet.length === 0 ? 0 : arred2(totalItens / comBuffet.length),
  };
});

// Pergunta 5: faturamento do salão nos dias da semana em que houve evento.
Parse.Cloud.define('pergunta5', async () => {
  const { pedidos, eventos } = await carregarDados();
  // Igual ao Java: evento de qualquer status marca o dia
  const diasComEvento = new Set(eventos.map((e) => e.diaSemana));
  const vendas = pedidos.filter((p) => p.status === 'SERVIDO' && diasComEvento.has(p.diaSemana));
  return {
    vendas: vendas.length,
    faturamento: arred2(vendas.reduce((s, p) => s + valorItens(p.itens), 0)),
  };
});

// Pergunta 6: satisfação média do salão, dos eventos e combinada.
Parse.Cloud.define('pergunta6', async () => {
  const { pedidos, eventos } = await carregarDados();
  const notasSalao = pedidos.filter((p) => p.status === 'SERVIDO').map((p) => p.avaliacao);
  const notasEventos = eventos.filter((e) => e.status === 'REALIZADO').map((e) => e.avaliacao);
  return {
    salao: mediaAvaliacoes(notasSalao),
    eventos: mediaAvaliacoes(notasEventos),
    combinado: mediaAvaliacoes(notasSalao.concat(notasEventos)),
  };
});

// Pergunta 7: evento com a maior receita de buffet.
Parse.Cloud.define('pergunta7', async () => {
  const { eventos } = await carregarDados();
  let destaque = null;
  let maiorValor = -1;
  for (const e of eventos) {
    const valor = valorItens(e.buffet);
    if (valor > maiorValor) {
      maiorValor = valor;
      destaque = e;
    }
  }
  if (destaque === null || maiorValor <= 0) return null;
  return {
    numEvento: destaque.numEvento, nome: destaque.nome, tipo: destaque.tipo,
    diaSemana: destaque.diaSemana, nomeDia: NOMES_DIA[destaque.diaSemana],
    valorBuffet: arred2(maiorValor),
  };
});

// Pergunta 8: receita combinada por dia e a divisão entre salão e eventos.
Parse.Cloud.define('pergunta8', async () => {
  const { pedidos, eventos } = await carregarDados();
  const dias = [];
  for (let dia = 1; dia <= 7; dia++) {
    const receitaSalao = pedidos
      .filter((p) => p.status === 'SERVIDO' && p.diaSemana === dia)
      .reduce((s, p) => s + valorItens(p.itens), 0);
    const realizados = eventos.filter((e) => e.diaSemana === dia && e.status === 'REALIZADO');
    const receitaEventos = realizados.reduce((s, e) => s + e.precoIngresso * e.ingressosVendidos + valorItens(e.buffet), 0);
    const total = receitaSalao + receitaEventos;

    dias.push({
      dia, nomeDia: NOMES_DIA[dia],
      total: arred2(total),
      salao: arred2(receitaSalao),
      percSalao: total === 0 ? 0 : arred2((receitaSalao / total) * 100),
      eventos: arred2(receitaEventos),
      percEventos: total === 0 ? 0 : arred2((receitaEventos / total) * 100),
      eventosRealizados: realizados.length,
    });
  }
  return dias;
});

// Pergunta 9: faturamento total somando salão e eventos.
Parse.Cloud.define('pergunta9', async () => {
  const { pedidos, eventos } = await carregarDados();
  const servidos = pedidos.filter((p) => p.status === 'SERVIDO');
  const receitaSalao = servidos.reduce((s, p) => s + valorItens(p.itens), 0);
  // Igual ao Java: soma ingressos + buffet de TODOS os eventos, até cancelados
  const receitaEventos = eventos.reduce((s, e) => s + e.precoIngresso * e.ingressosVendidos + valorItens(e.buffet), 0);
  return {
    receitaSalao: arred2(receitaSalao),
    vendasServidas: servidos.length,
    receitaEventos: arred2(receitaEventos),
    faturamento: arred2(receitaSalao + receitaEventos),
  };
});
