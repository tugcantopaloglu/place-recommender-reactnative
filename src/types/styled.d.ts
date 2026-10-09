import 'styled-components';
import { lightTheme } from '../theme/theme';

type ApplicationTheme = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends ApplicationTheme {}
}
