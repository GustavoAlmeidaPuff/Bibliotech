import { useSettings } from '../contexts/SettingsContext';

export const useDistinctCodes = () => {
  const { settings } = useSettings();
  return settings.useDistinctCodes;
};

export default useDistinctCodes; 