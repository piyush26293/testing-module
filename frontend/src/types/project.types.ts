export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  testCaseCount?: number;
  lastExecutionAt?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status?: 'active' | 'archived';
}

export interface ProjectSettings {
  projectId: string;
  environments: Environment[];
  teamMembers: TeamMember[];
}

export interface Environment {
  id: string;
  name: string;
  url: string;
  variables: Record<string, string>;
}

export interface TeamMember {
  id: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  name: string;
  email: string;
}
