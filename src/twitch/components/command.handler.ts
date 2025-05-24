import { Injectable } from '@nestjs/common';
import { TaskService } from 'src/task/TaskService.service';
import { Client } from 'tmi.js';

@Injectable()
export class CommandHandler {
  private botEnabled = true;

  constructor(private readonly taskService: TaskService) {}

  async handleCommand(client: Client, channel: string, tags, message: string) {
    const args = message.split(' ');
    const command = args.shift()?.toLowerCase();
    const username = tags['display-name'];
    const isMod = tags.mod || tags.badges?.broadcaster;

    if (!this.botEnabled && command !== '!onbot') return;

    const commandMap = new Map<string, () => string | Promise<string>>([
      [['!hola', '!hi'].join(), () => `¡Hola, ${username}! 👋`],
      [
        ['!addtask', '!agregartarea', '!agregar', '!add'].join(),
        () => this.addTaskCommand(username, args),
      ],
      [
        ['!tasks', '!tareas', '!list', '!mis-tareas'].join(),
        () => this.showTasksCommand(username),
      ],
      [
        ['!estoy', '!esta', '!workingon', '!trabajando'].join(),
        () => this.changeTaskStatusCommand(username, args),
      ],
      [
        ['!done', '!finish', '!finalizar', '!completado', '!acabe'].join(),
        () => this.finishTaskCommand(username),
      ],
      [
        ['!borrartareas', '!tasksdelete', '!dtask', 'btarea'].join(),
        () => this.deleteFinishedTasksCommand(username),
      ],
      [
        ['!borrartarea', '!taskdelete'].join(),
        () => this.deleteTaskCommand(username, args),
      ],
      [
        ['!comandos', '!help', '!ayuda', '!aiuda'].join(),
        () => this.getUserCommands(),
      ],
    ]);

    if (isMod) {
      commandMap.set('!onbot', () => {
        this.botEnabled = true;
        return '✅ Bot encendido.';
      });
      commandMap.set('!offbot', () => {
        this.botEnabled = false;
        return '🛑 Bot apagado.';
      });
    }

    for (const [keys, func] of commandMap.entries()) {
      if (keys.split(',').includes(command)) {
        const response = await func();
        if (response) {
          client.say(channel, `local: ${response}`);
        }
        break;
      }
    }
  }
  private async addTaskCommand(user: string, args: string[]): Promise<string> {
    const description = args.join(' ').trim();
    if (!description)
      return '⚠️ Debes proporcionar una descripción para la tarea.';
    const task = await this.taskService.addTask(user, description);
    return `✅ Tarea #${task.id_tasks} añadida: ${description}`;
  }

  private async showTasksCommand(user: string): Promise<string> {
    const tasks = await this.taskService.getTasks(user);
    console.log({ tasks });
    if (tasks.length === 0) return '📌 No tienes tareas pendientes.';
    return (
      `📋 **Tus tareas:**
` +
      tasks
        .map(
          (t) =>
            `${t.status === 'pendiente' ? '[ ]' : t.status === 'en progreso' ? '[~]' : '[✔]'} #${t.id_tasks}: ${t.description}`,
        )
        .join('\n')
    );
  }

  private async changeTaskStatusCommand(
    user: string,
    args: string[],
  ): Promise<string> {
    const text = args.join(' ').trim();
    const taskRegex = /^tarea(\d+)$/i;
    const match = text.match(taskRegex);

    if (match) {
      const taskId = args[0];

      await this.taskService.resetPreviousTask(user);

      const task = await this.taskService.updateTaskStatus(
        user,
        taskId,
        'en progreso',
      );
      return task
        ? `⏳ Tarea #${taskId} ahora está en progreso.`
        : '⚠️ Esa tarea no está en tu listado.';
    } else {
      await this.taskService.resetPreviousTask(user);
      if (!text.trim()) return '⚠️ La tarea no puede estar vacía.';
      const newTask = await this.taskService.addTask(user, text, 'en progreso');
      return `✅ Nueva tarea en progreso: #${newTask.id} - ${text}`;
    }
  }

  private async finishTaskCommand(user: string): Promise<string> {
    const finishedTask = await this.taskService.finishCurrentTask(user);
    return finishedTask
      ? `✔️ Tarea #${finishedTask.id_tasks} finalizada: ${finishedTask.description}`
      : '⚠️ No tienes ninguna tarea en progreso.';
  }

  private async deleteFinishedTasksCommand(user: string): Promise<string> {
    await this.taskService.deleteFinishedTasks(user);
    return '🗑️ Se han eliminado todas las tareas finalizadas.';
  }

  private async deleteTaskCommand(
    user: string,
    args: string[],
  ): Promise<string> {
    const taskId = args[0];
    if (!taskId || typeof taskId !== 'string')
      return '⚠️ Debes proporcionar un ID de tarea válido.';
    const deleted = await this.taskService.deleteTask(user, taskId);
    return deleted
      ? `🗑️ Tarea #${taskId} eliminada.`
      : '⚠️ No se encontró la tarea.';
  }

  private getUserCommands(): string {
    return `
📜 **Comandos Disponibles**
🔹 **!hola, !hi** → Saludo del bot
🔹 **!addtask, !agregartarea, !agregar, !add [tarea]** → Agrega una nueva tarea
🔹 **!tasks, !tareas, !list, !mis-tareas** → Muestra tus tareas
🔹 **!estoy, !esta, !workingon, !trabajando tarea[num]** → Pone una tarea en progreso 
🔹 **!done, !finish, !finalizar, !completado, !acabe** → Finaliza la tarea en progreso
🔹 **!borrartareas, !tasksdelete, !dtask, !btarea** → Elimina todas las tareas finalizadas
🔹 **!borrartarea, !taskdelete [id]** → Elimina una tarea específica
🔹 **!comandos, !help, !ayuda, !aiuda** → Muestra la lista de comandos`;
  }
}
