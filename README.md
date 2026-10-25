# 🎮 DotaScope — Analizador Táctico de Partidas de Dota 2

Plataforma interactiva de analítica y diagnóstico táctico de partidas de Dota 2 impulsada por la telemetría de OpenDota y un Coach Táctico con Inteligencia Artificial.

![DotaScope](https://img.shields.io/badge/Dota_2-Analytics-red?style=for-the-badge&logo=steam)
![React](https://img.shields.io/badge/React_19-Vite_6-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🚀 Características Principales

- **Diagnóstico Integral de Partida (Autopsia Táctica)**:
  - ¿Por qué se perdió la partida? Auditoría de causas raíz y punto de quiebre (*Tipping Point* con minuto exacto y desplome de oro).
  - Radar de Equipo interactivo (Líneas, Visión, Economía, Teamfight y Objetivos).
- **Evaluación por Posición (Roles 1 al 5)**:
  - Detección automática y precisa de roles (`Pos 1 · HC`, `Pos 2 · Mid`, `Pos 3 · Offlane`, `Pos 4 · Soft Support`, `Pos 5 · Hard Support`).
  - Calificación en escala S/A/B/C/D/F (0 a 100 puntos) con gráficas de barras comparativas frente al estándar competitivo.
  - Desglose de fallos críticos y aciertos por jugador.
- **Coach Táctico con Inteligencia Artificial**:
  - Resumen ejecutivo automático de la partida.
  - Momentos decisivos del encuentro.
  - Consejos de mejora personalizados para cada una de las 5 posiciones.
  - Recomendaciones macro para las siguientes partidas.
- **Herramientas de Partida**:
  - Banner para solicitar parseo de repetición en partidas sin procesar.
  - Mapa interactivo de Wards (Observer y Sentry).
  - Curvas de ventaja de Oro y XP minuto a minuto.
  - Línea de tiempo de compra de ítems clave.
- **Glosario y Leyenda**:
  - Explicación de todas las métricas (KDA, GPM, XPM, LH/DN, Networth, visión, stuns, etc.).

---

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript + Vite 6
- **Estilos**: Tailwind CSS + Lucide Icons
- **Gráficas**: Recharts (RadarChart, BarChart, AreaChart)
- **API**: OpenDota API (telemetría oficial de repeticiones de Valve)
- **IA**: Motor Táctico Autónomo + soporte para Pollinations AI / Google Gemini

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

Desarrollado con ❤️ para la comunidad competitiva de Dota 2.
