import { CustomerInteraction, AppSettings, ProductItem, CategoryItem, CatalogItem } from '../types';

/**
 * Utilitário para exportação e integração com banco de dados SQLite local
 * Gera scripts DDL padronizados e arquivos .sql / .sqlite para backup local e compatibilidade total.
 */

export function generateSQLiteDump(
  interactions: CustomerInteraction[],
  settings: AppSettings
): string {
  const timestamp = new Date().toISOString();
  let sql = `-- ==========================================================================\n`;
  sql += `-- BANCO DE DADOS LOCAL: CONTROLE DE ATENDIMENTOS E VENDAS - LOJA DE MÓVEIS\n`;
  sql += `-- Gerado em: ${timestamp}\n`;
  sql += `-- Compatível com: SQLite 3, SQLite Studio, DB Browser for SQLite, DBeaver\n`;
  sql += `-- ==========================================================================\n\n`;

  sql += `PRAGMA foreign_keys = ON;\n`;
  sql += `BEGIN TRANSACTION;\n\n`;

  // 1. Tabela de Categorias
  sql += `-- 1. TABELA DE CATEGORIAS DE MÓVEIS\n`;
  sql += `CREATE TABLE IF NOT EXISTS categorias (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  nome TEXT NOT NULL UNIQUE,\n`;
  sql += `  ativo INTEGER NOT NULL DEFAULT 1\n`;
  sql += `);\n\n`;

  const categories = settings.catalogCategories || [];
  for (const cat of categories) {
    const nomeSafe = cat.name.replace(/'/g, "''");
    const ativo = cat.active ? 1 : 0;
    sql += `INSERT OR REPLACE INTO categorias (id, nome, ativo) VALUES ('${cat.id}', '${nomeSafe}', ${ativo});\n`;
  }
  sql += `\n`;

  // 2. Tabela de Produtos / Móveis (Nomes próprios comerciais)
  sql += `-- 2. TABELA DE PRODUTOS / MÓVEIS (NOMES PRÓPRIOS COMERCIAIS)\n`;
  sql += `CREATE TABLE IF NOT EXISTS produtos (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  nome TEXT NOT NULL,\n`;
  sql += `  categoria TEXT NOT NULL,\n`;
  sql += `  fabricante TEXT,\n`;
  sql += `  ativo INTEGER NOT NULL DEFAULT 1,\n`;
  sql += `  observacao TEXT\n`;
  sql += `);\n\n`;

  const products = settings.catalogProducts || [];
  for (const p of products) {
    const nomeSafe = p.name.replace(/'/g, "''");
    const catSafe = (p.category || 'Móveis').replace(/'/g, "''");
    const fabSafe = p.brand ? `'${p.brand.replace(/'/g, "''")}'` : 'NULL';
    const obsSafe = p.notes ? `'${p.notes.replace(/'/g, "''")}'` : 'NULL';
    const ativo = p.active ? 1 : 0;
    sql += `INSERT OR REPLACE INTO produtos (id, nome, categoria, fabricante, ativo, observacao) VALUES ('${p.id}', '${nomeSafe}', '${catSafe}', ${fabSafe}, ${ativo}, ${obsSafe});\n`;
  }
  sql += `\n`;

  // 3. Tabela de Campanhas
  sql += `-- 3. TABELA DE CAMPANHAS PROMOCIONAIS\n`;
  sql += `CREATE TABLE IF NOT EXISTS campanhas (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  nome TEXT NOT NULL UNIQUE,\n`;
  sql += `  ativo INTEGER NOT NULL DEFAULT 1\n`;
  sql += `);\n\n`;

  const campaigns = settings.catalogCampaigns || [];
  for (const c of campaigns) {
    const nomeSafe = c.name.replace(/'/g, "''");
    const ativo = c.active ? 1 : 0;
    sql += `INSERT OR REPLACE INTO campanhas (id, nome, ativo) VALUES ('${c.id}', '${nomeSafe}', ${ativo});\n`;
  }
  sql += `\n`;

  // 4. Tabela de Origens de Atendimento
  sql += `-- 4. TABELA DE ORIGENS DE ATENDIMENTO\n`;
  sql += `CREATE TABLE IF NOT EXISTS origens (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  nome TEXT NOT NULL UNIQUE,\n`;
  sql += `  ativo INTEGER NOT NULL DEFAULT 1\n`;
  sql += `);\n\n`;

  const origins = settings.catalogOrigins || [];
  for (const o of origins) {
    const nomeSafe = o.name.replace(/'/g, "''");
    const ativo = o.active ? 1 : 0;
    sql += `INSERT OR REPLACE INTO origens (id, nome, ativo) VALUES ('${o.id}', '${nomeSafe}', ${ativo});\n`;
  }
  sql += `\n`;

  // 5. Tabela de Vendedoras
  sql += `-- 5. TABELA DE VENDEDORAS / ATENDENTES\n`;
  sql += `CREATE TABLE IF NOT EXISTS vendedoras (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  nome TEXT NOT NULL UNIQUE,\n`;
  sql += `  ativo INTEGER NOT NULL DEFAULT 1\n`;
  sql += `);\n\n`;

  const sellers = settings.catalogSellers || [];
  for (const s of sellers) {
    const nomeSafe = s.name.replace(/'/g, "''");
    const ativo = s.active ? 1 : 0;
    sql += `INSERT OR REPLACE INTO vendedoras (id, nome, ativo) VALUES ('${s.id}', '${nomeSafe}', ${ativo});\n`;
  }
  sql += `\n`;

  // 6. Tabela Principal de Atendimentos (Interações com Preservação Histórica)
  sql += `-- 6. TABELA DE ATENDIMENTOS E VENDAS (REGISTROS HISTÓRICOS IMUTÁVEIS)\n`;
  sql += `CREATE TABLE IF NOT EXISTS interacoes (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  data TEXT NOT NULL,\n`;
  sql += `  hora TEXT NOT NULL,\n`;
  sql += `  cliente_nome TEXT,\n`;
  sql += `  vendedora TEXT NOT NULL,\n`;
  sql += `  origem TEXT NOT NULL,\n`;
  sql += `  campanha TEXT NOT NULL,\n`;
  sql += `  produto_interesse TEXT NOT NULL,\n`;
  sql += `  status TEXT NOT NULL CHECK(status IN ('venda_realizada', 'em_negociacao', 'desistiu', 'sem_interesse', 'retorno_futuro')),\n`;
  sql += `  valor_venda REAL,\n`;
  sql += `  produto_vendido TEXT,\n`;
  sql += `  observacoes TEXT,\n`;
  sql += `  criado_em TEXT NOT NULL,\n`;
  sql += `  atualizado_em TEXT NOT NULL\n`;
  sql += `);\n\n`;

  sql += `CREATE INDEX IF NOT EXISTS idx_interacoes_data ON interacoes(data);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_interacoes_status ON interacoes(status);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_interacoes_origem ON interacoes(origem);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_interacoes_campanha ON interacoes(campanha);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_interacoes_produto ON interacoes(produto_interesse);\n\n`;

  for (const item of interactions) {
    const clienteSafe = item.customerName ? `'${item.customerName.replace(/'/g, "''")}'` : 'NULL';
    const vendedoraSafe = (item.sellerName || 'Vendedora').replace(/'/g, "''");
    const origemSafe = item.origin.replace(/'/g, "''");
    const campanhaSafe = item.campaign.replace(/'/g, "''");
    const prodSafe = item.product.replace(/'/g, "''");
    const statusSafe = item.status;
    const valorSafe = item.saleValue !== undefined && item.saleValue !== null ? item.saleValue : 'NULL';
    const prodVendidoSafe = item.productSold ? `'${item.productSold.replace(/'/g, "''")}'` : 'NULL';
    const obsSafe = item.notes ? `'${item.notes.replace(/'/g, "''")}'` : 'NULL';
    const createdAt = item.createdAt || new Date().toISOString();
    const updatedAt = item.updatedAt || new Date().toISOString();

    sql += `INSERT OR REPLACE INTO interacoes (\n`;
    sql += `  id, data, hora, cliente_nome, vendedora, origem, campanha, produto_interesse, status, valor_venda, produto_vendido, observacoes, criado_em, atualizado_em\n`;
    sql += `) VALUES (\n`;
    sql += `  '${item.id}', '${item.date}', '${item.time}', ${clienteSafe}, '${vendedoraSafe}', '${origemSafe}', '${campanhaSafe}', '${prodSafe}', '${statusSafe}', ${valorSafe}, ${prodVendidoSafe}, ${obsSafe}, '${createdAt}', '${updatedAt}'\n`;
    sql += `);\n`;
  }

  sql += `\nCOMMIT;\n`;
  sql += `-- Fim do dump SQLite. Total de atendimentos: ${interactions.length}\n`;

  return sql;
}

/**
 * Faz download do arquivo .sql do SQLite
 */
export function downloadSQLiteDump(interactions: CustomerInteraction[], settings: AppSettings) {
  const sqlContent = generateSQLiteDump(interactions, settings);
  const blob = new Blob([sqlContent], { type: 'application/x-sqlite3;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  link.href = url;
  link.setAttribute('download', `banco_sqlite_loja_moveis_${dateStr}.sql`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
