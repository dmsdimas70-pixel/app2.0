import { CustomerInteraction } from '../types';

export function generateInitialInteractions(): CustomerInteraction[] {
  const interactions: CustomerInteraction[] = [];

  // Helper to add interaction
  let idCounter = 1;
  const add = (
    date: string,
    time: string,
    customerName: string,
    sellerName: string,
    origin: string,
    campaign: string,
    product: string,
    status: CustomerInteraction['status'],
    saleValue?: number,
    productSold?: string,
    notes?: string
  ) => {
    interactions.push({
      id: `att-${idCounter++}`,
      date,
      time,
      customerName,
      sellerName,
      origin,
      campaign,
      product,
      status,
      saleValue,
      productSold: productSold || (status === 'venda_realizada' ? product : undefined),
      notes: notes || '',
      createdAt: `${date}T${time}:00.000Z`,
      updatedAt: `${date}T${time}:00.000Z`,
    });
  };

  // --- HOJE (Sexta-feira, 2026-09-04) ---
  add('2026-09-04', '09:15', 'Carlos Eduardo', 'Camila Vendas', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 4600, 'Sofá Retrátil 3 Lugares Suede', 'Viu o anúncio do carrossel no feed do Instagram');
  add('2026-09-04', '10:00', 'Mariana Alencar', 'Juliana Móveis', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Mesa', 'em_negociacao', undefined, undefined, 'Mesa 6 cadeiras tampo de vidro; enviou fotos da sala');
  add('2026-09-04', '10:45', 'Roberto Silveira', 'Renata Consultora', 'WhatsApp', 'Campanha de Cozinha', 'Cozinha', 'venda_realizada', 8900, 'Cozinha Modulada MDF Prime', 'Agendou visita ontem pelo WhatsApp corporativo');
  add('2026-09-04', '11:30', 'Aline Prado', 'Patrícia Design', 'Meta Ads', 'Campanha de Quarto', 'Guarda-roupa', 'desistiu', undefined, undefined, 'Achou a profundidade menor que a necessária');
  add('2026-09-04', '13:20', 'Marcos Vinícius', 'Camila Vendas', 'Google', 'Campanha de Sofá', 'Sofá', 'em_negociacao', undefined, undefined, 'Gostou do sofá de couro natural; vai voltar com a esposa');
  add('2026-09-04', '14:10', 'Dra. Beatriz Santos', 'Juliana Móveis', 'Indicação', 'Nenhuma / Orgânico', 'Poltrona', 'venda_realizada', 2850, 'Par de Poltronas Bouclé com pés dourados', 'Indicada pela vizinha que comprou mês passado');
  add('2026-09-04', '15:00', 'Luciana Rocha', 'Renata Consultora', 'Instagram', 'Campanha de Cozinha', 'Cozinha', 'em_negociacao', undefined, undefined, 'Projeto 3D em andamento para aprovação no sábado');
  add('2026-09-04', '15:45', 'Fábio Meireles', 'Camila Vendas', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Rack', 'sem_interesse', undefined, undefined, 'Apenas olhando modelos compactos para apartamento');

  // --- ONTEM (Quinta-feira, 2026-09-03) ---
  add('2026-09-03', '09:40', 'Sérgio Nogueira', 'Juliana Móveis', 'Google Ads', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 5200, 'Sofá de Canto Veludo Molhado');
  add('2026-09-03', '10:30', 'Eliane Ferreira', 'Renata Consultora', 'Instagram', 'Campanha de Quarto', 'Cama', 'em_negociacao');
  add('2026-09-03', '11:15', 'Danilo Paes', 'Patrícia Design', 'Meta Ads', 'Campanha de Cozinha', 'Cozinha', 'venda_realizada', 11400, 'Armários de cozinha em MDF Grafite + Ilha');
  add('2026-09-03', '14:00', 'Gisele Borges', 'Camila Vendas', 'WhatsApp', 'Campanha de Sofá', 'Sofá', 'desistiu', undefined, undefined, 'Prazo de entrega da fábrica de 35 dias não atendeu');
  add('2026-09-03', '15:20', 'Valéria Cunha', 'Juliana Móveis', 'Cliente antigo', 'Nenhuma / Orgânico', 'Painel', 'venda_realizada', 1980, 'Painel Ripado com LED 2.20m');
  add('2026-09-03', '16:10', 'Lucas Viana', 'Renata Consultora', 'Facebook', 'Saldão', 'Mesa', 'sem_interesse');
  add('2026-09-03', '17:00', 'Cláudia Mendes', 'Patrícia Design', 'Indicação', 'Campanha de Quarto', 'Guarda-roupa', 'retorno_futuro', undefined, undefined, 'Esperando entrega das chaves do condomínio');

  // --- Quarta-feira, 2026-09-02 (Dia forte em atendimentos) ---
  add('2026-09-02', '09:20', 'Bruno Castilho', 'Camila Vendas', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 3900, 'Sofá Retrátil Linho Cru');
  add('2026-09-02', '10:10', 'Fernanda Lima', 'Renata Consultora', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 4400, 'Sofá Ilha Living 4 Lugares');
  add('2026-09-02', '11:00', 'Tiago Rezende', 'Juliana Móveis', 'Google', 'Campanha de Cozinha', 'Cozinha', 'em_negociacao');
  add('2026-09-02', '11:45', 'Renato Garcia', 'Patrícia Design', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Rack', 'desistiu');
  add('2026-09-02', '13:40', 'Vanessa Dias', 'Camila Vendas', 'WhatsApp', 'Campanha de Quarto', 'Colchão', 'venda_realizada', 3200, 'Colchão Molas Ensacadas Queen King');
  add('2026-09-02', '14:30', 'Eduardo Pires', 'Juliana Móveis', 'Instagram', 'Campanha de Guarda-Roupa', 'Guarda-roupa', 'em_negociacao');
  add('2026-09-02', '15:15', 'Letícia Moura', 'Renata Consultora', 'Meta Ads', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 6100, 'Sofá em Couro 2.80m');
  add('2026-09-02', '16:00', 'Rodrigo Antunes', 'Camila Vendas', 'Marketplace', 'Saldão', 'Mesa', 'sem_interesse');
  add('2026-09-02', '16:50', 'Helena Barros', 'Patrícia Design', 'Instagram', 'Campanha de Setembro', 'Cama', 'retorno_futuro');
  add('2026-09-02', '17:30', 'Paulo Nobre', 'Juliana Móveis', 'Indicação', 'Campanha de Cozinha', 'Cozinha', 'venda_realizada', 9800, 'Cozinha modulada completa');

  // --- Terça-feira, 2026-09-01 ---
  add('2026-09-01', '10:00', 'Priscila Ramos', 'Camila Vendas', 'Instagram', 'Campanha de Setembro', 'Sofá', 'em_negociacao');
  add('2026-09-01', '11:20', 'Marcos Tavares', 'Renata Consultora', 'Google Ads', 'Campanha de Guarda-Roupa', 'Guarda-roupa', 'venda_realizada', 3600, 'Guarda-roupa Casal 6 Portas Espelhado');
  add('2026-09-01', '14:15', 'Camila Duarte', 'Juliana Móveis', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Mesa', 'desistiu');
  add('2026-09-01', '15:30', 'André Martins', 'Patrícia Design', 'Meta Ads', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 4100, 'Sofá Retrátil Reclinável Terracota');
  add('2026-09-01', '16:40', 'Julio Cesar', 'Camila Vendas', 'WhatsApp', 'Campanha de Cozinha', 'Cozinha', 'em_negociacao');

  // --- SEMANA ANTERIOR (2026-08-24 a 2026-08-30) ---
  // 24/08 (Segunda)
  add('2026-08-24', '10:30', 'Tatiana Freitas', 'Renata Consultora', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 3500);
  add('2026-08-24', '14:00', 'Igor Santos', 'Juliana Móveis', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Rack', 'sem_interesse');
  add('2026-08-24', '16:15', 'Cristina Luz', 'Camila Vendas', 'WhatsApp', 'Campanha de Guarda-Roupa', 'Guarda-roupa', 'em_negociacao');

  // 25/08 (Terça)
  add('2026-08-25', '09:45', 'Mauro Celso', 'Patrícia Design', 'Google', 'Campanha de Cozinha', 'Cozinha', 'venda_realizada', 7900);
  add('2026-08-25', '11:30', 'Sabrina Sato', 'Camila Vendas', 'Meta Ads', 'Campanha de Sofá', 'Sofá', 'desistiu');
  add('2026-08-25', '15:00', 'Wagner Lima', 'Renata Consultora', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 4800);
  add('2026-08-25', '16:40', 'Simone Reis', 'Juliana Móveis', 'Indicação', 'Campanha de Quarto', 'Cama', 'em_negociacao');

  // 26/08 (Quarta)
  add('2026-08-26', '10:00', 'Arthur Bernardes', 'Camila Vendas', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 5400);
  add('2026-08-26', '11:20', 'Beatriz Godoy', 'Renata Consultora', 'Facebook', 'Saldão', 'Mesa', 'venda_realizada', 2400);
  add('2026-08-26', '14:10', 'Caio Ribeiro', 'Juliana Móveis', 'WhatsApp', 'Campanha de Cozinha', 'Cozinha', 'desistiu');
  add('2026-08-26', '15:30', 'Denise Lopes', 'Patrícia Design', 'Google Ads', 'Campanha de Guarda-Roupa', 'Guarda-roupa', 'venda_realizada', 3800);
  add('2026-08-26', '16:45', 'Evandro Melo', 'Camila Vendas', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Painel', 'sem_interesse');
  add('2026-08-26', '17:20', 'Fabiana Rosa', 'Renata Consultora', 'Instagram', 'Campanha de Sofá', 'Sofá', 'em_negociacao');

  // 27/08 (Quinta)
  add('2026-08-27', '09:30', 'Gustavo Henrique', 'Juliana Móveis', 'Meta Ads', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 4900);
  add('2026-08-27', '11:00', 'Heloisa Maia', 'Patrícia Design', 'Cliente antigo', 'Nenhuma / Orgânico', 'Colchão', 'venda_realizada', 2900);
  add('2026-08-27', '14:30', 'Inácio Silva', 'Camila Vendas', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Rack', 'desistiu');
  add('2026-08-27', '16:00', 'Jaqueline Paz', 'Renata Consultora', 'Instagram', 'Campanha de Cozinha', 'Cozinha', 'em_negociacao');

  // 28/08 (Sexta)
  add('2026-08-28', '10:15', 'Kléber Costa', 'Juliana Móveis', 'Google', 'Campanha de Cozinha', 'Cozinha', 'venda_realizada', 12500);
  add('2026-08-28', '11:45', 'Larissa Fontana', 'Camila Vendas', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 3800);
  add('2026-08-28', '14:20', 'Maurício Zago', 'Patrícia Design', 'WhatsApp', 'Campanha de Quarto', 'Guarda-roupa', 'em_negociacao');
  add('2026-08-28', '15:50', 'Neusa Toledo', 'Renata Consultora', 'Indicação', 'Nenhuma / Orgânico', 'Mesa', 'venda_realizada', 3100);
  add('2026-08-28', '17:10', 'Otávio Braga', 'Juliana Móveis', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Sofá', 'sem_interesse');

  // 29/08 (Sábado) - Sábado forte
  add('2026-08-29', '09:10', 'Patrícia Souza', 'Camila Vendas', 'Instagram', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 6200);
  add('2026-08-29', '10:00', 'Quirino Neto', 'Renata Consultora', 'Meta Ads', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 4100);
  add('2026-08-29', '11:15', 'Rafael Diniz', 'Juliana Móveis', 'Google Ads', 'Campanha de Cozinha', 'Cozinha', 'venda_realizada', 8700);
  add('2026-08-29', '12:30', 'Silvia Regina', 'Patrícia Design', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Mesa', 'venda_realizada', 2800);
  add('2026-08-29', '13:40', 'Talita Xavier', 'Camila Vendas', 'WhatsApp', 'Campanha de Guarda-Roupa', 'Guarda-roupa', 'em_negociacao');
  add('2026-08-29', '14:50', 'Ubirajara Fontes', 'Renata Consultora', 'Instagram', 'Campanha de Quarto', 'Cama', 'desistiu');
  add('2026-08-29', '15:40', 'Viviane Lima', 'Juliana Móveis', 'Cliente antigo', 'Campanha de Sofá', 'Sofá', 'venda_realizada', 5600);

  // --- RESTANTE DE AGOSTO (para alimentar comparação completa de Setembro x Agosto) ---
  const sampleDataAugust = [
    { d: '2026-08-03', c: 'Instagram', o: 'Campanha de Sofá', p: 'Sofá', s: 'venda_realizada', v: 4200 },
    { d: '2026-08-04', c: 'Google Ads', o: 'Campanha de Cozinha', p: 'Cozinha', s: 'venda_realizada', v: 9300 },
    { d: '2026-08-05', c: 'Meta Ads', o: 'Campanha de Sofá', p: 'Sofá', s: 'venda_realizada', v: 5100 },
    { d: '2026-08-06', c: 'Passou em frente à loja', o: 'Nenhuma / Orgânico', p: 'Mesa', s: 'venda_realizada', v: 1950 },
    { d: '2026-08-07', c: 'Instagram', o: 'Campanha de Guarda-Roupa', p: 'Guarda-roupa', s: 'venda_realizada', v: 3400 },
    { d: '2026-08-10', c: 'WhatsApp', o: 'Campanha de Cozinha', p: 'Cozinha', s: 'venda_realizada', v: 8200 },
    { d: '2026-08-11', c: 'Google', o: 'Campanha de Sofá', p: 'Sofá', s: 'venda_realizada', v: 4700 },
    { d: '2026-08-12', c: 'Indicação', o: 'Campanha de Quarto', p: 'Cama', s: 'venda_realizada', v: 3100 },
    { d: '2026-08-13', c: 'Instagram', o: 'Campanha de Sofá', p: 'Sofá', s: 'venda_realizada', v: 6400 },
    { d: '2026-08-14', c: 'Meta Ads', o: 'Campanha de Cozinha', p: 'Cozinha', s: 'venda_realizada', v: 10500 },
    { d: '2026-08-17', c: 'Instagram', o: 'Campanha de Sofá', p: 'Sofá', s: 'venda_realizada', v: 3800 },
    { d: '2026-08-18', c: 'Google Ads', o: 'Campanha de Guarda-Roupa', p: 'Guarda-roupa', s: 'venda_realizada', v: 4100 },
    { d: '2026-08-19', c: 'WhatsApp', o: 'Campanha de Cozinha', p: 'Cozinha', s: 'venda_realizada', v: 7600 },
    { d: '2026-08-20', c: 'Instagram', o: 'Campanha de Sofá', p: 'Sofá', s: 'venda_realizada', v: 4500 },
    { d: '2026-08-21', c: 'Passou em frente à loja', o: 'Nenhuma / Orgânico', p: 'Mesa', s: 'venda_realizada', v: 2200 },
  ];

  sampleDataAugust.forEach((item, idx) => {
    add(
      item.d,
      '14:00',
      `Cliente Ag-${idx + 1}`,
      idx % 2 === 0 ? 'Camila Vendas' : 'Juliana Móveis',
      item.c,
      item.o,
      item.p,
      'venda_realizada',
      item.v,
      `${item.p} Modelo Especial`
    );
    // Adiciona alguns não-compradores no mesmo dia para manter taxa de conversão realista (~25-35%)
    add(item.d, '11:00', `Visita Ag-${idx + 1}A`, 'Renata Consultora', item.c, item.o, item.p, 'em_negociacao');
    add(item.d, '16:00', `Visita Ag-${idx + 1}B`, 'Patrícia Design', 'Passou em frente à loja', 'Nenhuma / Orgânico', 'Rack', 'desistiu');
  });

  return interactions;
}
