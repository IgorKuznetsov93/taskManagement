import {Test} from '@nestjs/testing';
import {NotFoundException} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {TaskRepository} from './task.repository';
import {GetTasksFilterDto} from './dto/get-tasks-filter.dto';
import {TaskStatus} from './task-status.enum';
import {CreateTaskDto} from './dto/create-task.dto';

const mockUser = { id: 12, username: 'Test user' };

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  deleteTaskById: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });
  describe('getTasks', () => {
    it('get all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'some search' };
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });
  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task ', async () => {
      const mockTask = { title: 'test title', description: 'test desc' };
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where:
          { id: 1, userId: mockUser.id },
      });
    });

    it('throw an Error when task not found ', async () => {
      const id = 1;
      taskRepository.findOne.mockResolvedValue(null);
      await expect(tasksService.getTaskById(id, mockUser)).rejects.toThrow(NotFoundException);
    });
  });
  describe('createTask', () => {
    it('calls taskRepository.createTask() and return the task ', async () => {
      const createTaskDto : CreateTaskDto = { title: 'test title', description: 'test desc' };
      const mockTask = {
        title: createTaskDto.title,
        description: createTaskDto.description,
        id: 1,
        userId: mockUser.id,
      };
      taskRepository.createTask.mockResolvedValue(mockTask);
      const result = await tasksService.createTask(createTaskDto, mockUser);
      expect(result).toEqual(mockTask);
      expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
    });
  });
  describe('deleteTask', () => {
    it('calls taskRepository.deleteTaskById() ', async () => {
      taskRepository.deleteTaskById.mockResolvedValue();
      const result = await taskRepository.deleteTaskById(1, mockUser);
      expect(result).toBeUndefined();
      expect(taskRepository.deleteTaskById).toHaveBeenCalledWith(1, mockUser);
    });
    it('throw an Error as task could not be found ', async () => {
      await expect(tasksService.deleteTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTask', () => {
    it('calls taskRepository.updateStatusById() ', async () => {
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save: jest.fn().mockResolvedValue(true),
      });
      const result = await tasksService.updateStatusById(1, TaskStatus.IN_PROGRESS, mockUser);
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});
