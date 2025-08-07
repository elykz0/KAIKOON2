import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Skeleton } from './Skeleton';
import { BookOpen, Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { postJournalAnalyze } from '../endpoints/journal/analyze_POST.schema';
import styles from './JournalDialog.module.css';

interface JournalEntry {
  text: string;
}

interface AnalyzedResult {
  tasks: string[];
  deadlines: Record<string, string>;
  obstacles: string[];
  schedule: Array<{
    task: string;
    start: string;
    end: string;
    deadline: string;
    subtasks: string[];
  }>;
  obstacle_strategies: Array<{
    obstacle: string;
    strategies: string[];
  }>;
  feedback_summary: string;
}

interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksCreated: (tasks: Array<{ title: string; estimatedMinutes: number }>) => void;
}

export const JournalDialog = ({ open, onOpenChange, onTasksCreated }: JournalDialogProps) => {
  const [journalText, setJournalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzedResult | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const analyzeJournal = async () => {
    if (!journalText.trim()) return;

    setIsAnalyzing(true);
    try {
      // Use the proper API call
      const result = await postJournalAnalyze({ text: journalText });
      setAnalysisResult(result);
    } catch (error) {
      console.warn('Journal analysis failed, using fallback:', error);
      const fallbackResult = analyzeJournalFallback(journalText);
      setAnalysisResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeJournalFallback = (text: string): AnalyzedResult => {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based analysis
    const tasks: string[] = [];
    const deadlines: Record<string, string> = {};
    const obstacles: string[] = [];

    // Extract tasks
    if (lowerText.includes('homework')) tasks.push('Complete homework');
    if (lowerText.includes('project')) tasks.push('Finish project');
    if (lowerText.includes('study')) tasks.push('Study for exam');
    if (lowerText.includes('essay')) tasks.push('Write essay');
    if (lowerText.includes('assignment')) tasks.push('Complete assignment');

    // Extract deadlines
    if (lowerText.includes('tomorrow')) {
      const task = tasks[0] || 'Complete task';
      deadlines[task] = 'tomorrow';
    }
    if (lowerText.includes('friday')) {
      const task = tasks[0] || 'Complete task';
      deadlines[task] = 'friday';
    }
    if (lowerText.includes('next week')) {
      const task = tasks[0] || 'Complete task';
      deadlines[task] = 'next week';
    }

    // Extract obstacles
    if (lowerText.includes('distracted') || lowerText.includes('phone')) {
      obstacles.push('Phone distractions');
    }
    if (lowerText.includes('noise') || lowerText.includes('siblings')) {
      obstacles.push('Environmental noise');
    }
    if (lowerText.includes('motivation') || lowerText.includes('overwhelmed')) {
      obstacles.push('Lack of motivation');
    }

    const schedule = tasks.map(task => ({
      task,
      start: '09:00 AM',
      end: '10:00 AM',
      deadline: deadlines[task] || 'No deadline',
      subtasks: ['Break down task', 'Start with easiest part', 'Review progress']
    }));

    const obstacle_strategies = obstacles.map(obstacle => ({
      obstacle,
      strategies: ['Use focus techniques', 'Create a quiet workspace', 'Set specific time blocks']
    }));

    return {
      tasks,
      deadlines,
      obstacles,
      schedule,
      obstacle_strategies,
      feedback_summary: `I found ${tasks.length} tasks in your journal entry. ${obstacles.length > 0 ? `You mentioned ${obstacles.length} obstacles that we can address.` : ''}`
    };
  };

  const handleCreateTasks = () => {
    if (!analysisResult) return;

    const tasksToCreate = Array.from(selectedTasks).map(taskTitle => ({
      title: taskTitle,
      estimatedMinutes: 60 // Default 60 minutes per task
    }));

    onTasksCreated(tasksToCreate);
    onOpenChange(false);
    setJournalText('');
    setAnalysisResult(null);
    setSelectedTasks(new Set());
  };

  const toggleTaskSelection = (task: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(task)) {
      newSelected.delete(task);
    } else {
      newSelected.add(task);
    }
    setSelectedTasks(newSelected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            <BookOpen size={20} />
            Journal & Task Analysis
          </DialogTitle>
        </DialogHeader>

        <div className={styles.content}>
          {!analysisResult ? (
            <div className={styles.journalSection}>
              <label className={styles.label}>
                Write about your day, tasks, and any challenges you're facing:
              </label>
              <Textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Today I need to finish my math homework by tomorrow evening, but I keep getting distracted by my phone notifications..."
                className={styles.textarea}
                rows={6}
              />
              <Button
                onClick={analyzeJournal}
                disabled={!journalText.trim() || isAnalyzing}
                className={styles.analyzeButton}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Journal'}
              </Button>
            </div>
          ) : (
            <div className={styles.analysisSection}>
              <div className={styles.analysisHeader}>
                <h3 className={styles.analysisTitle}>Analysis Results</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedTasks(new Set());
                  }}
                >
                  Write New Entry
                </Button>
              </div>

              {analysisResult.tasks.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <CheckCircle size={16} />
                    Tasks Found
                  </h4>
                  <div className={styles.taskList}>
                    {analysisResult.tasks.map((task, index) => (
                      <label key={index} className={styles.taskItem}>
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task)}
                          onChange={() => toggleTaskSelection(task)}
                          className={styles.checkbox}
                        />
                        <span className={styles.taskText}>{task}</span>
                        {analysisResult.deadlines[task] && (
                          <span className={styles.deadline}>
                            <Calendar size={12} />
                            {analysisResult.deadlines[task]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.obstacles.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <AlertTriangle size={16} />
                    Obstacles Identified
                  </h4>
                  <div className={styles.obstaclesList}>
                    {analysisResult.obstacles.map((obstacle, index) => (
                      <div key={index} className={styles.obstacleItem}>
                        <span className={styles.obstacleText}>{obstacle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.schedule.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>
                    <Clock size={16} />
                    Suggested Schedule
                  </h4>
                  <div className={styles.scheduleList}>
                    {analysisResult.schedule.map((item, index) => (
                      <div key={index} className={styles.scheduleItem}>
                        <div className={styles.scheduleTime}>
                          {item.start} - {item.end}
                        </div>
                        <div className={styles.scheduleTask}>{item.task}</div>
                        {item.deadline !== 'No deadline' && (
                          <div className={styles.scheduleDeadline}>
                            Due: {item.deadline}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <Button
                  onClick={handleCreateTasks}
                  disabled={selectedTasks.size === 0}
                  className={styles.createButton}
                >
                  Create {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
