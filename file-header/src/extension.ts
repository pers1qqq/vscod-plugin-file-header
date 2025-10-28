import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable =
      vscode.commands.registerCommand('fileHeader.insert', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('Нет активного редактора.');
          return;
        }
        const cfg = vscode.workspace.getConfiguration();
        const author = cfg.get<string>('fileHeader.author') ?? 'ФИО';
        const group = cfg.get<string>('fileHeader.group') ?? 'Группа';
        const rawTemplate = cfg.get<string>('fileHeader.template') ??
            '/*\\n * Автор: ${author}\\n * Группа: ${group}\\n * Дата: ${date}\\n */\\n\\n';

        const template = rawTemplate.replace(/\\n/g, '\n');
        const dateStr = new Date().toLocaleString();

        let header = template.replace(/\$\{author\}/g, author)
                         .replace(/\$\{group\}/g, group)
                         .replace(/\$\{date\}/g, dateStr);

        await editor.edit(editBuilder => {
          editBuilder.insert(new vscode.Position(0, 0), header);
        });

        vscode.window.showInformationMessage('Заголовок вставлен.');
      });

  context.subscriptions.push(disposable);
}


export function deactivate() {}