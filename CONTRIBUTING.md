# 🤝 Вклад в проект VoiceFlow

Спасибо за интерес к проекту! Любая помощь приветствуется! 🎉

## Как можно помочь

### 1. Баг-репорты

Нашли баг? Создайте [Issue](https://github.com/YOUR_USERNAME/VoiceFlow/issues) с:

- Описанием проблемы
- Шагами для воспроизведения
- Ожидаемым результатом
- Фактическим результатом
- Скриншотами (если применимо)
- Версией приложения
- ОС и браузером

### 2. Предложения функций

Хотите новую функцию? Создайте [Issue](https://github.com/YOUR_USERNAME/VoiceFlow/issues) с:

- Названием функции
- Описанием зачем она нужна
- Примерами использования
- Возможными альтернативами

### 3. Pull Requests

Хотите исправить баг или добавить функцию?

#### Шаги:

1. **Fork** проект
2. Создайте ветку:
   ```bash
   git checkout -b feature/amazing-feature
   ```
   или
   ```bash
   git checkout -b fix/bug-fix
   ```

3. Внесите изменения
4. Закоммитьте:
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
   
   Используйте [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — новая функция
   - `fix:` — исправление бага
   - `docs:` — документация
   - `style:` — форматирование
   - `refactor:` — рефакторинг
   - `test:` — тесты
   - `chore:` — прочее

5. Отправьте:
   ```bash
   git push origin feature/amazing-feature
   ```

6. Откройте **Pull Request**

#### Требования к PR:

- [ ] Код следует стилю проекта
- [ ] Добавлены тесты (если применимо)
- [ ] Обновлена документация
- [ ] Все тесты проходят
- [ ] Нет конфликтов слияния

---

## 📝 Стиль кода

### TypeScript

- Используйте TypeScript для всего нового кода
- Избегайте `any`, используйте правильные типы
- Следуйте [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

### Именование

```typescript
// Классы
class VoiceChannel { }

// Функции и переменные
const getChannel = () => { }
let isConnected = false

// Константы
const MAX_USERS = 50

// Интерфейсы
interface ChannelConfig { }

// Типы
type ChannelType = 'VOICE' | 'TEXT'
```

### Структура файлов

```typescript
// 1. Imports
import { Module } from '@nestjs/common'

// 2. Decorators
@Module({ })

// 3. Class
export class VoiceModule { }
```

---

## 🧪 Тестирование

### Запуск тестов

```bash
cd server
npm run test

cd client
npm run test
```

### Написание тестов

```typescript
describe('VoiceService', () => {
  it('should create a room', () => {
    // Arrange
    const service = new VoiceService()
    
    // Act
    const room = await service.getOrCreateRoom('test')
    
    // Assert
    expect(room).toBeDefined()
  })
})
```

---

## 📚 Документация

### Обновление документации

- Обновляйте README.md при добавлении функций
- Добавляйте комментарии к сложному коду
- Обновляйте API документацию

### Формат Markdown

- Используйте заголовки `#`, `##`, `###`
- Списки `-` или `1.`
- Код в блоках \`\`\`typescript
- Ссылки [текст](url)

---

## 🎯 Roadmap

Смотрите открытые [Issues](https://github.com/YOUR_USERNAME/VoiceFlow/issues) для плана разработки.

### Приоритеты

- 🔴 High — Критичные баги
- 🟡 Medium — Важные функции
- 🟢 Low — Улучшения

---

## 💬 Общение

- **GitHub Issues** — для багов и предложений
- **Discord** — для общих вопросов
- **Email** — для личного общения

---

## 🏆 Участники

Спасибо всем кто помогает проекту! 🙏

[Список участников](https://github.com/YOUR_USERNAME/VoiceFlow/graphs/contributors)

---

<div align="center">

**Вместе мы сделаем VoiceFlow лучше! 💪**

</div>
