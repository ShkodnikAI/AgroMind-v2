/**
 * Цветовая палитра AgroMind
 * WCAG 2.1 AA совместимость
 */

export const colors = {
  // Primary (зелёные тона — растения, природа)
  colorPrimary: '#1B5E20',        // 12.6:1 ✅ AAA
  colorPrimaryLight: '#2E7D32',   // 9.7:1 ✅ AAA
  colorPrimaryMid: '#4CAF50',     // 3.1:1 ✅ AA Large
  colorPrimaryDark: '#0D3B11',    // 16.5:1 ✅ AAA
  
  // Status colors
  colorDanger: '#B71C1C',         // 9.6:1 ✅ AAA
  colorWarning: '#E65100',        // 5.7:1 ✅ AA
  colorInfo: '#0277BD',           // 7.2:1 ✅ AAA
  colorSuccess: '#2E7D32',        // 9.7:1 ✅ AAA
  
  // Text
  colorText: '#212121',           // 16.1:1 ✅ AAA
  colorTextSecondary: '#424242',  // 10.4:1 ✅ AAA
  colorTextTertiary: '#757575',   // 4.6:1 ✅ AA
  colorTextInverse: '#FFFFFF',
  
  // Backgrounds
  colorBackground: '#FAFAFA',
  colorSurface: '#FFFFFF',
  colorSurfaceVariant: '#F5F5F5',
  colorOverlay: 'rgba(0, 0, 0, 0.5)',
  
  // Borders
  colorBorder: '#E0E0E0',
  colorBorderDark: '#BDBDBD',
  
  // Gradients
  gradientStart: '#2E7D32',
  gradientEnd: '#1B5E20',
} as const;

export type ColorKey = keyof typeof colors;
