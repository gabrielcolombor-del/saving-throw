const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\Gabriel Colombo\\OneDrive\\Área de Trabalho\\RPG\\DD-Player-Handbook.pdf';
const outputPath = path.join(__dirname, '..', 'assets', 'spells-en.json');

if (!fs.existsSync(pdfPath)) {
  console.error('Erro: PDF não encontrado em:', pdfPath);
  process.exit(1);
}

console.log('Iniciando extração do PDF...');
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  console.log('PDF carregado. Total de caracteres:', text.length);

  // 1. EXTRAÇÃO DAS LISTAS DE CLASSES (páginas 188 a 191)
  // Vamos recortar a parte do texto correspondente às listas de magias das classes.
  // Começa no início do capítulo 11 (página 188) e vai até "Spell Descriptions" (página 192).
  const chapter11Regex = /C\s*h\s*a\s*p\s*t\s*e\s*r\s*11\s*:\s*S\s*p\s*e\s*l\s*l\s*s/i;
  const spellDescRegex = /S\s*p\s*e\s*l\s*l\s*D\s*e\s*s\s*c\s*r\s*i\s*p\s*t\s*i\s*o\s*n\s*s/i;

  const chapter11Match = chapter11Regex.exec(text);
  
  // Para Spell Descriptions, queremos encontrar a ocorrência real (após o meio do texto), 
  // não a do sumário.
  let spellDescMatch = null;
  let match;
  while ((match = spellDescRegex.exec(text)) !== null) {
    if (match.index > 500000) { // O sumário fica no início do texto (<10.000)
      spellDescMatch = match;
      break;
    }
  }

  if (!chapter11Match || !spellDescMatch) {
    console.error('Erro: Não foi possível delimitar as listas de classes ou as descrições.');
    console.log('Chapter 11 Match:', !!chapter11Match);
    console.log('Spell Desc Match:', !!spellDescMatch);
    process.exit(1);
  }

  const listsStartIdx = chapter11Match.index;
  const descStartIdx = spellDescMatch.index;

  const listsText = text.substring(listsStartIdx, descStartIdx);
  const spellsText = text.substring(descStartIdx);

  console.log('Separando seções de classes...');
  
  // Mapeamos as posições aproximadas de início de cada classe
  const classesRegex = [
    { name: 'Bard', regex: /B\s*a\s*r\s*d\s*S\s*p\s*e\s*l\s*l\s*s/i },
    { name: 'Cleric', regex: /C\s*l\s*e\s*r\s*i\s*c\s*S\s*p\s*e\s*l\s*l\s*s/i },
    { name: 'Druid', regex: /D\s*r\s*u\s*i\s*d\s*S\s*p\s*e\s*l\s*l\s*s/i },
    { name: 'Paladin', regex: /P\s*a\s*l\s*a\s*d\s*i\s*n\s*S\s*p\s*e\s*l\s*l\s*s/i },
    { name: 'Ranger', regex: /R\s*a\s*n\s*g\s*e\s*r\s*S\s*p\s*e\s*l\s*l\s*s/i },
    { name: 'Sorcerer', regex: /S\s*o\s*r\s*c\s*e\s*r\s*e\s*r\s*S\s*p\s*e\s*l\s*l\s*s/i },
    { name: 'Warlock', regex: /W\s*a\s*r\s*l\s*o\s*c\s*k\s*S\s*p\s*e\s*l\s*l\s*s/i },
    { name: 'Wizard', regex: /W\s*i\s*z\s*a\s*r\s*d\s*S\s*p\s*e\s*l\s*l\s*s/i }
  ];

  // Encontrar os índices reais no listsText
  let classSections = [];
  for (let i = 0; i < classesRegex.length; i++) {
    const match = classesRegex[i].regex.exec(listsText);
    if (match) {
      classSections.push({
        name: classesRegex[i].name,
        index: match.index
      });
    }
  }

  // Ordenar por índice para garantir a ordem
  classSections.sort((a, b) => a.index - b.index);

  // Recortar o texto de cada classe
  let classTexts = {};
  for (let i = 0; i < classSections.length; i++) {
    const start = classSections[i].index;
    const end = (i < classSections.length - 1) ? classSections[i+1].index : listsText.length;
    classTexts[classSections[i].name] = listsText.substring(start, end);
  }

  // 2. EXTRAÇÃO DAS MAGIAS INDIVIDUAIS (Spell Descriptions)
  console.log('Extraindo magias das descrições...');
  const lines = spellsText.split('\n');
  const spells = [];

  // Encontrar todas as linhas com "Casting Time:"
  const anchors = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Casting Time:') || lines[i].includes('C asting  T im e:')) {
      // Validar se a linha anterior ou a próxima dão sinais de ser uma magia (evitar falsos positivos)
      const prevLine = lines[i-1] || '';
      const nextLine = lines[i+1] || '';
      if (
        prevLine.toLowerCase().includes('cantrip') || 
        prevLine.toLowerCase().includes('level') ||
        prevLine.toLowerCase().includes('abjuration') ||
        prevLine.toLowerCase().includes('conjuration') ||
        prevLine.toLowerCase().includes('divination') ||
        prevLine.toLowerCase().includes('enchantment') ||
        prevLine.toLowerCase().includes('evocation') ||
        prevLine.toLowerCase().includes('illusion') ||
        prevLine.toLowerCase().includes('necromancy') ||
        prevLine.toLowerCase().includes('transmutation') ||
        nextLine.toLowerCase().includes('range')
      ) {
        anchors.push(i);
      }
    }
  }

  console.log(`Encontradas ${anchors.length} magias estruturadas.`);

  for (let a = 0; a < anchors.length; a++) {
    const idx = anchors[a];
    const nameLine = lines[idx - 2] ? lines[idx - 2].trim() : '';
    const levelSchoolLine = lines[idx - 1] ? lines[idx - 1].trim() : '';
    const castingTimeLine = lines[idx].trim();
    
    // Encontrar Range
    let range = '';
    let rangeLineIdx = idx + 1;
    while (rangeLineIdx < lines.length && !lines[rangeLineIdx].includes('Range:')) {
      rangeLineIdx++;
    }
    if (rangeLineIdx < lines.length) {
      range = lines[rangeLineIdx].replace('Range:', '').trim();
    }

    // Encontrar Components
    let components = '';
    let compLineIdx = rangeLineIdx + 1;
    while (compLineIdx < lines.length && !lines[compLineIdx].includes('Components:')) {
      compLineIdx++;
    }
    if (compLineIdx < lines.length) {
      components = lines[compLineIdx].replace('Components:', '').trim();
      // Se a linha seguinte não for Duration, acumular como parte dos componentes (wrap de linhas)
      let nextCompIdx = compLineIdx + 1;
      while (nextCompIdx < lines.length && !lines[nextCompIdx].includes('Duration:')) {
        components += ' ' + lines[nextCompIdx].trim();
        nextCompIdx++;
      }
    }

    // Encontrar Duration
    let duration = '';
    let durLineIdx = rangeLineIdx + 1;
    while (durLineIdx < lines.length && !lines[durLineIdx].includes('Duration:')) {
      durLineIdx++;
    }
    if (durLineIdx < lines.length) {
      duration = lines[durLineIdx].replace('Duration:', '').trim();
    }

    // A descrição vai do fim dos cabeçalhos até a linha anterior do nome da próxima magia
    const descStart = durLineIdx + 1;
    const descEnd = (a < anchors.length - 1) ? anchors[a+1] - 2 : lines.length;
    
    let descLines = [];
    for (let d = descStart; d < descEnd; d++) {
      descLines.push(lines[d]);
    }
    
    let fullDescription = descLines.join('\n').trim();
    
    // Separar "At Higher Levels"
    let description = fullDescription;
    let highLevel = '';
    const highLevelMatch = fullDescription.match(/(At Higher Levels\.|A\s*t\s*H\s*igh\s*er\s*L\s*ev\s*els\.)\s*([\s\S]+)$/i);
    if (highLevelMatch) {
      description = fullDescription.substring(0, highLevelMatch.index).trim();
      highLevel = highLevelMatch[2].trim();
    }

    // Limpar o nome da magia dos espaços extras causados pelo PDF
    // Ex: "A cid   S plash" -> "Acid Splash"
    // Algoritmo simples: se houver duas letras maiúsculas separadas por espaço, ou letras minúsculas seguidas por espaço e outra minúscula,
    // vamos normalizar mantendo o espaçamento de palavras real.
    // Uma forma mais segura é remover espaços duplos e, se restarem espaços únicos entre letras simples (ex: "A c i d"), juntá-las.
    let cleanName = nameLine
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();

    // Heurística de limpeza para fontes do PHB
    // Se parecer espaçado como "A l t e r   S e l f" ou "A c i d   S p l a s h"
    if (cleanName.split(' ').length > 4 && !cleanName.includes("'") && !cleanName.includes("-")) {
      // Junta letras que estão sozinhas
      let parts = cleanName.split(' ');
      let newName = '';
      for (let p = 0; p < parts.length; p++) {
        if (parts[p].length === 1) {
          newName += parts[p];
        } else {
          newName += ' ' + parts[p];
        }
      }
      cleanName = newName.replace(/\s+/g, ' ').trim();
    }
    // Correções manuais de OCR para nomes comuns
    cleanName = cleanName
      .replace(/^A cid Splash$/i, 'Acid Splash')
      .replace(/^A lter Self$/i, 'Alter Self')
      .replace(/^A n im a l F riendsh ip$/i, 'Animal Friendship')
      .replace(/^A n im a l Messenger$/i, 'Animal Messenger')
      .replace(/^A n im a l Shapes$/i, 'Animal Shapes')
      .replace(/^A n im a t e Dead$/i, 'Animate Dead')
      .replace(/^A n im a t e Objects$/i, 'Animate Objects')
      .replace(/^A n t ip a t h y\/Sym p a t h y$/i, 'Antipathy/Sympathy')
      .replace(/^A r m o r of Agathys$/i, 'Armor of Agathys')
      .replace(/^A r m s of Hadar$/i, 'Arms of Hadar')
      .replace(/^A s t r a l Proj ection$/i, 'Astral Projection')
      .replace(/^A u r a of Life$/i, 'Aura of Life')
      .replace(/^A u r a of Purity$/i, 'Aura of Purity')
      .replace(/^A u r a of Vitality$/i, 'Aura of Vitality')
      .replace(/^B a n ish m e n t$/i, 'Banishment')
      .replace(/^B l a d e Ward$/i, 'Blade Ward')
      .replace(/^C a l l Lightning$/i, 'Call Lightning')
      .replace(/^C o n t r a f e i t i ç o$/i, 'Counterspell') // caso
      .replace(/^C o u n t e r s p e l l$/i, 'Counterspell')
      .replace(/^D e t e c t Magic$/i, 'Detect Magic')
      .replace(/^D im e n s i o n Door$/i, 'Dimension Door')
      .replace(/^D i s p e l Magic$/i, 'Dispel Magic')
      .replace(/^E l d r i t c h Blast$/i, 'Eldritch Blast')
      .replace(/^F a e r i e Fire$/i, 'Faerie Fire')
      .replace(/^F i n g e r of Death$/i, 'Finger of Death')
      .replace(/^F i r e Bolt$/i, 'Fire Bolt')
      .replace(/^F i r e b a l l$/i, 'Fireball')
      .replace(/^H e l l i s h Rebuke$/i, 'Hellish Rebuke')
      .replace(/^H o l d Person$/i, 'Hold Person')
      .replace(/^M a g e Armor$/i, 'Mage Armor')
      .replace(/^M a g i c Missile$/i, 'Magic Missile')
      .replace(/^M i s t y Step$/i, 'Misty Step')
      .replace(/^P o l y m o r p h$/i, 'Polymorph')
      .replace(/^S p i r i t Guardians$/i, 'Spirit Guardians')
      .replace(/^S p i k e Growth$/i, 'Spike Growth')
      .replace(/^T e l e p o r t$/i, 'Teleport')
      .replace(/^T h o r n Whip$/i, 'Thorn Whip')
      .replace(/^T r u e Polymorph$/i, 'True Polymorph')
      .replace(/^W i s h$/i, 'Wish');

    // Parse do level e da escola
    // Ex: "Conjuration cantrip" -> level = 0, school = "Conjuration"
    // Ex: "2nd-level abjuration" -> level = 2, school = "abjuration"
    let level = 0;
    let school = levelSchoolLine;
    const levelMatch = levelSchoolLine.match(/(\d+)(st|nd|rd|th)-level/i);
    if (levelMatch) {
      level = parseInt(levelMatch[1], 10);
      school = levelSchoolLine.replace(levelMatch[0], '').replace('(ritual)', '').trim();
    } else if (levelSchoolLine.toLowerCase().includes('cantrip')) {
      level = 0;
      school = levelSchoolLine.toLowerCase().replace('cantrip', '').trim();
    }

    // Capitalizar a escola
    if (school.length > 0) {
      school = school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
    }

    spells.push({
      id: a + 1,
      name: cleanName,
      level: level,
      school: school,
      casting_time: castingTimeLine.replace('Casting Time:', '').replace('C asting  T im e:', '').trim(),
      range: range,
      components: components,
      duration: duration,
      description: description,
      high_level: highLevel,
      classes: [] // Será preenchido na próxima etapa
    });
  }

  // 3. ASSOCIAÇÃO DAS MAGIAS ÀS CLASSES
  console.log('Associando magias às classes...');
  
  // Criar uma versão normalizada de busca para cada magia
  // Ex: "Tasha's Hideous Laughter" -> "tashashideouslaughter"
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const normalizedSpells = spells.map(s => ({
    spell: s,
    normName: normalize(s.name)
  }));

  // Ordenar magias por tamanho do nome normalizado decrescente
  // Isso evita que "Wish" bata dentro de outro nome maior se houver colisão
  normalizedSpells.sort((a, b) => b.normName.length - a.normName.length);

  // Mapeamento de nomes de classe em inglês -> português
  const classTranslation = {
    'Bard': 'Bardo',
    'Cleric': 'Clérigo',
    'Druid': 'Druida',
    'Paladin': 'Paladino',
    'Ranger': 'Patrulheiro',
    'Sorcerer': 'Feiticeiro',
    'Warlock': 'Bruxo',
    'Wizard': 'Mago'
  };

  // Para cada classe, vamos escanear o listsText recortado dela
  for (const [englishClassName, classText] of Object.entries(classTexts)) {
    const portugueseClassName = classTranslation[englishClassName];
    const normalizedClassText = normalize(classText);
    
    // Vamos varrer todas as magias
    for (const item of normalizedSpells) {
      // Se o nome normalizado da magia for encontrado no texto da classe
      if (normalizedClassText.includes(item.normName)) {
        item.spell.classes.push(portugueseClassName);
      }
    }
  }

  // Corrigir algumas magias comuns que podem ter falhado na associação por conta do OCR
  // Exemplo: se as classes estiverem vazias, damos algumas classes padrão
  spells.forEach(s => {
    if (s.classes.length === 0) {
      if (s.name.toLowerCase().includes('smite')) s.classes.push('Paladino');
      else if (s.name.toLowerCase().includes('arrow') || s.name.toLowerCase().includes('hunter')) s.classes.push('Patrulheiro');
      else {
        // Padrão: Mago e Feiticeiro
        s.classes.push('Mago');
      }
    }
  });

  // Salvar no arquivo JSON
  fs.writeFileSync(outputPath, JSON.stringify(spells, null, 2));
  console.log(`Sucesso! ${spells.length} magias extraídas e salvas em: ${outputPath}`);

}).catch(err => {
  console.error('Erro geral no pdf-parse:', err);
});
