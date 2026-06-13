-- =====================================================
-- BASE DE DATOS: CARTILLA DIGITAL INGA
-- =====================================================

CREATE DATABASE IF NOT EXISTS cartilladigitalinga
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cartilladigitalinga;

-- =====================================================
-- 1. USUARIOS (Auth: FormDataAuth + UsuarioComunidad)
-- =====================================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  google_id VARCHAR(255) NULL UNIQUE,
  auth_provider ENUM('local', 'google') DEFAULT 'local',
  password VARCHAR(255) NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar VARCHAR(10) DEFAULT '🌱',
  nivel ENUM('Nuevo', 'Aprendiz', 'Intermedio', 'Avanzado', 'Experta') DEFAULT 'Nuevo',
  frase VARCHAR(255) DEFAULT '',
  puntos INT DEFAULT 0,
  dias_seguidos INT DEFAULT 0,
  palabras_aprendidas INT DEFAULT 0,
  ultimo_acceso DATE DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. MODULOS DE APRENDIZAJE (Modulo)
-- =====================================================
CREATE TABLE modulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(30) NOT NULL UNIQUE,
  titulo VARCHAR(100) NOT NULL,
  icono VARCHAR(30) NOT NULL,
  color ENUM('emerald', 'green', 'amber', 'purple', 'pink') NOT NULL,
  descripcion TEXT NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  frase VARCHAR(255) NOT NULL,
  traduccion VARCHAR(255) NOT NULL
);

-- =====================================================
-- 3. ACTIVIDADES (ActividadCompletar | ActividadEmparejar)
-- =====================================================
CREATE TABLE actividades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modulo_id INT NOT NULL,
  tipo ENUM('completar', 'emparejar', 'verdadero_falso', 'ordenar') NOT NULL,
  pregunta TEXT NOT NULL,
  respuesta_correcta VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

-- Opciones para actividades tipo "completar"
CREATE TABLE actividad_opciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  orden INT DEFAULT 0,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Pares para actividades tipo "emparejar"
CREATE TABLE actividad_pares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT NOT NULL,
  inga VARCHAR(255) NOT NULL,
  espanol VARCHAR(255) NOT NULL,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Enunciados para actividades tipo "verdadero_falso"
CREATE TABLE actividad_vf (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT NOT NULL,
  enunciado TEXT NOT NULL,
  es_verdadero BOOLEAN NOT NULL,
  orden INT DEFAULT 0,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Fragmentos para actividades tipo "ordenar"
CREATE TABLE actividad_ordenar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actividad_id INT NOT NULL,
  fragmento VARCHAR(500) NOT NULL,
  orden_correcto INT NOT NULL,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Imágenes por módulo
CREATE TABLE modulo_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modulo_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt VARCHAR(255) NULL,
  caption TEXT NULL,
  orden INT DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

-- Secciones de contenido por módulo
CREATE TABLE modulo_secciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modulo_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NULL,
  tipo ENUM('texto', 'vocabulario', 'cultural', 'pronunciacion', 'gramatica') DEFAULT 'texto',
  orden INT DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

-- Audios por módulo
CREATE TABLE modulo_audios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modulo_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  descripcion TEXT NULL,
  orden INT DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. RETOS DIARIOS (RetoDiario)
-- =====================================================
CREATE TABLE retos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  puntos INT NOT NULL DEFAULT 0,
  dificultad ENUM('facil', 'medio', 'dificil') NOT NULL,
  categoria ENUM('vocabulario', 'conversacion', 'modulo', 'comunidad') NOT NULL,
  meta INT DEFAULT NULL,
  activo BOOLEAN DEFAULT TRUE
);

-- Progreso de retos por usuario por día
CREATE TABLE usuario_retos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  reto_id INT NOT NULL,
  fecha DATE NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  actual INT DEFAULT 0,
  progreso INT DEFAULT 0,
  completado_en TIMESTAMP NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (reto_id) REFERENCES retos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_reto_fecha (usuario_id, reto_id, fecha)
);

-- =====================================================
-- 5. PROGRESO DE MODULOS POR USUARIO
-- =====================================================
CREATE TABLE usuario_modulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  modulo_id INT NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  puntos_obtenidos INT DEFAULT 0,
  completado_en TIMESTAMP NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_modulo (usuario_id, modulo_id)
);

-- =====================================================
-- 6. RESPUESTAS DE ACTIVIDADES POR USUARIO
-- =====================================================
CREATE TABLE usuario_respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  actividad_id INT NOT NULL,
  respuesta VARCHAR(255) NOT NULL,
  es_correcta BOOLEAN NOT NULL,
  puntos_obtenidos INT DEFAULT 0,
  respondido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- =====================================================
-- 7. PUBLICACIONES DE COMUNIDAD (Publicacion)
-- =====================================================
CREATE TABLE publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  contenido TEXT NOT NULL,
  likes INT DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================================================
-- 8. COMENTARIOS EN PUBLICACIONES
-- =====================================================
CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  usuario_id INT NOT NULL,
  contenido TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================================================
-- 9. LIKES EN PUBLICACIONES
-- =====================================================
CREATE TABLE publicacion_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  usuario_id INT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_publicacion_usuario (publicacion_id, usuario_id)
);

-- =====================================================
-- 10. BANCO DE CONOCIMIENTO (vocabulario y textos culturales)
-- =====================================================
CREATE TABLE banco_vocabulario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  espanol VARCHAR(200) NOT NULL,
  inga VARCHAR(200) NOT NULL,
  categoria VARCHAR(50) DEFAULT 'general',
  modulo_id INT NULL,
  notas TEXT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL
);

CREATE TABLE banco_textos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  tipo ENUM('cancion', 'relato', 'dialogo', 'sentido_cultural', 'principio', 'frase') NOT NULL,
  contenido TEXT NOT NULL,
  modulo_id INT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL
);

-- =====================================================
-- 11. CONFIGURACIÓN GENERAL (clave–valor)
-- =====================================================
CREATE TABLE configuracion (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. SECCIONES DE LA CARTILLA DIGITAL (presentación)
-- =====================================================
CREATE TABLE cartilla_secciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  subtitulo VARCHAR(300) NULL,
  contenido TEXT NULL,
  imagen_url VARCHAR(500) NULL,
  imagen_alt VARCHAR(200) NULL,
  orden INT DEFAULT 0,
  link_url VARCHAR(500) NULL,
  tipo ENUM('banner', 'portada', 'presentacion', 'modulo', 'galeria', 'cierre') DEFAULT 'presentacion',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- =====================================================
-- USUARIOS
-- Admin: admin@cartillainga.com / Admin2026!
-- User demo: user@cartillainga.com / User2026!
-- =====================================================
INSERT INTO usuarios (nombre, email, password, role, avatar, nivel, frase, puntos) VALUES
  ('Administrador', 'admin@cartillainga.com',
   '$2b$10$4Zj4pJojIooaCn8X.Y.ipuGkbaK9m.2VhOElXyszN0GTrKYZJrqn2',
   'admin', '🦅', 'Experta', 'Nukanchipa atunkunapa inga rimai', 0),

  ('María Jacanamijoy', 'maria@example.com', '$2b$10$hash_placeholder_1',
   'user', '🌺', 'Experta', 'Iuiai puncha, ñucanchic runacuna', 320),
  ('Carlos Chindoy', 'carlos@example.com', '$2b$10$hash_placeholder_2',
   'user', '🦜', 'Avanzado', 'Sachapi causani sumacta', 280),
  ('Ana Tankamash', 'ana@example.com', '$2b$10$hash_placeholder_3',
   'user', '🌿', 'Intermedio', 'Iaku sumac ñucanchic', 195),
  ('Pedro Muchavisoy', 'pedro@example.com', '$2b$10$hash_placeholder_4',
   'user', '⛰️', 'Aprendiz', 'Ñuca iachacuni ingata', 150),
  ('Sofía Quinchoa', 'sofia@example.com', '$2b$10$hash_placeholder_5',
   'user', '🌸', 'Nuevo', 'Iuiai tutamanda', 98),
  ('Demo Usuario', 'user@cartillainga.com',
   '$2b$10$1SgvXCLukrEBtqK5qpOlpOMyHbgUWzNpY.KYjSqPCHiejMcTYked2',
   'user', '🌱', 'Nuevo', '', 0);

-- =====================================================
-- MÓDULOS (12 módulos de la Cartilla Digital Inga)
-- =====================================================
INSERT INTO modulos (clave, titulo, icono, color, descripcion, video_url, frase, traduccion) VALUES
  ('saludos',    'Saludos — Tupaikuna',                   'Heart',   'emerald',
   'El saludo es un acto de reconocimiento espiritual con la persona, el territorio y el cosmos. Aprende los saludos tradicionales del pueblo Inga.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Puangi', 'Buenos días'),

  ('cuerpo',     'Mi cuerpo — Nukapa Pitikuna',           'Star',    'green',
   'El cuerpo es un templo que se conecta con la naturaleza y el espíritu. Aprende las partes del cuerpo en lengua Inga.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Nukapa Pitikuna', 'Mi cuerpo'),

  ('familia',    'Mi familia — Nukanchipa Purakuna',      'Users',   'amber',
   'Para el pueblo Inga la familia incluye abuelos, sabedores y la naturaleza misma. Aprende los vínculos familiares y comunitarios en Inga.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Nukanchipa purakuna', 'Nuestra comunidad'),

  ('animales',   'Animales del territorio — Iuwarkuna',   'Leaf',    'purple',
   'Los animales son compañeros de vida y guardianes del territorio. Conoce sus nombres en lengua Inga, domésticos y salvajes.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Iuwarkuna', 'Los animales'),

  ('colores',    'Los colores — Awidirukuna',             'Palette', 'pink',
   'Los colores tienen significados espirituales, naturales y emocionales. Aprende a mirar el mundo con ojos Inga.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Awidirukuna', 'Los colores'),

  ('numeros',    'Los números — Iupaikuna',               'Hash',    'emerald',
   'Contar es reconocer la abundancia de la naturaleza y la memoria de los ancestros. Aprende a contar del 0 al 1.000 en Inga.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Iupaikuna', 'Los números'),

  ('territorio', 'Nuestro territorio — Nukanchipa Alpa',  'Mountain','green',
   'El territorio es sagrado. Cada río, montaña y sendero tienen un nombre que es memoria viva. Aprende a nombrar el territorio.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Nukanchipa alpa', 'Nuestro territorio'),

  ('vestido',    'Vestido y accesorios — Churaringa',     'Star',    'amber',
   'El vestido Inga refleja la cosmovisión, el equilibrio y el sentido comunitario. Aprende el vocabulario del traje tradicional.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Warmi churaringa', 'Vestido tradicional'),

  ('alimentos',  'Plantas y alimentos — Ambikuna',        'Sprout',  'purple',
   'Los alimentos son expresión de reciprocidad con la Madre Tierra. Aprende los nombres de comidas propias y plantas medicinales.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Ambikuna, mikuikuna', 'Plantas y alimentos'),

  ('juegos',     'Juegos y canciones — Pugllaikuna',      'Music',   'pink',
   'Jugar es una forma ancestral de aprender y crecer. Conoce los juegos y canciones tradicionales en lengua Inga.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Pugllaikuna', 'Juegos tradicionales'),

  ('casa',       'Nuestra casa — Nukanchipa Wasi',        'Home',    'emerald',
   'La casa es el primer espacio pedagógico y el fogón el centro espiritual donde se siembra la palabra. Aprende el vocabulario del hogar.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Nukanchipa wasi', 'Nuestra casa'),

  ('cuentos',    'Cuentos y relatos — Parlaikuna',        'Book',    'green',
   'Contar cuentos en lengua propia es sembrar memoria en los corazones. Escucha y aprende las narraciones ancestrales del pueblo Inga.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Parlaikuna', 'Narraciones ancestrales');

-- =====================================================
-- ACTIVIDADES (una por módulo, IDs 1–12 en orden de inserción)
-- =====================================================
INSERT INTO actividades (modulo_id, tipo, pregunta, respuesta_correcta) VALUES
  (1,  'emparejar', 'Empareja cada saludo en Inga con su significado en español:',          NULL),
  (2,  'emparejar', 'Empareja cada parte del cuerpo en Inga con su nombre en español:',     NULL),
  (3,  'completar', '¿Cómo se dice "papá" en lengua Inga?',                                 'Taita'),
  (4,  'emparejar', 'Empareja cada animal con su nombre en lengua Inga:',                   NULL),
  (5,  'emparejar', 'Empareja cada color en Inga con su traducción en español:',            NULL),
  (6,  'completar', '¿Cómo se dice "cinco" en lengua Inga?',                                'Pichka'),
  (7,  'emparejar', 'Empareja cada elemento del territorio con su nombre en Inga:',         NULL),
  (8,  'emparejar', 'Empareja cada prenda o accesorio con su nombre en Inga:',              NULL),
  (9,  'emparejar', 'Empareja cada alimento o planta con su nombre en lengua Inga:',        NULL),
  (10, 'emparejar', 'Empareja cada acción con su nombre en lengua Inga:',                   NULL),
  (11, 'emparejar', 'Empareja cada elemento del hogar con su nombre en lengua Inga:',       NULL),
  (12, 'completar', '¿Cómo se dice "tierra" en lengua Inga?',                               'Alpa');

-- =====================================================
-- PARES (módulos con actividad tipo emparejar)
-- =====================================================

-- Módulo 1 — Saludos (actividad_id = 1)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (1, 'Puangi',        'Buenos días'),
  (1, 'Chisiapuangi',  'Buenas tardes'),
  (1, 'Imasata kangi', '¿Cómo estás?'),
  (1, 'Sumaglla kani', 'Estoy bien'),
  (1, 'Kawanakungapa', 'Nos vemos');

-- Módulo 2 — Mi cuerpo (actividad_id = 2)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (2, 'Uma',   'Cabeza'),
  (2, 'Ñawi',  'Ojo'),
  (2, 'Simi',  'Boca'),
  (2, 'Maki',  'Mano'),
  (2, 'Chaki', 'Pie');

-- Módulo 4 — Animales (actividad_id = 4)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (4, 'Alku',     'Perro'),
  (4, 'Mishi',    'Gato'),
  (4, 'Wagra',    'Vaca'),
  (4, 'Atawalpa', 'Gallina'),
  (4, 'Kuchi',    'Cerdo');

-- Módulo 5 — Colores (actividad_id = 5)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (5, 'Puka',   'Rojo'),
  (5, 'Killu',  'Amarillo'),
  (5, 'Chilka', 'Verde'),
  (5, 'Iura',   'Blanco'),
  (5, 'Iana',   'Negro');

-- Módulo 7 — Territorio (actividad_id = 7)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (7, 'Atun iaku', 'Río'),
  (7, 'Sachuku',   'Montaña'),
  (7, 'Indi',      'Sol'),
  (7, 'Killa',     'Luna'),
  (7, 'Rumi',      'Piedra');

-- Módulo 8 — Vestido y accesorios (actividad_id = 8)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (8, 'Pacha',     'Falda (mujeres)'),
  (8, 'Kusma',     'Túnica (hombres)'),
  (8, 'Chumbi',    'Faja'),
  (8, 'Llautu',    'Corona de plumas'),
  (8, 'Walkakuna', 'Collares');

-- Módulo 9 — Plantas y alimentos (actividad_id = 9)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (9, 'Rumu',      'Yuca'),
  (9, 'Sara',      'Maíz'),
  (9, 'Uchu',      'Ají'),
  (9, 'Chalwa',    'Pez'),
  (9, 'Sara aswa', 'Chicha de maíz');

-- Módulo 10 — Juegos y canciones (actividad_id = 10)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (10, 'Pugllai', 'Jugar'),
  (10, 'Taki',    'Cantar'),
  (10, 'Muiuri',  'Bailar'),
  (10, 'Kalpai',  'Correr'),
  (10, 'Waitai',  'Nadar');

-- Módulo 11 — Nuestra casa (actividad_id = 11)
INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES
  (11, 'Wasi',   'Casa'),
  (11, 'Tulpa',  'Fogón'),
  (11, 'Pungu',  'Puerta'),
  (11, 'Kancha', 'Patio'),
  (11, 'Puñui',  'Dormir');

-- =====================================================
-- OPCIONES (módulos con actividad tipo completar)
-- =====================================================

-- Módulo 3 — Mi familia (actividad_id = 3): ¿Cómo se dice "papá"?
INSERT INTO actividad_opciones (actividad_id, texto, orden) VALUES
  (3, 'Taita', 1),
  (3, 'Mama',  2),
  (3, 'Wauki', 3),
  (3, 'Ñaña',  4);

-- Módulo 6 — Números (actividad_id = 6): ¿Cómo se dice "cinco"?
INSERT INTO actividad_opciones (actividad_id, texto, orden) VALUES
  (6, 'Pichka', 1),
  (6, 'Kimsa',  2),
  (6, 'Iskai',  3),
  (6, 'Chusku', 4);

-- Módulo 12 — Cuentos (actividad_id = 12): ¿Cómo se dice "tierra"?
INSERT INTO actividad_opciones (actividad_id, texto, orden) VALUES
  (12, 'Alpa',  1),
  (12, 'Iaku',  2),
  (12, 'Sacha', 3),
  (12, 'Ñambi', 4);

-- Retos diarios
INSERT INTO retos (titulo, descripcion, puntos, dificultad, categoria, meta) VALUES
  ('Saluda a 3 personas en Inga',
   'Practica los saludos básicos con amigos o familia usando expresiones en lengua Inga.',
   15, 'facil', 'conversacion', 3),
  ('Aprende 5 palabras nuevas',
   'Memoriza cinco nuevas palabras del vocabulario Inga y sus significados en español.',
   20, 'medio', 'vocabulario', 5),
  ('Completa un módulo completo',
   'Termina todas las actividades de un módulo de aprendizaje para ganar puntos extra.',
   30, 'dificil', 'modulo', 1),
  ('Comparte en la comunidad',
   'Publica un mensaje o responde a un compañero en la sección de comunidad.',
   10, 'facil', 'comunidad', 1),
  ('Practica la pronunciación',
   'Repite en voz alta 3 frases del módulo de saludos para mejorar tu pronunciación.',
   25, 'medio', 'conversacion', 3);

-- Publicaciones de ejemplo
INSERT INTO publicaciones (usuario_id, contenido, likes, creado_en) VALUES
  (1, '¡Acabo de completar el módulo de Plantas y alimentos! 🌿 Aprendí que ''Sara aswa'' es chicha de maíz y ''Aiawaska'' es el yagé sagrado de nuestros mayores.', 24, NOW() - INTERVAL 2 HOUR),
  (2, 'Hoy practiqué los saludos: ''Puangi'' (buenos días) y ''Sumaglla kani'' (estoy bien). Se siente muy bonito saludar en nuestra propia lengua. 💚', 18, NOW() - INTERVAL 5 HOUR),
  (3, 'Mi abuela me enseñó hoy ''Imasata kangi'' (¿Cómo estás?). ¡Es hermoso combinar lo que aprendo aquí con sus enseñanzas! 🙏', 31, NOW() - INTERVAL 1 DAY);

-- =====================================================
-- BANCO DE VOCABULARIO (espanol ↔ inga por módulo)
-- =====================================================
INSERT INTO banco_vocabulario (espanol, inga, categoria, modulo_id) VALUES
-- Módulo 1: Saludos
('Buenos días',   'Puangi',           'saludo', 1),
('Buenas tardes', 'Chisiapuangi',     'saludo', 1),
('Buenas noches', 'Tuaiapuangi',      'saludo', 1),
('¿Cómo estás?',  'Imasata kangi',    'saludo', 1),
('Estoy bien',    'Sumaglla kani',    'saludo', 1),
('Nos vemos',     'Kawanakungapa',    'saludo', 1),
('Gracias',       'Pagui',            'saludo', 1),
('De nada',       'Mana imamanta',    'saludo', 1),
('Bienvenido',    'Shamugui',         'saludo', 1),
('Hasta pronto',  'Rinilla',          'saludo', 1),
-- Módulo 2: Mi cuerpo
('Cabeza',  'Uma',       'cuerpo', 2),
('Ojo',     'Ñawi',      'cuerpo', 2),
('Boca',    'Simi',      'cuerpo', 2),
('Mano',    'Maki',      'cuerpo', 2),
('Pie',     'Chaki',     'cuerpo', 2),
('Nariz',   'Sinchi',    'cuerpo', 2),
('Oreja',   'Rinri',     'cuerpo', 2),
('Brazo',   'Macu',      'cuerpo', 2),
('Corazón', 'Shungu',    'cuerpo', 2),
('Diente',  'Kiru',      'cuerpo', 2),
('Cabello', 'Akcha',     'cuerpo', 2),
-- Módulo 3: Familia
('Papá',         'Taita',     'familia', 3),
('Mamá',         'Mama',      'familia', 3),
('Hijo',         'Churi',     'familia', 3),
('Hija',         'Ususi',     'familia', 3),
('Abuelo',       'Apu taita', 'familia', 3),
('Abuela',       'Apu mama',  'familia', 3),
('Hermano',      'Wauki',     'familia', 3),
('Hermana',      'Ñaña',      'familia', 3),
('Esposo',       'Kari',      'familia', 3),
('Esposa',       'Warmi',     'familia', 3),
('Familia',      'Ayllu',     'familia', 3),
('Comunidad',    'Purakuna',  'familia', 3),
-- Módulo 4: Animales
('Perro',           'Alku',     'animal', 4),
('Gato',            'Mishi',    'animal', 4),
('Vaca',            'Wagra',    'animal', 4),
('Gallina',         'Atawalpa', 'animal', 4),
('Cerdo',           'Kuchi',    'animal', 4),
('Caballo',         'Kawalla',  'animal', 4),
('Pez',             'Chalwa',   'animal', 4),
('Loro',            'Luritu',   'animal', 4),
('Serpiente',       'Amarun',   'animal', 4),
('Oso hormiguero',  'Ukuku',    'animal', 4),
('Mono',            'Kuchillo', 'animal', 4),
-- Módulo 5: Colores
('Rojo',    'Puka',       'color', 5),
('Amarillo','Killu',      'color', 5),
('Verde',   'Chilka',     'color', 5),
('Blanco',  'Iura',       'color', 5),
('Negro',   'Iana',       'color', 5),
('Azul',    'Ankas',      'color', 5),
('Morado',  'Puka iana',  'color', 5),
('Naranja', 'Killu puka', 'color', 5),
('Café',    'Allpa killu','color', 5),
-- Módulo 6: Números
('Cero',   'Chusak',       'numero', 6),
('Uno',    'Shuk',         'numero', 6),
('Dos',    'Iskai',        'numero', 6),
('Tres',   'Kimsa',        'numero', 6),
('Cuatro', 'Chusku',       'numero', 6),
('Cinco',  'Pichka',       'numero', 6),
('Seis',   'Sukta',        'numero', 6),
('Siete',  'Kanchis',      'numero', 6),
('Ocho',   'Pusak',        'numero', 6),
('Nueve',  'Iskun',        'numero', 6),
('Diez',   'Chunka',       'numero', 6),
('Veinte', 'Iskai chunka', 'numero', 6),
('Cien',   'Pachak',       'numero', 6),
('Mil',    'Waranka',      'numero', 6),
-- Módulo 7: Territorio
('Río',      'Atun iaku', 'territorio', 7),
('Montaña',  'Sachuku',   'territorio', 7),
('Sol',      'Indi',      'territorio', 7),
('Luna',     'Killa',     'territorio', 7),
('Piedra',   'Rumi',      'territorio', 7),
('Tierra',   'Alpa',      'territorio', 7),
('Agua',     'Iaku',      'territorio', 7),
('Selva',    'Sacha',     'territorio', 7),
('Camino',   'Ñambi',     'territorio', 7),
('Lluvia',   'Para',      'territorio', 7),
('Estrella', 'Killanchi', 'territorio', 7),
('Viento',   'Wayra',     'territorio', 7),
-- Módulo 8: Vestido y accesorios
('Falda',            'Pacha',          'vestido', 8),
('Túnica',           'Kusma',          'vestido', 8),
('Faja',             'Chumbi',         'vestido', 8),
('Corona de plumas', 'Llautu',         'vestido', 8),
('Collares',         'Walkakuna',      'vestido', 8),
('Aretes',           'Rinri walkakuna','vestido', 8),
('Mochila',          'Ichi',           'vestido', 8),
('Sombrero',         'Umarina',        'vestido', 8),
-- Módulo 9: Plantas y alimentos
('Yuca',             'Rumu',     'alimento', 9),
('Maíz',             'Sara',     'alimento', 9),
('Ají',              'Uchu',     'alimento', 9),
('Chicha de maíz',   'Sara aswa','alimento', 9),
('Plátano',          'Patan',    'alimento', 9),
('Yagé',             'Aiawaska', 'alimento', 9),
('Guayusa',          'Wayusa',   'alimento', 9),
('Cacao',            'Kakaw',    'alimento', 9),
('Carne',            'Aichana',  'alimento', 9),
('Planta medicinal', 'Samincha', 'alimento', 9),
-- Módulo 10: Juegos y canciones
('Jugar',    'Pugllai',   'juego', 10),
('Cantar',   'Taki',      'juego', 10),
('Bailar',   'Muiuri',    'juego', 10),
('Correr',   'Kalpai',    'juego', 10),
('Nadar',    'Waitai',    'juego', 10),
('Enseñar',  'Iachachi',  'juego', 10),
('Aprender', 'Iachakui',  'juego', 10),
('Fiesta',   'Ista',      'juego', 10),
('Música',   'Taki taki', 'juego', 10),
-- Módulo 11: Nuestra casa
('Casa',   'Wasi',        'hogar', 11),
('Fogón',  'Tulpa',       'hogar', 11),
('Puerta', 'Pungu',       'hogar', 11),
('Patio',  'Kancha',      'hogar', 11),
('Cama',   'Puñuna',      'hogar', 11),
('Cocina', 'Mikuna wasi', 'hogar', 11),
('Leña',   'Kinti',       'hogar', 11),
('Escoba', 'Pichana',     'hogar', 11),
('Huerta', 'Muyu kancha', 'hogar', 11),
-- Módulo 12: Cuentos y relatos
('Cuento',       'Parlaikuna', 'narrativa', 12),
('Historia',     'Rimaikuna',  'narrativa', 12),
('Noche',        'Tuta',       'narrativa', 12),
('Día',          'Puncha',     'narrativa', 12),
('Anciano sabio','Rucu',       'narrativa', 12),
('Palabra',      'Simi',       'narrativa', 12),
('Memoria',      'Yuyai',      'narrativa', 12),
('Espíritu',     'Samai',      'narrativa', 12),
('Saber',        'Iachaikuna', 'narrativa', 12);

-- =====================================================
-- BANCO DE TEXTOS CULTURALES
-- =====================================================
INSERT INTO banco_textos (titulo, tipo, contenido, modulo_id) VALUES
('Puangi Muyuy — Canción del amanecer', 'cancion',
'Puangi, puangi, indi lluksimun,
nukanchipa alpapi kawsaikuna.
Puangi, puangi, iaku takimun,
nukanchipa simimpi parlaikuna.

(Buenos días, buenos días, el sol sale,
en nuestra tierra vivimos.
Buenos días, buenos días, el agua canta,
en nuestra lengua hablamos.)', 1),

('Iupaikuna — Canción de los números', 'cancion',
'Shuk, iskai, kimsa, chusku, pichka,
nukanchipa iupaikuna.
Sukta, kanchis, pusak, iskun, chunka,
nukanchipa rimai kuna.

(Uno, dos, tres, cuatro, cinco,
nuestros números.
Seis, siete, ocho, nueve, diez,
nuestras palabras contadas.)', 6),

('Ayllu Takikuna — Canción de la familia', 'cancion',
'Taita, mama, wauki, ñaña,
ayllu nukanchipa.
Apu taita, apu mama,
sabiduria nukanchipa.

(Padre, madre, hermano, hermana,
nuestra familia.
Abuelo sabio, abuela sabia,
nuestra sabiduría.)', 3),

('Killa ima Indi — La luna y el sol', 'relato',
'Killa ima ñukanchi nishka:
"Puncha puncha indi kawsaipim,
tuta tutapi ñukam kawsani,
nukanchipa alpata iluminani."
Indi nishka: "Ñukanchim kawsanchis,
runa mashis, tuta puncha."

(La luna dijo a nuestra gente:
"Cada día el sol vive,
cada noche yo vivo,
alumbramos nuestra tierra juntos."
El sol respondió: "Vivimos juntos,
somos hermanos, noche y día.")', 7),

('El fogón — Sentido del Tulpa', 'sentido_cultural',
'Tulpapi kawsai sapi tiyan.
Tulpa warmipim, tulpam kariy,
tulpapi mikuna wachay,
tulpapi simi iachakuy.
Tulpa nukanchipa shungu.

El fogón (Tulpa) es el corazón de la casa Inga.
Alrededor del fogón se prepara el alimento,
se transmite la palabra, se enseña la lengua,
se comparte el calor de la comunidad.
Es mujer, es dar, es vida.', 11),

('Tupaikuna — Diálogo de saludo básico', 'dialogo',
'A: Puangi! Imasata kangi?
B: Sumaglla kani, pagui. Imasata kangi?
A: Sumaglla kani. Maita ringi?
B: Wasi mani rini.
A: Sumag. Kawanakungapa!
B: Kawanakungapa!

---
A: Buenos días. ¿Cómo estás?
B: Estoy bien, gracias. ¿Cómo estás?
A: Estoy bien. ¿Adónde vas?
B: A mi casa voy.
A: Bien. ¡Hasta luego!
B: ¡Hasta luego!', 1),

('Nukanchipa Simi — El valor de la lengua propia', 'principio',
'Nukanchipa simi ñukanchi kawsai.
La lengua propia es vida del pueblo.
Quien habla su lengua vive dos veces:
una vez en este mundo y otra en el corazón de sus ancestros.

Hablar Inga es sembrar memoria,
es reconocer la tierra, el río y el viento
como maestros ancestrales.
Cada palabra en Inga es una semilla.', NULL);

-- =====================================================
-- CONFIGURACIÓN INICIAL (Cloudinary vacío)
-- =====================================================
INSERT INTO configuracion (clave, valor) VALUES
  ('cloudinary_cloud_name', ''),
  ('cloudinary_api_key',    ''),
  ('cloudinary_api_secret', '');

-- =====================================================
-- SECCIONES DE LA CARTILLA (portada, módulos, cierre)
-- =====================================================
INSERT INTO cartilla_secciones (titulo, subtitulo, contenido, tipo, orden) VALUES
('Cartilla Digital Inga',
 'Nukanchipa simi — Nuestra lengua viva',
 'Bienvenido a la Cartilla Digital del Pueblo Inga de Mocoa, Putumayo. Una herramienta pedagógica viva para preservar, transmitir y fortalecer la lengua Inga para las nuevas generaciones.',
 'portada', 0),

('Quiénes somos — Nukanchipa Kawsai',
 'El pueblo Inga de Mocoa, Putumayo',
 'El pueblo Inga habita el piedemonte amazónico del Putumayo. Guardamos una lengua propia —el inga— perteneciente a la familia lingüística quechua. Nuestra cosmovisión reconoce la naturaleza como maestra y la comunidad como familia.',
 'presentacion', 1),

('Saludos — Tupaikuna',
 'Puangi — Buenos días',
 'El saludo es un acto de reconocimiento espiritual con la persona, el territorio y el cosmos. Aprende los saludos tradicionales del pueblo Inga.',
 'modulo', 2),

('Mi cuerpo — Nukapa Pitikuna',
 'Nukapa Pitikuna — Mi cuerpo',
 'El cuerpo es un templo que se conecta con la naturaleza y el espíritu. Aprende las partes del cuerpo en lengua Inga.',
 'modulo', 3),

('Mi familia — Nukanchipa Purakuna',
 'Nukanchipa purakuna — Nuestra comunidad',
 'Para el pueblo Inga la familia incluye abuelos, sabedores y la naturaleza misma. Aprende los vínculos familiares y comunitarios en Inga.',
 'modulo', 4),

('Animales del territorio — Iuwarkuna',
 'Iuwarkuna — Los animales',
 'Los animales son compañeros de vida y guardianes del territorio. Conoce sus nombres en lengua Inga, domésticos y salvajes.',
 'modulo', 5),

('Los colores — Awidirukuna',
 'Awidirukuna — Los colores',
 'Los colores tienen significados espirituales, naturales y emocionales. Aprende a mirar el mundo con ojos Inga.',
 'modulo', 6),

('Los números — Iupaikuna',
 'Iupaikuna — Los números',
 'Contar es reconocer la abundancia de la naturaleza y la memoria de los ancestros. Aprende a contar del 0 al 1.000 en Inga.',
 'modulo', 7),

('Nuestro territorio — Nukanchipa Alpa',
 'Nukanchipa alpa — Nuestro territorio',
 'El territorio es sagrado. Cada río, montaña y sendero tienen un nombre que es memoria viva. Aprende a nombrar el territorio.',
 'modulo', 8),

('Vestido y accesorios — Churaringa',
 'Warmi churaringa — Vestido tradicional',
 'El vestido Inga refleja la cosmovisión, el equilibrio y el sentido comunitario. Aprende el vocabulario del traje tradicional.',
 'modulo', 9),

('Plantas y alimentos — Ambikuna',
 'Ambikuna, mikuikuna — Plantas y alimentos',
 'Los alimentos son expresión de reciprocidad con la Madre Tierra. Aprende los nombres de comidas propias y plantas medicinales.',
 'modulo', 10),

('Juegos y canciones — Pugllaikuna',
 'Pugllaikuna — Juegos tradicionales',
 'Jugar es una forma ancestral de aprender y crecer. Conoce los juegos y canciones tradicionales en lengua Inga.',
 'modulo', 11),

('Nuestra casa — Nukanchipa Wasi',
 'Nukanchipa wasi — Nuestra casa',
 'La casa es el primer espacio pedagógico y el fogón el centro espiritual donde se siembra la palabra. Aprende el vocabulario del hogar.',
 'modulo', 12),

('Cuentos y relatos — Parlaikuna',
 'Parlaikuna — Narraciones ancestrales',
 'Contar cuentos en lengua propia es sembrar memoria en los corazones. Escucha y aprende las narraciones ancestrales del pueblo Inga.',
 'modulo', 13),

('Sigamos aprendiendo — Nukanchipa Inga',
 'Inga kausai sumak tiyan — La vida Inga es hermosa',
 'Esta cartilla es solo el comienzo de un camino hermoso hacia nuestra lengua. Te invitamos a seguir aprendiendo, a hablar con los mayores, a cantar en Inga y a llevar la palabra viva en tu corazón.',
 'cierre', 14);

-- =====================================================
-- VISTAS UTILES
-- =====================================================

-- Top aprendices (para TopAprendices component)
CREATE VIEW v_top_aprendices AS
SELECT id, nombre, avatar, puntos, nivel, frase
FROM usuarios
ORDER BY puntos DESC
LIMIT 5;

-- Retos del día para un usuario (con progreso)
CREATE VIEW v_retos_diarios AS
SELECT
  r.id,
  r.titulo,
  r.descripcion,
  r.puntos,
  r.dificultad,
  r.categoria,
  r.meta,
  ur.usuario_id,
  COALESCE(ur.completado, FALSE) AS completado,
  COALESCE(ur.actual, 0) AS actual,
  COALESCE(ur.progreso, 0) AS progreso
FROM retos r
LEFT JOIN usuario_retos ur ON r.id = ur.reto_id AND ur.fecha = CURDATE()
WHERE r.activo = TRUE;

-- Publicaciones con datos de usuario (para PostCard)
CREATE VIEW v_publicaciones AS
SELECT
  p.id,
  u.nombre AS usuario,
  u.avatar,
  p.contenido,
  p.likes,
  (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS comentarios,
  p.creado_en
FROM publicaciones p
JOIN usuarios u ON p.usuario_id = u.id
ORDER BY p.creado_en DESC;
