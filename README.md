# DTEK Schedule

React-додаток для відображення графіка відключень електроенергії DTEK (черга 3.1).

## Функції

- Відображення графіка на сьогодні та завтра
- Автооновлення кожні 10 хвилин
- Адаптивний дизайн для мобільних пристроїв
- Підтримка темної теми

## Запуск локально

```bash
npm install
npm run dev
```

У іншому терміналі запустіть скрейпер:

```bash
node scrape-dtek.js
```

## Docker

Запустіть проект у Docker-контейнері:

```bash
docker-compose build
docker-compose up -d
```

Доступ: http://localhost:8080

Контейнер включає:
- nginx для роздачі статичних файлів React
- Playwright scraper для отримання даних з DTEK
- supervisord для керування процесами

## Scraper

Скрейпер отримує фактичний графік відключень з сайту DTEK та зберігає дані в `public/schedule.json`. Оновлюється автоматично кожні 10 хвилин.

## Stack

- React 19
- Vite
- TypeScript
- Playwright (scraping)
