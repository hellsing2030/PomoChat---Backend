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
    console.log(isMod);

    if (!this.botEnabled && command !== '!onbot') return;

    const commands = {
      '!hola': () => `¡Hola, ${username}! 👋`,

      '!addtask': () => this.addTaskCommand(username, args),
      '!agregartarea': () => this.addTaskCommand(username, args),
      '!agregar': () => this.addTaskCommand(username, args),
      '!add': () => this.addTaskCommand(username, args),

      '!tasks': () => this.showTasksCommand(username),
      '!tareas': () => this.showTasksCommand(username),
      '!list': () => this.showTasksCommand(username),
      '!mis-tareas': () => this.showTasksCommand(username),

      '!estoy': () => this.changeTaskStatusCommand(username, args),
      '!esta': () => this.changeTaskStatusCommand(username, args),
      '!workingon': () => this.changeTaskStatusCommand(username, args),
      '!trabajando': () => this.changeTaskStatusCommand(username, args),

      '!done': () => this.finishTaskCommand(username),
      '!finish': () => this.finishTaskCommand(username),
      '!finalizar': () => this.finishTaskCommand(username),
      '!completado': () => this.finishTaskCommand(username),
      '!acabe': () => this.finishTaskCommand(username),

      '!comandos': () => this.getUserCommands(),
      '!help': () => this.getUserCommands(),
      '!ayuda': () => this.getUserCommands(),
    };

    if (isMod) {
      commands['!onbot'] = () => {
        this.botEnabled = true;
        return '✅ Bot encendido.';
      };
      commands['!offbot'] = () => {
        this.botEnabled = false;
        return '🛑 Bot apagado.';
      };
      commands['!admincomandos'] = () => this.getAdminCommands();
    }

    if (commands[command]) {
      const response = await commands[command]();
      if (response) {
        client.say(channel, response);
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
      `📋 **Tus tareas:**\n` +
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

      // 🛑 Antes de cambiar, aseguramos que la tarea anterior vuelva a 'pendiente'
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
      // 🛑 Antes de crear una nueva tarea en progreso, reseteamos la anterior
      this.taskService.resetPreviousTask(user);

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

  private getUserCommands(): string {
    return `
    📜 **Comandos Disponibles**  
    - **!hola** → Saludo del bot  
    - **!addtask / !agregartarea [tarea]** → Agrega una nueva tarea  
    - **!tasks / !tareas** → Muestra tus tareas  
    - **!estoy / !esta tarea[num]** → Pone una tarea en progreso  
    - **!done** → Finaliza la tarea en progreso  
    `;
  }

  private getAdminCommands(): string {
    return `
    🔧 **Comandos de Administración**  
    - **!onbot** → Activa el bot  
    - **!offbot** → Desactiva el bot  
    - **!admincomandos** → Muestra estos comandos  
    `;
  }
}
