import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { idLocal } from '@/utils/id';
import { tiposTEService } from '@/services/tiposTEService';
import type { CategoriaDocumento } from '@/types/documento';
import type { TipoTE, TipoTEPayload } from '@/types/tipoTE';
import { categoriasDocumento } from '@/features/proyectos/constantes';
import { Alert, Button, Checkbox, Input, Modal, Switch, Tabs, Textarea, useToast } from '@/components/ui';

const vacio: TipoTEPayload = {
  codigo: '',
  nombre: '',
  descripcion: '',
  activo: true,
  referencial: true,
  documentosRequeridos: [],
  guia: [],
  requisitos: [],
  materialApoyo: [],
};

type Seccion = 'general' | 'documentos' | 'guia';

interface Props {
  tipo: TipoTE | null;
  abierto: boolean;
  onClose: () => void;
}

export function TipoTEFormModal({ tipo, abierto, onClose }: Props) {
  const toast = useToast();
  const [f, setF] = useState<TipoTEPayload>(vacio);
  const [seccion, setSeccion] = useState<Seccion>('general');
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    if (tipo) {
      const { id: _id, ...resto } = tipo;
      setF(structuredClone(resto));
    } else setF(vacio);
    setSeccion('general');
    setIntentado(false);
    setError(null);
  }, [abierto, tipo]);

  const errores = {
    codigo: !/^TE\d{1,2}[A-Z]?$/i.test(f.codigo.trim()) ? 'Formato: TE seguido de un número (ej. TE7)' : undefined,
    nombre: !f.nombre.trim() ? 'Ingresa el nombre' : undefined,
    documentos: f.documentosRequeridos.some((d) => !d.nombre.trim()) ? 'Todos los documentos deben tener nombre' : undefined,
  };

  const guardar = async () => {
    setIntentado(true);
    if (errores.codigo || errores.nombre || errores.documentos) {
      setSeccion(errores.documentos && !errores.codigo && !errores.nombre ? 'documentos' : 'general');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const payload: TipoTEPayload = {
        ...f,
        guia: f.guia.filter((p) => p.titulo.trim()),
        requisitos: f.requisitos.filter((r) => r.texto.trim()),
      };
      if (tipo) await tiposTEService.actualizar(tipo.id, payload);
      else await tiposTEService.crear(payload);
      toast.exito(tipo ? 'Tipo TE actualizado' : 'Tipo TE creado', `${payload.codigo.toUpperCase()} — ${payload.nombre}`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const setDoc = (i: number, cambios: Partial<TipoTEPayload['documentosRequeridos'][number]>) =>
    setF({ ...f, documentosRequeridos: f.documentosRequeridos.map((d, j) => (j === i ? { ...d, ...cambios } : d)) });

  return (
    <Modal
      abierto={abierto}
      onClose={onClose}
      size="xl"
      titulo={tipo ? `Editar ${tipo.codigo}` : 'Nuevo tipo TE'}
      descripcion="Los cambios se reflejan en la creación de proyectos, checklists y la guía de apoyo."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={Save} onClick={guardar} loading={guardando}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert tipo="error">{error}</Alert>}
        <Tabs
          value={seccion}
          onChange={setSeccion}
          items={[
            { value: 'general', label: 'Datos generales' },
            { value: 'documentos', label: `Documentos requeridos (${f.documentosRequeridos.length})` },
            { value: 'guia', label: 'Guía y requisitos' },
          ]}
        />

        {seccion === 'general' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <Input label="Código" required value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value.toUpperCase() })} error={intentado ? errores.codigo : undefined} placeholder="TE7" />
              <Input label="Nombre" required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} error={intentado ? errores.nombre : undefined} />
            </div>
            <Textarea label="Descripción" rows={3} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} />
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <Switch label="Activo" descripcion="Disponible al crear nuevos proyectos." checked={f.activo} onChange={(v) => setF({ ...f, activo: v })} />
              <Switch
                label="Contenido referencial a validar"
                descripcion="Muestra la advertencia hasta que el contenido sea validado por un profesional."
                checked={f.referencial}
                onChange={(v) => setF({ ...f, referencial: v })}
              />
            </div>
          </div>
        )}

        {seccion === 'documentos' && (
          <div className="space-y-3">
            {intentado && errores.documentos && <Alert tipo="error">{errores.documentos}</Alert>}
            {f.documentosRequeridos.length === 0 && <p className="text-sm text-slate-500">Aún no hay documentos requeridos.</p>}
            {f.documentosRequeridos.map((d, i) => (
              <div key={d.id} className="grid items-end gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_12rem_auto_auto]">
                <Input label={`Documento ${i + 1}`} value={d.nombre} onChange={(e) => setDoc(i, { nombre: e.target.value })} />
                <div>
                  <label className="label">Categoría</label>
                  <select className="form-control" value={d.categoria} onChange={(e) => setDoc(i, { categoria: e.target.value as CategoriaDocumento })}>
                    {categoriasDocumento.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Checkbox label="Obligatorio" checked={d.obligatorio} onChange={(e) => setDoc(i, { obligatorio: e.target.checked })} className="pb-2.5" />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar documento"
                  onClick={() => setF({ ...f, documentosRequeridos: f.documentosRequeridos.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              icon={Plus}
              onClick={() =>
                setF({ ...f, documentosRequeridos: [...f.documentosRequeridos, { id: idLocal('req'), nombre: '', categoria: 'planos', obligatorio: true }] })
              }
            >
              Agregar documento
            </Button>
          </div>
        )}

        {seccion === 'guia' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Pasos de la guía de declaración</p>
              {f.guia.map((p, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{i + 1}</span>
                    <input
                      className="form-control"
                      placeholder="Título del paso"
                      value={p.titulo}
                      onChange={(e) => setF({ ...f, guia: f.guia.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)) })}
                      aria-label={`Título del paso ${i + 1}`}
                    />
                    <Button variant="ghost" size="icon" aria-label="Quitar paso" onClick={() => setF({ ...f, guia: f.guia.filter((_, j) => j !== i) })}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Descripción"
                    value={p.descripcion}
                    onChange={(e) => setF({ ...f, guia: f.guia.map((x, j) => (j === i ? { ...x, descripcion: e.target.value } : x)) })}
                    aria-label={`Descripción del paso ${i + 1}`}
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setF({ ...f, guia: [...f.guia, { titulo: '', descripcion: '' }] })}>
                Agregar paso
              </Button>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Checklist de requisitos</p>
              {f.requisitos.map((r, i) => (
                <div key={r.id} className="flex items-center gap-2">
                  <input
                    className="form-control"
                    value={r.texto}
                    placeholder="Requisito"
                    onChange={(e) => setF({ ...f, requisitos: f.requisitos.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)) })}
                    aria-label={`Requisito ${i + 1}`}
                  />
                  <Button variant="ghost" size="icon" aria-label="Quitar requisito" onClick={() => setF({ ...f, requisitos: f.requisitos.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setF({ ...f, requisitos: [...f.requisitos, { id: idLocal('chk'), texto: '' }] })}>
                Agregar requisito
              </Button>
              <p className="pt-2 text-xs text-slate-500">
                Los pliegos RIC aplicables se asignan desde Administración → Contenidos (etiquetas TE de cada pliego).
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
