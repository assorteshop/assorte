# ASSORTE

Інтернет-магазин (Next.js App Router, TypeScript, Tailwind, Supabase, Vercel). Окремий проєкт, не повʼязаний з Talent Mates / MATE.

Документація проєкту лежить у `docs/`: архітектура (`ASSORTE_Architecture_v1.0_Foundation_Sprint_01.md`) і бриф блогу (`ASSORTE_Blog_Sprint_Brief.md`). Якщо документ розходиться з живим проєктом, пріоритет мають проєкт і DESIGN LOCK v1.0.

## Команди

| Команда | Що робить |
|---|---|
| `npm run dev` | локальний сервер |
| `npm run typecheck` | генерує типи маршрутів і запускає `tsc` |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run build` | продакшн-збірка |

## Змінні середовища

Шаблон: `.env.example`. Секрети ніколи не комітимо (`.env.local` у `.gitignore`).

| Змінна | Де | Для чого |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | доступ до бази (публічний ключ) |
| `NEXT_PUBLIC_SITE_URL` | **лише Production на бойовому домені** | адреса сайту для canonical/sitemap і **вмикач індексації** (див. нижче) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Vercel (секрети) | сповіщення про замовлення |
| `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL` | Vercel (секрети) | сповіщення на email (необовʼязково) |
| `LIQPAY_PUBLIC_KEY`, `LIQPAY_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Vercel (секрети) | онлайн-оплата (поки не підключено) |
| `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` | лише `.env.local` | тестовий адмін для автотестів (не коміт) |

## Індексація пошуковиками

Поки `NEXT_PUBLIC_SITE_URL` не заданий або це адреса `*.vercel.app` (а також на всіх preview-збірках), сайт закритий від індексації: `robots.txt` → `Disallow: /`, на всіх сторінках `noindex`, у відповідях заголовок `X-Robots-Tag`. Логіка в `src/lib/site.ts`, покрита тестами.

## Перед запуском на бойовому домені

- [ ] Додати домен у Vercel і задати `NEXT_PUBLIC_SITE_URL=https://<домен>` **тільки для Production** (так вмикається індексація). Перевірити `https://<домен>/robots.txt`.
- [ ] **Окрема база для розробки.** Зараз одна база Supabase обслуговує і preview, і production. Перед запуском створити окремий проєкт Supabase для розробки/preview (окремі ключі у змінних Preview), а в production залишити бойову базу. Міграції спершу застосовувати до dev-бази.
- [ ] Перевірити юридичні сторінки (доставка й оплата, повернення, оферта, політика конфіденційності), реквізити продавця.
- [ ] Підключити та перевірити онлайн-оплату у тестовому режимі, потім бойовому.
- [ ] Перевірити резервні копії Supabase та доступи (хто адмін).
- [ ] Прибрати тестові товари, статті та замовлення.
- [ ] Перевірити `https://<домен>/sitemap.xml` і додати його в Google Search Console.

## Як додати статтю в блог

Коротко: статтю пише Claude chat за інструкцією `docs/claude-chat-article-prompt.md` (там же 5 кроків публікації). Редактор приймає HTML від Claude як є або Markdown, сам заповнює заголовок/SEO з тексту, показує кнопки для фото-заглушок, а картку товару в тексті ставить рядок `[[product:адреса-товару]]`. Блог: `/blog`, стара адреса `/articles/*` перенаправляється (301).

## Категорії

Список категорій живе в коді: `src/lib/categories.ts`. Окремої таблиці категорій у базі немає, тому категорія перевіряється `CHECK`-обмеженнями. Додаючи нову категорію, змініть **три місця**: `src/lib/categories.ts`, обмеження `articles_category_slug_check` і `products_category_check` (нова міграція: видалити обмеження й створити знову з довшим списком).

## Міграції

SQL лежить у `supabase/`. Виконуються вручну в Supabase → SQL Editor, по одній, після погодження. Нові міграції лише додають (без видалення і перейменувань).
