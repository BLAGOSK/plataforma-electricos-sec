/** Pruebas unitarias (src/**\/*.spec.ts). Las e2e están en test/jest-e2e.config.js */
module.exports = {
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }] },
  // Usa el código fuente del paquete compartido (no requiere build previo)
  moduleNameMapper: { '^@electricos/shared$': '<rootDir>/../../../packages/shared/src/index.ts' },
  testEnvironment: 'node',
};
