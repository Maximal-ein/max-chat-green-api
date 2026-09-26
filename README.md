# MAX Chat — клиент мессенджера MAX через GREEN-API

Тестовое задание на должность **«Фронтенд разработчик React»**.
Простой чат-интерфейс для отправки и получения **текстовых** сообщений в мессенджере
[MAX](https://max.ru) через [GREEN-API](https://green-api.com/max).

Прототип интерфейса — внешний вид чата [https://web.max.ru/](https://web.max.ru/):
тёмная боковая панель со списком чатов, светлая область переписки с пузырями
сообщений, поле ввода внизу.

## Возможности

### Базовые (по тестовому заданию)
- Вход по учётным данным GREEN-API (`idInstance`, `apiTokenInstance`)
- Создание нового чата по номеру телефона (`checkAccount`)
- Отправка текстовых сообщений (`sendMessage`)
- Приём входящих через long-poll (`receiveNotification` + `deleteNotification`)
- Статусы доставки (✓ отправлено, ✓✓ доставлено, ✓✓ прочитано)

### Дополнительные UX-фичи
- 🌓 Тёмная/светлая тема (переключатель, сохраняется в localStorage)
- ⌨️ Индикатор «печатает…» в шапке чата и внизу списка сообщений
- 🔔 Звуковые уведомления (вкл/выкл, сохраняется в localStorage)
- 📌 Закреплённые чаты (pinned chats вверху списка)
- 🔇 Отключение уведомлений для отдельных чатов (mute)
- 📦 Архивация чатов (скрытие из основного списка + toggle «Архив»)
- 🏷️ Счётчик непрочитанных + бейдж в document title
- 📅 Разделители по датам (Сегодня / Вчера / дата)
- ⬇️ Кнопка «прокрутить вниз» при прокрутке вверх
- 📋 Копирование сообщений (клик по hover-кнопке)
- 💬 Ответ на сообщение (quote preview + цитата в пузыре)
- ✏️ Редактирование исходящих сообщений
- 🗑️ Удаление сообщений (только локально)
- 📝 Markdown: **bold**, *italic*, `code`, [links](url)
- 📤 Экспорт чата в .txt / .json
- 🏷️ Переименование чата (custom display name)
- ℹ️ Панель информации о чате (телефон, chatId, последнее сообщение, статусы)
- 🎨 Градиентные аватары (10 палитр по хешу имени)
- 📡 Баннер потери соединения с GREEN-API
- ⌨️ Горячие клавиши: Ctrl+K (поиск чатов), Ctrl+F (поиск в чате), ? (справка)
- 🔍 Поиск по сообщениям в чате (подсветка + навигация ↑↓)
- 😀 Emoji picker (100 эмодзи в 5 категориях)
- 🖱️ Контекстное меню (правый клик): Ответить / Копировать / Редактировать / Удалить
- ✨ Framer Motion анимации на empty state
- 📱 Адаптивная вёрстка (desktop + mobile drawer)

## Технологии

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (New York)
- **Prisma ORM** (SQLite)
- **Zustand** — клиентское состояние
- **Framer Motion** — анимации
- **react-markdown** — markdown rendering

## Локальный запуск

### Способ 1: С реальными учётными данными GREEN-API

#### Предварительные требования

- [Bun](https://bun.sh) 1.1+ (рекомендуется) или Node.js 20+
- Аккаунт в [кабинете GREEN-API](https://console.green-api.com) с подключённым
  инстансом MAX

#### Шаги

```bash
# 1. Распаковать архив
tar -xzf max-chat-project.tar.gz
cd max-chat-project

# 2. Установить зависимости
bun install

# 3. Настроить переменные окружения
# Файл .env уже содержит:
#   DATABASE_URL=file:./db/custom.db
# Если нужно — отредактируйте путь.

# 4. Применить схему базы данных (создаст SQLite файл)
bun run db:push

# 5. Запустить dev-сервер
bun run dev
```

Приложение откроется на **http://localhost:3000**.

#### Использование

1. Откройте приложение в браузере
2. Введите `idInstance` и `apiTokenInstance` из кабинета GREEN-API
3. Нажмите «Войти» — приложение проверит учётные данные через `getStateInstance`
4. Нажмите «Новый чат» и введите номер телефона получателя (например, `79991234567`)
5. Напишите текстовое сообщение и нажмите Enter
6. Дождитесь ответа от получателя — ответ появится автоматически

### Способ 2: Без реальных учётных данных (mock-сервер)

В проекте включён mock-сервер GREEN-API для тестирования без реальных кредов:

```bash
# 1. Распаковать и установить (см. шаги выше)

# 2. Запустить mock-сервер в отдельном терминале
cd mini-services/green-api-mock
bun install
bun run dev
# Mock-сервер запустится на http://127.0.0.1:3040

# 3. В другом терминале запустить основной dev-сервер
cd ../..
bun run db:push
bun run dev

# 4. Открыть http://localhost:3000 и войти:
#    idInstance: любые данные (например DEMO_MOCK)
#    apiTokenInstance: любые данные (например mocktoken)
#    apiUrl: http://127.0.0.1:3040
```

Mock-сервер автоматически отвечает на каждое отправленное сообщение входящим
webhook'ом, позволяя протестировать полный цикл: вход → создание чата →
отправка → индикатор «печатает…» → получение ответа.

### Переменные окружения

Файл `.env`:

```
DATABASE_URL=file:./db/custom.db
```

`apiUrl` по умолчанию — `https://api.green-api.com`. Его можно переопределить
при входе (поле `apiUrl` на экране авторизации).

## Архитектура

```
src/
├── app/
│   ├── api/                            # Next.js Route Handlers (прокси к GREEN-API)
│   │   ├── account/login/              # POST — проверка кредов + upsert Account
│   │   ├── account/logout/             # POST — удаление Account из БД
│   │   ├── account/state/              # GET  — getStateInstance
│   │   ├── chats/                      # GET — список чатов; POST — создать чат
│   │   ├── chats/[id]/                 # DELETE — удалить чат
│   │   ├── chats/[id]/read/            # PATCH — отметить прочитанным
│   │   ├── chats/[id]/pin/             # PATCH — закрепить/открепить
│   │   ├── chats/[id]/mute/            # PATCH — mute/unmute
│   │   ├── chats/[id]/archive/         # PATCH — архивировать/вернуть
│   │   ├── chats/[id]/rename/          # PATCH — переименовать
│   │   ├── chats/[id]/export/          # GET — экспорт в txt/json
│   │   ├── messages/                   # GET — сообщения чата
│   │   ├── messages/[id]/              # DELETE — удалить сообщение
│   │   ├── messages/[id]/edit/        # PATCH — редактировать сообщение
│   │   ├── messages/send/              # POST — отправить сообщение
│   │   └── notifications/poll/         # POST — long-poll вебхуков GREEN-API
│   ├── layout.tsx
│   ├── page.tsx                        # роутинг: login ↔ chat по session
│   └── globals.css                     # тема (зелёный акцент, тёмный сайдбар)
├── components/
│   ├── auth/                           # login-form, logout-button
│   ├── chat/                           # UI чата (15+ компонентов)
│   ├── theme-provider.tsx              # next-themes обёртка
│   ├── theme-toggle.tsx                # кнопка Moon/Sun
│   ├── sound-toggle.tsx                # кнопка Volume2/VolumeX
│   └── keyboard-help.tsx               # диалог справки горячих клавиш
├── hooks/                              # use-auth, use-chats, use-messages,
│                                       # use-notifications, use-reply, use-search,
│                                       # use-sound, use-unread-title
├── lib/
│   ├── green-api.ts                    # серверный клиент GREEN-API
│   ├── storage.ts                      # localStorage session helpers
│   ├── types.ts                        # shared TypeScript types
│   ├── db.ts                           # Prisma client
│   └── message-grouping.ts            # группировка сообщений по дням
├── server-lib/
│   ├── helpers.ts                      # серверные утилиты
│   └── notifications/handlers.ts       # обработчики вебхуков
└── store/chat-store.ts                 # Zustand store
```

Все файлы исходников ≤200 строк.

## Соответствие требованиям задания

| # | Требование | Статус |
|---|-------------|--------|
| 1 | UI для отправки/получения сообщений в MAX | ✅ |
| 2 | Использовать сервис GREEN-API | ✅ Все запросы к api.green-api.com |
| 3 | Только текстовые сообщения | ✅ Фильтр `typeMessage === "textMessage"` |
| 4 | Прототип — web.max.ru | ✅ Тёмный сайдбар + светлый чат, пузыри |
| 5 | Максимально простой интерфейс | ✅ |
| 6 | Отправка через SendMessage | ✅ `POST /waInstance{id}/sendMessage/{token}` |
| 7 | Приём через HTTP API | ✅ `receiveNotification` + `deleteNotification` |
| 8 | Технология React | ✅ Next.js 16 / React 19 |

## Команды

```bash
bun run dev        # запустить dev-сервер (порт 3000)
bun run lint       # проверить ESLint
bun run db:push    # применить схему Prisma к SQLite
bun run db:generate# регенерировать Prisma Client
```

## Скриншоты

Скриншоты приложения находятся в папке `screenshots/`:
- `01-login-light.png` — экран входа (светлая тема)
- `02-login-dark.png` — экран входа (тёмная тема)
- `03-empty-chat.png` — пустой экран чата
- `04-chat-messages.png` — чат с сообщениями
- `05-dark-theme-chat.png` — чат в тёмной теме
- `06-new-chat-dialog.png` — диалог создания чата
- `07-chat-info.png` — панель информации о чате
- `08-emoji-picker.png` — выбор эмодзи
- `09-message-search.png` — поиск по сообщениям
- `10-typing-indicator.png` — индикатор «печатает…»

## GREEN-API endpoints

| Метод | URL |
|-------|-----|
| getStateInstance | `GET /waInstance{id}/getStateInstance/{token}` |
| checkAccount | `POST /waInstance{id}/checkAccount/{token}` |
| sendMessage | `POST /waInstance{id}/sendMessage/{token}` |
| receiveNotification | `GET /waInstance{id}/receiveNotification/{token}?receiveTimeout=N` |
| deleteNotification | `DELETE /waInstance{id}/deleteNotification/{token}/{receiptId}` |
