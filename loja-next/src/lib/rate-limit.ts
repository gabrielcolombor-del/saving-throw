import { pool } from '@/lib/db';

/*
 * Limite de tentativas de login (admin e mestres).
 *
 * As falhas ficam no Postgres porque, na Vercel, cada requisição pode cair numa instância
 * diferente: um contador só em memória seria zerado a cada instância nova. Sem banco,
 * cai no contador em memória (melhor que nada em dev).
 */

const memory = new Map<string, number[]>();
let tableChecked = false;

async function ensureTable() {
  if (!pool || tableChecked) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id BIGSERIAL PRIMARY KEY,
      scope VARCHAR(50) NOT NULL,
      key VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS login_attempts_lookup ON login_attempts (scope, key, created_at);
    -- Só o servidor (papel postgres) usa esta tabela; a API pública do Supabase não enxerga nada.
    ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
  `);
  tableChecked = true;
}

/** IP do cliente como a Vercel informa (primeiro item do x-forwarded-for). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] || request.headers.get('x-real-ip') || 'desconhecido').trim().slice(0, 100);
}

export type Limit = { max: number; windowMinutes: number };

/** true quando a chave já gastou todas as tentativas da janela. */
export async function isBlocked(scope: string, key: string, { max, windowMinutes }: Limit): Promise<boolean> {
  if (pool) {
    try {
      await ensureTable();
      const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS n FROM login_attempts
          WHERE scope = $1 AND key = $2 AND created_at > NOW() - make_interval(mins => $3)`,
        [scope, key, windowMinutes],
      );
      return rows[0].n >= max;
    } catch (e) {
      console.error('Limite de tentativas: falha ao consultar o banco:', (e as Error).message);
    }
  }
  const since = Date.now() - windowMinutes * 60_000;
  const hits = (memory.get(`${scope}:${key}`) || []).filter((t) => t > since);
  memory.set(`${scope}:${key}`, hits);
  return hits.length >= max;
}

export async function recordFailure(scope: string, key: string) {
  if (pool) {
    try {
      await ensureTable();
      await pool.query('INSERT INTO login_attempts (scope, key) VALUES ($1, $2)', [scope, key]);
      // Limpeza oportunista: nada com mais de um dia interessa.
      if (Math.random() < 0.05) await pool.query(`DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '1 day'`);
      return;
    } catch (e) {
      console.error('Limite de tentativas: falha ao gravar no banco:', (e as Error).message);
    }
  }
  const k = `${scope}:${key}`;
  memory.set(k, [...(memory.get(k) || []), Date.now()]);
}

export async function clearFailures(scope: string, key: string) {
  memory.delete(`${scope}:${key}`);
  if (!pool) return;
  try {
    await pool.query('DELETE FROM login_attempts WHERE scope = $1 AND key = $2', [scope, key]);
  } catch (e) {
    console.error('Limite de tentativas: falha ao limpar:', (e as Error).message);
  }
}
