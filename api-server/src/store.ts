export interface Profile {
  id: string;
  name: string;
  skills: string[];
  interests: string[];
  academicYear: string;
  createdAt: string;
}

export interface PerformanceRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  date: string;
  topic: string;
  difficulty: string;
}

export interface SimulationTask {
  id: string;
  type: "quiz" | "coding";
  title: string;
  description: string;
  question: string;
  options: string[];
  timeLimit: number;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  correctAnswer: string;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

class InMemoryStore {
  profile: Profile | null = null;

  performanceRecords: PerformanceRecord[] = [
    { id: "demo-1", taskId: "task-1", taskTitle: "Data Structures Fundamentals", score: 4, maxScore: 10, percentage: 40, timeTaken: 58, date: daysAgo(18), topic: "Data Structures", difficulty: "Easy" },
    { id: "demo-2", taskId: "task-5", taskTitle: "SQL Database Queries", score: 5, maxScore: 10, percentage: 50, timeTaken: 52, date: daysAgo(15), topic: "Databases", difficulty: "Easy" },
    { id: "demo-3", taskId: "task-2", taskTitle: "Algorithm Complexity", score: 5, maxScore: 10, percentage: 50, timeTaken: 75, date: daysAgo(13), topic: "Algorithms", difficulty: "Medium" },
    { id: "demo-4", taskId: "task-3", taskTitle: "Python List Comprehension", score: 6, maxScore: 10, percentage: 60, timeTaken: 95, date: daysAgo(11), topic: "Python", difficulty: "Medium" },
    { id: "demo-5", taskId: "task-1", taskTitle: "Data Structures Fundamentals", score: 7, maxScore: 10, percentage: 70, timeTaken: 40, date: daysAgo(8), topic: "Data Structures", difficulty: "Easy" },
    { id: "demo-6", taskId: "task-4", taskTitle: "Machine Learning Concepts", score: 6, maxScore: 10, percentage: 60, timeTaken: 68, date: daysAgo(6), topic: "Machine Learning", difficulty: "Hard" },
    { id: "demo-7", taskId: "task-2", taskTitle: "Algorithm Complexity", score: 7, maxScore: 10, percentage: 70, timeTaken: 60, date: daysAgo(3), topic: "Algorithms", difficulty: "Medium" },
    { id: "demo-8", taskId: "task-5", taskTitle: "SQL Database Queries", score: 8, maxScore: 10, percentage: 80, timeTaken: 35, date: daysAgo(1), topic: "Databases", difficulty: "Easy" },
  ];

  simulationTasks: SimulationTask[] = [
    {
      id: "task-1",
      type: "quiz",
      title: "Data Structures Fundamentals",
      description: "Test your knowledge of fundamental data structures used in software engineering.",
      question: "Which data structure uses LIFO (Last In, First Out) ordering?",
      options: ["Queue", "Stack", "Linked List", "Binary Tree"],
      timeLimit: 60,
      difficulty: "Easy",
      topic: "Data Structures",
      correctAnswer: "Stack",
    },
    {
      id: "task-2",
      type: "quiz",
      title: "Algorithm Complexity",
      description: "Assess your understanding of algorithmic time and space complexity.",
      question: "What is the time complexity of binary search on a sorted array?",
      options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
      timeLimit: 90,
      difficulty: "Medium",
      topic: "Algorithms",
      correctAnswer: "O(log n)",
    },
    {
      id: "task-3",
      type: "coding",
      title: "Python List Comprehension",
      description: "Evaluate your ability to write clean, idiomatic Python code.",
      question: "Which of the following correctly creates a list of squares of even numbers from 1 to 10 using list comprehension?",
      options: [
        "[x**2 for x in range(1,11) if x%2==0]",
        "[x**2 if x%2==0 for x in range(1,11)]",
        "[x**2 for x%2==0 in range(1,11)]",
        "filter(lambda x: x**2, range(1,11))",
      ],
      timeLimit: 120,
      difficulty: "Medium",
      topic: "Python",
      correctAnswer: "[x**2 for x in range(1,11) if x%2==0]",
    },
    {
      id: "task-4",
      type: "quiz",
      title: "Machine Learning Concepts",
      description: "Test your grasp of core machine learning terminology and concepts.",
      question: "Which technique is used to prevent overfitting in neural networks by randomly disabling neurons during training?",
      options: ["Batch Normalization", "Dropout", "L2 Regularization", "Early Stopping"],
      timeLimit: 75,
      difficulty: "Hard",
      topic: "Machine Learning",
      correctAnswer: "Dropout",
    },
    {
      id: "task-5",
      type: "quiz",
      title: "SQL Database Queries",
      description: "Prove your SQL proficiency with practical query challenges.",
      question: "Which SQL clause is used to filter groups of rows returned by GROUP BY?",
      options: ["WHERE", "HAVING", "FILTER", "CASE"],
      timeLimit: 60,
      difficulty: "Easy",
      topic: "Databases",
      correctAnswer: "HAVING",
    },
  ];

  currentTaskIndex = 0;

  getNextTask(): SimulationTask {
    const task = this.simulationTasks[this.currentTaskIndex % this.simulationTasks.length];
    this.currentTaskIndex++;
    return task;
  }
}

export const store = new InMemoryStore();
