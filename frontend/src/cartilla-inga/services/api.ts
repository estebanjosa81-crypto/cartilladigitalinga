const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getToken = (): string | null => localStorage.getItem('token');

const headers = (withAuth = false): HeadersInit => {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data as T;
};

// ============= AUTH =============

export interface LoginResponse {
  token: string;
  usuario: UsuarioAPI;
}

export interface UsuarioAPI {
  id: number;
  nombre: string;
  email: string;
  avatar: string;
  nivel: string;
  role?: string;
  puntos: number;
  frase?: string;
  dias_seguidos?: number;
  palabras_aprendidas?: number;
}

export const authAPI = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password })
    }),

  registro: (nombre: string, email: string, password: string) =>
    request<LoginResponse>('/auth/registro', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nombre, email, password })
    }),

  googleLogin: (credential: string) =>
    request<LoginResponse>('/auth/google', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ credential })
    }),

  perfil: () =>
    request<UsuarioAPI>('/auth/perfil', { headers: headers(true) }),
};

// ============= USUARIOS =============

export const usuariosAPI = {
  top: () =>
    request<UsuarioAPI[]>('/usuarios/top', { headers: headers() }),

  activos: () =>
    request<{ total: number }>('/usuarios/activos', { headers: headers() }),

  stats: (id: number) =>
    request<{ puntos: number; dias_seguidos: number; palabras_aprendidas: number; modulos_total: number }>(
      `/usuarios/${id}/stats`, { headers: headers() }
    ),
};

// ============= MODULOS =============

export interface ActividadPublicaAPI {
  id: number;
  tipo: 'completar' | 'emparejar' | 'verdadero_falso' | 'ordenar';
  pregunta: string;
  respuesta_correcta?: string | null;
  opciones?: { id: number; texto: string; orden: number }[];
  pares?: { id: number; inga: string; espanol: string }[];
  enunciados_vf?: { id: number; enunciado: string; es_verdadero: boolean; orden: number }[];
  fragmentos_ordenar?: { id: number; fragmento: string; orden_correcto: number }[];
}

export interface ModuloImagenPublicaAPI {
  id: number;
  url: string;
  alt: string | null;
  caption: string | null;
  orden: number;
}

export interface ModuloSeccionPublicaAPI {
  id: number;
  titulo: string;
  contenido: string | null;
  tipo: 'texto' | 'vocabulario' | 'cultural' | 'pronunciacion' | 'gramatica';
  orden: number;
}

export interface ModuloAudioPublicaAPI {
  id: number;
  titulo: string;
  url: string;
  descripcion: string | null;
  orden: number;
}

export interface ModuloAPI {
  id: number;
  clave: string;
  titulo: string;
  icono: string;
  color: string;
  descripcion: string;
  video_url: string;
  frase: string;
  traduccion: string;
  actividad?: ActividadAPI;
  actividades?: ActividadPublicaAPI[];
  imagenes?: ModuloImagenPublicaAPI[];
  secciones?: ModuloSeccionPublicaAPI[];
  audios?: ModuloAudioPublicaAPI[];
}

export interface ActividadAPI {
  tipo: 'completar' | 'emparejar';
  pregunta: string;
  respuestaCorrecta?: string;
  opciones?: string[];
  pares?: { id: number; inga: string; espanol: string }[];
}

export interface RespuestaAPI {
  correcta: boolean;
  puntos_obtenidos: number;
  puntos_totales: number;
}

// ============= TRADUCTOR =============

export interface ResultadoTraductorAPI {
  id: number;
  espanol: string;
  inga: string;
  categoria: string;
  notas: string | null;
  coincide: 'espanol' | 'inga';
}

export const traductorAPI = {
  buscar: (q: string) =>
    request<{ resultados: ResultadoTraductorAPI[]; total: number }>(
      `/vocabulario/buscar?q=${encodeURIComponent(q)}`,
      { headers: headers() }
    ),
};

export const modulosAPI = {
  listar: () =>
    request<ModuloAPI[]>('/modulos', { headers: headers() }),

  obtener: (clave: string) =>
    request<ModuloAPI>(`/modulos/${clave}`, { headers: headers() }),

  responder: (clave: string, respuesta: string) =>
    request<RespuestaAPI>(`/modulos/${clave}/responder`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ respuesta })
    }),
};

// ============= RETOS =============

export interface RetoAPI {
  id: number;
  titulo: string;
  descripcion: string;
  puntos: number;
  dificultad: 'facil' | 'medio' | 'dificil';
  categoria: 'vocabulario' | 'conversacion' | 'modulo' | 'comunidad';
  meta: number | null;
  completado: boolean;
  actual: number;
  progreso: number;
}

export const retosAPI = {
  listar: () =>
    request<RetoAPI[]>('/retos', { headers: headers(true) }),
};

// ============= COMUNIDAD =============

export interface PublicacionAPI {
  id: number;
  usuario: string;
  avatar: string;
  contenido: string;
  likes: number;
  comentarios: number;
  creado_en: string;
}

export interface ComentarioAPI {
  id: number;
  usuario: string;
  avatar: string;
  contenido: string;
  creado_en: string;
}

export const comunidadAPI = {
  listarPublicaciones: () =>
    request<PublicacionAPI[]>('/comunidad/publicaciones', { headers: headers() }),

  crearPublicacion: (contenido: string) =>
    request<PublicacionAPI>('/comunidad/publicaciones', {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ contenido })
    }),

  toggleLike: (id: number) =>
    request<{ likes: number; liked: boolean }>(`/comunidad/publicaciones/${id}/like`, {
      method: 'POST',
      headers: headers(true),
    }),

  listarComentarios: (id: number) =>
    request<ComentarioAPI[]>(`/comunidad/publicaciones/${id}/comentarios`, { headers: headers() }),

  crearComentario: (id: number, contenido: string) =>
    request<ComentarioAPI>(`/comunidad/publicaciones/${id}/comentarios`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ contenido })
    }),
};

// ============= ADMIN =============

export interface AdminStatsAPI {
  total_usuarios: number;
  usuarios_activos_hoy: number;
  modulos_completados: number;
  total_publicaciones: number;
  puntos_totales: number;
  total_modulos: number;
}

export interface AdminUsuarioAPI {
  id: number;
  nombre: string;
  email: string;
  avatar: string;
  nivel: string;
  role: string;
  puntos: number;
  dias_seguidos: number;
  palabras_aprendidas: number;
  ultimo_acceso: string | null;
  creado_en: string;
  modulos_completados: number;
}

export interface AdminModuloAPI {
  id: number;
  clave: string;
  titulo: string;
  icono: string;
  color: string;
  descripcion: string;
  video_url: string;
  frase: string;
  traduccion: string;
  completados: number;
  tiene_actividad: boolean;
}

export interface AdminActividadAPI {
  id: number;
  modulo_id: number;
  tipo: 'completar' | 'emparejar' | 'verdadero_falso' | 'ordenar';
  pregunta: string;
  respuesta_correcta?: string;
  opciones?: { id: number; texto: string; orden: number }[];
  pares?: { id: number; inga: string; espanol: string }[];
  enunciados_vf?: { id: number; enunciado: string; es_verdadero: boolean; orden: number }[];
  fragmentos_ordenar?: { id: number; fragmento: string; orden_correcto: number }[];
}

export interface ModuloImagenAPI {
  id: number;
  modulo_id: number;
  url: string;
  alt: string | null;
  caption: string | null;
  orden: number;
  creado_en: string;
}

export interface ModuloSeccionAPI {
  id: number;
  modulo_id: number;
  titulo: string;
  contenido: string | null;
  tipo: 'texto' | 'vocabulario' | 'cultural' | 'pronunciacion' | 'gramatica';
  orden: number;
  creado_en: string;
}

export interface ModuloAudioAPI {
  id: number;
  modulo_id: number;
  titulo: string;
  url: string;
  descripcion: string | null;
  orden: number;
  creado_en: string;
}

export interface AdminPublicacionAPI extends PublicacionAPI {
  email: string;
}

export interface BancoVocabAPI {
  id: number;
  espanol: string;
  inga: string;
  categoria: string;
  modulo_id: number | null;
  notas: string | null;
  creado_en: string;
}

export interface BancoTextoAPI {
  id: number;
  titulo: string;
  tipo: 'cancion' | 'relato' | 'dialogo' | 'sentido_cultural' | 'principio' | 'frase';
  contenido: string;
  modulo_id: number | null;
  creado_en: string;
}

export const adminAPI = {
  getStats: () =>
    request<AdminStatsAPI>('/admin/stats', { headers: headers(true) }),

  // Usuarios
  listarUsuarios: () =>
    request<AdminUsuarioAPI[]>('/admin/usuarios', { headers: headers(true) }),
  actualizarUsuario: (id: number, data: Partial<AdminUsuarioAPI>) =>
    request<AdminUsuarioAPI>(`/admin/usuarios/${id}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarUsuario: (id: number) =>
    request<{ mensaje: string }>(`/admin/usuarios/${id}`, {
      method: 'DELETE', headers: headers(true),
    }),

  // Módulos
  listarModulos: () =>
    request<AdminModuloAPI[]>('/admin/modulos', { headers: headers(true) }),
  crearModulo: (data: Omit<AdminModuloAPI, 'id' | 'completados' | 'tiene_actividad'>) =>
    request<AdminModuloAPI>('/admin/modulos', {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizarModulo: (id: number, data: Partial<AdminModuloAPI>) =>
    request<AdminModuloAPI>(`/admin/modulos/${id}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarModulo: (id: number) =>
    request<{ mensaje: string }>(`/admin/modulos/${id}`, {
      method: 'DELETE', headers: headers(true),
    }),

  // Actividad (legacy)
  getActividad: (moduloId: number) =>
    request<AdminActividadAPI | null>(`/admin/modulos/${moduloId}/actividad`, { headers: headers(true) }),
  actualizarActividad: (moduloId: number, data: Partial<AdminActividadAPI>) =>
    request<{ mensaje: string }>(`/admin/modulos/${moduloId}/actividad`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),

  // Actividades V2
  listarActividades: (moduloId: number) =>
    request<AdminActividadAPI[]>(`/admin/modulos/${moduloId}/actividades`, { headers: headers(true) }),
  crearActividad: (moduloId: number, data: Partial<AdminActividadAPI>) =>
    request<AdminActividadAPI>(`/admin/modulos/${moduloId}/actividades`, {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizarActividadV2: (moduloId: number, actId: number, data: Partial<AdminActividadAPI>) =>
    request<AdminActividadAPI>(`/admin/modulos/${moduloId}/actividades/${actId}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarActividadV2: (moduloId: number, actId: number) =>
    request<{ mensaje: string }>(`/admin/modulos/${moduloId}/actividades/${actId}`, {
      method: 'DELETE', headers: headers(true),
    }),

  // Imágenes del módulo
  listarImagenes: (moduloId: number) =>
    request<ModuloImagenAPI[]>(`/admin/modulos/${moduloId}/imagenes`, { headers: headers(true) }),
  crearImagen: (moduloId: number, data: Partial<ModuloImagenAPI>) =>
    request<ModuloImagenAPI>(`/admin/modulos/${moduloId}/imagenes`, {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizarImagen: (moduloId: number, imgId: number, data: Partial<ModuloImagenAPI>) =>
    request<ModuloImagenAPI>(`/admin/modulos/${moduloId}/imagenes/${imgId}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarImagen: (moduloId: number, imgId: number) =>
    request<{ mensaje: string }>(`/admin/modulos/${moduloId}/imagenes/${imgId}`, {
      method: 'DELETE', headers: headers(true),
    }),

  // Secciones de contenido del módulo
  listarSeccionesContenido: (moduloId: number) =>
    request<ModuloSeccionAPI[]>(`/admin/modulos/${moduloId}/secciones-contenido`, { headers: headers(true) }),
  crearSeccionContenido: (moduloId: number, data: Partial<ModuloSeccionAPI>) =>
    request<ModuloSeccionAPI>(`/admin/modulos/${moduloId}/secciones-contenido`, {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizarSeccionContenido: (moduloId: number, secId: number, data: Partial<ModuloSeccionAPI>) =>
    request<ModuloSeccionAPI>(`/admin/modulos/${moduloId}/secciones-contenido/${secId}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarSeccionContenido: (moduloId: number, secId: number) =>
    request<{ mensaje: string }>(`/admin/modulos/${moduloId}/secciones-contenido/${secId}`, {
      method: 'DELETE', headers: headers(true),
    }),

  // Audios del módulo
  listarAudios: (moduloId: number) =>
    request<ModuloAudioAPI[]>(`/admin/modulos/${moduloId}/audios`, { headers: headers(true) }),
  crearAudio: (moduloId: number, data: Partial<ModuloAudioAPI>) =>
    request<ModuloAudioAPI>(`/admin/modulos/${moduloId}/audios`, {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizarAudio: (moduloId: number, audId: number, data: Partial<ModuloAudioAPI>) =>
    request<ModuloAudioAPI>(`/admin/modulos/${moduloId}/audios/${audId}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarAudio: (moduloId: number, audId: number) =>
    request<{ mensaje: string }>(`/admin/modulos/${moduloId}/audios/${audId}`, {
      method: 'DELETE', headers: headers(true),
    }),

  // Comunidad
  listarPublicaciones: () =>
    request<AdminPublicacionAPI[]>('/admin/publicaciones', { headers: headers(true) }),
  eliminarPublicacion: (id: number) =>
    request<{ mensaje: string }>(`/admin/publicaciones/${id}`, {
      method: 'DELETE', headers: headers(true),
    }),
};

// ============= BANCO DE CONOCIMIENTO =============

const buildQs = (params: Record<string, string | number | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string | number][];
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
};

export interface CartillaSeccionAPI {
  id: number;
  titulo: string;
  subtitulo: string | null;
  contenido: string | null;
  imagen_url: string | null;
  imagen_alt: string | null;
  link_url: string | null;
  orden: number;
  tipo: 'banner' | 'portada' | 'presentacion' | 'modulo' | 'galeria' | 'cierre';
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface BannerSlideAPI {
  id: number;
  titulo: string;
  subtitulo: string | null;
  imagen_url: string | null;
  imagen_alt: string | null;
  link_url: string | null;
  orden: number;
}

export interface SeccionPublicaAPI {
  id: number;
  titulo: string;
  subtitulo: string | null;
  contenido: string | null;
  imagen_url: string | null;
  imagen_alt: string | null;
  link_url: string | null;
  orden: number;
  tipo: 'portada' | 'presentacion' | 'modulo' | 'galeria' | 'cierre';
}

export const seccionesPublicAPI = {
  getBanner: () =>
    request<BannerSlideAPI[]>('/secciones/banner', { headers: headers() }),
  getActivas: () =>
    request<SeccionPublicaAPI[]>('/secciones/activas', { headers: headers() }),
};

export const configAPI = {
  get: () =>
    request<Record<string, string>>('/admin/configuracion', { headers: headers(true) }),
  save: (data: Record<string, string>) =>
    request<Record<string, string>>('/admin/configuracion', {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
};

export const uploadAPI = {
  imagen: async (file: File): Promise<{ url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append('imagen', file);
    const res = await fetch(`${API_URL}/admin/upload/imagen`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken() ?? ''}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
    return data as { url: string; public_id: string };
  },

  audio: async (file: File): Promise<{ url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await fetch(`${API_URL}/admin/upload/audio`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken() ?? ''}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir audio');
    return data as { url: string; public_id: string };
  },
};

export const seccionesAPI = {
  listar: () =>
    request<CartillaSeccionAPI[]>('/admin/secciones', { headers: headers(true) }),
  crear: (data: Omit<CartillaSeccionAPI, 'id' | 'creado_en' | 'actualizado_en'>) =>
    request<CartillaSeccionAPI>('/admin/secciones', {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizar: (id: number, data: Partial<CartillaSeccionAPI>) =>
    request<CartillaSeccionAPI>(`/admin/secciones/${id}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminar: (id: number) =>
    request<{ mensaje: string }>(`/admin/secciones/${id}`, {
      method: 'DELETE', headers: headers(true),
    }),
  reordenar: (items: { id: number; orden: number }[]) =>
    request<{ mensaje: string }>('/admin/secciones/reordenar', {
      method: 'PUT', headers: headers(true), body: JSON.stringify(items),
    }),
};

export const bancoAPI = {
  listarVocabulario: (params?: { modulo_id?: number; categoria?: string }) =>
    request<BancoVocabAPI[]>(`/admin/banco/vocabulario${buildQs(params ?? {})}`, { headers: headers(true) }),
  crearVocabulario: (data: Omit<BancoVocabAPI, 'id' | 'creado_en'>) =>
    request<BancoVocabAPI>('/admin/banco/vocabulario', {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizarVocabulario: (id: number, data: Partial<BancoVocabAPI>) =>
    request<BancoVocabAPI>(`/admin/banco/vocabulario/${id}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarVocabulario: (id: number) =>
    request<{ mensaje: string }>(`/admin/banco/vocabulario/${id}`, {
      method: 'DELETE', headers: headers(true),
    }),
  importarVocabulario: (pares: { espanol: string; inga: string }[], modulo_id: number | null, categoria: string) =>
    request<{ insertados: number }>('/admin/banco/vocabulario/importar', {
      method: 'POST', headers: headers(true), body: JSON.stringify({ pares, modulo_id, categoria }),
    }),

  listarTextos: (params?: { tipo?: string; modulo_id?: number }) =>
    request<BancoTextoAPI[]>(`/admin/banco/textos${buildQs(params ?? {})}`, { headers: headers(true) }),
  crearTexto: (data: Omit<BancoTextoAPI, 'id' | 'creado_en'>) =>
    request<BancoTextoAPI>('/admin/banco/textos', {
      method: 'POST', headers: headers(true), body: JSON.stringify(data),
    }),
  actualizarTexto: (id: number, data: Partial<BancoTextoAPI>) =>
    request<BancoTextoAPI>(`/admin/banco/textos/${id}`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
  eliminarTexto: (id: number) =>
    request<{ mensaje: string }>(`/admin/banco/textos/${id}`, {
      method: 'DELETE', headers: headers(true),
    }),
};
