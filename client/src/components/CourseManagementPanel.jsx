import { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import api from '../api/axios';
import { formatFee } from '../utils/currency';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';
import { useCourseLocations } from '../hooks/useCourseLocations';

const EMPTY_FORM = {
  title: '',
  category: '',
  description: '',
  outcomes: '',
  spotlight: '',
  imageUrl: '',
};

function CourseForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [uploading, setUploading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/admin/uploads', formData);
      update('imageUrl', res.data.url);
    } catch {
      // upload failed — leave the previous image in place
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      title: form.title,
      category: form.category,
      description: form.description || undefined,
      outcomes: form.outcomes || undefined,
      spotlight: form.spotlight || undefined,
      imageUrl: form.imageUrl || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
        <input value={form.title} onChange={(e) => update('title', e.target.value)} required className="portal-input" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
        <input value={form.category} onChange={(e) => update('category', e.target.value)} required className="portal-input" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Spotlight tag</label>
        <input value={form.spotlight} onChange={(e) => update('spotlight', e.target.value)} className="portal-input" placeholder="e.g. Security Track" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
        <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={2} className="portal-textarea" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-600">Outcomes</label>
        <input value={form.outcomes} onChange={(e) => update('outcomes', e.target.value)} className="portal-input" placeholder="e.g. Threat detection · Risk analysis" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-600">Course image</label>
        <div className="flex flex-wrap items-center gap-4">
          {form.imageUrl && <img src={form.imageUrl} alt="Course preview" className="h-20 w-32 rounded-xl object-cover" />}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageUpload} disabled={uploading} className="text-sm" />
          {form.imageUrl && (
            <button type="button" onClick={() => update('imageUrl', '')} className="portal-button-secondary px-3 py-1.5 text-xs">
              Remove
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={uploading} className="portal-button-primary px-4 py-2 text-xs">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="portal-button-secondary px-4 py-2 text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}

function locationFeesSummary(locationFees) {
  if (!locationFees || locationFees.length === 0) return 'No fees set';
  return locationFees.map((entry) => `${entry.location} ${formatFee(entry.fee)}`).join(' · ');
}

function LocationFeesEditor({ course, onSave, onCancel }) {
  const knownLocations = useCourseLocations();
  const existingLocations = (course.locationFees || []).map((entry) => entry.location);
  const locations = Array.from(new Set([...knownLocations, ...existingLocations]));

  const initialValues = Object.fromEntries(
    locations.map((location) => {
      const match = (course.locationFees || []).find((entry) => entry.location === location);
      return [location, match ? String(match.fee) : ''];
    })
  );

  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);

  function update(location, value) {
    setValues((prev) => ({ ...prev, [location]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const fees = Object.fromEntries(
      Object.entries(values).map(([location, value]) => [location, value === '' ? null : Number(value)])
    );
    await onSave(fees);
    setSaving(false);
  }

  if (locations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-500">
        No centre locations are configured yet. Add options to the "Center Location" field in the form builder first.
        <div className="mt-3">
          <button type="button" onClick={onCancel} className="portal-button-secondary px-3 py-1.5 text-xs">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2">
      {locations.map((location) => (
        <div key={location}>
          <label className="mb-1 block text-xs font-medium text-slate-600">{location} fee (GHS)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={values[location]}
            onChange={(e) => update(location, e.target.value)}
            className="portal-input"
            placeholder="Leave blank for no price"
          />
        </div>
      ))}
      <div className="flex gap-2 sm:col-span-2">
        <button type="button" onClick={handleSave} disabled={saving} className="portal-button-primary px-4 py-2 text-xs">
          {saving ? 'Saving…' : 'Save fees'}
        </button>
        <button type="button" onClick={onCancel} className="portal-button-secondary px-4 py-2 text-xs">
          Cancel
        </button>
      </div>
    </div>
  );
}

function CourseRow({
  course,
  index,
  courseCount,
  onMove,
  onToggleEnabled,
  onEdit,
  onDelete,
  onSaveFees,
  editing,
  onStartEdit,
  onCancelEdit,
}) {
  const [showFees, setShowFees] = useState(false);

  if (editing) {
    return (
      <CourseForm
        initial={{
          title: course.title,
          category: course.category,
          description: course.description || '',
          outcomes: course.outcomes || '',
          spotlight: course.spotlight || '',
          imageUrl: course.imageUrl || '',
        }}
        submitLabel="Save course"
        onCancel={onCancelEdit}
        onSubmit={(values) => onEdit(course.id, values)}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="text-xs text-slate-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === courseCount - 1}
            className="text-xs text-slate-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ▼
          </button>
        </div>

        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} className="h-14 w-20 rounded-xl object-cover" />
        ) : (
          <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-slate-400">No image</div>
        )}

        <div className="min-w-[160px] flex-1">
          <p className="text-sm font-semibold text-slate-900">{course.title}</p>
          <p className="text-xs text-slate-400">{course.category}</p>
        </div>

        <p className="min-w-[160px] text-xs font-medium text-slate-600">{locationFeesSummary(course.locationFees)}</p>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input type="checkbox" checked={course.enabled} onChange={(e) => onToggleEnabled(course, e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          Shown on site
        </label>

        <button type="button" onClick={() => setShowFees((prev) => !prev)} className="portal-button-secondary px-3 py-1.5 text-xs">
          {showFees ? 'Hide fees' : 'Location fees'}
        </button>

        <button type="button" onClick={() => onStartEdit(course.id)} className="portal-button-secondary px-3 py-1.5 text-xs">
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(course)}
          className="portal-button-secondary bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 px-3 py-1.5 text-xs"
        >
          Delete
        </button>
      </div>

      {showFees && (
        <div className="mt-3">
          <LocationFeesEditor
            course={course}
            onCancel={() => setShowFees(false)}
            onSave={async (fees) => {
              await onSaveFees(course.id, fees);
              setShowFees(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function CourseManagementPanel() {
  const handleUnauthorizedAccess = useUnauthorizedRedirect();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorizedAccess]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  async function guarded(action, failureMessage) {
    try {
      await action();
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setError(err.response?.data?.message || failureMessage);
      setTimeout(() => setError(''), 4000);
    }
  }

  async function createCourse(values) {
    await guarded(async () => {
      await api.post('/admin/courses', values);
      setAddingCourse(false);
      await fetchCourses();
    }, 'Failed to create course.');
  }

  async function updateCourse(id, values) {
    await guarded(async () => {
      await api.put('/admin/courses/' + id, values);
      setEditingId(null);
      await fetchCourses();
    }, 'Failed to update course.');
  }

  async function toggleEnabled(course, enabled) {
    await guarded(async () => {
      await api.put('/admin/courses/' + course.id, { enabled });
      await fetchCourses();
    }, 'Failed to update course.');
  }

  async function saveFees(id, fees) {
    await guarded(async () => {
      await api.put('/admin/courses/' + id + '/fees', { fees });
      await fetchCourses();
    }, 'Failed to update course fees.');
  }

  async function moveCourse(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= courses.length) return;
    const reordered = [...courses];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await guarded(async () => {
      await api.put('/admin/courses/reorder', { order: reordered.map((course) => course.id) });
      await fetchCourses();
    }, 'Failed to reorder courses.');
  }

  async function handleConfirmDelete() {
    const target = confirmDelete;
    setConfirmDelete(null);
    if (!target) return;

    await guarded(async () => {
      await api.delete('/admin/courses/' + target.id);
      await fetchCourses();
    }, 'Failed to delete course.');
  }

  return (
    <div className="portal-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Course catalogue</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Courses</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add or remove courses, upload course images, and set fees. Changes appear immediately on the homepage and registration form.
          </p>
        </div>
        <button type="button" onClick={() => setAddingCourse((prev) => !prev)} className="portal-button-secondary px-4 py-2 text-xs">
          {addingCourse ? 'Cancel' : '+ Add course'}
        </button>
      </div>

      {error && <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {addingCourse && (
        <div className="mt-4">
          <CourseForm submitLabel="Add course" onCancel={() => setAddingCourse(false)} onSubmit={createCourse} />
        </div>
      )}

      <div className="mt-5 space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-500">No courses yet. Add one to get started.</p>
        ) : (
          courses.map((course, index) => (
            <CourseRow
              key={course.id}
              course={course}
              index={index}
              courseCount={courses.length}
              editing={editingId === course.id}
              onStartEdit={setEditingId}
              onCancelEdit={() => setEditingId(null)}
              onMove={moveCourse}
              onToggleEnabled={toggleEnabled}
              onEdit={updateCourse}
              onDelete={setConfirmDelete}
              onSaveFees={saveFees}
            />
          ))
        )}
      </div>

      {confirmDelete && (
        <Modal
          title={`Delete "${confirmDelete.title}"`}
          message="This will permanently remove the course from the catalogue. Students who already registered for it keep their existing records."
          showCancel
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
