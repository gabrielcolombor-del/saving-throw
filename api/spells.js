const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Inicializa o Pool do PostgreSQL apenas se as variáveis de ambiente existirem
let pool = null;
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000 // 5 segundos de limite para evitar travamentos
    });
    console.log('Pool do PostgreSQL inicializado.');
  } catch (err) {
    console.error('Falha ao inicializar o Pool do PostgreSQL:', err.message);
  }
} else {
  console.log('PostgreSQL não configurado. Utilizando fallback local JSON.');
}

module.exports = async (req, res) => {
  // CORS Headers para permitir requisições locais durante o desenvolvimento
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Obter e validar parâmetros
  const className = req.query.class ? req.query.class.trim() : '';
  const cycleParam = req.query.cycle !== undefined ? parseInt(req.query.cycle, 10) : NaN;

  if (!className || isNaN(cycleParam)) {
    return res.status(400).json({
      error: 'Parâmetros inválidos. Forneça "class" (ex: Mago) e "cycle" (0 a 9).'
    });
  }

  // Tentar buscar no PostgreSQL
  if (pool) {
    try {
      const query = `
        SELECT s.* 
        FROM spells s
        JOIN spell_classes sc ON s.id = sc.spell_id
        WHERE LOWER(sc.class_name) = LOWER($1) AND s.level <= $2
        ORDER BY s.level ASC, s.name ASC
      `;
      
      const { rows } = await pool.query(query, [className, cycleParam]);
      
      // Retornar dados formatados
      const formattedRows = rows.map(row => ({
        id: row.id,
        name: row.name,
        level: row.level,
        school: row.school,
        casting_time: row.casting_time,
        range: row.range,
        components: row.components,
        duration: row.duration,
        description: row.description,
        high_level: row.high_level,
        classes: [className] // A classe buscada está garantida na lista
      }));

      return res.status(200).json({
        source: 'postgresql',
        spells: formattedRows
      });

    } catch (dbError) {
      console.error('Erro ao consultar o PostgreSQL, acionando fallback JSON:', dbError.message);
    }
  }

  // Fallback: carregar dados do arquivo JSON local
  try {
    const jsonPath = path.join(process.cwd(), 'assets', 'spells-pt.json');
    
    if (!fs.existsSync(jsonPath)) {
      return res.status(500).json({
        error: 'Serviço temporariamente indisponível. Base de dados offline.'
      });
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const spells = JSON.parse(fileContent);

    // Filtrar em memória
    const filteredSpells = spells.filter(spell => {
      const classMatch = spell.classes && spell.classes.some(c => c.toLowerCase() === className.toLowerCase());
      const levelMatch = spell.level <= cycleParam;
      return classMatch && levelMatch;
    });

    // Ordenar por ciclo e depois por nome
    filteredSpells.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name, 'pt-BR');
    });

    return res.status(200).json({
      source: 'local_json',
      spells: filteredSpells
    });

  } catch (jsonError) {
    console.error('Erro ao ler o fallback JSON:', jsonError.message);
    return res.status(500).json({
      error: 'Erro interno do servidor ao ler a base de dados.'
    });
  }
};
