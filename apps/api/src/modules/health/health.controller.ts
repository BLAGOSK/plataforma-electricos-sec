import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FASE_ACTUAL } from '@electricos/shared';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { VERSION_API } from '../../version';

type EstadoComponente = 'ok' | 'error';

@ApiTags('salud')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Estado de la API, la base de datos y el almacenamiento' })
  async health(@Res({ passthrough: true }) res: Response) {
    const comprobar = async (fn: () => Promise<unknown>): Promise<EstadoComponente> => {
      try {
        await fn();
        return 'ok';
      } catch {
        return 'error';
      }
    };
    const [baseDatos, almacenamiento] = await Promise.all([
      comprobar(() => this.prisma.$queryRaw`SELECT 1`),
      comprobar(() => this.storage.verificar()),
    ]);
    const ok = baseDatos === 'ok' && almacenamiento === 'ok';
    res.status(ok ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return {
      estado: ok ? 'ok' : 'degradado',
      componentes: { baseDatos, almacenamiento },
      version: VERSION_API,
      fase: FASE_ACTUAL,
      uptimeSeg: Math.round(process.uptime()),
    };
  }
}
