import { useAppSelector } from '@/redux/hooks';
import { STRINGS } from '@/i18n/translations';

export function useTranslation() {
  const lang = useAppSelector((s) => s.settings.language);
  return STRINGS[lang] || STRINGS.en;
}
