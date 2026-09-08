import { useCallback, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import CourseManagementPanel from '../components/CourseManagementPanel';
import api from '../api/axios';
import { sortByOrder } from '../utils/dynamicForm';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Choice (radio)' },
  { value: 'checkbox', label: 'Checkbox' },
];

const FONT_OPTIONS = [
  { value: "'Trebuchet MS', 'Segoe UI', sans-serif", label: 'Trebuchet MS (default)' },
  { value: "'Inter', 'Segoe UI', sans-serif", label: 'Inter' },
  { value: "Georgia, 'Times New Roman', serif", label: 'Georgia (serif)' },
  { value: "'Poppins', 'Segoe UI', sans-serif", label: 'Poppins' },
  { value: "'Courier New', monospace", label: 'Courier New (monospace)' },
];

function needsOptions(type) {
  return type === 'select' || type === 'radio';
}

function FieldEditor({ initial, onSubmit, onCancel, submitLabel }) {
  const [label, setLabel] = useState(initial?.label || '');
  const [type, setType] = useState(initial?.type || 'text');
  const [required, setRequired] = useState(initial?.required || false);
  const [placeholder, setPlaceholder] = useState(initial?.placeholder || '');
  const [optionsText, setOptionsText] = useState((initial?.options || []).join(', '));
  const disableType = Boolean(initial?.isBuiltIn);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      label,
      type,
      required,
      placeholder: placeholder || undefined,
      options: needsOptions(type)
        ? optionsText.split(',').map((option) => option.trim()).filter(Boolean)
        : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Label</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} required className="portal-input" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={disableType}
          className="portal-select disabled:cursor-not-allowed disabled:opacity-60"
        >
          {FIELD_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Placeholder</label>
        <input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} className="portal-input" />
      </div>
      <div className="flex items-end gap-2">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          id={`required-${initial?.id || 'new'}`}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor={`required-${initial?.id || 'new'}`} className="text-sm text-slate-700">
          Required
        </label>
      </div>
      {needsOptions(type) && (
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Options (comma-separated)</label>
          <input
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            className="portal-input"
            placeholder="Option A, Option B, Option C"
          />
        </div>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="portal-button-primary px-4 py-2 text-xs">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="portal-button-secondary px-4 py-2 text-xs">
          Cancel
        </button>
      </div>
    </form>
  );
}

function FieldRow({ field, index, fieldCount, onToggleEnabled, onMove, onEdit, onDelete, onStartEdit, editing, onCancelEdit }) {
  if (editing) {
    return (
      <FieldEditor
        initial={field}
        submitLabel="Save field"
        onCancel={onCancelEdit}
        onSubmit={(values) => onEdit(field.id, values)}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
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
          disabled={index === fieldCount - 1}
          className="text-xs text-slate-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ▼
        </button>
      </div>

      <div className="min-w-[160px] flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {field.label}
          {field.required && <span className="ml-1 text-blue-500">*</span>}
        </p>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {field.type}
          {field.isBuiltIn ? ' · built-in' : ' · custom'}
        </p>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <input type="checkbox" checked={field.enabled} onChange={(e) => onToggleEnabled(field, e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        Shown on form
      </label>

      <button type="button" onClick={() => onStartEdit(field.id)} className="portal-button-secondary px-3 py-1.5 text-xs">
        Edit
      </button>

      {!field.isBuiltIn && (
        <button
          type="button"
          onClick={() => onDelete(field)}
          className="portal-button-secondary bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 px-3 py-1.5 text-xs"
        >
          Delete
        </button>
      )}
    </div>
  );
}

function SectionBlock({ section, index, sectionCount, onMoveSection, onToggleSection, onDeleteSection, api: apiActions }) {
  const [editingSection, setEditingSection] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || '');
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [addingField, setAddingField] = useState(false);

  const fields = sortByOrder(section.fields || []);
  const hasBuiltInField = fields.some((field) => field.isBuiltIn);

  async function saveSectionDetails() {
    await apiActions.updateSection(section.id, { title, description });
    setEditingSection(false);
  }

  return (
    <div className="portal-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-1 pt-1">
            <button
              type="button"
              onClick={() => onMoveSection(index, -1)}
              disabled={index === 0}
              className="text-xs text-slate-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => onMoveSection(index, 1)}
              disabled={index === sectionCount - 1}
              className="text-xs text-slate-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ▼
            </button>
          </div>

          {editingSection ? (
            <div className="grid gap-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="portal-input" />
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="portal-input" placeholder="Description (optional)" />
              <div className="flex gap-2">
                <button type="button" onClick={saveSectionDetails} className="portal-button-primary px-3 py-1.5 text-xs">
                  Save
                </button>
                <button type="button" onClick={() => setEditingSection(false)} className="portal-button-secondary px-3 py-1.5 text-xs">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
              {section.description && <p className="mt-1 text-sm text-slate-500">{section.description}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={(e) => onToggleSection(section, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Shown on form
          </label>
          {!editingSection && (
            <button type="button" onClick={() => setEditingSection(true)} className="portal-button-secondary px-3 py-1.5 text-xs">
              Edit
            </button>
          )}
          {!hasBuiltInField && (
            <button
              type="button"
              onClick={() => onDeleteSection(section)}
              className="portal-button-secondary bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 px-3 py-1.5 text-xs"
            >
              Delete section
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {fields.map((field, fieldIndex) => (
          <FieldRow
            key={field.id}
            field={field}
            index={fieldIndex}
            fieldCount={fields.length}
            editing={editingFieldId === field.id}
            onStartEdit={setEditingFieldId}
            onCancelEdit={() => setEditingFieldId(null)}
            onToggleEnabled={(f, enabled) => apiActions.updateField(f.id, { enabled })}
            onMove={(fieldIdx, direction) => apiActions.moveField(section, fields, fieldIdx, direction)}
            onEdit={async (id, values) => {
              await apiActions.updateField(id, values);
              setEditingFieldId(null);
            }}
            onDelete={(f) => apiActions.confirmDeleteField(f)}
          />
        ))}
      </div>

      <div className="mt-4">
        {addingField ? (
          <FieldEditor
            submitLabel="Add field"
            onCancel={() => setAddingField(false)}
            onSubmit={async (values) => {
              await apiActions.createField(section.id, values);
              setAddingField(false);
            }}
          />
        ) : (
          <button type="button" onClick={() => setAddingField(true)} className="portal-button-secondary px-4 py-2 text-xs">
            + Add field
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const handleUnauthorizedAccess = useUnauthorizedRedirect();

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [appearance, setAppearance] = useState({ heroImageUrl: '', fontFamily: '', baseFontSize: 16, headingScale: 1 });
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [addingSection, setAddingSection] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/form-config');
      setConfig(res.data);
      setAppearance({
        heroImageUrl: res.data.settings.heroImageUrl || '',
        fontFamily: res.data.settings.fontFamily,
        baseFontSize: res.data.settings.baseFontSize,
        headingScale: res.data.settings.headingScale,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setError('Failed to load form settings.');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorizedAccess]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  function flash(text) {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  }

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

  async function handleSaveAppearance(e) {
    e.preventDefault();
    setSavingAppearance(true);
    await guarded(async () => {
      await api.put('/admin/form-settings', appearance);
      flash('Appearance settings saved.');
      await fetchConfig();
    }, 'Failed to save appearance settings.');
    setSavingAppearance(false);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await guarded(async () => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/admin/uploads', formData);
      setAppearance((prev) => ({ ...prev, heroImageUrl: res.data.url }));
    }, 'Image upload failed.');
    setUploading(false);
    e.target.value = '';
  }

  const sections = config ? sortByOrder(config.sections || []) : [];

  async function moveSection(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await guarded(async () => {
      await api.put('/admin/form-sections/reorder', { order: reordered.map((section) => section.id) });
      await fetchConfig();
    }, 'Failed to reorder sections.');
  }

  async function moveField(section, fields, index, direction) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const reordered = [...fields];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await guarded(async () => {
      await api.put('/admin/form-fields/reorder', { order: reordered.map((field) => field.id) });
      await fetchConfig();
    }, 'Failed to reorder fields.');
  }

  async function toggleSection(section, enabled) {
    await guarded(async () => {
      await api.put('/admin/form-sections/' + section.id, { enabled });
      await fetchConfig();
    }, 'Failed to update section.');
  }

  async function updateSection(id, values) {
    await guarded(async () => {
      await api.put('/admin/form-sections/' + id, values);
      await fetchConfig();
    }, 'Failed to update section.');
  }

  async function createSection(values) {
    await guarded(async () => {
      await api.post('/admin/form-sections', values);
      await fetchConfig();
    }, 'Failed to create section.');
  }

  async function updateField(id, values) {
    await guarded(async () => {
      await api.put('/admin/form-fields/' + id, values);
      await fetchConfig();
    }, 'Failed to update field.');
  }

  async function createField(sectionId, values) {
    await guarded(async () => {
      await api.post('/admin/form-fields', { sectionId, ...values });
      await fetchConfig();
    }, 'Failed to create field.');
  }

  function confirmDeleteField(field) {
    setConfirmDelete({ type: 'field', id: field.id, label: field.label });
  }

  function confirmDeleteSection(section) {
    setConfirmDelete({ type: 'section', id: section.id, label: section.title });
  }

  async function handleConfirmDelete() {
    const target = confirmDelete;
    setConfirmDelete(null);
    if (!target) return;

    await guarded(async () => {
      if (target.type === 'field') {
        await api.delete('/admin/form-fields/' + target.id);
      } else {
        await api.delete('/admin/form-sections/' + target.id);
      }
      await fetchConfig();
    }, 'Failed to delete. Built-in items can only be disabled.');
  }

  const apiActions = {
    updateSection,
    moveField,
    updateField,
    createField,
    confirmDeleteField,
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="portal-kicker">Portal operations</span>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-2 max-w-2xl text-lg text-slate-600">
          Customize the registration form: add or remove fields, reorder sections, and control the page's appearance.
        </p>
      </div>

      {message && <div className="portal-panel border border-emerald-100 bg-emerald-50 px-6 py-4 text-sm text-emerald-700">{message}</div>}
      {error && <div className="portal-panel border border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div>}

      <div className="portal-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Appearance</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Registration page styling</h2>
        <p className="mt-2 text-sm text-slate-500">
          These settings apply site-wide to the public registration page.
        </p>

        <form onSubmit={handleSaveAppearance} className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Hero image</label>
            <div className="flex flex-wrap items-center gap-4">
              {appearance.heroImageUrl && (
                <img src={appearance.heroImageUrl} alt="Hero preview" className="h-20 w-32 rounded-xl object-cover" />
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageUpload} disabled={uploading} className="text-sm" />
              {appearance.heroImageUrl && (
                <button
                  type="button"
                  onClick={() => setAppearance((prev) => ({ ...prev, heroImageUrl: '' }))}
                  className="portal-button-secondary px-3 py-1.5 text-xs"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Font family</label>
            <select
              value={appearance.fontFamily}
              onChange={(e) => setAppearance((prev) => ({ ...prev, fontFamily: e.target.value }))}
              className="portal-select"
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Base font size (px)</label>
            <input
              type="number"
              min={12}
              max={24}
              value={appearance.baseFontSize}
              onChange={(e) => setAppearance((prev) => ({ ...prev, baseFontSize: Number(e.target.value) }))}
              className="portal-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Heading scale</label>
            <input
              type="number"
              step="0.05"
              min={0.75}
              max={2}
              value={appearance.headingScale}
              onChange={(e) => setAppearance((prev) => ({ ...prev, headingScale: Number(e.target.value) }))}
              className="portal-input"
            />
            <p className="mt-1 text-xs text-slate-400">1 = default size. Scales section and hero headings.</p>
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={savingAppearance} className="portal-button-primary">
              {savingAppearance ? 'Saving…' : 'Save appearance'}
            </button>
          </div>
        </form>
      </div>

      <CourseManagementPanel />

      <div className="portal-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Form builder</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Sections &amp; fields</h2>
          </div>
          <button type="button" onClick={() => setAddingSection((prev) => !prev)} className="portal-button-secondary px-4 py-2 text-xs">
            {addingSection ? 'Cancel' : '+ Add section'}
          </button>
        </div>

        {addingSection && (
          <form
            className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              await createSection({ title: form.title.value, description: form.description.value });
              form.reset();
              setAddingSection(false);
            }}
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
              <input name="title" required className="portal-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Description (optional)</label>
              <input name="description" className="portal-input" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="portal-button-primary px-4 py-2 text-xs">
                Create section
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 space-y-5">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            sections.map((section, index) => (
              <SectionBlock
                key={section.id}
                section={section}
                index={index}
                sectionCount={sections.length}
                onMoveSection={moveSection}
                onToggleSection={toggleSection}
                onDeleteSection={confirmDeleteSection}
                api={apiActions}
              />
            ))
          )}
        </div>
      </div>

      {confirmDelete && (
        <Modal
          title={`Delete "${confirmDelete.label}"`}
          message={
            confirmDelete.type === 'field'
              ? 'This will permanently remove the custom field. Data already submitted for it will remain on existing student records.'
              : 'This will permanently remove the section. This is only possible for sections without built-in fields.'
          }
          showCancel
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
