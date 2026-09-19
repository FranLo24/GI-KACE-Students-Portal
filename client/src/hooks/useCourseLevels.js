import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

// The computer literacy level each course category belongs to, as set in
// Settings → Course Levels. Returned as a Map so callers can look a category's
// level up directly; a category with no level set maps to null.
export function useCourseLevels() {
  const [courseLevels, setCourseLevels] = useState([]);

  useEffect(() => {
    api
      .get('/course-levels')
      .then((res) => setCourseLevels(res.data))
      .catch(() => {});
  }, []);

  return useMemo(() => new Map(courseLevels.map((entry) => [entry.category, entry.level])), [courseLevels]);
}
