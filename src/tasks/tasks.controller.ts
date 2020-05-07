import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}


  @Get()
  getTasks(@Query(ValidationPipe) filterDto : GetTasksFilterDto) : Promise<Task[]> {
    return this.tasksService.getTasks(filterDto);
  }

  @Get('/:id')
  getTaskById(@Param('id', ParseIntPipe) id : number) : Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @Delete('/:id')
  deleteTaskById(@Param('id', ParseIntPipe) id : number) : Promise<void> {
    return this.tasksService.deleteTaskById(id);
  }

  @Patch('/:id/status')
  updateStatusById(@Param('id', ParseIntPipe) id : number, @Body('status', TaskStatusValidationPipe) status: TaskStatus) : Promise<Task> {
    return this.tasksService.updateStatusById(id, status);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createTask(@Body() createTaskDto: CreateTaskDto) : Promise<Task> {
    return this.tasksService.createTask(createTaskDto);
  }
}
