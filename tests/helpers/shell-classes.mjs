const SHELL_CLASS_PREFIXES = ['cap-shell-', 'cap-notifications'];

export function collectShellClasses(html) {
  const classNames = [...html.matchAll(/class="([^"]*)"/g)].flatMap((match) => match[1].split(/\s+/));
  return new Set(classNames.filter((className) => SHELL_CLASS_PREFIXES.some((prefix) => className.startsWith(prefix))));
}
