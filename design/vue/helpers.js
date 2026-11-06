const OUTLINE_SUFFIX = '-outline';

export function iconClass(item) {
  const useFilledVariant = item.active && item.icon.endsWith(OUTLINE_SUFFIX);
  const name = useFilledVariant ? item.icon.slice(0, -OUTLINE_SUFFIX.length) : item.icon;
  return `mdi-${name}`;
}

export function itemAriaLabel(item) {
  if (!item.count) return item.label;
  const noun = item.urgent ? 'urgente' : 'pendiente';
  return `${item.label}, ${item.count} ${noun}${item.count === 1 ? '' : 's'}`;
}

export function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
