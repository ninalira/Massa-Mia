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

// 2. Produto (cardápio)
Parse.Cloud.beforeSave('Produto', (request) => {
  const produto = request.object;
  conferirOpcao(produto, 'categoria', ['PIZZA', 'BEBIDA'], false);
  conferirMinimo(produto, 'preco', 0);
});

// 3. Pedido (venda do restaurante) — regras do Cadastro.registrarVenda
Parse.Cloud.beforeSave('Pedido', (request) => {
  const pedido = request.object;
  conferirOpcao(pedido, 'status', ['SERVIDO', 'CANCELADO'], true);
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
Parse.Cloud.beforeSave('Evento', (request) => {
  const evento = request.object;

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
Parse.Cloud.beforeSave('ItemProduto', (request) => {
  const item = request.object;

  if (!item.get('produto')) {
    throw 'produto é obrigatório.';
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
