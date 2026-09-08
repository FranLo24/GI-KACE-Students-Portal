const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { REQUIRED_DB_COLUMNS } = require('../data/builtinFieldKeys');

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only PNG, JPEG, WEBP, or GIF images are allowed'));
    }
    cb(null, true);
  },
}).single('image');

const uploadImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
};

function slugify(text) {
  return (
    text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'item'
  );
}

async function uniqueSectionKey(baseKey) {
  let key = baseKey;
  let suffix = 1;
  while (await prisma.formSection.findUnique({ where: { key } })) {
    key = `${baseKey}-${suffix++}`;
  }
  return key;
}

async function uniqueFieldKey(baseKey) {
  let key = baseKey;
  let suffix = 1;
  while (await prisma.formField.findUnique({ where: { key } })) {
    key = `${baseKey}-${suffix++}`;
  }
  return key;
}

async function getOrCreateSettings() {
  const existing = await prisma.formSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.formSettings.create({ data: { id: 1 } });
}

const getPublicFormConfig = async (req, res) => {
  try {
    const [sections, settings] = await Promise.all([
      prisma.formSection.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
        include: { fields: { where: { enabled: true }, orderBy: { order: 'asc' } } },
      }),
      getOrCreateSettings(),
    ]);
    res.json({ sections, settings });
  } catch (error) {
    console.error('Get public form config error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAdminFormConfig = async (req, res) => {
  try {
    const [sections, settings] = await Promise.all([
      prisma.formSection.findMany({
        orderBy: { order: 'asc' },
        include: { fields: { orderBy: { order: 'asc' } } },
      }),
      getOrCreateSettings(),
    ]);
    res.json({ sections, settings });
  } catch (error) {
    console.error('Get admin form config error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateFormSettings = async (req, res) => {
  const { heroImageUrl, fontFamily, baseFontSize, headingScale } = req.body;

  try {
    await getOrCreateSettings();
    const settings = await prisma.formSettings.update({
      where: { id: 1 },
      data: {
        ...(heroImageUrl !== undefined ? { heroImageUrl: heroImageUrl || null } : {}),
        ...(fontFamily !== undefined ? { fontFamily } : {}),
        ...(baseFontSize !== undefined ? { baseFontSize: Number(baseFontSize) } : {}),
        ...(headingScale !== undefined ? { headingScale: Number(headingScale) } : {}),
      },
    });
    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    console.error('Update form settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSection = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const key = await uniqueSectionKey(slugify(title));
    const maxOrder = await prisma.formSection.aggregate({ _max: { order: true } });

    const section = await prisma.formSection.create({
      data: {
        key,
        title: title.trim(),
        description: description?.trim() || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    res.status(201).json({ message: 'Section created', section });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSection = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid section ID' });

  const { title, description, enabled } = req.body;

  try {
    const section = await prisma.formSection.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
      },
    });
    res.json({ message: 'Section updated', section });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSection = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid section ID' });

  try {
    const builtInField = await prisma.formField.findFirst({ where: { sectionId: id, isBuiltIn: true } });
    if (builtInField) {
      return res.status(400).json({ message: 'This section contains built-in fields and cannot be deleted.' });
    }

    await prisma.formSection.delete({ where: { id } });
    res.json({ message: 'Section deleted' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const reorderSections = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'order must be a non-empty array of section IDs' });
  }

  try {
    await prisma.$transaction(
      order.map((id, index) => prisma.formSection.update({ where: { id: Number(id) }, data: { order: index } }))
    );
    res.json({ message: 'Sections reordered' });
  } catch (error) {
    console.error('Reorder sections error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createField = async (req, res) => {
  const { sectionId, label, type, placeholder, required, options, validation, conditionalOn } = req.body;

  if (!sectionId || !label?.trim() || !type) {
    return res.status(400).json({ message: 'sectionId, label, and type are required' });
  }

  try {
    const key = await uniqueFieldKey(slugify(label));
    const maxOrder = await prisma.formField.aggregate({
      where: { sectionId: Number(sectionId) },
      _max: { order: true },
    });

    const field = await prisma.formField.create({
      data: {
        sectionId: Number(sectionId),
        key,
        label: label.trim(),
        type,
        placeholder: placeholder || null,
        required: Boolean(required),
        options: options ?? null,
        validation: validation ?? null,
        conditionalOn: conditionalOn ?? null,
        order: (maxOrder._max.order ?? -1) + 1,
        isBuiltIn: false,
      },
    });
    res.status(201).json({ message: 'Field created', field });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateField = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid field ID' });

  const { label, type, placeholder, required, options, validation, conditionalOn, enabled } = req.body;

  try {
    const existing = await prisma.formField.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Field not found' });

    if (existing.isBuiltIn && REQUIRED_DB_COLUMNS.includes(existing.key) && enabled === false) {
      return res.status(400).json({
        message: `"${existing.label}" is required by the system and cannot be disabled.`,
      });
    }

    const field = await prisma.formField.update({
      where: { id },
      data: {
        ...(label !== undefined ? { label } : {}),
        ...(!existing.isBuiltIn && type !== undefined ? { type } : {}),
        ...(placeholder !== undefined ? { placeholder: placeholder || null } : {}),
        ...(required !== undefined ? { required: Boolean(required) } : {}),
        ...(options !== undefined ? { options } : {}),
        ...(validation !== undefined ? { validation } : {}),
        ...(!existing.isBuiltIn && conditionalOn !== undefined ? { conditionalOn } : {}),
        ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
      },
    });
    res.json({ message: 'Field updated', field });
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteField = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid field ID' });

  try {
    const existing = await prisma.formField.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Field not found' });

    if (existing.isBuiltIn) {
      return res.status(400).json({ message: 'Built-in fields cannot be deleted, only disabled.' });
    }

    await prisma.formField.delete({ where: { id } });
    res.json({ message: 'Field deleted' });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const reorderFields = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'order must be a non-empty array of field IDs' });
  }

  try {
    await prisma.$transaction(
      order.map((id, index) => prisma.formField.update({ where: { id: Number(id) }, data: { order: index } }))
    );
    res.json({ message: 'Fields reordered' });
  } catch (error) {
    console.error('Reorder fields error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPublicFormConfig,
  getAdminFormConfig,
  updateFormSettings,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  createField,
  updateField,
  deleteField,
  reorderFields,
  uploadImage,
};
