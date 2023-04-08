export const roles = ["None", "Administrator", "Customer", "Employee"] as const;
type Role = typeof roles[number];

export const statuses = ["None", "Active", "Deleted"] as const;
type Status = typeof statuses[number];

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  status: Status;
  role: Role;
  createdAt: string;
};
