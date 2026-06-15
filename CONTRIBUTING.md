# Contribuir a LexAI

Gracias por tu interés en el proyecto. Esta guía resume el flujo de trabajo para colaborar de forma ordenada.

## Requisitos previos

- Node.js ≥ 22
- pnpm ≥ 9
- Git

## Configuración

```bash
git clone https://github.com/buildwithme1/lexai.git
cd lexai
pnpm install
copy .env.example .env
pnpm start
```

## Flujo de trabajo

1. Crea una rama desde `main`:
   ```bash
   git checkout -b feat/descripcion-corta
   ```
2. Implementa los cambios con tests cuando aplique
3. Ejecuta `pnpm preflight` antes de abrir PR
4. Abre un Pull Request con descripción clara: qué, por qué, cómo probar

## Estilo de commits

[Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope):` nueva funcionalidad
- `fix(scope):` corrección de bug
- `docs:` documentación
- `chore:` mantenimiento, dependencias
- `test:` tests
- `ci:` pipelines

Ejemplo: `feat(web): add admin audit log table`

## Estándares de código

- TypeScript estricto, sin `any` innecesarios
- Validar entradas con Zod
- No incluir secretos ni archivos `.env`
- Respetar tokens de diseño y accesibilidad WCAG 2.2 AA
- Respuestas IA deben cumplir `LegalResponse` e IRAC

## Reportar issues

Incluye:

- Pasos para reproducir
- Comportamiento esperado vs actual
- Versión de Node/pnpm y SO
- Logs relevantes (sin datos personales ni API keys)

## Seguridad

Si encuentras una vulnerabilidad, no abras un issue público. Contacta a **buildwithme1@proton.me**.