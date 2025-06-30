
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  serverUrl: string;
  autoScroll: boolean;
  showTimestamps: boolean;
  maxMessages: string;
  accentColor: string;
  theme: 'light' | 'dark' | 'system';
}

const initialState: SettingsState = {
  serverUrl: 'http://localhost:8000',
  autoScroll: true,
  showTimestamps: true,
  maxMessages: '100',
  accentColor: '#3b82f6',
  theme: 'system',
};

// Load settings from localStorage on initialization
const loadedSettings = (() => {
  try {
    const saved = localStorage.getItem('aiAgentSettings');
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  } catch {
    return initialState;
  }
})();

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadedSettings,
  reducers: {
    updateSetting: (state, action: PayloadAction<{ key: keyof SettingsState; value: any }>) => {
      const { key, value } = action.payload;
      (state as any)[key] = value;
      
      // Save to localStorage
      localStorage.setItem('aiAgentSettings', JSON.stringify(state));
      
      // Apply settings immediately
      if (key === 'accentColor') {
        const root = document.documentElement;
        const hsl = hexToHsl(value);
        root.style.setProperty('--primary', hsl);
      }
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: state }));
    },
    resetSettings: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem('aiAgentSettings');
      document.documentElement.style.removeProperty('--primary');
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: state }));
    },
  },
});

const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const { updateSetting, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
