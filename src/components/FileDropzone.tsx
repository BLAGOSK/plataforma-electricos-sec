import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatBytes } from '@/utils/format';

interface FileDropzoneProps {
  onArchivos: (archivos: File[]) => void;
  /** Ej: "application/pdf,image/*" */
  accept?: string;
  multiple?: boolean;
  maxMB?: number;
  /** Texto con los formatos permitidos (para el usuario) */
  formatos?: string;
  error?: string | null;
  compacto?: boolean;
  disabled?: boolean;
}

function coincideAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(',').some((patron) => {
    const p = patron.trim();
    if (p.endsWith('/*')) return file.type.startsWith(p.slice(0, -1));
    if (p.startsWith('.')) return file.name.toLowerCase().endsWith(p.toLowerCase());
    return file.type === p;
  });
}

/** Zona de carga con arrastrar y soltar. No sube nada: entrega los File al componente padre. */
export function FileDropzone({
  onArchivos,
  accept,
  multiple = false,
  maxMB = 20,
  formatos,
  error,
  compacto,
  disabled,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const procesar = (lista: FileList | null) => {
    if (!lista?.length) return;
    const archivos = Array.from(lista).slice(0, multiple ? undefined : 1);
    const invalido = archivos.find((f) => !coincideAccept(f, accept));
    if (invalido) return setErrorLocal(`"${invalido.name}" no tiene un formato permitido.`);
    const grande = archivos.find((f) => f.size > maxMB * 1024 * 1024);
    if (grande) return setErrorLocal(`"${grande.name}" pesa ${formatBytes(grande.size)}; el máximo es ${maxMB} MB.`);
    setErrorLocal(null);
    onArchivos(archivos);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    if (!disabled) procesar(e.dataTransfer.files);
  };

  const mensajeError = errorLocal ?? error;

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors',
          compacto ? 'px-4 py-5' : 'px-6 py-10',
          arrastrando ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/40',
          mensajeError && 'border-red-300',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <UploadCloud className={cn('text-brand-600', compacto ? 'mb-1 h-6 w-6' : 'mb-3 h-10 w-10')} />
        <p className="text-sm font-medium text-slate-700">
          <span className="text-brand-700">Haz clic para seleccionar</span> o arrastra {multiple ? 'los archivos' : 'el archivo'} aquí
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatos ?? 'Cualquier formato'} · máx. {maxMB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            procesar(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {mensajeError && <p className="mt-1.5 text-xs text-red-600">{mensajeError}</p>}
    </div>
  );
}
