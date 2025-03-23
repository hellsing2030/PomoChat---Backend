import { Injectable } from '@nestjs/common';
import { Client } from 'tmi.js';
import { TaskService } from '../services/TaskService.service';

@Injectable()
export class CommandHandler {
  private botEnabled = true; // Estado del bot

  constructor(private readonly taskService: TaskService) {}

  async handleCommand(client: Client, channel: string, tags, message: string) {
    const args = message.split(' ');
    const command = args.shift()?.toLowerCase();
    const username = tags['display-name'];
    const isMod = tags.mod || tags.badges?.broadcaster; // Verifica si es streamer o mod
    console.log(isMod);

    // Si el bot está apagado, ignora todos los comandos excepto "!onbot"
    if (!this.botEnabled && command !== '!onbot') return;

    // Definir comandos generales
    const commands = {
      // Saludo
      '!hola': () => `¡Hola, ${username}! 👋`,

      // Agregar tarea
      '!addtask': () => this.addTaskCommand(username, args),
      '!agregartarea': () => this.addTaskCommand(username, args),
      '!agregar': () => this.addTaskCommand(username, args),
      '!add': () => this.addTaskCommand(username, args),

      // Ver tareas
      '!tasks': () => this.showTasksCommand(username),
      '!tareas': () => this.showTasksCommand(username),
      '!list': () => this.showTasksCommand(username),
      '!mis-tareas': () => this.showTasksCommand(username),

      // Cambiar tarea en progreso o crear nueva
      '!estoy': () => this.changeTaskStatusCommand(username, args),
      '!esta': () => this.changeTaskStatusCommand(username, args),
      '!workingon': () => this.changeTaskStatusCommand(username, args),
      '!trabajando': () => this.changeTaskStatusCommand(username, args),

      // Finalizar tarea en progreso
      '!done': () => this.finishTaskCommand(username),
      '!finish': () => this.finishTaskCommand(username),
      '!finalizar': () => this.finishTaskCommand(username),
      '!completado': () => this.finishTaskCommand(username),

      // Mostrar comandos disponibles
      '!comandos': () => this.getUserCommands(),
      '!help': () => this.getUserCommands(),
      '!ayuda': () => this.getUserCommands(),
    };

    // Comandos exclusivos para el streamer y moderadores
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

    // Ejecutar el comando si existe
    if (commands[command]) {
      const response = await commands[command]();
      if (response) {
        client.say(channel, response);
      }
    }
  }

  // Agregar una tarea
  private addTaskCommand(user: string, args: string[]): string {
    const description = args.join(' ').trim();
    if (!description)
      return '⚠️ Debes proporcionar una descripción para la tarea.';
    const task = this.taskService.addTask(user, description);
    return `✅ Tarea #${task.id} añadida: ${description}`;
  }

  // Mostrar las tareas del usuario
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

  // Cambiar el estado de una tarea
  private changeTaskStatusCommand(user: string, args: string[]): string {
    const text = args.join(' ').trim();
    const taskRegex = /^tarea(\d+)$/i;
    const match = text.match(taskRegex);

    if (match) {
      const taskId = parseInt(match[1], 10);
      const task = this.taskService.updateTaskStatus(
        user,
        taskId,
        'en progreso',
      );
      return task
        ? `⏳ Tarea #${taskId} ahora está en progreso.`
        : '⚠️ Esa tarea no está en tu listado.';
    } else {
      const newTask = this.taskService.addTask(user, text, 'en progreso');
      return `✅ Nueva tarea en progreso: #${newTask.id} - ${text}`;
    }
  }

  // Finalizar la tarea en progreso
  private finishTaskCommand(user: string): string {
    const finishedTask = this.taskService.finishCurrentTask(user);
    return finishedTask
      ? `✔️ Tarea #${finishedTask.id} finalizada: ${finishedTask.description}`
      : '⚠️ No tienes ninguna tarea en progreso.';
  }

  // Comandos disponibles para todos los usuarios
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

  // Comandos disponibles solo para el streamer y moderadores
  private getAdminCommands(): string {
    return `
    🔧 **Comandos de Administración**  
    - **!onbot** → Activa el bot  
    - **!offbot** → Desactiva el bot  
    - **!admincomandos** → Muestra estos comandos  
    `;
  }
}
