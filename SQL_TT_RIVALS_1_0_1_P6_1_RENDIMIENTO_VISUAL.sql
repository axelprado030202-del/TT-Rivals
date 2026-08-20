-- ============================================================
-- TT RIVALS 1.0.1 — P6.1 RENDIMIENTO VISUAL
-- Preferencia sincronizada por cuenta para los efectos de fondo.
-- Valores: auto | high | medium | low | off
-- Idempotente: puede volver a ejecutarse.
-- ============================================================

begin;

alter table public.user_preferences
  add column if not exists background_effect_quality text not null default 'auto';

update public.user_preferences
set background_effect_quality='auto'
where background_effect_quality is null
   or background_effect_quality not in ('auto','high','medium','low','off');

alter table public.user_preferences
  drop constraint if exists user_preferences_background_effect_quality_check;

alter table public.user_preferences
  add constraint user_preferences_background_effect_quality_check
  check (background_effect_quality in ('auto','high','medium','low','off'));

commit;

select 'TT Rivals P6.1: rendimiento visual preparado' as resultado;
