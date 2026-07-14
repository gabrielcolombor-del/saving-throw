const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\Gabriel Colombo\\OneDrive\\Área de Trabalho\\AT\\Antigravity\\Saving Throw\\assets\\Livro do Jogador - DnD 5e.pdf';
const outputPath = path.join(__dirname, '..', 'assets', 'spells-pt.json');

if (!fs.existsSync(pdfPath)) {
  console.error('Erro: PDF não encontrado em:', pdfPath);
  process.exit(1);
}

console.log('Iniciando extração do PDF em português...');
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  console.log('PDF carregado. Total de caracteres:', text.length);

  // 1. DELIMITAÇÃO DAS SEÇÕES
  // Buscamos o Capítulo 11: Magias (onde estão as listas) e o início das descrições.
  const chapter11Regex = /C\s*a\s*p\s*í\s*t\s*u\s*l\s*o\s*11\s*:\s*M\s*a\s*g\s*i\s*a\s*s/i;
  
  // As descrições começam com "AMIZADE ANIMAL" ou similar, por volta da página 215.
  // Vamos buscar por "AMIZADE ANIMAL" em caixa alta, ou "Tempo de Conjuração" após o caractere 800.000.
  const amizadeRegex = /A\s*M\s*I\s*Z\s*A\s*D\s*E\s*A\s*N\s*I\s*M\s*A\s*L/gi;
  
  const chapter11Match = chapter11Regex.exec(text);
  
  let descStartIdx = -1;
  let match;
  while ((match = amizadeRegex.exec(text)) !== null) {
    if (match.index > 750000) { // O índice real das descrições
      descStartIdx = match.index;
      break;
    }
  }

  if (!chapter11Match || descStartIdx === -1) {
    console.error('Erro: Não foi possível delimitar as listas de classes ou as descrições em português.');
    console.log('Chapter 11 Match:', !!chapter11Match);
    console.log('Desc Start index:', descStartIdx);
    process.exit(1);
  }

  const listsStartIdx = chapter11Match.index;

  const listsText = text.substring(listsStartIdx, descStartIdx);
  const spellsText = text.substring(descStartIdx);

  console.log('Separando seções de classes em português...');
  
  // Nomes das classes no PDF em português
  const classesRegex = [
    { name: 'Bardo', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*B\s*A\s*R\s*D\s*O/i },
    { name: 'Clérigo', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*C\s*L\s*É\s*R\s*I\s*G\s*O/i },
    { name: 'Druida', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*D\s*R\s*U\s*I\s*D\s*A/i },
    { name: 'Paladino', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*P\s*A\s*L\s*A\s*D\s*I\s*N\s*O/i },
    { name: 'Patrulheiro', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*P\s*A\s*T\s*R\s*U\s*L\s*H\s*E\s*I\s*R\s*O/i },
    { name: 'Feiticeiro', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*F\s*E\s*I\s*T\s*I\s*C\s*E\s*I\s*R\s*O/i },
    { name: 'Bruxo', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*B\s*R\s*U\s*X\s*O/i },
    { name: 'Mago', regex: /M\s*A\s*G\s*I\s*A\s*S\s*D\s*E\s*M\s*A\s*G\s*O/i }
  ];

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

  classSections.sort((a, b) => a.index - b.index);

  let classTexts = {};
  for (let i = 0; i < classSections.length; i++) {
    const start = classSections[i].index;
    const end = (i < classSections.length - 1) ? classSections[i+1].index : listsText.length;
    classTexts[classSections[i].name] = listsText.substring(start, end);
  }

  // 2. EXTRAÇÃO DAS DESCRIÇÕES DAS MAGIAS
  console.log('Extraindo magias em português das descrições...');
  const lines = spellsText.split('\n');
  const spells = [];

  // Encontrar todas as linhas com "Tempo de Conjuração"
  const anchors = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Tempo de Conjuração') || lines[i].includes('Tempo de Conjuraçao') || lines[i].includes('Tempo de Conjuracao')) {
      const prevLine = lines[i-1] || '';
      const nextLine = lines[i+1] || '';
      if (
        prevLine.toLowerCase().includes('nível') || 
        prevLine.toLowerCase().includes('nivel') ||
        prevLine.toLowerCase().includes('truque') ||
        nextLine.toLowerCase().includes('alcance')
      ) {
        anchors.push(i);
      }
    }
  }

  console.log(`Encontradas ${anchors.length} magias estruturadas em português.`);

  for (let a = 0; a < anchors.length; a++) {
    const idx = anchors[a];
    const nameLine = lines[idx - 2] ? lines[idx - 2].trim() : '';
    const levelSchoolLine = lines[idx - 1] ? lines[idx - 1].trim() : '';
    const castingTimeLine = lines[idx].trim();
    
    // Encontrar Alcance
    let range = '';
    let rangeLineIdx = idx + 1;
    while (rangeLineIdx < lines.length && !lines[rangeLineIdx].includes('Alcance')) {
      rangeLineIdx++;
    }
    if (rangeLineIdx < lines.length) {
      range = lines[rangeLineIdx].replace('Alcance', '').replace(':', '').replace(' :', '').trim();
    }

    // Encontrar Componentes
    let components = '';
    let compLineIdx = rangeLineIdx + 1;
    while (compLineIdx < lines.length && !lines[compLineIdx].includes('Componentes')) {
      compLineIdx++;
    }
    if (compLineIdx < lines.length) {
      components = lines[compLineIdx].replace('Componentes', '').replace(':', '').replace(' :', '').trim();
      // Acumular linhas extras se necessário
      let nextCompIdx = compLineIdx + 1;
      while (nextCompIdx < lines.length && !lines[nextCompIdx].includes('Duração') && !lines[nextCompIdx].includes('Duraçao')) {
        components += ' ' + lines[nextCompIdx].trim();
        nextCompIdx++;
      }
    }

    // Encontrar Duração
    let duration = '';
    let durLineIdx = rangeLineIdx + 1;
    while (durLineIdx < lines.length && !lines[durLineIdx].includes('Duração') && !lines[durLineIdx].includes('Duraçao')) {
      durLineIdx++;
    }
    if (durLineIdx < lines.length) {
      duration = lines[durLineIdx].replace('Duração', '').replace('Duraçao', '').replace(':', '').replace(' :', '').trim();
    }

    // A descrição vai da duração até a próxima magia
    const descStart = durLineIdx + 1;
    const descEnd = (a < anchors.length - 1) ? anchors[a+1] - 2 : lines.length;
    
    let descLines = [];
    for (let d = descStart; d < descEnd; d++) {
      descLines.push(lines[d]);
    }
    
    let fullDescription = descLines.join('\n').trim();
    
    // Separar "Em Níveis Superiores"
    let description = fullDescription;
    let highLevel = '';
    const highLevelMatch = fullDescription.match(/(Em Níveis Superiores\.|Em N\s*í\s*v\s*e\s*i\s*s\s*S\s*u\s*p\s*e\s*r\s*i\s*o\s*r\s*e\s*s\s*\.)\s*([\s\S]+)$/i);
    if (highLevelMatch) {
      description = fullDescription.substring(0, highLevelMatch.index).trim();
      highLevel = highLevelMatch[2].trim();
    }

    // Limpar o nome da magia
    let cleanName = nameLine.replace(/\s+/g, ' ').trim();
    
    // Heurística para unir letras separadas por drop cap ou fonte especial
    if (cleanName.split(' ').length > 3 && !cleanName.includes('-')) {
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

    // Corrigir acentuação ou caixa nos nomes comuns em português
    cleanName = cleanName
      .replace(/^A MIZADE A NIMAL$/i, 'Amizade Animal')
      .replace(/^A MPLIAR P LANTAS$/i, 'Ampliar Plantas')
      .replace(/^Â NCORA P LANAR$/i, 'Âncora Planar')
      .replace(/^A NDAR NA Á GUA$/i, 'Andar na Água')
      .replace(/^A NIMAR M ORTOS$/i, 'Animar Mortos')
      .replace(/^A NIMAR O BJETOS$/i, 'Animar Objetos')
      .replace(/^A PARRAPAR$/i, 'Aparar')
      .replace(/^A PRIMORAR H ABILIDADE$/i, 'Aprimorar Habilidade')
      .replace(/^A RROMBAR$/i, 'Arrombar')
      .replace(/^A TAQUE C ERTEIRO$/i, 'Ataque Certeiro')
      .replace(/^B ANIMENTO$/i, 'Banimento')
      .replace(/^B ANQUETE DE H ERÓIS$/i, 'Banquete de Heróis')
      .replace(/^B ANQUETE DOS H ERÓIS$/i, 'Banquete dos Heróis')
      .replace(/^B ÊNÇÃO$/i, 'Bênção')
      .replace(/^B OLA DE F OGO$/i, 'Bola de Fogo')
      .replace(/^B OLA DE F OGO C ONTROLÁVEL$/i, 'Bola de Fogo Controlável')
      .replace(/^B ORDÃO M ÍSTICO$/i, 'Bordão Místico')
      .replace(/^C AMPO A NTIMAGIA$/i, 'Campo Antimagia')
      .replace(/^C HICOTE DE E SPINHOS$/i, 'Chicote de Espinhos')
      .replace(/^C ÍRCULO DE P ODER$/i, 'Círculo de Poder')
      .replace(/^C ÍRCULO M ÁGICO$/i, 'Círculo Mágico')
      .replace(/^C OLO DE F OGO$/i, 'Coluna de Chamas')
      .replace(/^C ONSERTAR$/i, 'Consertar')
      .replace(/^C RESCER E SPINHOS$/i, 'Crescer Espinhos')
      .replace(/^C URA C OMPLETA$/i, 'Cura Completa')
      .replace(/^C URA C OMPLETA EM M ASSA$/i, 'Cura Completa em Massa')
      .replace(/^D EDO DA M ORTE$/i, 'Dedo da Morte')
      .replace(/^D ESEJO$/i, 'Desejo')
      .replace(/^D ISPEL M AGIA$/i, 'Dissipar Magia')
      .replace(/^D ISSIPAR M AGIA$/i, 'Dissipar Magia')
      .replace(/^D OMINAR M ONSTRO$/i, 'Dominar Monstro')
      .replace(/^D OMINAR P ESSOA$/i, 'Dominar Pessoa')
      .replace(/^E SPINHO DE Á CIDO$/i, 'Espirro de Ácido')
      .replace(/^E SPIRRO DE Á CIDO$/i, 'Espirro de Ácido')
      .replace(/^F OGO DAS F ADAS$/i, 'Fogo das Fadas')
      .replace(/^I MOBILIZAR P ESSOA$/i, 'Imobilizar Pessoa')
      .replace(/^I NVISIBILIDADE$/i, 'Invisibilidade')
      .replace(/^M ÃOS M ÁGICAS$/i, 'Mãos Mágicas')
      .replace(/^M ETAMORFOSE$/i, 'Metamorfose')
      .replace(/^M ETAMORFOSE V ERDADEIRA$/i, 'Metamorfose Verdadeira')
      .replace(/^M ÓS SEIS M ÁGICOS$/i, 'Mísseis Mágicos')
      .replace(/^M ÍSSEIS M ÁGICOS$/i, 'Mísseis Mágicos')
      .replace(/^P ADRÃO H IPNÓTICO$/i, 'Padrão Hipnótico')
      .replace(/^P ASSOS S EM P EGADAS$/i, 'Passos sem Pegadas')
      .replace(/^P ELE DE P EDRA$/i, 'Pele de Pedra')
      .replace(/^P ORTAL$/i, 'Portal')
      .replace(/^P ROJEÇÃO A STRAL$/i, 'Projeção Astral')
      .replace(/^R AJADA M ÍSTICA$/i, 'Rajada Mística')
      .replace(/^R ESTAURAÇÃO M AIOR$/i, 'Restauração Maior')
      .replace(/^R ESTAURAÇÃO M ENOR$/i, 'Restauração Menor')
      .replace(/^T ERREMOTO$/i, 'Terremoto')
      .replace(/^V ISÃO DA V ERDADE$/i, 'Visão da Verdade')
      .replace(/^V OO$/i, 'Voo');

    // Parse do level e da escola
    // Ex: "truque de conjuração" -> level = 0, school = "Conjuração"
    // Ex: "3° nível de evocação" -> level = 3, school = "Evocação"
    let level = 0;
    let school = levelSchoolLine;
    const levelMatch = levelSchoolLine.match(/(\d+)(°|º)\s*nível/i);
    if (levelMatch) {
      level = parseInt(levelMatch[1], 10);
      school = levelSchoolLine.replace(levelMatch[0], '').replace('de', '').replace('(ritual)', '').trim();
    } else if (levelSchoolLine.toLowerCase().includes('truque')) {
      level = 0;
      school = levelSchoolLine.toLowerCase().replace('truque', '').replace('de', '').trim();
    }

    if (school.length > 0) {
      school = school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
    }

    spells.push({
      id: a + 1,
      name: cleanName,
      level: level,
      school: school,
      casting_time: castingTimeLine.replace('Tempo de Conjuração', '').replace('Tempo de Conjuraçao', '').replace(':', '').replace(' :', '').trim(),
      range: range,
      components: components,
      duration: duration,
      description: description,
      high_level: highLevel,
      classes: []
    });
  }

  // 3. ASSOCIAÇÃO ÀS CLASSES
  console.log('Associando magias às classes em português...');
  
  const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

  const normalizedSpells = spells.map(s => ({
    spell: s,
    normName: normalize(s.name)
  }));

  normalizedSpells.sort((a, b) => b.normName.length - a.normName.length);

  for (const [className, classText] of Object.entries(classTexts)) {
    const normalizedClassText = normalize(classText);
    
    for (const item of normalizedSpells) {
      if (normalizedClassText.includes(item.normName)) {
        item.spell.classes.push(className);
      }
    }
  }

  // Preencher classes vazias com base em palavras-chave ou fallback
  spells.forEach(s => {
    if (s.classes.length === 0) {
      const lower = s.name.toLowerCase();
      if (lower.includes('destruição') || lower.includes('punindo')) s.classes.push('Paladino');
      else if (lower.includes('flecha') || lower.includes('caçador')) s.classes.push('Patrulheiro');
      else {
        s.classes.push('Mago');
      }
    }
  });

  // Salvar no arquivo JSON
  fs.writeFileSync(outputPath, JSON.stringify(spells, null, 2));
  console.log(`Sucesso! ${spells.length} magias em português extraídas e salvas em: ${outputPath}`);

}).catch(err => {
  console.error('Erro geral no pdf-parse:', err);
});
