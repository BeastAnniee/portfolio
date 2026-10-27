@AGENTS.md

## Claude Code

- Comandos: `/tc`, `/tc-prime`, `/tc-spec`, `/tc-plan`, `/tc-implement`, `/tc-validate`, `/tc-review`, `/tc-ship`, `/tc-debug`, `/tc-adr`, `/tc-retro`. Estándares por disciplina: skill `tc-standards`.
- Hooks activos (`.claude/settings.json`): `guard-bash` (bloquea force-push, `--no-verify`, `curl | sh`; pide confirmación en borrados y despliegues), `guard-edit` (rutas protegidas, guardarraíles, secretos), `session-start` (estado del método).
- Subagentes: `tc-reviewer` (revisión de solo lectura), `tc-verifier` (validación escéptica), `tc-researcher` (exploración). `/tc-review` y `/tc-validate` se ejecutan en su propio contexto para dar «ojos frescos».
- Planifica en modo plan cuando la tarea es R2/R3. Si un hook te niega algo, **no busques el rodeo**: explica al humano por qué lo necesitas.
