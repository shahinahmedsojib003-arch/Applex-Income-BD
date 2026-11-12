import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Clock,
  Coins,
  ExternalLink,
  CheckCircle,
  Clock3,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Task, TaskCategory, TaskSubmission } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface TasksViewProps {
  tasks: Task[];
  userSubmissions: TaskSubmission[];
  onOpenTaskModal: (task: Task) => void;
  onOpenAuth: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  userSubmissions,
  onOpenTaskModal,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'available' | 'mySubmissions'>('available');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: t('all') },
    { id: 'visit', label: t('categoryVisit') },
    { id: 'video', label: t('categoryVideo') },
    { id: 'social', label: t('categorySocial') },
    { id: 'survey', label: t('categorySurvey') },
    { id: 'app', label: t('categoryApp') },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(searchLower) ||
      (task.titleBn && task.titleBn.toLowerCase().includes(searchLower)) ||
      task.description.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch && task.status === 'active';
  });

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-700" />
            <span>{t('navTasks')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Earn money by completing daily verified micro-tasks
          </p>
        </div>

        {/* Available vs My Submissions Tab */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('available')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'available'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('allTasks')} ({tasks.length})
          </button>
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else setActiveSubTab('mySubmissions');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'mySubmissions'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Proofs ({userSubmissions.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'available' ? (
        <>
          {/* Search & Category Filter Bar */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    activeCategory === cat.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-700">No tasks found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Try selecting a different category or clear your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => {
                const title =
                  language === 'bn' && task.titleBn ? task.titleBn : task.title;
                const desc =
                  language === 'bn' && task.descriptionBn
                    ? task.descriptionBn
                    : task.description;

                const hasSubmitted = userSubmissions.some((s) => s.taskId === task.id);

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {task.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.timeRequiredSec}s</span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                        {title}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono font-black text-base text-emerald-800">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>+৳{task.rewardAmount.toFixed(2)}</span>
                      </div>

                      {hasSubmitted ? (
                        <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (!currentUser) onOpenAuth();
                            else onOpenTaskModal(task);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
                        >
                          {t('startTask')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Submissions Tab */
        <div className="space-y-3">
          {userSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400">
                You haven't submitted any task proofs yet. Choose a task and start earning!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {userSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-900">{sub.taskTitle}</h4>
                    <p className="text-xs text-gray-500 font-mono">Proof: {sub.proofContent}</p>
                    {sub.adminFeedback && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 inline-block">
                        Note: {sub.adminFeedback}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400">
                      Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <span className="font-extrabold font-mono text-sm text-emerald-700">
                      +৳{sub.rewardAmount.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sub.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {sub.status === 'pending' && <Clock3 className="w-3 h-3" />}
                      {sub.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
