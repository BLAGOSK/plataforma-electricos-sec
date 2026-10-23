import { Global, Module } from '@nestjs/common';
import { validarEnv } from './env';

/** Token de inyección de la configuración validada. Uso: `@Inject(ENV) private env: Env` */
export const ENV = Symbol('ENV');

@Global()
@Module({
  providers: [{ provide: ENV, useFactory: () => validarEnv(process.env) }],
  exports: [ENV],
})
export class ConfigModule {}
