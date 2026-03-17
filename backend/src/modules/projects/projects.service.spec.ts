import { ProjectsService } from './projects.service';
import { UserRole } from '../../database/entities/user.entity';

describe('ProjectsService access helpers', () => {
  let service: ProjectsService;
  let userRepository: { findOne: jest.Mock };
  let projectMemberRepository: { findOne: jest.Mock };

  beforeEach(() => {
    userRepository = { findOne: jest.fn() };
    projectMemberRepository = { findOne: jest.fn() };

    service = new ProjectsService(
      {} as any,
      projectMemberRepository as any,
      userRepository as any,
    );
  });

  it('returns false from hasAccess when user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const result = await service.hasAccess('project-1', 'missing-user');

    expect(result).toBe(false);
    expect(projectMemberRepository.findOne).not.toHaveBeenCalled();
  });

  it('returns false from isProjectAdmin when user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(undefined);

    const result = await (service as any).isProjectAdmin('project-1', 'missing-user');

    expect(result).toBe(false);
    expect(projectMemberRepository.findOne).not.toHaveBeenCalled();
  });

  it('treats platform admins as project admins regardless of membership', async () => {
    userRepository.findOne.mockResolvedValue({ role: UserRole.ADMIN });

    const result = await (service as any).isProjectAdmin('project-1', 'admin-user');

    expect(result).toBe(true);
    expect(projectMemberRepository.findOne).not.toHaveBeenCalled();
  });
});
