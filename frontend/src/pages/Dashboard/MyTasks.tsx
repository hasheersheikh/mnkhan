import React, { useState, useEffect } from 'react';
import TaskTimeline from '../../components/Dashboard/TaskTimeline';
import * as tasksApi from '../../api/tasks';

const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksApi.getTasks();
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <h2 className="text-3xl font-serif italic mb-8 text-mnkhan-charcoal">Matter Progress Tracking</h2>
      {tasks.length > 0 ? (
        tasks.map(task => (
          <TaskTimeline 
            key={task._id}
            title={task.title}
            description={task.description}
            status={task.status}
            progress={task.progress}
            timeline={task.timeline}
            steps={task.steps}
          />
        ))
      ) : (
        <div className="bg-white p-12 text-center rounded-sm border border-mnkhan-gray-border">
          <p className="text-mnkhan-text-muted italic">No active legal matters or tasks found.</p>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
