# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # TypeScript compile + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Tech Stack

- React 19 + TypeScript
- Vite 7 (build tool)
- ESLint 9 with React Hooks and React Refresh plugins

## Project Structure

```
src/
  main.tsx    # Entry point, renders App to DOM
  App.tsx     # Root component
  *.css       # Component styles
public/       # Static assets (copied as-is to build)
```
