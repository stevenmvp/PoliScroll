import {
  type AcademicTopic,
  type AcademicLogEntry,
  type AcademicStats,
} from '../types/academic';

export const PRESET_TOPICS: AcademicTopic[] = [
  {
    id: 'greek-gods',
    title: 'Mitología Clásica: Dioses Griegos',
    domain: 'history',
    icon: 'Sparkles',
    promptQuestion: '¿Cuáles de estos son dioses del panteón de la Grecia Clásica?',
    shortCriteria: 'Dioses Griegos (vs Maya / Nórdico / Egipcio)',
    description: 'Distingue las deidades del Olimpo griego frente a figuras nórdicas, egipcias o del Popol Vuh maya.',
    sources: [
      { title: 'Hesíodo - Teogonía (Gredos)', url: 'https://www.editorialgredos.com' },
      { title: 'Homero - Ilíada y Odisea', url: 'https://www.perseus.tufts.edu' },
      { title: 'Pausanias - Descripción de Grecia', url: 'https://www.theoi.com' },
    ],
    correctItems: [
      { term: 'Zeus', explanation: 'Rey de los dioses olímpicos y señor del trueno y el cielo en Grecia.', category: 'Olímpico' },
      { term: 'Atenea', explanation: 'Diosa griega de la sabiduría, la estrategia bélica y las artes.', category: 'Olímpica' },
      { term: 'Apolo', explanation: 'Dios griego de la luz, la música, la poesía y la profecía.', category: 'Olímpico' },
      { term: 'Dionisio', explanation: 'Dios olímpico griego del vino, el teatro, las fiestas y el éxtasis.', category: 'Olímpico' },
      { term: 'Poseidón', explanation: 'Dios griego soberano de los mares, tempestades y terremotos.', category: 'Olímpico' },
      { term: 'Hermes', explanation: 'Mensajero alado de los dioses olímpicos y guía de las almas.', category: 'Olímpico' },
      { term: 'Artemisa', explanation: 'Diosa griega de la caza, los bosques salvajes y la luna.', category: 'Olímpica' },
      { term: 'Hefesto', explanation: 'Dios griego del fuego, la metalurgia y los artesanos.', category: 'Olímpico' },
      { term: 'Afrodita', explanation: 'Diosa griega de la belleza, la sensualidad y el amor.', category: 'Olímpica' },
      { term: 'Hades', explanation: 'Soberano griego del inframundo y las profundidades de la tierra.', category: 'Inframundo' },
      { term: 'Deméter', explanation: 'Diosa griega de la agricultura, las cosechas y la fertilidad.', category: 'Olímpica' },
      { term: 'Ares', explanation: 'Dios griego de la guerra despiadada y la fuerza bruta.', category: 'Olímpico' },
    ],
    distractorItems: [
      { term: 'Hunahpú', explanation: 'Héroe gemelo sagrado de la mitología maya narrado en el libro Popol Vuh.', mistakenOrigin: 'Popol Vuh (Mitología Maya Quiché)' },
      { term: 'Ixbalanqué', explanation: 'Hermano gemelo de Hunahpú en el Popol Vuh maya que venció a los señores de Xibalbá.', mistakenOrigin: 'Popol Vuh (Mitología Maya Quiché)' },
      { term: 'Vucub Caquix', explanation: 'Ser soberbio con forma de guacamaya derrotado en el Popol Vuh maya.', mistakenOrigin: 'Popol Vuh (Mitología Maya Quiché)' },
      { term: 'Thor', explanation: 'Dios del trueno y la fuerza con el martillo Mjolnir en la mitología nórdica.', mistakenOrigin: 'Mitología Nórdica' },
      { term: 'Loki', explanation: 'Gigante y dios de las artimañas y el engaño en la mitología nórdica.', mistakenOrigin: 'Mitología Nórdica' },
      { term: 'Anubis', explanation: 'Dios con cabeza de chacal encargado del embalsamamiento en el Antiguo Egipto.', mistakenOrigin: 'Mitología Egipcia' },
      { term: 'Osiris', explanation: 'Dios egipcio de la resurrección, la regeneración y el juicio de los muertos.', mistakenOrigin: 'Mitología Egipcia' },
      { term: 'Quetzalcóatl', explanation: 'La serpiente emplumada, deidad de las culturas mesoamericanas mexica y tolteca.', mistakenOrigin: 'Mitología Mesoamericana' },
      { term: 'Odin', explanation: 'Padre de todos en Asgard, señor de la sabiduría y la guerra nórdica.', mistakenOrigin: 'Mitología Nórdica' },
      { term: 'Ra', explanation: 'Dios supremo del sol y creador primordial en la teología solar egipcia.', mistakenOrigin: 'Mitología Egipcia' },
    ],
    gameSpecificData: {
      froggerTip: 'Pisa únicamente los dioses del panteón olímpico; deidades mayas o nórdicas colapsarán el tronco.',
      bridgePrompt: 'Extiende el puente horizontalmente hasta conectar con un dios griego legítimo.',
      chickenHopPrompt: 'Salta sobre las rocas custodiadas por deidades del Olimpo.',
      flappyGates: [
        { question: 'Rey de los dioses del Olimpo:', topOption: 'Zeus', bottomOption: 'Hunahpú (Maya)', correctChoice: 'top' },
        { question: 'Dios de los mares y terremotos griegos:', topOption: 'Poseidón', bottomOption: 'Thor (Nórdico)', correctChoice: 'top' },
        { question: 'Figura sagrada del Popol Vuh maya (distractor):', topOption: 'Atenea', bottomOption: 'Ixbalanqué', correctChoice: 'bottom' },
      ],
      triviaQuestions: [
        {
          question: '¿Qué deidad griega nació armada de la cabeza de Zeus según la Teogonía de Hesíodo?',
          options: ['Atenea', 'Hunahpú', 'Thor', 'Afrodita'],
          correctIndex: 0,
          explanation: 'Atenea brotó armada con lanza y escudo tras el dolor de cabeza de Zeus al devorar a Metis.',
          source: 'Hesíodo - Teogonía, versos 886-900',
        },
        {
          question: '¿A qué cosmovisión pertenece el héroe sagrado Hunahpú?',
          options: ['Mitología Maya (Popol Vuh)', 'Grecia Clásica', 'Panteón Egipcio', 'Mitología Nórdica'],
          correctIndex: 0,
          explanation: 'Hunahpú y su gemelo Ixbalanqué son los héroes centrales del libro sagrado de los mayas k\'iche\'.',
          source: 'Popol Vuh - Traducción de Adrián Recinos',
        },
      ],
    },
  },
  {
    id: 'humerus-anatomy',
    title: 'Medicina: Anatomía del Húmero y Miembro Superior',
    domain: 'medicine',
    icon: 'Activity',
    promptQuestion: '¿Cuáles son accidentes óseos y estructuras del Húmero humano?',
    shortCriteria: 'Estructuras del Húmero (vs Fémur / Pierna / Cúbito)',
    description: 'Identifica las prominencias, fosas y tubérculos propios del húmero evitando confundirlos con huesos de miembros inferiores.',
    sources: [
      { title: "Gray's Anatomy: The Anatomical Basis of Clinical Practice (42nd Ed.)", url: 'https://www.elsevier.com/books/grays-anatomy/standring/978-0-7020-7705-0' },
      { title: 'Rouvière, H. & Delmas, A. - Anatomía Humana Descriptiva, Topográfica y Funcional', url: 'https://www.elsevier.com' },
      { title: 'Netter, F. H. - Atlas de Anatomía Humana (7.ª Edición)', url: 'https://www.clinicalkey.es' },
    ],
    correctItems: [
      { term: 'Troquíter', explanation: 'Tubérculo mayor del húmero; inserción del supraespinoso, infraespinoso y redondo menor.', category: 'Epífisis proximal' },
      { term: 'Troquín', explanation: 'Tubérculo menor del húmero donde se inserta el músculo subescapular.', category: 'Epífisis proximal' },
      { term: 'Tróclea humeral', explanation: 'Superficie articular con forma de polea en el húmero distal que articula con la ulna (cúbito).', category: 'Epífisis distal' },
      { term: 'Cóndilo humeral', explanation: 'Capitulum o eminencia redondeada que articula con la cúpula del radio.', category: 'Epífisis distal' },
      { term: 'Fosa olecraniana', explanation: 'Depresión profunda posterior del húmero que recibe al olécranon del cúbito en extensión.', category: 'Fosa distal' },
      { term: 'Fosa coronoidea', explanation: 'Depresión anterior del húmero que aloja la apófisis coronoides durante la flexión.', category: 'Fosa distal' },
      { term: 'Canal de torsión', explanation: 'Surco del nervio radial a lo largo de la diáfisis del húmero.', category: 'Diáfisis' },
      { term: 'Cuello quirúrgico', explanation: 'Zona estrecha vulnerable a fracturas por debajo de los tubérculos humerales.', category: 'Epífisis proximal' },
      { term: 'Corredera bicipital', explanation: 'Surco intertubercular por donde transita el tendón de la porción larga del bíceps.', category: 'Epífisis proximal' },
      { term: 'Tuberosidad deltoidea', explanation: 'V deltoidea en la cara anterolateral humeral donde se inserta el músculo deltoides.', category: 'Diáfisis' },
    ],
    distractorItems: [
      { term: 'Trocánter mayor', explanation: 'Gran prominencia ósea situada en la extremidad superior del FÉMUR (cadera), no en el húmero.', mistakenOrigin: 'Fémur (Miembro Inferior)' },
      { term: 'Trocánter menor', explanation: 'Proyección posteromedial del FÉMUR donde se inserta el tendón del iliopsoas.', mistakenOrigin: 'Fémur (Miembro Inferior)' },
      { term: 'Línea áspera', explanation: 'Cresta longitudinal prominente en la cara posterior de la diáfisis del FÉMUR.', mistakenOrigin: 'Fémur (Miembro Inferior)' },
      { term: 'Astrágalo', explanation: 'Hueso del tarso en el tobillo que transmite el peso corporal hacia el pie.', mistakenOrigin: 'Tarso / Pie' },
      { term: 'Maléolo medial', explanation: 'Prominencia medial del tobillo que corresponde al extremo distal de la TIBIA.', mistakenOrigin: 'Tibia (Pierna)' },
      { term: 'Acetábulo', explanation: 'Cavidad cotiloidea de la pelvis donde se articula la cabeza del fémur.', mistakenOrigin: 'Pelvis / Cadera' },
      { term: 'Rótula (Patela)', explanation: 'Hueso sesamoideo anterior situado en la articulación de la rodilla.', mistakenOrigin: 'Rodilla' },
      { term: 'Olécranon', explanation: 'Prominencia posterior del codo perteneciente a la ULNA (Cúbito), no al húmero.', mistakenOrigin: 'Ulna / Cúbito' },
    ],
    gameSpecificData: {
      froggerTip: 'Pisa únicamente los accidentes óseos del húmero; las estructuras del fémur y la tibia te harán caer al agua.',
      bridgePrompt: 'Extiende el puente hasta el accidente anatómico perteneciente al húmero.',
      chickenHopPrompt: 'Impúlsate a las plataformas con tubérculos y fosas humerales.',
      flappyGates: [
        { question: 'Tubérculo mayor del húmero proximal:', topOption: 'Troquíter', bottomOption: 'Trocánter mayor (Fémur)', correctChoice: 'top' },
        { question: 'Accidente óseo perteneciente al Fémur (distractor):', topOption: 'Troquín', bottomOption: 'Línea áspera (Fémur)', correctChoice: 'bottom' },
      ],
      triviaQuestions: [
        {
          question: '¿Qué nervio discurre por el canal de torsión en la cara posterior del húmero?',
          options: ['Nervio Radial', 'Nervio Ciático', 'Nervio Femoral', 'Nervio Óptico'],
          correctIndex: 0,
          explanation: 'El nervio radial transita por el canal de torsión (surco radial) acompañado de la arteria braquial profunda.',
          source: "Gray's Anatomy 42nd Ed., Cap. 48",
        },
      ],
    },
  },
  {
    id: 'algebra-factoring',
    title: 'Matemáticas: Factorización & Álgebra Notable',
    domain: 'math',
    icon: 'Hash',
    promptQuestion: '¿Cuáles son identidades y factorizaciones algebraicas rigurosamente verdaderas?',
    shortCriteria: 'Factorizaciones Válidas (vs Falacias de Signos)',
    description: 'Reconoce productos notables exactos y diferencia errores matemáticos comunes de signo o exponente.',
    sources: [
      { title: 'Spivak, M. - Calculus (Editorial Reverté)', url: 'https://www.reverte.com' },
      { title: 'Stewart, J. - Cálculo de una Variable: Trascendentes Tempranas', url: 'https://www.cengage.com' },
      { title: 'Baldor, A. - Álgebra (Publicaciones Cultural)', url: 'https://www.editorialpatria.com.mx' },
    ],
    correctItems: [
      { term: 'a² - b² = (a-b)(a+b)', explanation: 'Diferencia de cuadrados perfecta; se descompone en binomios conjugados.', category: 'Diferencia cuadrados' },
      { term: 'x² + 2xy + y² = (x+y)²', explanation: 'Trinomio cuadrado perfecto de suma; cuadrado de un binomio.', category: 'Trinomio' },
      { term: 'x² - 2xy + y² = (x-y)²', explanation: 'Trinomio cuadrado perfecto de diferencia.', category: 'Trinomio' },
      { term: 'a³ - b³ = (a-b)(a²+ab+b²)', explanation: 'Diferencia de cubos; producto de binomio por trinomio cuadrático positivo.', category: 'Cubos' },
      { term: 'a³ + b³ = (a+b)(a²-ab+b²)', explanation: 'Suma de cubos; término cruzado con signo negativo.', category: 'Cubos' },
      { term: 'x² - 5x + 6 = (x-2)(x-3)', explanation: 'Trinomio cuadrático mónico: dos números que multiplicados den 6 y sumados den -5.', category: 'Trinomio' },
      { term: '2x² + 4x = 2x(x + 2)', explanation: 'Factorización directa por factor común monomio.', category: 'Factor Común' },
      { term: 'x² + 7x + 12 = (x+3)(x+4)', explanation: 'Trinomio mónico simple con términos constantes positivos.', category: 'Trinomio' },
    ],
    distractorItems: [
      { term: 'a² + b² = (a+b)²', explanation: 'Falacia clásica: se omite el doble producto del primero por el segundo (+2ab).', mistakenOrigin: 'Error clásico de distribución exponencial' },
      { term: 'x² - y² = (x-y)²', explanation: 'Confusión entre diferencia de cuadrados (x-y)(x+y) y binomio al cuadrado.', mistakenOrigin: 'Confusión de producto notable' },
      { term: 'a³ + b³ = (a+b)³', explanation: 'Error: (a+b)³ genera además 3a²b + 3ab².', mistakenOrigin: 'Omisión de coeficientes binomiales' },
      { term: 'x² + 5x + 6 = (x-2)(x-3)', explanation: 'Error de signos: daría -5x pero los factores deben ser (x+2)(x+3).', mistakenOrigin: 'Fallo de signos en trinomio' },
      { term: 'x² - 9 = (x-3)²', explanation: 'Error: (x-3)² = x² - 6x + 9, no x² - 9.', mistakenOrigin: 'Confusión con cuadrado de binomio' },
    ],
    gameSpecificData: {
      froggerTip: 'Pisa únicamente identidades algebraicas exactas; las falacias de signos se hundirán bajo tus pies.',
      bridgePrompt: 'Extiende el puente hasta la factorización rigurosamente verdadera.',
      chickenHopPrompt: 'Salta a las plataformas con factorizaciones matemáticamente demostradas.',
      flappyGates: [
        { question: 'Factorización correcta de la diferencia de cuadrados:', topOption: 'a² - b² = (a-b)(a+b)', bottomOption: 'a² + b² = (a+b)² (Falacia)', correctChoice: 'top' },
      ],
      triviaQuestions: [
        {
          question: '¿Cuál es el desarrollo correcto de la diferencia de cubos a³ - b³?',
          options: ['(a - b)(a² + ab + b²)', '(a + b)³', '(a - b)³', 'a² - 2ab + b²'],
          correctIndex: 0,
          explanation: 'La diferencia de cubos factoriza siempre en un binomio diferencia multiplicado por el trinomio con términos positivos.',
          source: 'Stewart - Precalculus, Cap. 1',
        },
      ],
    },
  },
  {
    id: 'cell-biology',
    title: 'Biología: Organelos Celulares Eucariotas',
    domain: 'science',
    icon: 'Dna',
    promptQuestion: '¿Cuáles son organelos y componentes de la Célula Eucariota Animal?',
    shortCriteria: 'Organelos Eucariotas (vs Bacterias / Virus)',
    description: 'Distingue las estructuras subcelulares eucariotas de organelos bacterianos o componentes virales acelulares.',
    sources: [
      { title: 'Alberts, B. - Biología Molecular de la Célula (6.ª Edición)', url: 'https://www.garlandscience.com' },
      { title: 'Lodish, H. - Molecular Cell Biology (W. H. Freeman)', url: 'https://www.macmillanlearning.com' },
      { title: 'Cooper, G. M. - The Cell: A Molecular Approach (Sinauer)', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    ],
    correctItems: [
      { term: 'Mitocondria', explanation: 'Central energética celular donde se sintetiza ATP mediante fosforilación oxidativa.', category: 'Energía' },
      { term: 'Retículo Rugoso', explanation: 'Red membranosa con ribosomas adheridos donde se sintetizan proteínas de exportación.', category: 'Síntesis' },
      { term: 'Aparato de Golgi', explanation: 'Empaqueta, glicosila y distribuye vesículas con proteínas y lípidos.', category: 'Secreción' },
      { term: 'Lisosoma', explanation: 'Vesícula con enzimas hidrolíticas ácidas para degradación y autofagia celular.', category: 'Digestión' },
      { term: 'Peroxisoma', explanation: 'Contiene catalasa para descomponer el peróxido de hidrógeno y oxidar ácidos grasos.', category: 'Oxidación' },
      { term: 'Centrosoma', explanation: 'Centro organizador de microtúbulos y huso mitótico con un par de centríolos.', category: 'División' },
      { term: 'Núcleo Celular', explanation: 'Estructura delimitada por envoltura nuclear que resguarda el genoma eucariota.', category: 'Genoma' },
    ],
    distractorItems: [
      { term: 'Cápside proteica', explanation: 'Estructura vírica que encierra el material genético; los virus son acelulares.', mistakenOrigin: 'Estructura Vírica (Acelular)' },
      { term: 'Plásmido bacteriano', explanation: 'Molécula de ADN circular extracromosómico propia de bacterias procariontes.', mistakenOrigin: 'Bacterias Procariotas' },
      { term: 'Pared de Peptidoglicano', explanation: 'Estructura rígida bacteriana de mureína; no existe en células animales eucariotas.', mistakenOrigin: 'Bacterias (Procariotas)' },
      { term: 'Mesosoma', explanation: 'Artefacto invaginado de la membrana plasmática en bacterias procariotas.', mistakenOrigin: 'Bacterias Procariotas' },
    ],
    gameSpecificData: {
      froggerTip: 'Pisa los organelos celulares de eucariotas; componentes víricos o bacterianos colapsarán.',
      bridgePrompt: 'Extiende el puente hasta el organelo membranoso eucariota.',
      chickenHopPrompt: 'Salta sobre los organelos celulares legítimos de animales.',
      flappyGates: [
        { question: 'Central energética eucariota de síntesis de ATP:', topOption: 'Mitocondria', bottomOption: 'Cápside vírica (Distractor)', correctChoice: 'top' },
      ],
      triviaQuestions: [
        {
          question: '¿Qué organelo contiene enzimas hidrolíticas ácidas para digestión celular y autofagia?',
          options: ['Lisosoma', 'Pared de Peptidoglicano', 'Cápside proteica', 'Mesosoma'],
          correctIndex: 0,
          explanation: 'Los lisosomas mantienen un pH interno ácido (~4.5-5.0) para la actividad óptima de sus hidrolasas.',
          source: 'Alberts - Biología Molecular de la Célula, Cap. 12',
        },
      ],
    },
  },
  {
    id: 'league-of-legends',
    title: 'League of Legends: Campeones de Runaterra',
    domain: 'pop_culture',
    domainCategory: 'pop_culture',
    domainCategoryLabel: 'Cultura Popular / Videojuegos & Ficción',
    normalizedTopic: 'League of Legends (Riot Games)',
    icon: 'Sparkles',
    promptQuestion: '¿Cuáles de los siguientes son campeones oficiales de League of Legends?',
    shortCriteria: 'Campeones de LoL (vs Héroes de Dota 2 / Overwatch)',
    description: 'Distingue a los campeones del universo oficial de Runaterra de personajes de Dota 2 o de otros videojuegos.',
    sources: [
      { title: 'League of Legends Universe (Riot Games)', url: 'https://universe.leagueoflegends.com', sourceDomain: 'Riot Games Oficial' },
      { title: 'League of Legends Wiki (Fandom Oficial)', url: 'https://leagueoflegends.fandom.com', sourceDomain: 'Wiki Especializada' },
      { title: 'Liquipedia League of Legends Portal', url: 'https://liquipedia.net/leagueoflegends', sourceDomain: 'Base de Datos de Esports' },
    ],
    correctItems: [
      { term: 'Ahri', explanation: 'La Mujer Zorro de Nueve Colas; maga y asesina vastaya originaria de Jonia.', category: 'Mago / Asesino' },
      { term: 'Yasuo', explanation: 'La Espada sin Honor; guerrero jonio maestro indiscutible de la técnica del viento.', category: 'Luchador' },
      { term: 'Jinx', explanation: 'La Bala Perdida; caótica tiradora armada con lanzacohetes originaria de Zaun.', category: 'Tirador' },
      { term: 'Thresh', explanation: 'El Carcelero de las Cadenas; espectro torturador de las Islas de la Sombra.', category: 'Soporte' },
      { term: 'Zed', explanation: 'El Maestro de las Sombras; líder de la Orden de la Sombra en Jonia.', category: 'Asesino' },
      { term: 'Lux', explanation: 'La Dama Luminosa; maga demaciana capaz de doblar la luz a su voluntad.', category: 'Mago' },
      { term: 'Darius', explanation: 'La Mano de Noxus; legendario líder militar y ejecutor de la fuerza noxiana.', category: 'Luchador' },
      { term: 'Lee Sin', explanation: 'El Monje Ciego; maestro de artes marciales del monasterio de Shojin en Jonia.', category: 'Luchador' },
    ],
    distractorItems: [
      { term: 'Pudge', explanation: 'El Carnicero (The Butcher); héroe de fuerza emblemático de Dota 2 (Valve), no de LoL.', mistakenOrigin: 'Dota 2 (Valve Corporation)' },
      { term: 'Invoker', explanation: 'El Arsenal Magus con 10 conjuros combinados; héroe de inteligencia de Dota 2.', mistakenOrigin: 'Dota 2 (Valve Corporation)' },
      { term: 'Tracer (Lena Oxton)', explanation: 'Heroína británica con acelerador temporal del videojuego Overwatch (Blizzard).', mistakenOrigin: 'Overwatch (Blizzard Entertainment)' },
      { term: 'Arthas Menethil', explanation: 'El Rey Exánime en Warcraft III y World of Warcraft.', mistakenOrigin: 'Warcraft Universe (Blizzard)' },
      { term: 'Bellona', explanation: 'Diosa romana de la guerra y personaje jugable del MOBA en tercera persona Smite.', mistakenOrigin: 'Smite (Hi-Rez Studios)' },
      { term: 'Master Chief', explanation: 'Spartan-II protagonista de la saga de ciencia ficción Halo (Microsoft/Bungie).', mistakenOrigin: 'Halo (Xbox Game Studios)' },
    ],
    gameSpecificData: {
      froggerTip: 'Pisa únicamente los campeones oficiales de Runaterra; los héroes de Dota 2 harán colapsar el tronco.',
      bridgePrompt: 'Extiende el puente hacia campeones legítimos de League of Legends.',
      chickenHopPrompt: 'Salta sobre las piedras con campeones de Riot Games.',
      flappyGates: [
        { question: 'Campeón jonio maestro del viento en LoL:', topOption: 'Yasuo', bottomOption: 'Pudge (Dota 2)', correctChoice: 'top' },
      ],
      triviaQuestions: [
        {
          question: '¿Qué heroína es una maga vastaya jonia en League of Legends?',
          options: ['Ahri', 'Tracer', 'Pudge', 'Bellona'],
          correctIndex: 0,
          explanation: 'Ahri es la zorra de nueve colas vastaya en el lore oficial de Runaterra.',
          source: 'Universe Wiki: Ahri Bio',
        },
      ],
    },
  },
  {
    id: 'transmilenio-bogota',
    title: 'Movilidad Urbana: TransMilenio (Bogotá)',
    domain: 'local_context',
    domainCategory: 'local_context',
    domainCategoryLabel: 'Normativa / Contexto Local & Transporte',
    normalizedTopic: 'Sistema TransMilenio Bogotá',
    icon: 'Activity',
    promptQuestion: '¿Cuáles de los siguientes son troncales, estaciones o elementos del sistema TransMilenio?',
    shortCriteria: 'Elementos de TransMilenio (vs Metro de Medellín / MIO Cali)',
    description: 'Identifica la infraestructura del sistema BRT de transporte masivo de la capital colombiana.',
    sources: [
      { title: 'TransMilenio S.A. - Portal Oficial de Movilidad', url: 'https://www.transmilenio.gov.co', sourceDomain: 'Portal Oficial' },
      { title: 'Secretaría Distrital de Movilidad de Bogotá', url: 'https://www.movilidadbogota.gov.co', sourceDomain: 'Entidad Pública' },
      { title: 'Manual del Usuario SITP Bogotá', url: 'https://sitp.gov.co', sourceDomain: 'Documentación Oficial' },
    ],
    correctItems: [
      { term: 'Troncal Caracas', explanation: 'Corredor troncal principal e histórico que atraviesa Bogotá de sur a norte.', category: 'Troncal' },
      { term: 'Portal Norte', explanation: 'Estación de cabecera e intercambio modal en la Autopista Norte con Calle 170.', category: 'Portal' },
      { term: 'Bus Biarticulado Rojo', explanation: 'Vehículo de alta capacidad (250 pasajeros) con dos fuelles para carriles exclusivos.', category: 'Flota' },
      { term: 'TransMiCable Ciudad Bolívar', explanation: 'Teleférico integrado con estaciones en Tunal, Manitas y Mirador del Paraíso.', category: 'Cable Aéreo' },
      { term: 'Portal El Dorado', explanation: 'Portal troncal sobre la Calle 26 con conexión al aeropuerto.', category: 'Portal' },
      { term: 'Tarjeta Tullave', explanation: 'Dispositivo inteligente con chip RFID utilizado para el recaudo y transbordos.', category: 'Recaudo' },
      { term: 'Estación Ricaurte', explanation: 'Conexión subterránea neurálgica entre las troncales Américas y Calle 13.', category: 'Estación de Conexión' },
      { term: 'Ruta Fácil 1 (Calle 26)', explanation: 'Servicio troncal con paradas en todas las estaciones del corredor El Dorado.', category: 'Servicio Troncal' },
    ],
    distractorItems: [
      { term: 'Estación San Antonio', explanation: 'Punto de transferencia neurálgico del Metro de Medellín (Líneas A, B y Tranvía).', mistakenOrigin: 'Metro de Medellín (Antioquia)' },
      { term: 'Estación San Javier', explanation: 'Estación terminal del Metro de Medellín que conecta con el Metrocable Línea J.', mistakenOrigin: 'Metro de Medellín (Antioquia)' },
      { term: 'MIO Cali (Terminal Menga)', explanation: 'Terminal de cabecera del Masivo Integrado de Occidente (MIO) de Santiago de Cali.', mistakenOrigin: 'MIO Cali (Valle del Cauca)' },
      { term: 'Transmetro Barranquilla (Portal Soledad)', explanation: 'Sistema de autobuses masivos de la ciudad de Barranquilla.', mistakenOrigin: 'Transmetro (Barranquilla)' },
      { term: 'Metrobús Insurgentes', explanation: 'Línea 1 del sistema BRT de la Ciudad de México.', mistakenOrigin: 'Metrobús (Ciudad de México)' },
    ],
    gameSpecificData: {
      froggerTip: 'Pisa únicamente troncales y estaciones de TransMilenio; las estaciones del Metro de Medellín colapsarán.',
      bridgePrompt: 'Extiende el puente hasta conectar con un portal o troncal de TransMilenio.',
      chickenHopPrompt: 'Salta a las plataformas pertenecientes a la red de TransMilenio.',
      flappyGates: [
        { question: 'Principal troncal histórica de Bogotá:', topOption: 'Troncal Caracas', bottomOption: 'Estación San Antonio (Metro Medellín)', correctChoice: 'top' },
      ],
      triviaQuestions: [
        {
          question: '¿Qué troncal de TransMilenio comunica directamente el centro con el Aeropuerto Internacional El Dorado?',
          options: ['Troncal Calle 26 (Avenida El Dorado)', 'Troncal Caracas', 'Línea A del Metro de Medellín', 'Línea 1 del Metrobús'],
          correctIndex: 0,
          explanation: 'La troncal Calle 26 comunica el centro de Bogotá directamente con el Aeropuerto Internacional El Dorado.',
          source: 'TransMilenio S.A. - Mapa del Sistema Troncal',
        },
      ],
    },
  },
];

const STORAGE_ACTIVE_TOPIC_KEY = 'vortex_academic_active_topic_id_v2';
const STORAGE_LOGS_KEY = 'vortex_academic_logs_v2';
const STORAGE_CUSTOM_TOPICS_KEY = 'vortex_academic_custom_topics_v2';

export class AcademicStore {
  private activeTopic: AcademicTopic;
  private customTopics: AcademicTopic[] = [];
  private logs: AcademicLogEntry[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.customTopics = this.loadCustomTopics();
    this.activeTopic = this.loadActiveTopic();
    this.logs = this.loadLogs();
  }

  private loadCustomTopics(): AcademicTopic[] {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_TOPICS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  private loadActiveTopic(): AcademicTopic {
    try {
      const storedId = localStorage.getItem(STORAGE_ACTIVE_TOPIC_KEY);
      if (storedId) {
        const found = this.getAllTopics().find((t) => t.id === storedId);
        if (found) return found;
      }
    } catch {}
    return PRESET_TOPICS[0];
  }

  private loadLogs(): AcademicLogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_LOGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_ACTIVE_TOPIC_KEY, this.activeTopic.id);
      localStorage.setItem(STORAGE_CUSTOM_TOPICS_KEY, JSON.stringify(this.customTopics));
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(this.logs.slice(0, 200)));
    } catch {}
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getAllTopics(): AcademicTopic[] {
    return [...PRESET_TOPICS, ...this.customTopics];
  }

  public getActiveTopic(): AcademicTopic {
    return this.activeTopic;
  }

  public setActiveTopic(topicId: string): void {
    const found = this.getAllTopics().find((t) => t.id === topicId);
    if (found) {
      this.activeTopic = found;
      this.save();
    }
  }

  public addCustomTopic(topic: AcademicTopic): void {
    this.customTopics = [topic, ...this.customTopics.filter((t) => t.id !== topic.id)];
    this.activeTopic = topic;
    this.save();
  }

  public getLogs(): AcademicLogEntry[] {
    return [...this.logs];
  }

  public recordChoice(params: {
    gameId: string;
    concept: string;
    isCorrect: boolean;
    mistakenOrigin?: string;
    quickExplanation: string;
    sources?: any[];
  }): AcademicLogEntry {
    const newEntry: AcademicLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
      topicId: this.activeTopic.id,
      topicTitle: this.activeTopic.title,
      gameId: params.gameId,
      concept: params.concept,
      isCorrect: params.isCorrect,
      mistakenOrigin: params.mistakenOrigin,
      quickExplanation: params.quickExplanation,
      sources: params.sources || this.activeTopic.sources,
      chatHistory: [],
    };

    this.logs.unshift(newEntry);
    this.save();
    return newEntry;
  }

  public recordAnswer(params: {
    gameId: string;
    term: string;
    isCorrect: boolean;
    explanation?: string;
    mistakenOrigin?: string;
  }): AcademicLogEntry {
    return this.recordChoice({
      gameId: params.gameId,
      concept: params.term,
      isCorrect: params.isCorrect,
      quickExplanation: params.explanation || '',
      mistakenOrigin: params.mistakenOrigin,
    });
  }

  public updateDetailedExplanation(logId: string, detailedExplanation: string): void {
    const target = this.logs.find((l) => l.id === logId);
    if (target) {
      target.detailedExplanation = detailedExplanation;
      this.save();
    }
  }

  public appendChatMessage(logId: string, message: { role: 'user' | 'model'; text: string }): void {
    const target = this.logs.find((l) => l.id === logId);
    if (target) {
      if (!target.chatHistory) target.chatHistory = [];
      target.chatHistory.push({
        ...message,
        timestamp: Date.now(),
      });
      this.save();
    }
  }

  public clearLogs(): void {
    this.logs = [];
    this.save();
  }

  public getStats(): AcademicStats {
    const total = this.logs.length;
    const correct = this.logs.filter((l) => l.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

    // Calculate streak
    let currentStreak = 0;
    for (const log of this.logs) {
      if (log.isCorrect) currentStreak++;
      else break;
    }

    return {
      totalInteractions: total,
      correctCount: correct,
      incorrectCount: incorrect,
      accuracyRate: accuracy,
      currentStreak,
      bestStreak: Math.max(currentStreak, 0),
    };
  }

  /**
   * Helper to get a balanced pool of items (some correct, some distractors)
   * for any mini-game to display on obstacles, logs, or options
   */
  public getRandomItemPool(count = 6): Array<{
    term: string;
    isCorrect: boolean;
    explanation: string;
    mistakenOrigin?: string;
  }> {
    const correct = [...this.activeTopic.correctItems].sort(() => Math.random() - 0.5);
    const distractors = [...this.activeTopic.distractorItems].sort(() => Math.random() - 0.5);

    const result: Array<{
      term: string;
      isCorrect: boolean;
      explanation: string;
      mistakenOrigin?: string;
    }> = [];

    const half = Math.ceil(count / 2);
    for (let i = 0; i < half && i < correct.length; i++) {
      result.push({
        term: correct[i].term,
        isCorrect: true,
        explanation: correct[i].explanation,
      });
    }

    for (let i = 0; result.length < count && i < distractors.length; i++) {
      result.push({
        term: distractors[i].term,
        isCorrect: false,
        explanation: distractors[i].explanation,
        mistakenOrigin: distractors[i].mistakenOrigin,
      });
    }

    return result.sort(() => Math.random() - 0.5);
  }

  public getRandomItem(): {
    term: string;
    isCorrect: boolean;
    explanation: string;
    mistakenOrigin?: string;
  } {
    const isCorrect = Math.random() > 0.45;
    if (isCorrect && this.activeTopic.correctItems.length > 0) {
      const idx = Math.floor(Math.random() * this.activeTopic.correctItems.length);
      const it = this.activeTopic.correctItems[idx];
      return {
        term: it.term,
        isCorrect: true,
        explanation: it.explanation,
      };
    } else if (this.activeTopic.distractorItems.length > 0) {
      const idx = Math.floor(Math.random() * this.activeTopic.distractorItems.length);
      const it = this.activeTopic.distractorItems[idx];
      return {
        term: it.term,
        isCorrect: false,
        explanation: it.explanation,
        mistakenOrigin: it.mistakenOrigin,
      };
    }
    return {
      term: 'Concepto Base',
      isCorrect: true,
      explanation: 'Concepto fundamental.',
    };
  }
}

export const academicStore = new AcademicStore();
