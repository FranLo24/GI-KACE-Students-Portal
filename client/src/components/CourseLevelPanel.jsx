import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

export default function CourseLevelPanel() {
  const [courseLevels, setCourseLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(null);
  const [removingCategory, setRemovingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [search, setSearch] = useState('');

  const fetchCourseLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/course-levels');
      setCourseLevels(res.data);
    } catch {
      // non-critical panel — fail silently, admin can retry by reloading
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourseLevels();
  }, [fetchCourseLevels]);

  async function updateLevel(category, level) {
    setSavingCategory(category);
    try {
      await api.put('/admin/course-levels/' + encodeURIComponent(category), { level: level || null });
      await fetchCourseLevels();
    } finally {
      setSavingCategory(null);
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await updateLevel(newCategory.trim(), newLevel);
    setNewCategory('');
    setNewLevel('');
  }

  async function handleRemove(category) {
    setRemovingCategory(category);
    try {
      await api.delete('/admin/course-levels/' + encodeURIComponent(category));
      await fetchCourseLevels();
    } finally {
      setRemovingCategory(null);
    }
  }

  const visibleCourseLevels = courseLevels.filter((entry) =>
    entry.category.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="portal-panel p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Course recommendations</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">Course Level Mapping</h2>
      <p className="mt-2 text-sm text-slate-500">
        Set which computer literacy level each course is recommended for. Students see the matching course
        highlighted during registration.
      </p>

      <div className="mt-5">
        <label className="sr-only" htmlFor="course-level-search">
          Search courses
        </label>
        <input
          id="course-level-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="portal-input max-w-sm"
        />
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : visibleCourseLevels.length === 0 ? (
          <p className="text-sm text-slate-500">No courses match "{search}".</p>
        ) : (
          visibleCourseLevels.map((entry) => (
            <div
              key={entry.category}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <p className="text-sm font-medium text-slate-700">{entry.category}</p>
              <div className="flex items-center gap-2">
                <select
                  value={entry.level || ''}
                  onChange={(e) => updateLevel(entry.category, e.target.value)}
                  disabled={savingCategory === entry.category || removingCategory === entry.category}
                  className="portal-select w-44"
                >
                  <option value="">Unset</option>
                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemove(entry.category)}
                  disabled={removingCategory === entry.category || savingCategory === entry.category}
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {removingCategory === entry.category ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddCategory} className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5">
        <div className="min-w-[180px] flex-1">
          <label className="mb-2 block text-sm font-medium text-slate-700">New course category</label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Cloud Computing"
            className="portal-input"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Level</label>
          <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="portal-select w-44">
            <option value="">Unset</option>
            {LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="portal-button-secondary">
          Add
        </button>
      </form>
    </div>
  );
}
