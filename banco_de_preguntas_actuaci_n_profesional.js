/* =========================================================
   BANCO DE PREGUNTAS: Actuación Profesional ("actquestions.js")
   Materia: Actuación Profesional en Ciencias Económicas
   Basado en: Ley 20.488, Ley Salta 6.576 y Apuntes de Cátedra.
   ========================================================= */

const SUBJECT_INFO = {
  id: 'act1',
  name: 'Actuación Profesional',
  shortName: 'Act. Prof.'
};

const QUESTION_BANK = [
  // UNIDAD 1: LA PROFESIÓN E HISTORIA (1-20)
  {
    "id": 1,
    "topic": "La Profesión",
    "difficulty": 1,
    "question": "¿Cuántas y cuáles son las carreras universitarias de grado reguladas por la Ley 20.488?",
    "options": [
      "Tres: Contador, Lic. en Administración y Lic. en Economía",
      "Cuatro: Contador Público, Lic. en Economía, Lic. en Administración y Actuario",
      "Dos: Contador Público y Lic. en Administración",
      "Cinco: Incluyendo Lic. en Comercio Internacional"
    ],
    "correct": 1,
    "explanation": "La Ley 20.488 reglamenta las actuaciones para Contador Público, Lic. en Economía, Lic. en Administración y Actuario."
  },
  {
    "id": 2,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "¿Qué organismo es el encargado de dar validez a los títulos universitarios en Argentina?",
    "options": [
      "FACPCE",
      "El Consejo Profesional Provincial",
      "La CONEAU",
      "La Inspección General de Justicia"
    ],
    "correct": 2,
    "explanation": "La Comisión Nacional de Evaluación y Acreditación Universitaria (CONEAU) es el organismo encargado de la validez y acreditación de los títulos."
  },
  {
    "id": 3,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "¿Cuál es la diferencia fundamental entre una Maestría y una Especialización según los apuntes?",
    "options": [
      "La maestría es solo para investigadores y el doctorado para prácticos",
      "La especialización hace hincapié en aspectos prácticos, mientras que la maestría profundiza tanto en la práctica como en la teoría",
      "No existe diferencia, son sinónimos legales",
      "La maestría dura 6 meses y la especialización 2 años"
    ],
    "correct": 1,
    "explanation": "La especialización se enfoca en aspectos prácticos de un tema, mientras que en la maestría se es 'maestro' del tema integrando teoría y práctica."
  },
  {
    "id": 4,
    "topic": "La Profesión",
    "difficulty": 3,
    "question": "¿Por qué las profesiones de Ciencias Económicas se consideran 'reguladas'?",
    "options": [
      "Porque el Estado quiere cobrar más impuestos a los graduados",
      "Porque su ejercicio implica un riesgo para el patrimonio de la sociedad",
      "Porque solo pueden ser ejercidas por monjes franciscanos",
      "Porque no tienen impacto en el interés público"
    ],
    "correct": 1,
    "explanation": "Las profesiones reguladas (Art. 43 Ley Educación Superior) son aquellas que comprometen el interés público, en este caso, el patrimonio social."
  },
  {
    "id": 5,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "Según el Art. 4 de la Ley 20.488, ¿a quiénes les está permitido el uso del título profesional?",
    "options": [
      "A sociedades comerciales anónimas",
      "A personas de existencia visible únicamente",
      "A cualquier persona con 10 años de experiencia contable",
      "A estudios jurídicos que contraten contadores"
    ],
    "correct": 1,
    "explanation": "El uso del título solo es permitido a personas de existencia visible, debiendo aclarar el título y la universidad expedidora."
  },
  {
    "id": 6,
    "topic": "Historia",
    "difficulty": 1,
    "question": "¿Quién es considerado el 'Padre de la Contabilidad' por elaborar la partida doble?",
    "options": [
      "Manuel Belgrano",
      "Fray Lucas Pacciolo",
      "Carlos Pellegrini",
      "J.V. González"
    ],
    "correct": 1,
    "explanation": "Luca Pacciolo publicó en 1494 el sistema de partida doble en su libro 'Suma aritmética, geométrica, proporcionalidad y proporción'."
  },
  {
    "id": 7,
    "topic": "Historia",
    "difficulty": 2,
    "question": "¿En qué fecha se celebra el día del Contador Público en Argentina y por qué?",
    "options": [
      "2 de Junio, por la creación del Consejo",
      "17 de Diciembre, por la fecha de publicación del libro de Pacciolo",
      "15 de Mayo, por Manuel Belgrano",
      "20 de Septiembre, por la Ley 20.488"
    ],
    "correct": 1,
    "explanation": "El 17 de diciembre de 1494 se publicó la obra de Pacciolo, estableciéndose esa fecha como el día del contador en el país."
  },
  {
    "id": 8,
    "topic": "Historia",
    "difficulty": 3,
    "question": "¿Cuál fue el aporte de Manuel Belgrano a la profesión en Argentina en 1789?",
    "options": [
      "La redacción de la Ley 20.488",
      "La propuesta de creación de la Escuela de Comercio",
      "La fundación de la FACPCE",
      "La creación del primer sistema informático contable"
    ],
    "correct": 1,
    "explanation": "Belgrano propuso la creación de la Escuela de Comercio, materializada luego por Carlos Pellegrini en 1890."
  },
  {
    "id": 9,
    "topic": "Historia",
    "difficulty": 3,
    "question": "¿Qué caracteriza a la 'Etapa Gremial' de la profesión (1905-1945)?",
    "options": [
      "La adopción de normas internacionales de auditoría",
      "El inicio de la organización profesional con el primer Congreso de Contadores de J.V. González",
      "El uso masivo de computadoras",
      "La obligatoriedad de la colegiación en todas las provincias"
    ],
    "correct": 1,
    "explanation": "Inicia con el congreso de 1905 donde los graduados comienzan a organizarse para defender sus derechos."
  },
  {
    "id": 10,
    "topic": "Historia",
    "difficulty": 4,
    "question": "¿En qué año se creó el Consejo Profesional de Ciencias Económicas de Salta?",
    "options": [
      "1905",
      "1945",
      "1973",
      "1989"
    ],
    "correct": 1,
    "explanation": "El Consejo de Salta, junto con la mayoría de los consejos provinciales, fue creado en el año 1945."
  },
  {
    "id": 11,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "¿Qué diferencia a un Escribano de un Contador respecto a la 'Fe Pública'?",
    "options": [
      "Solo el escribano da fe pública",
      "El escribano da fe sobre actos civiles; el contador sobre actos comerciales y patrimoniales",
      "Los abogados son los únicos que tienen poder de fe pública",
      "No existe diferencia en el ámbito de aplicación"
    ],
    "correct": 1,
    "explanation": "Ambos dan fe pública, pero el escribano se centra en el consentimiento del acto civil y el contador en la realidad patrimonial y comercial."
  },
  {
    "id": 12,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "¿Qué condiciones debe cumplir un profesional para hacer uso del título en una jurisdicción determinada?",
    "options": [
      "Solo poseer el título de grado",
      "Poseer el título de grado y estar matriculado en dicha jurisdicción",
      "Haber nacido en la provincia",
      "Tener un contrato de trabajo firmado"
    ],
    "correct": 1,
    "explanation": "Es requisito indispensable tener el título habilitante y la matrícula activa en el Consejo correspondiente."
  },
  {
    "id": 13,
    "topic": "Historia",
    "difficulty": 2,
    "question": "¿Qué entidad gremial nació en 1926 para defender los derechos de los profesionales?",
    "options": [
      "La FACPCE",
      "La Federación de Graduados en Ciencias Económicas",
      "El Tribunal de Ética",
      "La IGJ"
    ],
    "correct": 1,
    "explanation": "Fundada en 1926 como 'Federación de doctores en economía', fue el primer órgano gremial."
  },
  {
    "id": 14,
    "topic": "Historia",
    "difficulty": 4,
    "question": "¿A qué etapa pertenece el nacimiento de la FACPCE en 1972?",
    "options": [
      "Etapa Gremial",
      "Etapa de Estructuración",
      "Etapa de Integración de la profesión",
      "Etapa de Armonización"
    ],
    "correct": 2,
    "explanation": "La etapa de integración (fines de los 60 hasta 1972) culmina con el nacimiento de la Federación Argentina de Consejos Profesionales."
  },
  {
    "id": 15,
    "topic": "La Profesión",
    "difficulty": 3,
    "question": "¿Qué implica que el trabajo del profesional se encuentre en la 'Etapa de Armonización' actualmente?",
    "options": [
      "Que no existen leyes",
      "El uso de la computadora y la adaptación a normas internacionales",
      "Que todos los contadores deben ser mediadores",
      "La eliminación de los Consejos Profesionales"
    ],
    "correct": 1,
    "explanation": "La armonización implica el avance técnico-tecnológico y la adopción de normativas internacionales de información financiera."
  },
  {
    "id": 16,
    "topic": "Historia",
    "difficulty": 2,
    "question": "¿Quiénes fueron los antecesores remotos de los contadores en las primeras civilizaciones?",
    "options": [
      "Los artesanos",
      "Los escribas",
      "Los guerreros",
      "Los sacerdotes"
    ],
    "correct": 1,
    "explanation": "Los escribas sabían escribir y daban fe en las plazas sobre los bienes que poseía cada persona."
  },
  {
    "id": 17,
    "topic": "La Profesión",
    "difficulty": 4,
    "question": "¿Cuál es el propósito de un 'Doctorado' según la jerarquía de títulos?",
    "options": [
      "Aprender a liquidar impuestos complejos",
      "Formar investigadores sobre un tema del ámbito específico",
      "Habilitar para ser juez de la nación",
      "Es un curso de actualización de 6 meses"
    ],
    "correct": 1,
    "explanation": "El doctorado es el título superior que forma al profesional con capacidad de investigación teórico-práctica."
  },
  {
    "id": 18,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "¿Qué tipo de título es una 'Tecnicatura'?",
    "options": [
      "Título de posgrado",
      "Título terciario",
      "Título de maestría",
      "Título de doctorado"
    ],
    "correct": 1,
    "explanation": "Las tecnicaturas son títulos de nivel terciario que forman técnicos en materias determinadas."
  },
  {
    "id": 19,
    "topic": "La Profesión",
    "difficulty": 3,
    "question": "Para que un título extranjero sea válido en Argentina, debe ser revalidado por:",
    "options": [
      "El Ministerio de Salud",
      "Una universidad nacional",
      "El Consejo de Ciencias Económicas directamente",
      "La embajada correspondiente"
    ],
    "correct": 1,
    "explanation": "Según la Ley 20.488 Art 2 inc c, debe ser revalidado por una universidad nacional y cumplir requisitos de residencia."
  },
  {
    "id": 20,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "¿Qué se entiende por 'actos que comprometen conocimientos propios' según la ley?",
    "options": [
      "Solo vender libros contables",
      "Ofrecimiento de servicios, nombramientos judiciales y presentaciones ante poderes públicos",
      "Cualquier charla informal sobre economía",
      "Escribir artículos de opinión en redes sociales"
    ],
    "correct": 1,
    "explanation": "El Art. 3 de la Ley 20.488 define así el ejercicio profesional cuando se comprometen saberes técnicos habilitantes."
  },

  // UNIDAD 2: ENTES DE LA PROFESIÓN (21-40)
  {
    "id": 21,
    "topic": "Entes Profesionales",
    "difficulty": 2,
    "question": "¿Qué son jurídicamente los Consejos Profesionales?",
    "options": [
      "Empresas privadas con fines de lucro",
      "Entidades de derecho público no estatal (entes paraestatales)",
      "Dependencias directas del Ministerio de Economía",
      "Sociedades de beneficencia"
    ],
    "correct": 1,
    "explanation": "Son entes que ejecutan funciones delegadas por el Estado pero con autonomía y directivos elegidos por matriculados."
  },
  {
    "id": 22,
    "topic": "Entes Profesionales",
    "difficulty": 2,
    "question": "¿Cuál es la función principal de los Colegios de Graduados?",
    "options": [
      "Llevar la matrícula oficial",
      "Representación gremial y defensa de la profesión (asociación voluntaria)",
      "Certificar estados contables",
      "Sancionar penalmente a los contadores"
    ],
    "correct": 1,
    "explanation": "A diferencia de los Consejos, los Colegios son asociaciones civiles de afiliación voluntaria con fines gremiales."
  },
  {
    "id": 23,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Cómo se llama el organismo de segundo grado que agrupa a los 24 consejos del país?",
    "options": [
      "CONEAU",
      "FACPCE",
      "CENYA",
      "CECYT"
    ],
    "correct": 1,
    "explanation": "La Federación Argentina de Consejos Profesionales de Ciencias Económicas (FACPCE) integra a todos los consejos provinciales."
  },
  {
    "id": 24,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Qué órgano del Consejo es el encargado de 'impartir justicia' interna y aplicar el código de ética?",
    "options": [
      "La Asamblea de Matriculados",
      "El Tribunal de Ética",
      "La Comisión Directiva",
      "El Órgano de Fiscalización"
    ],
    "correct": 1,
    "explanation": "El Tribunal de Ética tiene la función de vigilar y sancionar el comportamiento ético de los profesionales."
  },
  {
    "id": 25,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Cuál es la función del CENYA dentro de la FACPCE?",
    "options": [
      "Organizar torneos deportivos",
      "Elaborar y difundir normas de contabilidad y auditoría",
      "Cobrar el derecho de ejercicio profesional",
      "Investigar delitos financieros"
    ],
    "correct": 1,
    "explanation": "El Consejo Elaborador de Normas de Contabilidad y Auditoría (CENYA) propone los proyectos de normas profesionales."
  },
  {
    "id": 26,
    "topic": "Entes Profesionales",
    "difficulty": 4,
    "question": "¿Qué tarea realiza el CECYT?",
    "options": [
      "Inspección de cajas de seguridad",
      "Investigación y consulta técnica (elaboración de informes)",
      "Venta de software contable",
      "Acreditación de carreras universitarias"
    ],
    "correct": 1,
    "explanation": "El Centro de Estudios Científicos y Técnicos es el brazo de investigación y consulta de la Federación."
  },
  {
    "id": 27,
    "topic": "Entes Profesionales",
    "difficulty": 2,
    "question": "¿Quiénes integran la Asamblea de Matriculados de un Consejo?",
    "options": [
      "Todos los graduados del país",
      "Los matriculados que cumplen condiciones (matrícula activa, al día con pagos)",
      "Solo los que tienen más de 20 años de ejercicio",
      "Únicamente los miembros de la comisión directiva"
    ],
    "correct": 1,
    "explanation": "La asamblea es el órgano máximo formado por los profesionales habilitados de la jurisdicción."
  },
  {
    "id": 28,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "En Salta, ¿qué ley rige la Obra Social del Consejo?",
    "options": [
      "Ley 20.488",
      "Ley 6.188",
      "Ley 24.521",
      "Ley 25.246"
    ],
    "correct": 1,
    "explanation": "La Obra Social del CPCE Salta pertenece al departamento de seguridad social regido por la Ley 6.188."
  },
  {
    "id": 29,
    "topic": "Entes Profesionales",
    "difficulty": 2,
    "question": "¿Qué significa que el Consejo tenga 'independencia funcional'?",
    "options": [
      "Que no pagan impuestos",
      "Que sus directivos son elegidos por los pares y no por el gobierno político",
      "Que no necesitan leyes nacionales",
      "Que cada contador hace lo que quiere"
    ],
    "correct": 1,
    "explanation": "Es un ente de autorregulación profesional con independencia de los poderes del Estado."
  },
  {
    "id": 30,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Cuál de estas atribuciones corresponde al Consejo Profesional?",
    "options": [
      "Fijar el valor del dólar",
      "Certificar las firmas y legalizar dictámenes profesionales",
      "Otorgar títulos de doctorado",
      "Modificar el Código Penal"
    ],
    "correct": 1,
    "explanation": "Una de las funciones críticas es la certificación de firmas para dar validez profesional a los trabajos presentados."
  },
  {
    "id": 31,
    "topic": "Entes Profesionales",
    "difficulty": 4,
    "question": "¿Cómo se llama la asociación civil fundada en 1926 integrada por asociaciones de graduados?",
    "options": [
      "FACPCE",
      "FAGCE",
      "CONEAU",
      "UIF"
    ],
    "correct": 1,
    "explanation": "La Federación Argentina de Graduados en Ciencias Económicas (FAGCE) es la organización gremial histórica."
  },
  {
    "id": 32,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Qué caracteriza al departamento de seguridad social (previsional) de los consejos?",
    "options": [
      "Es de afiliación voluntaria",
      "Es de afiliación obligatoria para los matriculados",
      "Solo para los que trabajan en el Estado",
      "Es gratuito"
    ],
    "correct": 1,
    "explanation": "El régimen previsional profesional suele ser obligatorio por ley para quienes ejercen la profesión de forma liberal."
  },
  {
    "id": 33,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Qué función cumple el Órgano de Fiscalización en un Consejo?",
    "options": [
      "Controlar que no se malgasten los fondos y se cumplan parámetros legales",
      "Dictar las normas contables",
      "Elegir al presidente a dedo",
      "Atender la parte deportiva de los matriculados"
    ],
    "correct": 0,
    "explanation": "Es el órgano de control interno sobre la gestión administrativa y patrimonial del ente."
  },
  {
    "id": 34,
    "topic": "Entes Profesionales",
    "difficulty": 2,
    "question": "La Comisión de Jóvenes Profesionales está destinada a quienes tienen:",
    "options": [
      "Menos de 21 años",
      "Hasta 30 años y/o 5 años de graduados",
      "Título de técnico únicamente",
      "Menos de 10 años de aportes"
    ],
    "correct": 1,
    "explanation": "Es un espacio de inserción para los nuevos matriculados según los criterios de edad o antigüedad de título."
  },
  {
    "id": 35,
    "topic": "Entes Profesionales",
    "difficulty": 4,
    "question": "¿Qué organismo emite los 'informes' sobre aplicaciones prácticas de normas?",
    "options": [
      "Tribunal de Ética",
      "CECYT",
      "Ministerio de Educación",
      "CENYA"
    ],
    "correct": 1,
    "explanation": "El CECYT prepara informes de investigación o aplicación práctica que pueden ser compartidos o no por la FACPCE."
  },
  {
    "id": 36,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Cuál es la única provincia donde el Colegio de Graduados representa oficialmente a la profesión?",
    "options": [
      "Salta",
      "Tucumán",
      "Buenos Aires",
      "Córdoba"
    ],
    "correct": 1,
    "explanation": "Los apuntes mencionan que en Tucumán el Colegio cumple la función de representación, a diferencia del resto donde son los Consejos."
  },
  {
    "id": 37,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Quién elige a los integrantes de la Comisión Directiva de un Consejo?",
    "options": [
      "El Gobernador de la Provincia",
      "Los matriculados mediante voto",
      "La FACPCE desde Buenos Aires",
      "Los decanos de las facultades"
    ],
    "correct": 1,
    "explanation": "Se eligen democráticamente por los profesionales que integran la Asamblea."
  },
  {
    "id": 38,
    "topic": "Entes Profesionales",
    "difficulty": 4,
    "question": "El Instituto Técnico de Contadores Públicos (ITCP) pertenece a:",
    "options": [
      "FACPCE",
      "FAGCE",
      "AFIP",
      "ONU"
    ],
    "correct": 1,
    "explanation": "Este instituto de investigación doctrinaria pertenece a la Federación de Graduados (FAGCE)."
  },
  {
    "id": 39,
    "topic": "Entes Profesionales",
    "difficulty": 2,
    "question": "¿Qué sucede con las Resoluciones Técnicas (RT) propuestas por la Federación?",
    "options": [
      "Son obligatorias automáticamente en todo el país",
      "Cada Consejo Provincial debe decidir si las adopta o no en su jurisdicción",
      "Solo valen en la Ciudad de Buenos Aires",
      "Solo se aplican si el cliente quiere"
    ],
    "correct": 1,
    "explanation": "La FACPCE propone la norma y cada Consejo, en uso de sus facultades delegadas, debe sancionarla localmente."
  },
  {
    "id": 40,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Qué entidad en Salta atiende la parte deportiva de los profesionales?",
    "options": [
      "El Tribunal de Ética",
      "La Asociación Profesional de Salta",
      "La Comisión Fiscalizadora",
      "La Dirección Técnica"
    ],
    "correct": 1,
    "explanation": "Existen asociaciones específicas para el esparcimiento y deportes de los matriculados."
  },

  // UNIDAD 3: REGULACIONES Y LEYES (41-65)
  {
    "id": 41,
    "topic": "Normativa",
    "difficulty": 2,
    "question": "¿Qué establece el Art. 12 de la Constitución Nacional respecto a la profesión?",
    "options": [
      "Que el título debe ser gratuito",
      "Que las provincias conservan el poder no delegado, como la regulación del ejercicio profesional",
      "Que todos los contadores deben trabajar para la Nación",
      "Que no puede haber consejos provinciales"
    ],
    "correct": 1,
    "explanation": "La regulación del ejercicio profesional es una competencia provincial no delegada al gobierno federal."
  },
  {
    "id": 42,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Qué exige el Art. 43 de la Ley de Educación Superior para las carreras de riesgo?",
    "options": [
      "Que duren al menos 10 años",
      "Carga horaria mínima y acreditación por la CONEAU",
      "Que no tengan exámenes finales",
      "Que solo se dicten en universidades privadas"
    ],
    "correct": 1,
    "explanation": "Las profesiones reguladas deben acreditar calidad académica y contenidos básicos ante la CONEAU."
  },
  {
    "id": 43,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Cuál es la ley orgánica del Consejo Profesional de Salta?",
    "options": [
      "Ley 20.488",
      "Ley 6.576",
      "Ley 25.246",
      "Ley 24.521"
    ],
    "correct": 1,
    "explanation": "La Ley 6.576 es la norma provincial que rige el ejercicio y la estructura del consejo salteño."
  },
  {
    "id": 44,
    "topic": "Normativa",
    "difficulty": 4,
    "question": "¿Qué trata la Ley 25.246 en relación a la actuación del profesional?",
    "options": [
      "Liquidación de haberes",
      "Encubrimiento y Lavado de Activos (deber de informar)",
      "Creación de universidades",
      "Estatuto del peón de campo"
    ],
    "correct": 1,
    "explanation": "Esta ley establece obligaciones para los profesionales como sujetos obligados ante la UIF por lavado de dinero."
  },
  {
    "id": 45,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "En el proceso de elaboración de una norma (RT), ¿cuánto tiempo tiene el borrador de consulta?",
    "options": [
      "2 días",
      "30 días corridos de anticipación para elevar a la Junta de Gobierno",
      "Un año exacto",
      "No existe periodo de consulta"
    ],
    "correct": 1,
    "explanation": "El proceso exige 30 días de anticipación para el análisis de los Consejos antes de su tratamiento."
  },
  {
    "id": 46,
    "topic": "Normativa",
    "difficulty": 4,
    "question": "¿Qué órgano de la FACPCE constituye la autoridad máxima?",
    "options": [
      "La Mesa Directiva",
      "La Asamblea Ordinaria y Extraordinaria",
      "El CENCYA",
      "El Director General"
    ],
    "correct": 1,
    "explanation": "La Asamblea, integrada por los presidentes de los consejos federados, es el órgano supremo de la Federación."
  },
  {
    "id": 47,
    "topic": "Normativa",
    "difficulty": 2,
    "question": "¿Qué siglas corresponden a las Normas Internacionales de Información Financiera?",
    "options": [
      "RT",
      "NIIF (o IFRS)",
      "NIA",
      "CONEAU"
    ],
    "correct": 1,
    "explanation": "NIIF son las normas internacionales que la Argentina está adoptando en su etapa de armonización."
  },
  {
    "id": 48,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Qué es el 'Acta Acuerdo Tucumán'?",
    "options": [
      "Un tratado de paz",
      "Un acuerdo para la armonización de normas profesionales en el país",
      "La ley que creó el monotributo",
      "Un contrato de alquiler del consejo"
    ],
    "correct": 1,
    "explanation": "Es un hito normativo que busca la unificación de criterios técnicos entre las distintas jurisdicciones."
  },
  {
    "id": 49,
    "topic": "Normativa",
    "difficulty": 4,
    "question": "Las resoluciones de la Junta de Gobierno de FACPCE se aprueban por:",
    "options": [
      "Voto unánime siempre",
      "Mayorías especiales establecidas en el Estatuto",
      "Orden directa del presidente",
      "Sorteo"
    ],
    "correct": 1,
    "explanation": "El reglamento establece mayorías específicas según el tipo de norma o decisión a tomar."
  },
  {
    "id": 50,
    "topic": "Normativa",
    "difficulty": 2,
    "question": "¿Qué significa 'incumbencia' profesional?",
    "options": [
      "El sueldo mínimo del contador",
      "Las tareas y facultades reservadas exclusivamente a cada título habilitante",
      "La fecha de vencimiento de la matrícula",
      "El nombre del estudio contable"
    ],
    "correct": 1,
    "explanation": "Las incumbencias definen qué puede hacer cada profesional según su formación (Contador vs Licenciado, etc.)."
  },
  {
    "id": 51,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿A qué entidad debe reportar un profesional ante una operación sospechosa de lavado?",
    "options": [
      "Al Consejo de Salta",
      "A la UIF (Unidad de Información Financiera)",
      "A la policía local",
      "A la universidad donde se recibió"
    ],
    "correct": 1,
    "explanation": "La Ley 25.246 establece a la UIF como el organismo receptor de los reportes de operaciones sospechosas (ROS)."
  },
  {
    "id": 52,
    "topic": "Normativa",
    "difficulty": 4,
    "question": "El Código Fiscal de la Provincia de Salta está bajo el:",
    "options": [
      "Decreto Ley 09/1975",
      "Ley 20.488",
      "Estatuto de Pacciolo",
      "Código de Comercio"
    ],
    "correct": 0,
    "explanation": "El marco fiscal provincial salteño se basa en el Decreto Ley 09 de 1975 y sus posteriores modificaciones."
  },
  {
    "id": 53,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Qué sucede si una propuesta de norma no es aprobada ni rechazada en Junta de Gobierno?",
    "options": [
      "Se quema el proyecto",
      "Se establece un nuevo período de consulta entre los Consejos",
      "Se aprueba por defecto",
      "La decide el presidente solo"
    ],
    "correct": 1,
    "explanation": "El reglamento de FACPCE prevé un nuevo período de consulta para limar asperezas y volver a tratarla."
  },
  {
    "id": 54,
    "topic": "Normativa",
    "difficulty": 2,
    "question": "¿Cuál es la herramienta principal del profesional en la 4ta etapa de la profesión?",
    "options": [
      "La regla de cálculo",
      "La computadora",
      "El ábaco",
      "La máquina de escribir"
    ],
    "correct": 1,
    "explanation": "Los apuntes destacan a la computadora como la herramienta central en la etapa actual de armonización."
  },
  {
    "id": 55,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Qué organismo emite las Normas Internacionales de Auditoría adoptadas por RT 32?",
    "options": [
      "AFIP",
      "IAASB de la IFAC",
      "Banco Central",
      "CONEAU"
    ],
    "correct": 1,
    "explanation": "La IFAC (International Federation of Accountants) a través del IAASB emite la normativa global de auditoría."
  },
  {
    "id": 56,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "La RT 26 en Argentina se refiere a:",
    "options": [
      "Normas de exposición contable para entes pequeños",
      "Adopción de las NIIF",
      "Valores actuales",
      "Consolidación de estados contables"
    ],
    "correct": 1,
    "explanation": "La Resolución Técnica 26 es la norma madre para la adopción de estándares internacionales de información financiera."
  },
  {
    "id": 57,
    "topic": "Normativa",
    "difficulty": 2,
    "question": "¿Qué regula la Ley 24.521?",
    "options": [
      "El precio del pan",
      "La Educación Superior",
      "Los concursos y quiebras",
      "La transferencia de tecnología"
    ],
    "correct": 1,
    "explanation": "Es la ley nacional que marco el funcionamiento de las universidades y títulos superiores."
  },
  {
    "id": 58,
    "topic": "Normativa",
    "difficulty": 5,
    "question": "¿Quién tiene la facultad de 'dictaminar sobre honorarios profesionales'?",
    "options": [
      "El cliente",
      "El Consejo Profesional",
      "El Ministerio de Trabajo",
      "La AFIP"
    ],
    "correct": 1,
    "explanation": "Es una atribución de los consejos fijar pautas o dictaminar sobre los honorarios por la labor técnica realizada."
  },
  {
    "id": 59,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Qué documento contiene los resultados de estudios o investigaciones del CECYT?",
    "options": [
      "Las Resoluciones Técnicas",
      "Los Informes",
      "La Memoria y Balance del Consejo",
      "El Código de Ética"
    ],
    "correct": 1,
    "explanation": "El CECYT emite 'Informes' que no son obligatorios pero sirven de guía doctrinaria y técnica."
  },
  {
    "id": 60,
    "topic": "Normativa",
    "difficulty": 4,
    "question": "¿Qué ley provincial modificó el código fiscal de Salta recientemente (citada en apuntes)?",
    "options": [
      "Ley 7.359",
      "Ley 20.488",
      "Ley de Aduanas",
      "Ley de sellos"
    ],
    "correct": 0,
    "explanation": "La Ley 7.359 es mencionada como una de las modificatorias del código fiscal salteño."
  },
  {
    "id": 61,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿A qué se refieren las 'Memorias de Sustentabilidad' mencionadas en la normativa?",
    "options": [
      "A la duración de los archivos en papel",
      "A informes sobre el impacto social y ambiental (Global Reporting Initiative)",
      "Al mantenimiento del edificio del consejo",
      "A la dieta de los contadores"
    ],
    "correct": 1,
    "explanation": "Forman parte de las nuevas tendencias normativas internacionales para reportar información no financiera."
  },
  {
    "id": 62,
    "topic": "Normativa",
    "difficulty": 2,
    "question": "¿Qué significan las siglas IFRS?",
    "options": [
      "International Financial Reporting Standards",
      "Internal Fiscal Revenue System",
      "Instituto Federal de Ramos Seguros",
      "Indice de Frecuencia de Riesgo Social"
    ],
    "correct": 0,
    "explanation": "Es el nombre en inglés de las NIIF (Normas Internacionales de Información Financiera)."
  },
  {
    "id": 63,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Qué exige la RT 34?",
    "options": [
      "Control de calidad y normas sobre independencia para auditores",
      "Revalúo técnico de bienes de uso",
      "Contabilidad para entidades sin fines de lucro",
      "Uso de moneda extranjera"
    ],
    "correct": 0,
    "explanation": "La RT 34 adopta los estándares internacionales de control de calidad para las firmas de auditoría."
  },
  {
    "id": 64,
    "topic": "Normativa",
    "difficulty": 3,
    "question": "¿Cuál es el órgano que agrupa a las autoridades de FACPCE (Presidente, Vices, etc.)?",
    "options": [
      "La Mesa Directiva",
      "El Comité de Ética",
      "La Asamblea de Estudiantes",
      "La Auditoría General de la Nación"
    ],
    "correct": 0,
    "explanation": "La Mesa Directiva es el brazo ejecutivo que conduce la Federación."
  },
  {
    "id": 65,
    "topic": "Normativa",
    "difficulty": 4,
    "question": "¿Qué requisito de residencia pide la Ley 20.488 para validar un título extranjero?",
    "options": [
      "6 meses",
      "Mínimo 2 años de residencia continuada en el país",
      "Haber nacido en Argentina",
      "No pide residencia"
    ],
    "correct": 1,
    "explanation": "Además de la reválida universitaria, se exige acreditar residencia para asegurar la inserción en el medio local."
  },

  // EXTRA PARA LLEGAR AL MÍNIMO (66-70)
  {
    "id": 66,
    "topic": "La Profesión",
    "difficulty": 2,
    "question": "¿Qué es un curso de 'Actualización' para un egresado?",
    "options": [
      "Aprender algo totalmente nuevo ajeno a la carrera",
      "Ponerse al día con la evolución de las disciplinas ya estudiadas",
      "Hacer la carrera de nuevo",
      "Un curso de gimnasia"
    ],
    "correct": 1,
    "explanation": "La actualización permite al profesional no quedar obsoleto ante los cambios normativos y técnicos."
  },
  {
    "id": 67,
    "topic": "Historia",
    "difficulty": 3,
    "question": "¿Qué tecnología permitió el paso de nómades a sedentarios e impulsó el trueque?",
    "options": [
      "La rueda",
      "El fuego",
      "La imprenta",
      "El vapor"
    ],
    "correct": 1,
    "explanation": "El fuego fue la tecnología inicial que cambió el estilo de vida y generó la necesidad de intercambio y registro."
  },
  {
    "id": 68,
    "topic": "Entes Profesionales",
    "difficulty": 3,
    "question": "¿Qué entidad en Salta atiende a los profesionales de la administración pública?",
    "options": [
      "El Tribunal de Cuentas únicamente",
      "La Asociación de Profesionales de Cs. Económicas de la Administración Pública",
      "La AFIP",
      "El sindicato de camioneros"
    ],
    "correct": 1,
    "explanation": "Existen asociaciones específicas para nuclear a los profesionales según su ámbito de desempeño laboral."
  },
  {
    "id": 69,
    "topic": "La Profesión",
    "difficulty": 1,
    "question": "¿Cuál fue el primer elemento de intercambio antes de los metales?",
    "options": [
      "La plata",
      "La sal",
      "El oro",
      "El petróleo"
    ],
    "correct": 1,
    "explanation": "La sal fue el primer elemento de intercambio masivo (de allí viene la palabra 'salario')."
  },
  {
    "id": 70,
    "topic": "Normativa",
    "difficulty": 4,
    "question": "¿Qué significa que la FACPCE tiene primacía en las instituciones y no en las personas?",
    "options": [
      "Que no le importa el bienestar de los contadores",
      "Que está conformada por los Consejos y no por afiliados individuales directos",
      "Que solo pueden entrar edificios",
      "Que es una monarquía"
    ],
    "correct": 1,
    "explanation": "La Federación es una organización de segundo grado; los individuos se matriculan en los Consejos, y los Consejos se federan."
  }
];

const CONCEPT_NOTES = {
  'Matriculación': {
    label: 'Matriculación',
    meanings: [
      { 
        topic: 'Actuación Profesional', 
        text: 'Acto administrativo de inscripción en el registro del Consejo que habilita el ejercicio legal.' 
      }
    ],
    tip: 'No basta con el diploma; sin matrícula la actuación es ilegal.'
  },
  'Incumbencia': {
    label: 'Incumbencia',
    meanings: [
      { 
        topic: 'Leyes Profesionales', 
        text: 'Conjunto de actividades para las cuales el título habilita exclusivamente por ley.' 
      }
    ],
    tip: 'Un Contador tiene incumbencias distintas a las de un Lic. en Administración (ej: dictaminar sobre estados contables).'
  },
  'Fe Pública': {
    label: 'Fe Pública',
    meanings: [
      { 
        topic: 'Responsabilidad', 
        text: 'Presunción de veracidad que el Estado otorga a las manifestaciones de ciertos profesionales.' 
      }
    ],
    tip: 'El Contador da fe sobre la realidad económica y patrimonial plasmada en sus dictámenes.'
  }
};