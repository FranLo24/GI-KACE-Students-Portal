import { useEffect, useState } from 'react';
import api from '../api/axios';

export function useCourseLocations() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    api
      .get('/form-config')
      .then((res) => {
        const fields = (res.data.sections || []).flatMap((section) => section.fields || []);
        const locationField = fields.find((field) => field.key === 'center-location');
        setLocations(locationField?.options || []);
      })
      .catch(() => {});
  }, []);

  return locations;
}
