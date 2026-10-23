import type { ArchivoAdjunto } from '@/types/common';
import type { CategoriaDocumento, Documento, EsquemaRevision, Revision } from '@/types/documento';

/** Archivos de ejemplo disponibles en public/mock-files. */
const ejemplos: Record<string, Omit<ArchivoAdjunto, 'id' | 'nombre'>> = {
  plano: { tipoMime: 'application/pdf', tamano: 1_284_000, url: '/mock-files/plano-ejemplo.pdf' },
  unilineal: { tipoMime: 'application/pdf', tamano: 642_000, url: '/mock-files/unilineal-ejemplo.pdf' },
  memoria: { tipoMime: 'application/pdf', tamano: 845_000, url: '/mock-files/memoria-calculo-ejemplo.pdf' },
  cuadro: { tipoMime: 'application/pdf', tamano: 212_000, url: '/mock-files/cuadro-cargas-ejemplo.pdf' },
  protocolo: { tipoMime: 'application/pdf', tamano: 318_000, url: '/mock-files/protocolo-pruebas-ejemplo.pdf' },
  foto: { tipoMime: 'image/svg+xml', tamano: 2_350_000, url: '/mock-files/foto-tablero-ejemplo.svg' },
  certificado: { tipoMime: 'application/pdf', tamano: 182_000, url: '/mock-files/certificado-sec-ejemplo.pdf' },
};

type Ejemplo = keyof typeof ejemplos;

let contador = 0;

function rev(numero: string, fecha: string, comentario: string, ejemplo: Ejemplo, nombreArchivo: string, autor = 'Juan Pérez Soto'): Revision {
  contador++;
  return {
    id: `rev-${String(contador).padStart(3, '0')}`,
    numero,
    comentario,
    fecha,
    autorNombre: autor,
    archivo: { id: `arc-doc-${contador}`, nombre: nombreArchivo, ...ejemplos[ejemplo] },
  };
}

function doc(
  id: string,
  proyectoId: string,
  nombre: string,
  categoria: CategoriaDocumento,
  esquemaRevision: EsquemaRevision,
  revisiones: Revision[],
  requisitoId?: string,
): Documento {
  return { id, proyectoId, nombre, categoria, esquemaRevision, revisiones, requisitoId, fechaCreacion: revisiones[0]!.fecha };
}

export const documentosSeed: Documento[] = [
  // ---- pry-001: Ampliación vivienda Familia Rojas (TE1, en desarrollo) ----
  doc('doc-001', 'pry-001', 'Plano de planta — primer piso', 'planos', 'letras', [
    rev('A', '2026-09-05T15:00:00.000Z', 'Emisión inicial para revisión del cliente.', 'plano', 'PL-01_planta_revA.pdf'),
    rev('B', '2026-09-20T12:30:00.000Z', 'Se reubica tablero secundario junto a la cocina y se agregan 3 enchufes.', 'plano', 'PL-01_planta_revB.pdf'),
    rev('C', '2026-10-21T16:20:00.000Z', 'Ajuste de circuitos de alumbrado según observaciones del arquitecto.', 'plano', 'PL-01_planta_revC.pdf'),
  ], 'req-te1-1'),
  doc('doc-002', 'pry-001', 'Diagrama unilineal', 'planos', 'letras', [
    rev('A', '2026-09-22T10:00:00.000Z', 'Emisión inicial.', 'unilineal', 'PL-02_unilineal_revA.pdf'),
  ], 'req-te1-2'),
  doc('doc-003', 'pry-001', 'Cuadro de cargas', 'cuadros_carga', 'numeros', [
    rev('0', '2026-09-10T09:00:00.000Z', 'Primera versión con 8 circuitos.', 'cuadro', 'cuadro_cargas_rev0.pdf'),
    rev('1', '2026-09-21T09:00:00.000Z', 'Se agregan circuitos C9 (horno) y C10 (encimera de inducción).', 'cuadro', 'cuadro_cargas_rev1.pdf'),
  ], 'req-te1-3'),
  doc('doc-004', 'pry-001', 'Fotografía tablero existente', 'fotografias', 'numeros', [
    rev('0', '2026-09-03T11:00:00.000Z', 'Registro del estado inicial del tablero.', 'foto', 'foto_tablero_existente.jpg'),
  ]),

  // ---- pry-002: Café Andino (TE1, listo para declarar) ----
  doc('doc-005', 'pry-002', 'Plano de planta local', 'planos', 'letras', [
    rev('A', '2026-08-12T10:00:00.000Z', 'Emisión inicial.', 'plano', 'planta_local_revA.pdf'),
    rev('B', '2026-08-25T10:00:00.000Z', 'Se incorpora circuito exclusivo para máquina de espresso.', 'plano', 'planta_local_revB.pdf'),
  ], 'req-te1-1'),
  doc('doc-006', 'pry-002', 'Diagrama unilineal', 'planos', 'letras', [
    rev('A', '2026-08-12T10:30:00.000Z', 'Emisión inicial.', 'unilineal', 'unilineal_revA.pdf'),
  ], 'req-te1-2'),
  doc('doc-007', 'pry-002', 'Cuadro de cargas', 'cuadros_carga', 'numeros', [
    rev('0', '2026-08-14T10:00:00.000Z', 'Emisión inicial.', 'cuadro', 'cuadro_cargas.pdf'),
  ], 'req-te1-3'),
  doc('doc-008', 'pry-002', 'Memoria de cálculo', 'memoria_calculo', 'numeros', [
    rev('0', '2026-08-20T10:00:00.000Z', 'Emisión inicial.', 'memoria', 'memoria_calculo_rev0.pdf'),
    rev('1', '2026-10-18T11:00:00.000Z', 'Se corrige caída de tensión del alimentador principal (2,1 % → 1,8 %).', 'memoria', 'memoria_calculo_rev1.pdf'),
  ], 'req-te1-4'),
  doc('doc-009', 'pry-002', 'Fotografías tablero y empalme', 'fotografias', 'numeros', [
    rev('0', '2026-10-01T10:00:00.000Z', 'Tablero terminado y empalme trifásico.', 'foto', 'fotos_tablero_empalme.jpg'),
  ], 'req-te1-5'),
  doc('doc-010', 'pry-002', 'Medición de puesta a tierra', 'certificados', 'numeros', [
    rev('0', '2026-10-02T10:00:00.000Z', 'Medición con telurómetro: 8,4 Ω.', 'protocolo', 'medicion_puesta_tierra.pdf'),
  ], 'req-te1-6'),

  // ---- pry-003: Fotovoltaico (TE4, declarado) ----
  doc('doc-011', 'pry-003', 'Diagrama unilineal FV', 'planos', 'letras', [
    rev('A', '2026-06-20T10:00:00.000Z', 'Emisión inicial.', 'unilineal', 'unilineal_fv_revA.pdf'),
  ], 'req-te4-1'),
  doc('doc-012', 'pry-003', 'Memoria explicativa', 'memoria_calculo', 'numeros', [
    rev('0', '2026-06-22T10:00:00.000Z', 'Emisión inicial.', 'memoria', 'memoria_fv.pdf'),
  ], 'req-te4-2'),
  doc('doc-013', 'pry-003', 'Certificados inversor y paneles', 'certificados', 'numeros', [
    rev('0', '2026-07-10T10:00:00.000Z', 'Certificados del fabricante.', 'certificado', 'certificados_equipos.pdf'),
  ], 'req-te4-3'),
  doc('doc-014', 'pry-003', 'Fotografías instalación', 'fotografias', 'numeros', [
    rev('0', '2026-07-28T10:00:00.000Z', 'Arreglo FV, inversor y tablero.', 'foto', 'fotos_instalacion_fv.jpg'),
  ], 'req-te4-4'),
  doc('doc-015', 'pry-003', 'Protocolo de pruebas', 'certificados', 'numeros', [
    rev('0', '2026-07-30T10:00:00.000Z', 'Pruebas de aislación y polaridad.', 'protocolo', 'protocolo_pruebas.pdf'),
  ], 'req-te4-5'),

  // ---- pry-004: Subestación (TE2, en desarrollo) ----
  doc('doc-016', 'pry-004', 'Diagrama unilineal MT/BT', 'planos', 'letras', [
    rev('A', '2026-09-25T10:00:00.000Z', 'Anteproyecto.', 'unilineal', 'unilineal_se_revA.pdf'),
    rev('B', '2026-10-15T09:30:00.000Z', 'Se cambia transformador a 300 kVA según factibilidad.', 'unilineal', 'unilineal_se_revB.pdf'),
  ], 'req-te2-2'),
  doc('doc-017', 'pry-004', 'Factibilidad distribuidora', 'otros', 'numeros', [
    rev('0', '2026-09-28T10:00:00.000Z', 'Respuesta de factibilidad.', 'certificado', 'factibilidad.pdf'),
  ]),

  // ---- pry-006: Oficinas Apoquindo (TE1, declarado) ----
  doc('doc-018', 'pry-006', 'Plano de planta piso 7', 'planos', 'letras', [
    rev('A', '2026-04-10T10:00:00.000Z', 'Emisión inicial.', 'plano', 'planta_p7_revA.pdf'),
    rev('B', '2026-05-02T10:00:00.000Z', 'Versión final para declaración.', 'plano', 'planta_p7_revB.pdf'),
  ], 'req-te1-1'),
  doc('doc-019', 'pry-006', 'Diagrama unilineal', 'planos', 'letras', [
    rev('A', '2026-04-12T10:00:00.000Z', 'Emisión inicial.', 'unilineal', 'unilineal_p7.pdf'),
  ], 'req-te1-2'),
  doc('doc-020', 'pry-006', 'Cuadro de cargas', 'cuadros_carga', 'numeros', [
    rev('0', '2026-04-12T11:00:00.000Z', 'Emisión inicial.', 'cuadro', 'cuadro_cargas_p7.pdf'),
  ], 'req-te1-3'),
  doc('doc-021', 'pry-006', 'Memoria de cálculo', 'memoria_calculo', 'numeros', [
    rev('0', '2026-04-20T10:00:00.000Z', 'Emisión inicial.', 'memoria', 'memoria_p7.pdf'),
  ], 'req-te1-4'),
  doc('doc-022', 'pry-006', 'Fotografías tableros', 'fotografias', 'numeros', [
    rev('0', '2026-05-20T10:00:00.000Z', 'Tableros TDA y TDC.', 'foto', 'fotos_tableros_p7.jpg'),
  ], 'req-te1-5'),

  // ---- pry-007 (Carolina) ----
  doc('doc-023', 'pry-007', 'Diagrama unilineal planta', 'planos', 'letras', [
    rev('A', '2026-07-05T10:00:00.000Z', 'Emisión inicial.', 'unilineal', 'unilineal_planta.pdf', 'Carolina Muñoz Vera'),
  ], 'req-te2-2'),
];
