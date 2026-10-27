import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

type Spell = {
  id: string | number;
  name: string;
  level: number;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  high_level: string | null;
  classes: string[];
};

const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const className = (sp.get('class') || '').trim();
  const cycle = sp.get('cycle') !== null ? parseInt(sp.get('cycle')!, 10) : NaN;

  if (!className || isNaN(cycle)) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos. Forneça "class" (ex: Mago) e "cycle" (0 a 9).' },
      { status: 400 },
    );
  }

  if (pool) {
    try {
      const { rows } = await pool.query(
        `SELECT s.id, s.name, s.level, s.school, s.casting_time, s.range, s.components, s.duration, s.description, s.high_level
           FROM spells s
           JOIN spell_classes sc ON s.id = sc.spell_id
          WHERE LOWER(sc.class_name) = LOWER($1) AND s.level <= $2
          ORDER BY s.level ASC, s.name ASC`,
        [className, cycle],
      );
      return NextResponse.json(
        { source: 'postgresql', spells: rows.map((r) => ({ ...r, classes: [className] })) },
        { headers: CACHE },
      );
    } catch (e) {
      console.error('Erro ao consultar o PostgreSQL, acionando fallback JSON:', (e as Error).message);
    }
  }

  // Fallback: base local empacotada com a função (no legado o caminho estava errado e o fallback nunca funcionava)
  try {
    const { default: spells } = (await import('@/data/spells-pt.json')) as { default: Spell[] };
    const lower = className.toLowerCase();
    const filtered = spells
      .filter((s) => s.classes?.some((c) => c.toLowerCase() === lower) && s.level <= cycle)
      .sort((a, b) => (a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name, 'pt-BR')));
    return NextResponse.json({ source: 'local_json', spells: filtered });
  } catch (e) {
    console.error('Erro ao ler o fallback JSON:', (e as Error).message);
    return NextResponse.json({ error: 'Erro interno do servidor ao ler a base de dados.' }, { status: 500 });
  }
}
