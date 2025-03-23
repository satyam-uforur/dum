export interface Message {
  _id?: string;
  from: string;
  content: string;
  timestamp: Date;
  time?: string;
  fileUrl?: string;
  fileName?: string;
  type?: "general" | "task" | "group";
  user?: string;
  avatar?: string;
}

export interface ChatProps {
  username: string;
}

export interface Task {
  _id: string;
  taskId: string;
  name: string;
  task: string;
  assigndate: string;
  duedate: string;
  workercount: number;
  workers: string[];
}

export interface Task {
  id: string;
  name: string;
}

export interface User {
  username: string;
  tasks: Task[];
}
