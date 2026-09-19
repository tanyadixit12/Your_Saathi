import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CheckSquare,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    tasks,
    addAppointment,
    toggleAppointment,
    deleteAppointment,
    addTask,
    toggleTask,
    deleteTask,
    setCurrentView,
    speakText,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appointments' | 'tasks'>('appointments');
  const [showAddApt, setShowAddApt] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Form states
  const [aptForm, setAptForm] = useState({
    title: '',
    dateTime: 'Today at 4:00 PM',
    location: '',
    notes: '',
  });

  const [taskForm, setTaskForm] = useState<{
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>({
    title: '',
    dueDate: 'By Friday',
    priority: 'medium',
  });

  const handleCreateApt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptForm.title.trim() || !aptForm.location.trim()) return;
    await addAppointment(aptForm);
    setAptForm({ title: '', dateTime: 'Today at 4:00 PM', location: '', notes: '' });
    setShowAddApt(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    await addTask(taskForm);
    setTaskForm({ title: '', dueDate: 'By Friday', priority: 'medium' });
    setShowAddTask(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Day</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <Calendar className="w-10 h-10 text-blue-600" />
            <span>Appointments & Tasks</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-stone-600 dark:text-stone-400 mt-1">
            Keep track of doctor visits, errands, and what to bring.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-200 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-300 dark:border-stone-700">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2.5 rounded-xl font-black text-lg transition-colors min-h-[48px] ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-2.5 rounded-xl font-black text-lg transition-colors min-h-[48px] ${
              activeTab === 'tasks'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-stone-900 dark:text-white">
              Upcoming Doctor Visits & Meetings
            </h2>
            <button
              onClick={() => setShowAddApt(!showAddApt)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>{showAddApt ? 'Cancel' : 'Add Appointment'}</span>
            </button>
          </div>

          {/* Add Appointment Form */}
          {showAddApt && (
            <form
              onSubmit={handleCreateApt}
              className="bg-white dark:bg-stone-900 border-3 border-blue-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
            >
              <h3 className="text-2xl font-black text-stone-950 dark:text-white">
                Add New Appointment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="apt-title" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                    Title / Purpose *
                  </label>
                  <input
                    id="apt-title"
                    type="text"
                    value={aptForm.title}
                    onChange={(e) => setAptForm({ ...aptForm, title: e.target.value })}
                    placeholder="e.g. Doctor visit with Dr. Rao, Eye checkup"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="apt-time" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                    Date and Time *
                  </label>
                  <input
                    id="apt-time"
                    type="text"
                    value={aptForm.dateTime}
                    onChange={(e) => setAptForm({ ...aptForm, dateTime: e.target.value })}
                    placeholder="e.g. Monday 4:00 PM, Tomorrow 11:00 AM"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="apt-loc" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                    Location / Clinic Name *
                  </label>
                  <input
                    id="apt-loc"
                    type="text"
                    value={aptForm.location}
                    onChange={(e) => setAptForm({ ...aptForm, location: e.target.value })}
                    placeholder="e.g. City Clinic Ground Floor Room 4"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="apt-notes" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                    Notes / Questions for Doctor
                  </label>
                  <input
                    id="apt-notes"
                    type="text"
                    value={aptForm.notes}
                    onChange={(e) => setAptForm({ ...aptForm, notes: e.target.value })}
                    placeholder="e.g. Discuss knee stiffness and blood report"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-md min-h-[48px]"
                >
                  Save & Generate Preparation Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddApt(false)}
                  className="px-6 py-3.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-white font-bold text-lg min-h-[48px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Appointments Cards List */}
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className={`border-3 rounded-3xl p-6 sm:p-7 shadow-sm transition-all ${
                  apt.completed
                    ? 'bg-stone-100 dark:bg-stone-900/60 border-stone-300 dark:border-stone-800 opacity-80'
                    : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 hover:border-blue-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                        {apt.title}
                      </span>
                      <span
                        className={`text-sm font-black px-3 py-1 rounded-full ${
                          apt.completed
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {apt.completed ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>

                    <div className="text-lg font-bold text-stone-700 dark:text-stone-300 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>{apt.dateTime}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-5 h-5 text-rose-600" />
                        <span>{apt.location}</span>
                      </span>
                    </div>

                    {apt.notes && (
                      <p className="text-base font-semibold text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                        📌 {apt.notes}
                      </p>
                    )}

                    {/* AI Preparation Checklist */}
                    {apt.preparationChecklist && apt.preparationChecklist.length > 0 && (
                      <div className="mt-4 bg-blue-50 dark:bg-stone-800/80 border-2 border-blue-200 dark:border-blue-900/50 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span>AI Preparation Checklist:</span>
                          </span>
                          <button
                            onClick={() =>
                              speakText(`Preparation checklist for ${apt.title}: ${apt.preparationChecklist?.join('. ')}`)
                            }
                            className="text-xs font-bold text-blue-700 dark:text-blue-300 underline"
                          >
                            Listen
                          </button>
                        </div>
                        <ul className="space-y-1.5 text-base font-bold text-stone-800 dark:text-stone-200">
                          {apt.preparationChecklist.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2 md:pt-0">
                    <button
                      onClick={() => toggleAppointment(apt.id)}
                      className={`px-5 py-3 rounded-xl font-black text-lg transition-transform active:scale-95 min-h-[48px] ${
                        apt.completed
                          ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                      }`}
                    >
                      {apt.completed ? 'Mark Upcoming' : '✓ Mark Done'}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this appointment?')) {
                          deleteAppointment(apt.id);
                        }
                      }}
                      className="p-3 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors min-h-[48px]"
                      aria-label="Delete appointment"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="bg-white dark:bg-stone-900 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-3xl p-12 text-center">
                <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-xl font-bold text-stone-600 dark:text-stone-400">
                  No appointments scheduled.
                </p>
                <button
                  onClick={() => setShowAddApt(true)}
                  className="mt-4 px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold text-lg"
                >
                  Schedule Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-stone-900 dark:text-white">
              Things to Do (Chores & Bills)
            </h2>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-lg shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>{showAddTask ? 'Cancel' : 'Add Task'}</span>
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTask && (
            <form
              onSubmit={handleCreateTask}
              className="bg-white dark:bg-stone-900 border-3 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
            >
              <h3 className="text-2xl font-black text-stone-950 dark:text-white">
                Add New Task
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="task-title" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                    Task Title *
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="e.g. Pay electricity bill, Water plants"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="task-due" className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                    Due Date *
                  </label>
                  <input
                    id="task-due"
                    type="text"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    placeholder="e.g. Friday, Tomorrow morning"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xl shadow-md min-h-[48px]"
                >
                  Save Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-6 py-3.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-white font-bold text-lg min-h-[48px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`border-3 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4 transition-all ${
                  task.completed
                    ? 'bg-stone-100 dark:bg-stone-900/60 border-stone-300 dark:border-stone-800 opacity-70 line-through'
                    : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-9 h-9 rounded-xl border-3 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-400 dark:border-stone-600 hover:border-emerald-600'
                    }`}
                    aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                  >
                    {task.completed && <CheckCircle2 className="w-6 h-6" />}
                  </button>

                  <div>
                    <span className="text-xl sm:text-2xl font-black text-stone-950 dark:text-white">
                      {task.title}
                    </span>
                    <div className="text-base font-bold text-stone-600 dark:text-stone-400 mt-0.5">
                      Due: <span className="text-stone-900 dark:text-stone-200">{task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this task?')) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-3 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors min-h-[48px]"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="bg-white dark:bg-stone-900 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-3xl p-12 text-center">
                <CheckSquare className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-xl font-bold text-stone-600 dark:text-stone-400">
                  No tasks on your list right now.
                </p>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="mt-4 px-6 py-3 rounded-xl bg-amber-600 text-white font-extrabold text-lg"
                >
                  Add a Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
