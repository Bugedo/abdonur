'use server';

import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { createAdminSession, clearAdminSession, isValidAdminPassword } from '@/lib/adminSession';

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function branchLoginUsernameFromSlug(slug: string) {
  return slug.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Usuario y contraseña son obligatorios.' };
  }

  if (!isValidAdminPassword(password)) {
    return { error: 'Credenciales incorrectas.' };
  }

  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername === 'admin') {
    await createAdminSession({ role: 'super_admin', username: 'admin' });
    redirect('/admin/admin');
  }

  const { data: branches, error } = await supabaseAdmin
    .from('branches')
    .select('id, slug, name')
    .eq('is_active', true);

  if (error || !branches) {
    return { error: 'No se pudo validar el usuario. Intentá de nuevo.' };
  }

  const branch = branches.find((b) => {
    const compactSlugUsername = branchLoginUsernameFromSlug(b.slug);
    return normalizedUsername.replace(/\s+/g, '') === compactSlugUsername;
  });

  if (!branch) {
    return { error: 'Usuario inválido. Usá el nombre de la sucursal.' };
  }

  await createAdminSession({
    role: 'branch_admin',
    username: branch.name,
    branchId: branch.id,
    branchSlug: branch.slug,
  });
  redirect(`/admin/sucursal/${branch.slug}`);
}

export async function logout() {
  await clearAdminSession();
  redirect('/admin');
}


