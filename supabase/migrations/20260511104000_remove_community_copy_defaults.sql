alter table public.profiles
  alter column focus set default 'Construyendo con Paisanos';

update public.profiles
set focus = 'Construyendo con Paisanos'
where focus = 'Construyendo en comunidad';
