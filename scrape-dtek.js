import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

// Захардкоджена черга 3.1
const QUEUE = '3.1';
const ADDRESS = { street: 'вул. Метрологічна', house: '11' };

async function scrapeSchedule() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`Скрейпінг черги ${QUEUE} (${ADDRESS.street}, ${ADDRESS.house})...`);
    await page.goto('https://www.dtek-kem.com.ua/ua/shutdowns', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForSelector('#street', { timeout: 30000 });

    // Закриваємо модальне вікно
    try {
      await page.click('#modal-attention > div > div > div.modal__head > button', {
        timeout: 3000,
        force: true
      });
      await page.waitForTimeout(500);
    } catch {
      // Модальне вікно не знайдено
    }

    // Вибираємо вулицю
    await page.click('#street', { force: true });
    await page.fill('#street', ADDRESS.street);
    await page.waitForTimeout(1500);

    const streetAutocomplete = await page.$('.autocomplete-items div');
    if (streetAutocomplete) {
      await streetAutocomplete.click();
    }

    await page.waitForTimeout(1000);

    // Вибираємо будинок
    await page.click('#house_num', { force: true });
    await page.fill('#house_num', ADDRESS.house);
    await page.waitForTimeout(1000);

    const houseAutocomplete = await page.$('.autocomplete-items div');
    if (houseAutocomplete) {
      await houseAutocomplete.click();
    }

    await page.waitForTimeout(3000);

    // Парсимо графік
    const scheduleData = await page.evaluate((queue) => {
      const result = {
        queue: queue,
        address: '',
        lastUpdate: '',
        today: { date: '', slots: [] },
        tomorrow: { date: '', slots: [] }
      };

      const streetInput = document.querySelector('#street');
      const houseInput = document.querySelector('#house_num');
      if (streetInput && houseInput) {
        result.address = `${streetInput.value}, ${houseInput.value}`;
      }

      const updateSpan = document.querySelector('.discon-fact-info-text .update');
      if (updateSpan) {
        result.lastUpdate = updateSpan.textContent.trim();
      }

      const tables = document.querySelectorAll('.discon-fact-table');

      tables.forEach((table, index) => {
        const dateSpan = document.querySelector(`.dates .date:nth-child(${index + 1}) span[rel="date"]`);
        const date = dateSpan ? dateSpan.textContent.trim() : '';

        const cells = table.querySelectorAll('tbody td');
        const slots = [];

        for (let i = 2; i < cells.length; i++) {
          const cell = cells[i];
          const hour = i - 2;

          if (cell.classList.contains('cell-scheduled')) {
            slots.push({ hour, type: 'full' });
          } else if (cell.classList.contains('cell-first-half')) {
            slots.push({ hour, type: 'first-half' });
          } else if (cell.classList.contains('cell-second-half')) {
            slots.push({ hour, type: 'second-half' });
          }
        }

        if (index === 0) {
          result.today = { date, slots };
        } else {
          result.tomorrow = { date, slots };
        }
      });

      return result;
    }, QUEUE);

    await browser.close();
    return scheduleData;

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'dtek-error.png' }).catch(() => {});
    await browser.close();
    throw error;
  }
}

async function run() {
  try {
    const data = await scrapeSchedule();
    console.log(`✓ Черга ${data.queue}: ${data.today.slots.length} відключень сьогодні, ${data.tomorrow.slots.length} завтра`);

    writeFileSync('public/schedule.json', JSON.stringify(data, null, 2));
    console.log('Збережено в public/schedule.json');
    console.log('Наступне оновлення через 10 хвилин...\n');
  } catch (err) {
    console.error('Помилка:', err.message);
    console.log('Повторна спроба через 10 хвилин...\n');
  }
}

// Запуск
console.log('DTEK Scraper - Черга 3.1');
console.log('========================\n');

run();
setInterval(run, 10 * 60 * 1000);
