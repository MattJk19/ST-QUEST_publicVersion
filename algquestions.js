/* =========================================================
   BANCO DE PREGUNTAS: Álgebra Lineal ("algquestions.js")
   Materia: Álgebra Lineal (alg1)
   Persona: Arquitecto de Contenido Educativo STEM
   Fuentes: Grossman (7ma Ed), PROMiDAT, TP Cuádricas.
   ========================================================= */

const SUBJECT_INFO = {
  id: 'alg1',
  name: 'Álgebra Lineal',
  shortName: 'Alg. Lineal'
};

const QUESTION_BANK = [
  // BLOQUE 1: Sistemas de Ecuaciones Lineales (1-7) - Grossman 1.1 y 1.2
  {
    "id": 1,
    "topic": "Rectas y planos",
    "themeId": 2,
    "difficulty": 2,
    "question": "¿Bajo qué condición un sistema de dos ecuaciones lineales con dos incógnitas tiene una solución única?",
    "options": [
      "Si a11a22 - a12a21 ≠ 0",
      "Si las rectas son paralelas y distintas",
      "Si a11a22 - a12a21 = 0",
      "Si las pendientes de ambas rectas son iguales"
    ],
    "correct": 0,
    "explanation": "Según el Teorema de Resumen 1.1.1 de Grossman, un sistema de 2x2 tiene solución única si y solo si el determinante del sistema (a11a22 - a12a21) es distinto de cero."
  },
  {
    "id": 2,
    "topic": "Rectas y planos",
    "themeId": 2,
    "difficulty": 1,
    "question": "¿Qué representa un sistema de ecuaciones 'inconsistente' según la geometría analítica?",
    "options": [
      "Un par de rectas que se intersecan en el origen",
      "Un par de rectas coincidentes",
      "Un par de rectas paralelas y distintas",
      "Un sistema con infinitas soluciones"
    ],
    "correct": 2,
    "explanation": "Como se describe en la Figura 1.2 de Grossman, un sistema es inconsistente cuando no tiene puntos de intersección, lo cual corresponde a rectas paralelas y distintas."
  },
  {
    "id": 3,
    "topic": "Rectas y planos",
    "themeId": 2,
    "difficulty": 2,
    "question": "¿Cuál de las siguientes operaciones elementales por renglones NO altera el conjunto de soluciones de un sistema?",
    "options": [
      "Sumar una constante distinta de cero a todos los elementos de un renglón",
      "Multiplicar un renglón por una constante c ≠ 0 (Ri → cRi)",
      "Intercambiar un renglón por una columna",
      "Elevar al cuadrado los elementos de un renglón"
    ],
    "correct": 1,
    "explanation": "La sección 1.2 de Grossman define las tres operaciones elementales que preservan la equivalencia del sistema, incluyendo Ri → cRi para c ≠ 0."
  },
  {
    "id": 4,
    "topic": "Rectas y planos",
    "themeId": 2,
    "difficulty": 3,
    "question": "En el método de eliminación de Gauss-Jordan, ¿cuál es el objetivo de la reducción por renglones?",
    "options": [
      "Obtener una matriz cuya diagonal sea cero",
      "Llevar la matriz aumentada a una forma donde las soluciones se identifiquen de inmediato",
      "Convertir la matriz de coeficientes en una matriz nula",
      "Intercambiar todas las filas por las columnas"
    ],
    "correct": 1,
    "explanation": "El Ejemplo 1.2.1 de Grossman ilustra cómo se aplican operaciones elementales hasta obtener un sistema equivalente cuya solución es evidente, usualmente en forma escalonada reducida."
  },
  {
    "id": 5,
    "topic": "Rectas y planos",
    "themeId": 2,
    "difficulty": 2,
    "question": "¿Qué indica el símbolo Ri ↔ Rj en la notación de matrices de Grossman?",
    "options": [
      "Que el renglón i se multiplica por el renglón j",
      "Que los renglones i y j se intercambian",
      "Que el renglón i se suma al renglón j",
      "Que la matriz es inconsistente"
    ],
    "correct": 1,
    "explanation": "Basado en la notación de la sección 1.2 de Grossman, Ri ↔ Rj representa la tercera operación elemental por renglón: el intercambio de filas."
  },
  {
    "id": 6,
    "topic": "Rectas y planos",
    "themeId": 2,
    "difficulty": 2,
    "question": "Si en un sistema de 2x2 se cumple que a11a22 - a12a21 = 0, ¿cuál es la conclusión necesaria sobre sus soluciones?",
    "options": [
      "Tiene solución única",
      "Es un sistema homogéneo",
      "No tiene solución o tiene infinitas soluciones",
      "Siempre tiene la solución trivial (0,0)"
    ],
    "correct": 2,
    "explanation": "De acuerdo con el Teorema de Resumen 1.1.1 (Punto de vista 1), si el determinante es cero, las rectas son paralelas, lo que implica que no hay intersección o las rectas coinciden."
  },
  {
    "id": 7,
    "topic": "Rectas y planos",
    "themeId": 2,
    "difficulty": 1,
    "question": "¿Cómo se define la matriz aumentada de un sistema de ecuaciones?",
    "options": [
      "Es la matriz que contiene solo los términos independientes",
      "Es un arreglo que incluye tanto los coeficientes de las variables como las constantes del sistema",
      "Es el resultado de multiplicar la matriz de coeficientes por su inversa",
      "Es una matriz cuadrada de n x n siempre"
    ],
    "correct": 1,
    "explanation": "La sección 1.2 (Ecuación 1.2.8) de Grossman define la matriz aumentada como la representación compacta del sistema para aplicar reducción por renglones."
  },

  // BLOQUE 2: Vectores y Matrices (8-13) - Grossman 2.1 a 2.6
  {
    "id": 8,
    "topic": "Productos",
    "themeId": 1,
    "difficulty": 2,
    "question": "¿Cuál es la condición necesaria para realizar el producto matricial AB?",
    "options": [
      "A y B deben ser del mismo tamaño",
      "El número de renglones de A debe ser igual al de columnas de B",
      "El número de columnas de A debe ser igual al número de renglones de B",
      "Ambas matrices deben ser cuadradas"
    ],
    "correct": 2,
    "explanation": "Según la sección 2.2 de Grossman, si A es m x n, B debe tener n renglones para que el producto esté definido."
  },
  {
    "id": 9,
    "topic": "Productos",
    "themeId": 1,
    "difficulty": 3,
    "question": "¿Qué propiedad define a la inversa de una matriz cuadrada A?",
    "options": [
      "A multiplicada por su transpuesta es la identidad",
      "A multiplicada por su inversa resulta en la identidad (A * A^-1 = I)",
      "El determinante de la matriz debe ser cero",
      "La matriz debe ser triangular superior únicamente"
    ],
    "correct": 1,
    "explanation": "La sección 2.4 de Grossman establece que una matriz cuadrada es invertible si existe A^-1 tal que el producto resulta en la matriz identidad I."
  },
  {
    "id": 10,
    "topic": "Productos",
    "themeId": 1,
    "difficulty": 2,
    "question": "¿Cómo se obtiene la transpuesta de una matriz A?",
    "options": [
      "Multiplicando todos sus elementos por -1",
      "Intercambiando sus renglones por sus columnas",
      "Calculando el recíproco de cada elemento",
      "Haciendo cero todos los elementos fuera de la diagonal"
    ],
    "correct": 1,
    "explanation": "La sección 2.5 de Grossman define la transpuesta (A^T) como el arreglo obtenido al escribir los renglones de A como columnas."
  },
  {
    "id": 11,
    "topic": "Productos",
    "themeId": 1,
    "difficulty": 3,
    "question": "¿Qué caracteriza a una matriz elemental según la sección 2.6 de Grossman?",
    "options": [
      "Es una matriz que solo contiene ceros y unos",
      "Es una matriz obtenida al aplicar una sola operación elemental por renglón a la matriz identidad",
      "Es la matriz de coeficientes de cualquier sistema inconsistente",
      "Es una matriz que no posee inversa"
    ],
    "correct": 1,
    "explanation": "Grossman define las matrices elementales como aquellas que resultan de una sola operación elemental sobre I. Son siempre cuadradas e invertibles, propiedad clave para la teoría de matrices inversas."
  },
  {
    "id": 12,
    "topic": "Productos",
    "themeId": 1,
    "difficulty": 2,
    "question": "En el contexto de matrices cuadradas, ¿qué significa que una matriz sea simétrica?",
    "options": [
      "Que es igual a su inversa",
      "Que es igual a su transpuesta (A = A^T)",
      "Que todos sus elementos son iguales a 1",
      "Que su determinante es exactamente 1"
    ],
    "correct": 1,
    "explanation": "La sección 2.5 describe la simetría como la propiedad donde A coincide con su transpuesta, lo cual requiere que sea una matriz cuadrada."
  },
  {
    "id": 13,
    "topic": "Productos",
    "themeId": 1,
    "difficulty": 4,
    "question": "Si una matriz A es invertible, ¿qué se puede afirmar sobre la solución del sistema Ax = b?",
    "options": [
      "Tiene infinitas soluciones para cualquier b",
      "Tiene una solución única dada por x = A^-1 * b",
      "No tiene solución si b ≠ 0",
      "Es un sistema inconsistente por definición"
    ],
    "correct": 1,
    "explanation": "Basado en la sección 2.4, la invertibilidad de A garantiza que el sistema posee una solución única, hallada mediante la premultiplicación por la inversa."
  },

  // BLOQUE 3: Determinantes (14-18) - Grossman 3.1 a 3.3
  {
    "id": 14,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "difficulty": 3,
    "question": "¿Cuál es el valor del determinante de un producto de matrices cuadradas AB?",
    "options": [
      "det A + det B",
      "det A * det B",
      "det A / det B",
      "(det A)^2"
    ],
    "correct": 1,
    "explanation": "El Teorema fundamental de la sección 3.5 establece que det AB = det A det B. La demostración completa utiliza matrices elementales para descomponer matrices invertibles, como se detalla en Grossman."
  },
  {
    "id": 15,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "difficulty": 2,
    "question": "Si una matriz cuadrada tiene un renglón (o columna) compuesto totalmente por ceros, ¿cuál es su determinante?",
    "options": [
      "1",
      "Depende de la suma de la diagonal",
      "0",
      "No se puede calcular"
    ],
    "correct": 2,
    "explanation": "Según las propiedades de los determinantes en la sección 3.2 de Grossman, la presencia de una línea de ceros anula el valor del determinante."
  },
  {
    "id": 16,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "difficulty": 3,
    "question": "¿Bajo qué condición principal se aplica la Regla de Cramer para resolver un sistema de n x n?",
    "options": [
      "Siempre que el sistema sea homogéneo",
      "Solo cuando el determinante de la matriz de coeficientes es diferente de cero",
      "Cuando el sistema tiene más incógnitas que ecuaciones",
      "Cuando la matriz es singular"
    ],
    "correct": 1,
    "explanation": "La sección 3.4 de Grossman explica que la Regla de Cramer requiere det A ≠ 0. Aunque es conceptualmente importante, es computacionalmente ineficiente frente a la eliminación gaussiana."
  },
  {
    "id": 17,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "difficulty": 2,
    "question": "¿Cómo se relaciona el determinante de A con el de su transpuesta A^T?",
    "options": [
      "det(A) = -det(A^T)",
      "det(A) = det(A^T)",
      "det(A) = 1 / det(A^T)",
      "Son independientes entre sí"
    ],
    "correct": 1,
    "explanation": "En la sección 3.2 de Grossman se demuestra que el determinante no varía al transponer la matriz: det A = det A^T."
  },
  {
    "id": 18,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "difficulty": 4,
    "question": "Según el Teorema de Resumen del Capítulo 3, ¿cuál es la condición necesaria y suficiente para que A sea invertible?",
    "options": [
      "det A = 0",
      "A debe ser una matriz rectangular",
      "det A ≠ 0",
      "A debe ser una matriz elemental"
    ],
    "correct": 2,
    "explanation": "La sección 3.3 de Grossman (Teorema de Resumen) vincula la existencia de la inversa directamente con un determinante distinto de cero."
  },

  // BLOQUE 4: Espacios Vectoriales (19-23) - Grossman 5.1 a 5.5
  {
    "id": 19,
    "topic": "Espacios vectoriales",
    "themeId": 3,
    "difficulty": 3,
    "question": "¿Qué condiciones debe cumplir un subconjunto W para ser considerado un subespacio de un espacio vectorial V?",
    "options": [
      "Debe contener solo vectores de norma unitaria",
      "Debe ser cerrado bajo la suma de vectores y la multiplicación por un escalar",
      "Debe tener una dimensión estrictamente mayor que V",
      "Debe ser un conjunto finito de vectores"
    ],
    "correct": 1,
    "explanation": "La sección 5.2 de Grossman define un subespacio como un subconjunto que hereda la estructura de espacio vectorial al cumplir con las propiedades de cerradura."
  },
  {
    "id": 20,
    "topic": "Espacios vectoriales",
    "themeId": 3,
    "difficulty": 3,
    "question": "¿Cuándo se define un conjunto de vectores como linealmente independiente?",
    "options": [
      "Si al menos un vector es combinación lineal de los demás",
      "Si la única combinación lineal que resulta en el vector nulo tiene todos los coeficientes nulos (ci = 0)",
      "Si todos los vectores son paralelos al eje x",
      "Si el número de vectores coincide con el rango de la matriz"
    ],
    "correct": 1,
    "explanation": "La independencia lineal, según la sección 5.4 de Grossman, garantiza que ningún vector del conjunto pueda ser generado por los otros."
  },
  {
    "id": 21,
    "topic": "Espacios vectoriales",
    "themeId": 3,
    "difficulty": 2,
    "question": "¿Cómo se define la dimensión de un espacio vectorial V?",
    "options": [
      "Como el número de renglones de su matriz aumentada",
      "Como el número de vectores presentes en cualquier base de V",
      "Como la suma de los elementos de su vector principal",
      "Como el valor absoluto de su determinante"
    ],
    "correct": 1,
    "explanation": "La dimensión es una propiedad intrínseca definida en la sección 5.5 de Grossman como la cardinalidad de sus bases."
  },
  {
    "id": 22,
    "topic": "Espacios vectoriales",
    "themeId": 3,
    "difficulty": 3,
    "question": "¿Qué requisitos debe cumplir un conjunto de vectores para constituir una base de V?",
    "options": [
      "Deben ser ortogonales y de longitud 1",
      "Deben ser linealmente independientes y generar el espacio V",
      "Deben formar una matriz con determinante nulo",
      "Deben incluir siempre al vector cero del espacio"
    ],
    "correct": 1,
    "explanation": "Según la sección 5.5 de Grossman, una base es el conjunto mínimo de vectores que permite representar a cualquier otro vector del espacio."
  },
  {
    "id": 23,
    "topic": "Espacios vectoriales",
    "themeId": 3,
    "difficulty": 2,
    "question": "En la definición de espacio vectorial, ¿qué garantiza el axioma u + v = v + u?",
    "options": [
      "La cerradura bajo la suma",
      "La propiedad conmutativa de la suma de vectores",
      "La existencia de un elemento neutro",
      "La propiedad distributiva escalar"
    ],
    "correct": 1,
    "explanation": "La conmutatividad es uno de los 10 axiomas fundamentales descritos en la sección 5.1 de Grossman para los espacios vectoriales."
  },

  // BLOQUE 5: Transformaciones Lineales y Valores Propios (24-28) - Grossman 7 y 8
  {
    "id": 24,
    "topic": "Subespacios",
    "themeId": 4,
    "difficulty": 3,
    "question": "¿Qué condiciones definen matemáticamente a una transformación lineal T?",
    "options": [
      "T(u+v) = T(u) + T(v) y T(αv) = αT(v)",
      "T(x) = x^n donde n es un número entero",
      "Que el determinante de la matriz asociada sea siempre unitario",
      "T(0) = b donde b es un vector no nulo"
    ],
    "correct": 0,
    "explanation": "La sección 7.1 de Grossman especifica que la linealidad requiere la preservación de la suma y el producto por escalar."
  },
  {
    "id": 25,
    "topic": "Subespacios",
    "themeId": 4,
    "difficulty": 3,
    "question": "¿Qué define al núcleo (o kernel) de una transformación lineal T: V → W?",
    "options": [
      "El conjunto de vectores en el dominio V tales que T(v) = 0",
      "El conjunto de todas las imágenes posibles en el codominio W",
      "La matriz identidad de tamaño n x n",
      "El vector con mayor magnitud en el dominio"
    ],
    "correct": 0,
    "explanation": "De acuerdo con la sección 7.2 de Grossman, el núcleo agrupa a todos los vectores del Dominio que mapean al vector nulo del Codominio."
  },
  {
    "id": 26,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "difficulty": 5,
    "question": "Para que una matriz cuadrada A sea diagonalizable, ¿qué relación conceptual debe existir con sus valores propios?",
    "options": [
      "Debe poseer n valores propios distintos cuyas raíces sean reales",
      "Debe tener suficientes vectores propios linealmente independientes para formar una base",
      "Todos sus valores propios λ deben ser iguales a cero",
      "La suma de sus valores propios debe ser igual al determinante de A"
    ],
    "correct": 1,
    "explanation": "En la sección 8.3, Grossman explica que la diagonalización depende de la existencia de n vectores propios linealmente independientes. Esto requiere resolver primero la ecuación característica det(A - λI) = 0 (Sección 8.1)."
  },
  {
    "id": 27,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "difficulty": 5,
    "question": "Sea λ un valor propio de A. ¿Cómo se caracteriza el espacio de vectores propios (autoespacio) asociado a λ?",
    "options": [
      "Como el conjunto de vectores v tales que Av = 0",
      "Como el núcleo de la matriz (A - λI)",
      "Como la transpuesta de la matriz de coeficientes",
      "Como el conjunto de vectores cuya norma es λ"
    ],
    "correct": 1,
    "explanation": "Según la sección 8.1 de Grossman, el vector característico no nulo satisface (A - λI)v = 0, lo que conceptualmente lo sitúa en el núcleo de dicha matriz."
  },
  {
    "id": 28,
    "topic": "Transformaciones",
    "themeId": 5,
    "difficulty": 3,
    "question": "Geométricamente, ¿qué operación en R2 representa la transformación lineal cuya matriz estándar es [[1, 0], [0, -1]]?",
    "options": [
      "Una expansión horizontal",
      "Una reflexión respecto al eje x",
      "Una rotación de 90 grados",
      "Un corte vertical"
    ],
    "correct": 1,
    "explanation": "La sección 7.3 de Grossman analiza las representaciones matriciales de transformaciones geométricas, identificando esta matriz específica con la reflexión sobre el eje x."
  },

  // BLOQUE 6: Geometría y Aplicaciones (29-30) - TP Cuádricas y PROMiDAT
  {
    "id": 29,
    "topic": "Cónicas",
    "themeId": 8,
    "difficulty": 2,
    "question": "¿Qué superficie cuádrica se identifica con la ecuación x^2/4 - y^2/1 - z^2/9 = 1?",
    "options": [
      "Un elipsoide",
      "Un hiperboloide de dos hojas",
      "Un paraboloide circular",
      "Un hiperboloide de una hoja"
    ],
    "correct": 1,
    "explanation": "Basado en el 'Trabajo Práctico - Cuádricas' (ejercicio 1.e), la presencia de dos signos negativos en los términos cuadráticos de una ecuación igualada a 1 identifica un hiperboloide de dos hojas."
  },
  {
    "id": 30,
    "topic": "Cónicas",
    "themeId": 8,
    "difficulty": 3,
    "question": "En Ciencia de Datos, ¿cuál es la aplicación principal del cálculo de valores y vectores propios?",
    "options": [
      "Redes Neuronales Convolucionales para visión",
      "Análisis de Componentes Principales (PCA) para reducción de dimensionalidad",
      "Regresión No Lineal para predicción de series",
      "Sistemas de archivos distribuidos"
    ],
    "correct": 1,
    "explanation": "Según la fuente PROMiDAT (ME-3000), el álgebra lineal sustenta el PCA, técnica que utiliza la descomposición de valores propios para identificar las direcciones de máxima varianza en los datos."
  },
  {
    "id": 31,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Qué representan conceptualmente las matrices L y U en la factorización de una matriz cuadrada A?",
    "options": [
      "a) L es una matriz triangular inferior con unos en la diagonal y U es una matriz triangular superior.",
      "b) L es una matriz de permutación y U es una matriz unitaria de rango completo.",
      "c) L representa la proyección ortogonal y U la transformación de escala.",
      "d) L es la inversa de la transpuesta de U en un espacio complejo."
    ],
    "correct": 0,
    "explanation": "De acuerdo con la Sección 2.7, la factorización LU descompone A en el producto de una matriz triangular inferior (L) y una superior (U). Esta técnica es fundamental para alcanzar un equilibrio entre la \"técnica y teoría\" del álgebra matricial."
  },
  {
    "id": 32,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "En el proceso de obtención de la matriz U, ¿qué técnica de reducción es aplicada sistemáticamente sobre la matriz A?",
    "options": [
      "a) Ortogonalización de Gram-Schmidt.",
      "b) Eliminación gaussiana para anular elementos bajo la diagonal principal.",
      "c) Cálculo de la adjunta y el determinante por cofactores.",
      "d) Descomposición espectral de valores propios reales."
    ],
    "correct": 1,
    "explanation": "La matriz U es el resultado final de aplicar la eliminación gaussiana a A. Como indica Grossman, estas habilidades algebraicas permiten resolver problemas técnicos complejos mediante un rigor algorítmico preciso."
  },
  {
    "id": 33,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "Si definimos A = LU, ¿cómo se construye la matriz L a partir de las matrices elementales E_i utilizadas en la reducción de A hacia U?",
    "options": [
      "a) L es la suma de todas las matrices elementales involucradas.",
      "b) L es el producto de las inversas de las matrices elementales en orden inverso (E_1^-1...E_k^-1).",
      "c) L se obtiene multiplicando A por su transpuesta dividida por el determinante.",
      "d) L es la matriz identidad multiplicada por el primer pivote de U."
    ],
    "correct": 1,
    "explanation": "La relación técnica fundamental establece que A = (E_1^-1 E_2^-1 ... E_k^-1) U. Esta estructura demuestra la \"belleza de las matemáticas\" al unificar operaciones elementales con la arquitectura de matrices triangulares."
  },
  {
    "id": 34,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Cuál es la principal ventaja operativa de disponer de la factorización LU de una matriz A al resolver Ax = b?",
    "options": [
      "a) Reduce la matriz A a una forma escalonada reducida por renglones automáticamente.",
      "b) Elimina la necesidad de realizar sustituciones hacia atrás.",
      "c) Facilita la resolución eficiente de múltiples sistemas que comparten la misma matriz A y diferentes vectores b.",
      "d) Permite calcular el polinomio característico sin usar determinantes."
    ],
    "correct": 2,
    "explanation": "Al tener LU, el sistema se resuelve en dos pasos (Ly = b y Ux = y) mediante sustitución simple, lo cual es computacionalmente preferible para procesos iterativos en ingeniería."
  },
  {
    "id": 35,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "Para garantizar una factorización LU sin el uso de una matriz de permutación P, ¿qué condición debe cumplirse durante la eliminación?",
    "options": [
      "a) Que el determinante de A sea exactamente igual a cero.",
      "b) Que no se requieran intercambios de renglones para evitar pivotes nulos.",
      "c) Que la matriz A sea estrictamente simétrica y definida positiva.",
      "d) Que todos los elementos de la matriz original sean números enteros."
    ],
    "correct": 1,
    "explanation": "La factorización LU estándar (sin pivoteo parcial) requiere que los menores principales sean no singulares, permitiendo la reducción sin intercambios. Grossman subraya que dominar estos detalles minuciosos es vital para la teoría."
  },
  {
    "id": 36,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "Bajo la convención de Doolittle para la factorización LU, ¿qué característica posee la diagonal principal de L?",
    "options": [
      "a) Todos sus elementos son iguales a 1.",
      "b) Sus elementos son los pivotes resultantes de la eliminación gaussiana.",
      "c) Contiene los valores propios de la matriz original A.",
      "d) Sus elementos son los recíprocos de los elementos de la diagonal de U."
    ],
    "correct": 0,
    "explanation": "En la forma de Doolittle, L es una matriz triangular inferior unitaria (unos en la diagonal). Este rigor técnico asegura la unicidad de la descomposición bajo condiciones específicas."
  },
  {
    "id": 37,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "En la resolución del sistema Ax = b mediante el método LU, ¿cuál es el propósito de resolver primero el sistema intermedio Ly = b?",
    "options": [
      "a) Obtener el vector de solución final x de forma directa.",
      "b) Determinar los coeficientes de la matriz U mediante sustitución hacia atrás.",
      "c) Hallar un vector intermedio y que permita posteriormente aplicar Ux = y.",
      "d) Comprobar si la matriz A es invertible mediante el rango de L."
    ],
    "correct": 2,
    "explanation": "Puesto que A = LU, el sistema es (LU)x = b. Al definir Ux = y, se debe resolver primero Ly = b. Este procedimiento paso a paso es la esencia del aprendizaje algorítmico descrito en el prefacio."
  },
  {
    "id": 38,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Qué tipo de operaciones elementales se almacenan implícitamente en los elementos bajo la diagonal de la matriz L?",
    "options": [
      "a) Intercambios de renglones para la optimización de pivotes.",
      "b) Multiplicadores utilizados para eliminar elementos debajo de la diagonal de A.",
      "c) Multiplicaciones de renglones por escalares para normalizar pivotes.",
      "d) Operaciones de transposición y conjugación compleja."
    ],
    "correct": 1,
    "explanation": "Los elementos l_ij de la matriz L representan los multiplicadores m_ij utilizados en la eliminación gaussiana. Esto mantiene la integridad de la estructura triangular inferior."
  },
  {
    "id": 39,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "Si una matriz A es no singular y posee una factorización LU, ¿qué propiedad heredan las matrices L y U?",
    "options": [
      "a) L y U deben ser también matrices no singulares (invertibles).",
      "b) L es siempre invertible, pero U puede ser singular.",
      "c) El producto de sus trazas es igual a la traza de A.",
      "d) Ambas matrices deben ser ortogonales."
    ],
    "correct": 0,
    "explanation": "Dado que det(A) = det(L) * det(U), si det(A) es distinto de cero, tanto L como U deben tener determinantes no nulos. Esto integra la teoría de determinantes con las factorizaciones técnicas."
  },
  {
    "id": 40,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿En qué área de aplicación específica se menciona que los sistemas de ecuaciones analizados mediante matrices describen esfuerzos estructurales?",
    "options": [
      "a) Dinámica de fluidos en entornos cuánticos.",
      "b) Análisis de esfuerzos en estructuras de ingeniería civil.",
      "c) Criptografía de clave pública basada en curvas elípticas.",
      "d) Modelado de la complejidad computacional en algoritmos NP-completos."
    ],
    "correct": 1,
    "explanation": "El Capítulo 1 y el prefacio (pág. 1) indican que la ingeniería civil utiliza estos sistemas para modelar la estabilidad de construcciones, siendo la factorización LU una herramienta de cálculo fundamental para estos esfuerzos."
  },
  {
    "id": 41,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "¿Cuál es el requisito para que un conjunto de vectores en Rn sea una base ortonormal?",
    "options": [
      "a) Que su producto vectorial sea nulo para todo par de vectores.",
      "b) Que sean mutuamente ortogonales y su norma sea unitaria (||v|| = 1).",
      "c) Que la matriz formada por ellos tenga traza nula.",
      "d) Que sean vectores linealmente dependientes en el origen."
    ],
    "correct": 1,
    "explanation": "Según la Sección 6.1, la ortonormalidad requiere vi · vj = 0 (i ≠ j) y ||vi|| = 1. Este concepto refleja la \"belleza de las matemáticas\" al conectar la geometría euclidiana con la estructura algebraica."
  },
  {
    "id": 42,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "En Rn, ¿qué representa geométricamente la proyección ortogonal de un vector u sobre un vector v?",
    "options": [
      "a) El área del paralelogramo formado por u y v.",
      "b) La sombra de u proyectada en la dirección de v de forma perpendicular.",
      "c) La distancia mínima entre el origen y el plano definido por u y v.",
      "d) El vector resultante de la suma ponderada de u y v por sus autovalores."
    ],
    "correct": 1,
    "explanation": "La proyección descompone u en una componente paralela a v. Es una técnica esencial para entender la resolución de sistemas inconsistentes y aproximaciones en espacios internos."
  },
  {
    "id": 43,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "¿Cuál es la función del método de mínimos cuadrados en la Sección 6.2?",
    "options": [
      "a) Resolver sistemas consistentes con soluciones infinitas.",
      "b) Hallar la mejor aproximación x que minimice la norma del error ||Ax - b|| en sistemas inconsistentes.",
      "c) Diagonalizar matrices simétricas de grandes dimensiones.",
      "d) Encontrar las raíces de un polinomio de grado n mediante iteración."
    ],
    "correct": 1,
    "explanation": "Mínimos cuadrados busca la solución más cercana en términos de distancia euclidiana. Grossman resalta esta técnica como una aplicación crucial en la ciencia de datos y la economía."
  },
  {
    "id": 44,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "¿Qué relación establece la desigualdad de Cauchy-Schwarz para cualquier par de vectores u, v en un espacio con producto interno?",
    "options": [
      "a) |u · v| ≤ ||u|| ||v||.",
      "b) ||u + v|| = ||u|| + ||v||.",
      "c) u · v = ||u|| / ||v||.",
      "d) det(u, v) ≤ traza(u + v)."
    ],
    "correct": 0,
    "explanation": "Esta desigualdad es un pilar teórico del Capítulo 6. El \"teorema de resumen\" integra estos resultados para proporcionar una visión coherente de la métrica en espacios vectoriales."
  },
  {
    "id": 45,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "Cuando se ajusta una curva a una serie de datos experimentales minimizando las desviaciones al cuadrado, se está aplicando:",
    "options": [
      "a) La regla de Cramer para determinantes.",
      "b) La aproximación por mínimos cuadrados.",
      "c) Un isomorfismo de kernel no nulo.",
      "d) La reducción de Jordan para matrices singulares."
    ],
    "correct": 1,
    "explanation": "El ajuste de curvas es una aplicación directa de la Sección 6.2, fundamental para la \"administración de recursos\" y el análisis de tendencias mencionado en la obra."
  },
  {
    "id": 46,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "Para que una función sea considerada un producto interno sobre un espacio vectorial, ¿qué axiomas debe satisfacer?",
    "options": [
      "a) Linealidad, simetría (o hermeticidad) y positividad definida.",
      "b) Inyectividad, sobreyectividad y preservación de la traza.",
      "c) Debe ser una función constante para todos los vectores.",
      "d) Debe ser equivalente a la suma de los componentes del vector."
    ],
    "correct": 0,
    "explanation": "La definición formal del Capítulo 6 exige el cumplimiento de estos axiomas, permitiendo generalizar nociones de ángulo y longitud a espacios de funciones o matrices."
  },
  {
    "id": 47,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "¿Cuál es la utilidad técnica del proceso de ortogonalización de Gram-Schmidt?",
    "options": [
      "a) Calcular el rango de una transformación lineal.",
      "b) Transformar una base cualquiera en una base ortogonal u ortonormal.",
      "c) Hallar los valores propios de una matriz no simétrica.",
      "d) Resolver el modelo de insumo-producto de Leontief."
    ],
    "correct": 1,
    "explanation": "Gram-Schmidt es la técnica algorítmica fundamental (Sección 6.1) para construir bases ortogonales, simplificando significativamente los cálculos de proyecciones."
  },
  {
    "id": 48,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "¿Qué propiedad define al operador de proyección ortogonal P sobre un subespacio W en un espacio con producto interno?",
    "options": [
      "a) P es un operador idempotente, es decir, P^2 = P.",
      "b) P es siempre una matriz de permutación de rango 1.",
      "c) P es una transformación inyectiva en todo el espacio vectorial.",
      "d) P preserva la norma de todos los vectores del espacio original."
    ],
    "correct": 0,
    "explanation": "En la teoría de espacios con producto interno (Capítulo 6), un operador de proyección satisface P^2 = P, lo que significa que proyectar un vector ya proyectado no altera el resultado."
  },
  {
    "id": 49,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "En el contexto de mínimos cuadrados, ¿cómo se denominan las ecuaciones (A^T A)x = A^T b?",
    "options": [
      "a) Ecuaciones características.",
      "b) Ecuaciones normales.",
      "c) Sistemas homogéneos de Jordan.",
      "d) Ecuaciones diferenciales de Cayley."
    ],
    "correct": 1,
    "explanation": "Resolver el sistema de ecuaciones normales es el paso técnico definitivo para encontrar la mejor aproximación, demostrando la utilidad práctica de la matriz transpuesta."
  },
  {
    "id": 50,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "La condición técnica para que dos vectores u y v sean ortogonales es:",
    "options": [
      "a) Que su producto interno sea igual a 1.",
      "b) Que su producto interno sea igual a 0.",
      "c) Que la suma de sus normas sea igual a la norma de la suma.",
      "d) Que uno sea múltiplo escalar del otro."
    ],
    "correct": 1,
    "explanation": "La ortogonalidad es el pilar del Capítulo 6. Comprender este concepto es prerrequisito para acceder a las versiones más complejas del \"teorema de resumen\"."
  },
  {
    "id": 51,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "En la sección de aplicaciones, ¿cómo se ilustra la relevancia del álgebra lineal para la gestión de suministros?",
    "options": [
      "a) Mediante modelos de predicción bursátil de alta frecuencia.",
      "b) Mediante el ejemplo de administración de suministros de alimento para peces (Ejemplo 1.2.8).",
      "c) A través del diseño de bases de datos relacionales.",
      "d) Usando la teoría de juegos para la competencia de mercado."
    ],
    "correct": 1,
    "explanation": "Grossman utiliza ejemplos prácticos como el suministro de alimento para peces para convencer al estudiante de la utilidad del álgebra en la toma de decisiones y ciencias aplicadas."
  },
  {
    "id": 52,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "¿Qué es el complemento ortogonal de un subespacio H en un espacio V?",
    "options": [
      "a) El conjunto de vectores que completan la base de V.",
      "b) El conjunto de todos los vectores en V que son perpendiculares a cada vector en H.",
      "c) El subespacio imagen tras una isometría.",
      "d) La matriz transpuesta de la base de H."
    ],
    "correct": 1,
    "explanation": "El complemento ortogonal (H^perp) es una estructura técnica clave para la descomposición de espacios y el estudio de proyecciones ortogonales."
  },
  {
    "id": 53,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "La norma de un vector v derivada de un producto interno se define formalmente como:",
    "options": [
      "a) La traza de la matriz de autovectores.",
      "b) La raíz cuadrada del producto interno del vector consigo mismo (sqrt(v · v)).",
      "c) El logaritmo natural del determinante del vector.",
      "d) La suma de los valores absolutos de sus componentes."
    ],
    "correct": 1,
    "explanation": "Esta definición permite generalizar el concepto de distancia a cualquier espacio con producto interno, unificando la geometría analítica con el álgebra abstracta."
  },
  {
    "id": 54,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "¿Qué técnica computacional se menciona en la fuente para ajustar un polinomio a un conjunto de puntos?",
    "options": [
      "a) Uso de comandos específicos en MATLAB (Sección 1.3.11).",
      "b) Aplicación manual de la eliminación de Gauss-Jordan.",
      "c) Factorización espectral por el método de Newton-Raphson.",
      "d) Uso de tablas de logaritmos de Hamilton."
    ],
    "correct": 0,
    "explanation": "La fuente integra la técnica computacional con la teoría de sistemas, utilizando MATLAB para facilitar el ajuste de polinomios a datos reales."
  },
  {
    "id": 55,
    "topic": "Espacios euclidianos",
    "themeId": 7,
    "question": "Si una matriz Q es ortogonal (sus columnas son ortonormales), ¿qué resultado produce Q^T Q?",
    "options": [
      "a) La matriz nula.",
      "b) La matriz identidad I.",
      "c) El determinante de Q.",
      "d) La matriz de Jordan asociada."
    ],
    "correct": 1,
    "explanation": "Esta propiedad técnica de las matrices ortogonales simplifica enormemente los cambios de base y las proyecciones, ilustrando la elegancia de la teoría matricial."
  },
  {
    "id": 56,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "Para que una transformación lineal T: V -> W sea un isomorfismo, debe cumplir con ser:",
    "options": [
      "a) Solamente inyectiva.",
      "b) Solamente sobreyectiva.",
      "c) Biyectiva (inyectiva y sobreyectiva simultáneamente).",
      "d) Una proyección sobre el núcleo de W."
    ],
    "correct": 2,
    "explanation": "La Sección 7.4 define el isomorfismo como una transformación biyectiva, lo que garantiza que ambos espacios posean la misma estructura algebraica."
  },
  {
    "id": 57,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "Si V y W son espacios vectoriales de dimensión finita e isomorfos, ¿qué se deduce sobre sus dimensiones?",
    "options": [
      "a) dim V > dim W.",
      "b) dim V = dim W.",
      "c) dim V < dim W.",
      "d) Sus dimensiones deben ser números primos."
    ],
    "correct": 1,
    "explanation": "Un resultado fundamental de la Sección 7.4 es que la igualdad de dimensiones es condición necesaria y suficiente para el isomorfismo en espacios de dimensión finita."
  },
  {
    "id": 58,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "El núcleo (kernel) de una transformación lineal T: V -> W se define como:",
    "options": [
      "a) El conjunto de vectores v en V tales que T(v) = 0_W.",
      "b) El conjunto de todas las imágenes posibles en W.",
      "c) La base ortonormal del espacio de salida.",
      "d) El determinante de la matriz de transformación."
    ],
    "correct": 0,
    "explanation": "Definido en la Sección 7.2, el núcleo es un subespacio cuya nulidad determina la inyectividad de la transformación."
  },
  {
    "id": 59,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "Una isometría se distingue por ser una transformación lineal que preserva:",
    "options": [
      "a) La traza de la matriz asociada y el determinante.",
      "b) La distancia (norma) entre los vectores.",
      "c) La dimensión del núcleo por encima de la imagen.",
      "d) El orden de los elementos en la diagonal principal."
    ],
    "correct": 1,
    "explanation": "Según la Sección 7.5, las isometrías preservan las métricas. Esto incluye rotaciones y reflexiones, pilares de la \"geometría de una transformación\"."
  },
  {
    "id": 60,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "¿Cuál de las siguientes es una interpretación geométrica de las transformaciones en R2 mencionada en el texto?",
    "options": [
      "a) Expansiones, compresiones, reflexiones y cortes.",
      "b) Cálculo de la tasa de interés compuesto.",
      "c) Optimización de redes neuronales profundas.",
      "d) Reducción de varianza en modelos estocásticos."
    ],
    "correct": 0,
    "explanation": "La fuente (pág. XVI) detalla estas operaciones para ayudar a visualizar cómo las transformaciones alteran el plano cartesiano."
  },
  {
    "id": 61,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "Si el núcleo de una transformación lineal T contiene un vector no nulo, se concluye que T:",
    "options": [
      "a) Es un isomorfismo.",
      "b) No es inyectiva.",
      "c) Es una isometría perfecta.",
      "d) Es la transformación identidad."
    ],
    "correct": 1,
    "explanation": "Para la inyectividad, el núcleo debe ser trivial ({0}). Este es un concepto central de la teoría de transformaciones (Sección 7.2)."
  },
  {
    "id": 62,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "¿Qué representa la imagen (o contradominio) de una transformación lineal T?",
    "options": [
      "a) El subespacio formado por todos los vectores resultantes T(v) en W.",
      "b) El determinante de la matriz escalonada de T.",
      "c) El conjunto de autovectores asociados a la unidad.",
      "d) La inversa de la matriz de transición."
    ],
    "correct": 0,
    "explanation": "La imagen es el conjunto de llegada de la transformación. Su dimensión (rango) está vinculada directamente al \"teorema de resumen\"."
  },
  {
    "id": 63,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "La propiedad T(αv) = αT(v) en una transformación lineal se denomina:",
    "options": [
      "a) Aditividad.",
      "b) Homogeneidad.",
      "c) Biyectividad métrica.",
      "d) Ortogonalidad de Gram-Schmidt."
    ],
    "correct": 1,
    "explanation": "Es uno de los dos axiomas fundamentales que definen la linealidad de una función entre espacios vectoriales (Sección 7.1)."
  },
  {
    "id": 64,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "¿Cuál es la matriz estándar de una reflexión sobre el eje y en R2?",
    "options": [
      "a) [1 0; 0 1]",
      "b) [-1 0; 0 1]",
      "c) [0 1; 1 0]",
      "d) [1 0; 0 -1]"
    ],
    "correct": 1,
    "explanation": "La matriz [-1 0; 0 1] invierte el signo de la componente x, reflejando el vector sobre el eje y, como se describe en la \"geometría de las transformaciones\" (pág. XVI)."
  },
  {
    "id": 65,
    "topic": "Transformaciones",
    "themeId": 5,
    "question": "Si la matriz A asociada a T es invertible, entonces T es un isomorfismo. ¿Dónde se integra formalmente este vínculo?",
    "options": [
      "a) En el Teorema de Cayley-Hamilton.",
      "b) En el Teorema de Resumen.",
      "c) En la Regla de Cramer.",
      "d) En la Descomposición LU."
    ],
    "correct": 1,
    "explanation": "El \"Teorema de Resumen\" (pág. XII) une la invertibilidad de matrices con la biyectividad de transformaciones, integrando conceptos de los Capítulos 2, 3, 5 y 7."
  },
  {
    "id": 66,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Qué define matemáticamente a un valor característico λ de una matriz A?",
    "options": [
      "a) Un escalar tal que det(A - λI) = 0.",
      "b) La suma de los elementos de la diagonal principal.",
      "c) El inverso multiplicativo del determinante de A.",
      "d) El número de renglones linealmente independientes."
    ],
    "correct": 0,
    "explanation": "Según la Sección 8.1, los valores característicos son las raíces del polinomio característico, esenciales para entender la dinámica de sistemas lineales."
  },
  {
    "id": 67,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "El polinomio característico se obtiene mediante el cálculo de:",
    "options": [
      "a) La traza de la matriz aumentada.",
      "b) El determinante det(A - λI).",
      "c) La norma de Frobenius de la matriz A.",
      "d) El producto de los elementos de la última columna."
    ],
    "correct": 1,
    "explanation": "Esta ecuación característica es la herramienta técnica para hallar los escalares λ que permiten la diagonalización (Capítulo 8)."
  },
  {
    "id": 68,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Bajo qué condición técnica una matriz A de n x n es diagonalizable (Sección 8.3)?",
    "options": [
      "a) Cuando posee n valores propios iguales a 1.",
      "b) Cuando posee n vectores característicos linealmente independientes que forman una base.",
      "c) Cuando es una matriz estrictamente triangular superior.",
      "d) Cuando su determinante es nulo y su traza es positiva."
    ],
    "correct": 1,
    "explanation": "La existencia de una base de autovectores permite transformar A en una matriz diagonal D mediante semejanza. Grossman resalta que esto simplifica enormemente el cálculo de potencias matriciales."
  },
  {
    "id": 69,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Qué propiedad asegura la Sección 8.4 sobre las matrices simétricas reales?",
    "options": [
      "a) Siempre tienen valores propios complejos puros.",
      "b) Son siempre diagonalizables ortogonalmente.",
      "c) Su forma de Jordan es siempre una matriz de ceros.",
      "d) Solo pueden ser diagonalizadas si su rango es 1."
    ],
    "correct": 1,
    "explanation": "Las matrices simétricas tienen autovectores ortogonales para autovalores distintos, facilitando una diagonalización técnica mediante matrices ortogonales."
  },
  {
    "id": 70,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Cuál es la utilidad de la Forma Canónica de Jordan (Sección 8.6)?",
    "options": [
      "a) Clasificar matrices según su traza.",
      "b) Proporcionar una forma casi diagonal para matrices que no son diagonalizables.",
      "c) Calcular el volumen de paralelepípedos en Rn.",
      "d) Eliminar los valores propios nulos de una matriz singular."
    ],
    "correct": 1,
    "explanation": "Cuando no hay suficientes autovectores, la forma de Jordan es la estructura más simple alcanzable, siendo crucial para el estudio de sistemas dinámicos."
  },
  {
    "id": 71,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "La aplicación de la forma de Jordan descrita en la Sección 8.7 se centra en:",
    "options": [
      "a) El análisis de flujos de tráfico en redes urbanas.",
      "b) La resolución de sistemas de ecuaciones diferenciales lineales (x' = Ax).",
      "c) La optimización de procesos de manufactura textil.",
      "d) La codificación de señales de audio digital."
    ],
    "correct": 1,
    "explanation": "Reducir la matriz A a su forma de Jordan facilita hallar la matriz exponencial, clave para la solución de ecuaciones diferenciales matriciales."
  },
  {
    "id": 72,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "El Teorema de Cayley-Hamilton establece que:",
    "options": [
      "a) Toda matriz cuadrada satisface su propia ecuación característica.",
      "b) El determinante de A es la suma de sus valores propios.",
      "c) La transpuesta de L es siempre igual a U.",
      "d) Los autovalores son siempre números primos."
    ],
    "correct": 0,
    "explanation": "Es un resultado profundo de la teoría matricial (Sección 8.8) que permite, entre otras cosas, calcular potencias de matrices de forma eficiente."
  },
  {
    "id": 73,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿A qué figura histórica se le acredita en la fuente la creación del \"Álgebra de Matrices\"?",
    "options": [
      "a) Isaac Newton.",
      "b) Arthur Cayley.",
      "c) Wassily Leontief.",
      "d) Josiah Willard Gibbs."
    ],
    "correct": 1,
    "explanation": "La fuente (pág. XIV y 76) incluye una semblanza de Arthur Cayley, destacando su papel fundacional en el desarrollo del álgebra matricial a mediados del siglo XIX."
  },
  {
    "id": 74,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "El propósito técnico del teorema de los círculos de Gershgorin es:",
    "options": [
      "a) Hallar la inversa de matrices triangulares.",
      "b) Estimar y acotar la ubicación de los valores propios en el plano complejo.",
      "c) Definir la curvatura de una transformación lineal.",
      "d) Resolver el modelo de crecimiento de población de Leslie."
    ],
    "correct": 1,
    "explanation": "Mencionado en la Sección 8.8, permite localizar autovalores sin resolver el polinomio, basándose en los elementos de la matriz."
  },
  {
    "id": 75,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "Si dos matrices A y B son semejantes, ¿qué elemento del \"Teorema de Resumen\" se preserva?",
    "options": [
      "a) El orden de los elementos en cada renglón.",
      "b) El polinomio característico y, por ende, los valores propios.",
      "c) La diagonalización ortogonal obligatoria.",
      "d) La nulidad absoluta del kernel."
    ],
    "correct": 1,
    "explanation": "La semejanza preserva propiedades espectrales críticas. Este vínculo es parte de la progresión del \"Teorema de Resumen\" que atraviesa toda la obra (Secciones 2.4 a 8.1)."
  },
  {
    "id": 76,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "En el estudio de formas cuadráticas (Sección 8.5), los valores propios se utilizan para:",
    "options": [
      "a) Identificar y rotar los ejes de secciones cónicas.",
      "b) Calcular la densidad de población en modelos biológicos.",
      "c) Determinar la complejidad de un algoritmo de búsqueda.",
      "d) Normalizar los coeficientes de una regresión lineal."
    ],
    "correct": 0,
    "explanation": "El Teorema de los Ejes Principales emplea autovalores para eliminar términos mixtos (xy) en ecuaciones de segundo grado."
  },
  {
    "id": 77,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Qué representa el autovalor dominante en un modelo de crecimiento de población (Sección 8.2)?",
    "options": [
      "a) La población inicial total.",
      "b) La tasa de crecimiento a largo plazo de la población.",
      "c) El número de individuos en la etapa fértil.",
      "d) La varianza del error en el censo."
    ],
    "correct": 1,
    "explanation": "En la matriz de Leslie, el autovalor de mayor magnitud dicta el comportamiento asintótico del sistema biológico."
  },
  {
    "id": 78,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "¿Cuál fue el motivo de Grossman para incluir valores propios complejos en su obra?",
    "options": [
      "a) Por exigencia de los revisores técnicos de la séptima edición.",
      "b) Porque son esenciales para modelar fenómenos periódicos y evitar errores teóricos.",
      "c) Para aumentar la dificultad de los ejercicios de autoevaluación.",
      "d) Debido a que las matrices reales no poseen aplicaciones prácticas."
    ],
    "correct": 1,
    "explanation": "En el prefacio (pág. XVI), el autor argumenta que ignorarlos es un error, pues muchas matrices comunes los poseen y son vitales para modelos físicos reales."
  },
  {
    "id": 79,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "Una propiedad fundamental de los valores propios de una matriz simétrica real es que:",
    "options": [
      "a) Son siempre números complejos con parte real nula.",
      "b) Son todos números reales.",
      "c) Su suma es siempre igual a cero.",
      "d) Son siempre iguales a los elementos de la diagonal."
    ],
    "correct": 1,
    "explanation": "Esta garantía teórica es crucial para aplicaciones en física y geometría, asegurando resultados medibles en el mundo real."
  },
  {
    "id": 80,
    "topic": "Matriz y diagonalización",
    "themeId": 6,
    "question": "Según la versión final del \"Teorema de Resumen\", ¿qué implica que λ = 0 sea un valor propio de A?",
    "options": [
      "a) Que la matriz A es invertible.",
      "b) Que la matriz A es singular (no invertible).",
      "c) Que el sistema Ax = b tiene solución única para todo b.",
      "d) Que la matriz A es equivalente a la identidad."
    ],
    "correct": 1,
    "explanation": "Si λ = 0 es raíz del polinomio característico, det(A) = 0. Esto concluye la progresión del \"Teorema de Resumen\" (Secciones 2.4, 3.3, 5.4, 7.4 y 8.1), unificando todo el curso."
  }

];

const CONCEPT_NOTES = {
  'Relación': {
    label: 'Relación',
    meanings: [
      { 
        topic: 'Bases de Datos', 
        text: 'Estructura organizada en tablas con tuplas y atributos (Modelo Relacional).' 
      },
      { 
        topic: 'Álgebra Lineal', 
        text: 'Vínculo matemático entre variables, usualmente definido por una función o transformación entre espacios.' 
      }
    ],
    tip: 'No confunda la "tabla" informática con la "transformación" o dependencia lógica entre vectores.'
  },
  'Dimensión': {
    label: 'Dimensión',
    meanings: [
      { 
        topic: 'Espacios Vectoriales', 
        text: 'Propiedad de una base: número de vectores linealmente independientes que la componen.' 
      },
      { 
        topic: 'Matrices', 
        text: 'Tamaño físico del arreglo expresado como renglones por columnas (m x n).' 
      }
    ],
    tip: 'En espacios vectoriales es la cantidad de elementos en una base; en matrices es simplemente su orden.'
  },
  'Inconsistencia': {
    label: 'Inconsistencia',
    meanings: [
      { 
        topic: 'Sistemas de Ecuaciones', 
        text: 'Condición de un sistema que carece de soluciones comunes.' 
      }
    ],
    tip: 'Geométricamente, la inconsistencia se visualiza en rectas paralelas que nunca se cruzan (Ver Grossman, Fig 1.2).'
  },
};