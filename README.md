# DTEK Schedule

React-додаток для відображення графіка відключень електроенергії DTEK (черга 3.1).

## Запуск

```bash
npm install
npm run dev
```

## Scraper

Скрейпер отримує фактичний графік відключень з сайту DTEK:

```bash
node scrape-dtek.js
```

Дані зберігаються в `public/schedule.json` та оновлюються кожні 10 хвилин.

## Stack

- React 19
- Vite
- Playwright (scraping)
