import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { asesoriasService } from '@/services/asesoriasService';
import type { Asesor, AsesorPayload, Modalidad } from '@/types/asesoria';
import { regiones } from '@/mocks/geografia';
import { Alert, Button, Checkbox, Field, Input, Modal, Select, Switch, Textarea, useToast } from '@/components/ui';
import { SelectorTiposTE } from './SelectorTiposTE';

const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const vacio: AsesorPayload = {
  nombre: '',
  titulo: '',
  email: '',
  bio: '',
  especialidades: [],
  tiposTE: [],
  aniosExperiencia: 5,
  region: 'Metropolitana de Santiago',
  comuna: 'Santiago',
  modalidades: ['videollamada'],
  tarifaHora: 30000,
  horario: [{ diaSemana: 1, inicio: '09:00', fin: '13:00' }],
  activo: true,
};

export function AsesorFormModal({ abierto, asesor, onClose }: { abierto: boolean; asesor: Asesor | null; onClose: () => void }) {
  const toast = useToast();
  const [f, setF] = useState<AsesorPayload>(vacio);
  const [especialidades, setEspecialidades] = useState('');
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    if (asesor) {
      const { id: _id, calificacion: _c, totalResenas: _t, ...resto } = asesor;
      setF(structuredClone(resto));
      setEspecialidades(asesor.especialidades.join(', '));
    } else {
      setF(vacio);
      setEspecialidades('');
    }
    setIntentado(false);
    setError(null);
  }, [abierto, asesor]);

  const errores = {
    nombre: !f.nombre.trim() ? 'Ingresa el nombre' : undefined,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()) ? 'Correo no válido' : undefined,
    modalidades: f.modalidades.length === 0 ? 'Selecciona al menos una modalidad' : undefined,
    horario: f.horario.some((b) => b.inicio >= b.fin) ? 'La hora de término debe ser posterior al inicio' : undefined,
  };

  const alternarModalidad = (m: Modalidad) =>
    setF({ ...f, modalidades: f.modalidades.includes(m) ? f.modalidades.filter((x) => x !== m) : [...f.modalidades, m] });

  const guardar = async () => {
    setIntentado(true);
    if (Object.values(errores).some(Boolean)) return;
    setGuardando(true);
    setError(null);
    const payload: AsesorPayload = {
      ...f,
      especialidades: especialidades
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (asesor) await asesoriasService.actualizarAsesor(asesor.id, payload);
      else await asesoriasService.crearAsesor(payload);
      toast.exito(asesor ? 'Asesor actualizado' : 'Asesor creado', payload.nombre);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const comunas = regiones.find((r) => r.nombre === f.region)?.comunas ?? [];

  return (
    <Modal
      abierto={abierto}
      onClose={onClose}
      size="xl"
      titulo={asesor ? 'Editar asesor' : 'Nuevo asesor'}
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
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {error && <Alert tipo="error">{error}</Alert>}
          <Input label="Nombre completo" required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} error={intentado ? errores.nombre : undefined} />
          <Input label="Título profesional" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
          <Input label="Correo" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={intentado ? errores.email : undefined} />
          <Textarea label="Biografía" rows={3} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
          <Input label="Especialidades" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} hint="Separadas por coma" />
          <SelectorTiposTE label="Experiencia en tipos TE" value={f.tiposTE} onChange={(ids) => setF({ ...f, tiposTE: ids })} />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Años de experiencia" type="number" min={0} value={f.aniosExperiencia} onChange={(e) => setF({ ...f, aniosExperiencia: Number(e.target.value) })} />
            <Input label="Tarifa referencial" sufijo="CLP/h" type="number" min={0} step={1000} value={f.tarifaHora} onChange={(e) => setF({ ...f, tarifaHora: Number(e.target.value) })} />
            <Select
              label="Región"
              value={f.region}
              onChange={(e) => setF({ ...f, region: e.target.value, comuna: regiones.find((r) => r.nombre === e.target.value)?.comunas[0] ?? '' })}
              opciones={regiones.map((r) => ({ value: r.nombre, label: r.nombre }))}
            />
            <Select label="Comuna" value={f.comuna} onChange={(e) => setF({ ...f, comuna: e.target.value })} opciones={comunas.map((c) => ({ value: c, label: c }))} />
          </div>
          <Field id="modalidades" label="Modalidades" error={intentado ? errores.modalidades : undefined}>
            <div className="flex gap-4">
              <Checkbox label="Videollamada" checked={f.modalidades.includes('videollamada')} onChange={() => alternarModalidad('videollamada')} />
              <Checkbox label="Presencial" checked={f.modalidades.includes('presencial')} onChange={() => alternarModalidad('presencial')} />
            </div>
          </Field>
          <Field id="horario" label="Horario de atención semanal" error={intentado ? errores.horario : undefined}>
            <div className="space-y-2">
              {f.horario.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    className="form-control"
                    value={b.diaSemana}
                    onChange={(e) => setF({ ...f, horario: f.horario.map((x, j) => (j === i ? { ...x, diaSemana: Number(e.target.value) } : x)) })}
                    aria-label="Día"
                  >
                    {dias.map((d, n) => n > 0 && (
                      <option key={d} value={n}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className="form-control w-28"
                    value={b.inicio}
                    onChange={(e) => setF({ ...f, horario: f.horario.map((x, j) => (j === i ? { ...x, inicio: e.target.value } : x)) })}
                    aria-label="Inicio"
                  />
                  <input
                    type="time"
                    className="form-control w-28"
                    value={b.fin}
                    onChange={(e) => setF({ ...f, horario: f.horario.map((x, j) => (j === i ? { ...x, fin: e.target.value } : x)) })}
                    aria-label="Término"
                  />
                  <Button variant="ghost" size="icon" aria-label="Quitar bloque" onClick={() => setF({ ...f, horario: f.horario.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setF({ ...f, horario: [...f.horario, { diaSemana: 1, inicio: '09:00', fin: '13:00' }] })}>
                Agregar bloque
              </Button>
            </div>
          </Field>
          <Switch label="Activo en el directorio" checked={f.activo} onChange={(v) => setF({ ...f, activo: v })} />
        </div>
      </div>
    </Modal>
  );
}
