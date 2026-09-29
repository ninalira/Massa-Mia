// Validações do Massa Mia no Back4App (Cloud Code).
// Cada beforeSave roda no servidor ANTES de gravar: é como o setter do Java,
// só que vale para qualquer tela ou app que grave na classe.
// Recusar = lançar um erro com a mensagem; o front recebe esse texto.
// Para publicar: painel do Back4App > Cloud Code > enviar este arquivo e o relatorios.js
// (na mesma pasta) > Deploy.

// Relatórios (as 9 perguntas) ficam em outro arquivo; esta linha o carrega, como um import do Java.
require('./relatorios.js');

// 1. Funções de apoio (usadas pelas quatro classes)

// Recusa se o número existir e estiver fora de [minimo, maximo].
function conferirFaixa(objeto, campo, minimo, maximo) {
  const valor = objeto.get(campo);
  if (valor === undefined) return;
  if (valor < minimo || valor > maximo) {
    throw campo + ' deve estar entre ' + minimo + ' e ' + maximo + '.';
  }
}

// Recusa se o número existir e for menor que o mínimo.
function conferirMinimo(objeto, campo, minimo) {
  const valor = objeto.get(campo);
  if (valor === undefined) return;
  if (valor < minimo) {
    throw campo + ' deve ser maior ou igual a ' + minimo + '.';
  }
}

// Recusa se o texto não for uma das opções. Se obrigatorio, recusa também quando falta.
function conferirOpcao(objeto, campo, opcoes, obrigatorio) {
  const valor = objeto.get(campo);
  if (valor === undefined && !obrigatorio) return;
  if (!opcoes.includes(valor)) {
    throw campo + ' deve ser ' + opcoes.join(', ') + '.';
  }
}

// Se veio a data (texto "AAAA-MM-DD"), confere e calcula o diaSemana a partir dela (1 = Seg ... 7 = Dom).
// Assim a tela manda só a data e o dia nunca fica diferente dela.
function preencherDiaSemana(objeto) {
  const data = objeto.get('data');
  if (data === undefined) return;
  const dia = new Date(data + 'T12:00:00Z');
  // A segunda conferência recusa datas que não existem, como 2026-02-30.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || isNaN(dia) || dia.toISOString().slice(0, 10) !== data) {
    throw 'data deve estar no formato AAAA-MM-DD.';
  }
  const domingoZero = dia.getUTCDay(); // em JavaScript, 0 = domingo
  objeto.set('diaSemana', domingoZero === 0 ? 7 : domingoZero);
}

// Registro novo sem número ganha o próximo (maior + 1), como um contador static do Java.
async function preencherNumero(objeto, classe, campo) {
  if (!objeto.isNew() || objeto.get(campo) !== undefined) return;
  const ultimo = await new Parse.Query(classe).descending(campo).first({ useMasterKey: true });
  objeto.set(campo, ultimo ? ultimo.get(campo) + 1 : 1);
}

// 2. Produto (cardápio)
Parse.Cloud.beforeSave('Produto', (request) => {
  const produto = request.object;
  conferirOpcao(produto, 'categoria', ['PIZZA', 'BEBIDA'], false);
  conferirMinimo(produto, 'preco', 0);
});

// 3. Pedido (venda do restaurante) — regras do Cadastro.registrarVenda
Parse.Cloud.beforeSave('Pedido', async (request) => {
  const pedido = request.object;
  await preencherNumero(pedido, 'Pedido', 'numPedido');
  preencherDiaSemana(pedido);
  conferirOpcao(pedido, 'status', ['SERVIDO', 'CANCELADO'], true);
  conferirOpcao(pedido, 'formaPagamento', ['PIX', 'DINHEIRO', 'CARTAO'], false);
  conferirFaixa(pedido, 'diaSemana', 1, 7);
  conferirFaixa(pedido, 'avaliacao', 0, 5);

  if (pedido.get('status') === 'CANCELADO') {
    // Java: cancelado não tem avaliação; motivo vazio vira "Não informado"
    pedido.set('avaliacao', 0);
    const motivo = (pedido.get('motivoCancelamento') || '').trim();
    pedido.set('motivoCancelamento', motivo === '' ? 'Não informado' : motivo);
  } else {
    pedido.set('motivoCancelamento', '');
  }
});

// 4. Evento — regras do construtor Evento(), dos setters e do GestaoEventos.atualizarEvento
Parse.Cloud.beforeSave('Evento', async (request) => {
  const evento = request.object;
  await preencherNumero(evento, 'Evento', 'numEvento');
  preencherDiaSemana(evento);

  // Java: todo evento novo nasce AGENDADO, sem público, ingressos nem avaliação
  if (evento.isNew()) {
    evento.set('status', 'AGENDADO');
  }

  conferirOpcao(evento, 'status', ['AGENDADO', 'REALIZADO', 'CANCELADO'], true);
  conferirFaixa(evento, 'diaSemana', 1, 7);
  conferirFaixa(evento, 'avaliacao', 0, 5);
  conferirMinimo(evento, 'precoIngresso', 0);
  conferirMinimo(evento, 'capacidade', 0);
  conferirMinimo(evento, 'publicoReal', 0);
  conferirMinimo(evento, 'ingressosVendidos', 0);

  if (evento.get('status') === 'REALIZADO') {
    // Java: público e ingressos não passam da capacidade
    const capacidade = evento.get('capacidade');
    if (capacidade !== undefined) {
      if (evento.get('publicoReal') > capacidade) evento.set('publicoReal', capacidade);
      if (evento.get('ingressosVendidos') > capacidade) evento.set('ingressosVendidos', capacidade);
    }
  } else {
    // Java: agendado ou cancelado não tem público, ingressos nem avaliação
    evento.set('publicoReal', 0);
    evento.set('ingressosVendidos', 0);
    evento.set('avaliacao', 0);
  }
});

// 5. ItemProduto (pizza ou bebida dentro de um pedido ou do buffet de um evento)
Parse.Cloud.beforeSave('ItemProduto', async (request) => {
  const item = request.object;

  if (!item.get('produto')) {
    throw 'produto é obrigatório.';
  }
  // Sem preço, o item usa o preço do cardápio (Java: o preço vem do Produto)
  if (item.get('precoUnitario') === undefined) {
    const produto = await item.get('produto').fetch({ useMasterKey: true });
    item.set('precoUnitario', produto.get('preco'));
  }
  conferirMinimo(item, 'quantidade', 1);
  conferirMinimo(item, 'precoUnitario', 0);

  // O item pertence a um pedido OU a um evento, nunca aos dois
  const temPedido = !!item.get('pedido');
  const temEvento = !!item.get('evento');
  if (temPedido === temEvento) {
    throw 'o item deve estar ligado a um pedido ou a um evento (só um dos dois).';
  }
});

// 6. Apagar um pedido ou evento apaga também os itens dele.
// afterDelete roda no servidor DEPOIS de apagar: o front só precisa apagar o pedido/evento.
async function apagarItens(campo, objeto) {
  const itens = await new Parse.Query('ItemProduto').equalTo(campo, objeto).limit(1000).find({ useMasterKey: true });
  await Parse.Object.destroyAll(itens, { useMasterKey: true });
}

Parse.Cloud.afterDelete('Pedido', (request) => apagarItens('pedido', request.object));
Parse.Cloud.afterDelete('Evento', (request) => apagarItens('evento', request.object));
