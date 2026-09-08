const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
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
} = require('../controllers/formConfigController');

router.get('/form-config', getPublicFormConfig);

router.get('/admin/form-config', verifyToken, getAdminFormConfig);
router.put('/admin/form-settings', verifyToken, updateFormSettings);
router.post('/admin/uploads', verifyToken, uploadImage);

router.post('/admin/form-sections', verifyToken, createSection);
router.put('/admin/form-sections/reorder', verifyToken, reorderSections);
router.put('/admin/form-sections/:id', verifyToken, updateSection);
router.delete('/admin/form-sections/:id', verifyToken, deleteSection);

router.post('/admin/form-fields', verifyToken, createField);
router.put('/admin/form-fields/reorder', verifyToken, reorderFields);
router.put('/admin/form-fields/:id', verifyToken, updateField);
router.delete('/admin/form-fields/:id', verifyToken, deleteField);

module.exports = router;
