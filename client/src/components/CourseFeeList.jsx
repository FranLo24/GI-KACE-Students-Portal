import { formatFee } from '../utils/currency';

export default function CourseFeeList({ fees = [], selectedLocation, variant = 'light' }) {
  if (fees.length === 0) {
    return (
      <p className={variant === 'dark' ? 'text-xs text-white/70' : 'text-xs text-slate-400'}>Pricing coming soon</p>
    );
  }

  const mutedClass = variant === 'dark' ? 'text-white/80' : 'text-slate-500';
  const highlightClass = variant === 'dark' ? 'text-white' : 'text-blue-700';

  return (
    <ul className="space-y-0.5">
      {fees.map((entry) => {
        const isSelected = selectedLocation && entry.location === selectedLocation;
        return (
          <li
            key={entry.location}
            className={[
              'flex items-center justify-between gap-3 text-xs font-medium',
              isSelected ? highlightClass + ' font-semibold' : mutedClass,
            ].join(' ')}
          >
            <span>{entry.location}</span>
            <span>{formatFee(entry.fee)}</span>
          </li>
        );
      })}
    </ul>
  );
}
