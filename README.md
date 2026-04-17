# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Learning Path AI Setup

To enable AI-generated learning tasks and AI code review:

1. Copy `backend/.env.example` to `backend/.env`.
2. Set your OpenAI key in `OPENAI_API_KEY`.
3. Keep or adjust `LEARNING_PASS_SCORE`.

Required variables:

```env
OPENAI_API_KEY=your_openai_api_key
LEARNING_PASS_SCORE=7
```

- `OPENAI_API_KEY`: Enables OpenAI task generation and code feedback.
- `LEARNING_PASS_SCORE`: Minimum AI quality score (1-10) required to unlock the next task.
