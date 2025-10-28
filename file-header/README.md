# 📘 Документация по плагину "File Header" для Visual Studio Code

## 🔹 Общие сведения

**Название плагина:** File Header  
**Автор:** Семизоров Герман Романович  
**Группа:** М3120  
**Цель разработки:**  
Создать расширение для Visual Studio Code, которое вставляет в начало любого открытого файла стандартную шапку с информацией об авторе, группе и текущей дате.  

Плагин демонстрирует принципы архитектуры VS Code Extensions — взаимодействие с API редактора, работу с пользовательскими настройками и регистрацию пользовательских команд.

---

## 🔹 Архитектура расширений VS Code

Расширения (extensions) в VS Code — это отдельные модули, которые:
- подключаются через систему событий (activation events);
- регистрируют команды, меню, конфигурации и другие точки расширения (contribution points);
- взаимодействуют с API VS Code через модуль `vscode`.

Каждое расширение состоит минимум из двух ключевых файлов:
- **`package.json`** — манифест, описывающий расширение;
- **`extension.ts`** — главный модуль с кодом (логика работы плагина).

---

## 🔹 Структура проекта

```
file-header/
│
├── .vscode/
│   └── launch.json              # Конфигурация отладки
├── src/
│   └── extension.ts             # Главный код расширения
├── package.json                 # Манифест плагина (описание)
├── tsconfig.json                # Настройки TypeScript
├── README.md                    # Краткое описание проекта
└── DOCS.md                      # Подробная документация (этот файл)
```

---

## 🔹 Манифест `package.json`

Манифест — это "паспорт" плагина. Он сообщает VS Code,  
когда активировать расширение, какие команды оно добавляет, и какие настройки поддерживает.

Основные поля:

```json
{
  "activationEvents": ["onCommand:fileHeader.insert"],
  "contributes": {
    "commands": [
      {
        "command": "fileHeader.insert",
        "title": "Insert File Header",
        "category": "File Header"
      }
    ],
    "configuration": {
      "type": "object",
      "title": "File Header",
      "properties": {
        "fileHeader.author": {
          "type": "string",
          "default": "ФИО",
          "description": "Автор для шапки файла"
        },
        "fileHeader.group": {
          "type": "string",
          "default": "Группа",
          "description": "Группа для шапки файла"
        },
        "fileHeader.template": {
          "type": "string",
          "default": "/*\\n * Автор: ${author}\\n * Группа: ${group}\\n * Дата: ${date}\\n */\\n\\n",
          "description": "Шаблон заголовка. Переменные: ${author}, ${group}, ${date}"
        }
      }
    }
  }
}
```

### 🔍 Разбор ключевых блоков

| Раздел | Назначение |
|:--|:--|
| `"activationEvents"` | определяет, когда плагин активируется. Здесь — при вызове команды `fileHeader.insert`. |
| `"commands"` | регистрирует новую команду, которая появится в палитре VS Code. |
| `"configuration"` | создаёт пользовательские настройки, доступные через Settings (`fileHeader.author`, `fileHeader.group`, `fileHeader.template`). |

---

## 🔹 Основной код (`src/extension.ts`)

Файл `extension.ts` содержит логику работы.  
Он экспортирует две функции — `activate()` и `deactivate()`.

### 📘 activate()

Эта функция вызывается VS Code, когда плагин активируется.
Здесь мы регистрируем команду и описываем её поведение:

```ts
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('fileHeader.insert', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Нет активного редактора.');
      return;
    }

    const cfg = vscode.workspace.getConfiguration();
    const author = cfg.get<string>('fileHeader.author') ?? 'ФИО';
    const group = cfg.get<string>('fileHeader.group') ?? 'Группа';
    const rawTemplate = cfg.get<string>('fileHeader.template')
      ?? "/*\\n * Автор: ${author}\\n * Группа: ${group}\\n * Дата: ${date}\\n */\\n\\n";
    const template = rawTemplate.replace(/\\n/g, '\n');
    const dateStr = new Date().toLocaleString();

    let header = template
      .replace(/\$\{author\}/g, author)
      .replace(/\$\{group\}/g, group)
      .replace(/\$\{date\}/g, dateStr);

    await editor.edit(editBuilder => {
      editBuilder.insert(new vscode.Position(0, 0), header);
    });

    vscode.window.showInformationMessage('Заголовок вставлен.');
  });

  context.subscriptions.push(disposable);
}
```

### 📘 deactivate()
Эта функция вызывается, когда расширение выгружается (необязательная, но хорошая практика):
```ts
export function deactivate() {}
```

---

## 🔹 Принцип работы плагина (по шагам)

1️⃣ Пользователь вызывает команду **Insert File Header**.  
2️⃣ VS Code активирует расширение (`onCommand:fileHeader.insert`).  
3️⃣ Плагин получает доступ к открытому документу (`activeTextEditor`).  
4️⃣ Считывает настройки:
   - имя автора (`fileHeader.author`);
   - группу (`fileHeader.group`);
   - шаблон (`fileHeader.template`).  
5️⃣ Подставляет значения в шаблон, заменяя `${author}`, `${group}`, `${date}`.  
6️⃣ Преобразует `\n` в реальные переводы строк.  
7️⃣ Вставляет готовую шапку в начало документа.  
8️⃣ Показывает уведомление: “Заголовок вставлен”.

---

## 🔹 Пример результата работы

```text
/*
 * Автор: Семизоров Герман Романович
 * Группа: М3120
 * Дата: 27.10.2025, 22:40:42
 */
```

---

## 🔹 Пример настроек (Settings → JSON)

```json
{
  "fileHeader.author": "Семизоров Герман Романович",
  "fileHeader.group": "М3120",
  "fileHeader.template": "/*\\n * Автор: ${author}\\n * Группа: ${group}\\n * Дата: ${date}\\n */\\n\\n"
}
```