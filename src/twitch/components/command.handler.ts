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
        ['!estoy', '!esta', '!está', '!workingon', '!trabajando'].join(),
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
      [
        ['!chiste', '!chistes', 'jaja', '!risitas'].join(),
        () => this.jajaupulus(username, args),
      ],
      [
        ['!creadorDeRisas', '!creadorderisas', '!creadorderisas'].join(),
        () => `Creador del bot de risas @Raupulus`,
      ],
      [
        ['!comer'].join(),
        () =>
          `ñam ñam ñam, **imaginate a tanuki virtual comiendo** ${this.getRandomSymbol()}`,
      ],
      [
        ['!dia'].join(),
        () =>
          `Extendido Día 16, entonces que procede... nota del bot(este es mi proposito ?) ${this.getRandomSymbol()}`,
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

  private getRandomSymbol(): string {
    const symbols = [
      '✨',
      '🔥',
      '🎉',
      '😎',
      '🍀',
      '🌟',
      '💡',
      '🦊',
      '🐱‍👤',
      '🦄',
      '🍕',
      '🥑',
      '🧩',
      '🎲',
      '🚀',
    ];
    const idx = Math.floor(Math.random() * symbols.length);
    return symbols[idx];
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
      `📋 **Tus tareas:**` +
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

    if (match) {
      const taskId = parseInt(match[1], 10);

      this.taskService.resetPreviousTask(user);

      const task = this.taskService.updateTaskStatus(
        user,
        taskId,
        'en progreso',
      );
      return task
        ? `⏳ Tarea #${taskId} ahora está en progreso.`
        : '⚠️ Esa tarea no está en tu listado.';
    } else {
      this.taskService.resetPreviousTask(user);
      if (!text.trim()) return '⚠️ La tarea no puede estar vacía.';
      const newTask = this.taskService.addTask(user, text, 'en progreso');
      return `✅ Nueva tarea en progreso: #${newTask.id} - ${text}`;
    }
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

  private async jajaupulus(user: string, args: string[]): Promise<string> {
    const keyType = {
      dev: 'chistes-devs',
      lepe: 'chistes-lepe',
    };

    const group_slug = keyType[args[0]];
    const url =
      args.length === 0
        ? `${process.env.URL_RAUPULUS}/api/v1/type/chistes/content/random`
        : `${process.env.URL_RAUPULUS}/api/v1/group/${group_slug}/content/random`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.TOKEN_CHISTES}`,
        },
      });

      const text = await response.text();

      if (!response.ok) {
        console.error(`Error ${response.status}:`, text);
        throw new Error('HTTP error');
      }

      const data = JSON.parse(text);
      return data.data[0].content;
    } catch (error) {
      console.error('❌ Error:', error);
      return 'Pegenle al creador porque su bot no funciona';
    }
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
🔹 **!comandos, !help, !ayuda, !aiuda** → Muestra la lista de comandos
🔹 **'!chiste', '!chistes', 'jaja', '!risitas'→ Bot de risas`;
  }
}
