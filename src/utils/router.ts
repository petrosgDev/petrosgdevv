export type AppRoute =
  | { name: 'home' }
  | { name: 'work' }
  | { name: 'project'; slug: string }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'not-found'; path: string };

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }
  const withoutTrailing = pathname.replace(/\/+$/, '');
  return withoutTrailing.startsWith('/') ? withoutTrailing : `/${withoutTrailing}`;
}

export function matchRoute(pathname: string): AppRoute {
  const cleanPath = normalizePathname(pathname);

  if (cleanPath === '/') {
    return { name: 'home' };
  }
  if (cleanPath === '/work') {
    return { name: 'work' };
  }
  if (cleanPath.startsWith('/work/')) {
    const slug = decodeURIComponent(cleanPath.slice('/work/'.length));
    if (slug && !slug.includes('/')) {
      return { name: 'project', slug };
    }
  }
  if (cleanPath === '/about') {
    return { name: 'about' };
  }
  if (cleanPath === '/contact') {
    return { name: 'contact' };
  }

  return { name: 'not-found', path: cleanPath };
}
