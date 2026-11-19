# Roadmap

[English](../../ROADMAP.md) · [Português](../pt-BR/ROADMAP.md)

Hacia dónde va el proyecto. Los ítems no tienen fecha; cada uno sale en una minor cuando está listo, y el CHANGELOG lo registra. Para sugerir un ítem, abre un issue.

- **Catálogo A2UI**: cubrir todos los componentes del catálogo básico de A2UI con componentes de refy, en la web y en React Native, para que un agente use refy donde usa el catálogo básico.
- **Paridad web y móvil**: las mismas props y el mismo comportamiento en `@refy-design/web` y `@refy-design/mobile`, familia por familia. La paridad actual está en el catálogo para agentes (campo `mobile` de cada familia).
- **Madurez**: evaluar cada familia de componentes como experimental, estable u obsoleta, según [docs/QUALITY.md](../QUALITY.md).
- **Pruebas de interacción**: pruebas de clic, teclado y escritura en todas las familias. La cobertura actual está en [docs/INTERACTION_COVERAGE.md](../INTERACTION_COVERAGE.md).
- **Temas**: más temas de partida y una mejor extracción de tema desde un sitio existente.
- **Rendimiento**: primera carga menor en los paquetes y en el sitio.
- **Kit para agentes**: más revisiones en `refy_validate` y mejores respuestas en `refy_search`.
