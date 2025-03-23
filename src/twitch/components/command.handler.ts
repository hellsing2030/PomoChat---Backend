import { Injectable } from '@nestjs/common';
import { Client } from 'tmi.js';
import { TaskService } from '../services/TaskService.service';

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
        ['!borrartareas', '!deletetask', '!dtask', 'btarea'].join(),
        () => this.deleteFinishedTasksCommand(username),
      ],
      [['!borrartarea'].join(), () => this.deleteTaskCommand(username, args)],
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
          client.say(channel, response);
        }
        break;
      }
    }
  }

  private addTaskCommand(user: string, args: string[]): string {
    const description = args.join(' ').trim();
    if (!description)
      return '⚠️ Debes proporcionar una descripción para la tarea.';
    const task = this.taskService.addTask(user, description);
    return `✅ Tarea #${task.id} añadida: ${description}`;
  }

  private showTasksCommand(user: string): string {
    const tasks = this.taskService.getTasks(user);
    if (tasks.length === 0) return '📌 No tienes tareas pendientes.';
    return (
      `📋 **Tus tareas:**
` +
      tasks
        .map(
          (t) =>
            `${t.status === 'pendiente' ? '[ ]' : t.status === 'en progreso' ? '[~]' : '[✔]'} #${t.id}: ${t.description}`,
        )
        .join('\n')
    );
  }

  private changeTaskStatusCommand(user: string, args: string[]): string {
    const text = args.join(' ').trim();
    const taskRegex = /^tarea(\d+)$/i;
    const match = text.match(taskRegex);

    if (!match)
      return '⚠️ Debes indicar una tarea válida, por ejemplo: !estoy tarea1';

    const taskId = parseInt(match[1], 10);
    this.taskService.resetPreviousTask(user);
    const task = this.taskService.updateTaskStatus(user, taskId, 'en progreso');

    return task
      ? `⏳ Tarea #${taskId} ahora está en progreso.`
      : '⚠️ Esa tarea no está en tu listado.';
  }

  private finishTaskCommand(user: string): string {
    const finishedTask = this.taskService.finishCurrentTask(user);
    return finishedTask
      ? `✔️ Tarea #${finishedTask.id} finalizada: ${finishedTask.description}`
      : '⚠️ No tienes ninguna tarea en progreso.';
  }

  private deleteFinishedTasksCommand(user: string): string {
    this.taskService.deleteFinishedTasks(user);
    return '🗑️ Se han eliminado todas las tareas finalizadas.';
  }

  private deleteTaskCommand(user: string, args: string[]): string {
    const taskId = parseInt(args[0], 10);
    if (isNaN(taskId))
      return '⚠️ Debes proporcionar un número de tarea válido.';
    return this.taskService.deleteTask(user, taskId)
      ? `🗑️ Tarea #${taskId} eliminada.`
      : '⚠️ No se encontró la tarea.';
  }

  private getUserCommands(): string {
    return `
    📜 **Comandos Disponibles**  
    - **!hola** → Saludo del bot  
    - **!addtask [tarea]** → Agrega una nueva tarea  
    - **!tasks** → Muestra tus tareas  
    - **!estoy tarea[num]** → Pone una tarea en progreso  
    - **!done** → Finaliza la tarea en progreso  
    - **!borrartareas** → Elimina todas las tareas finalizadas  
    - **!borrartarea [id]** → Elimina una tarea específica 
    - ** 
    `;
  }
}
