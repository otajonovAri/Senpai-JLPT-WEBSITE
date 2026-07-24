import { useState, useEffect } from 'react';

/**
 * Reactive media-query hook. Needed because the app styles with inline
 * `style={{}}` objects, which can't express CSS @media rules on their own.
 *
 * @param {string} query e.g. '(max-width: 900px)'
 * @returns {boolean} whether the query currently matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
