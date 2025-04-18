import { translationTable } from '@/locales/config';
import TranslationTable from './TranslationTable';

function UserSettingLocale() {
  return <TranslationTable data={translationTable} languages={['zh']} />;
}

export default UserSettingLocale;
