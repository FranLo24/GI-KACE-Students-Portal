import { useSearchParams } from 'react-router-dom';

// ?standalone=true (or the param absent) shows the full portal (navbar +
// footer). ?standalone=false shows only the page content — used to embed
// just the registration form without site chrome.
export function useShowChrome() {
  const [searchParams] = useSearchParams();
  return searchParams.get('standalone') !== 'false';
}
