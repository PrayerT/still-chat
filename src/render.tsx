import { renderToString } from 'react-dom/server';
import App from './App';
export function render(language: 'zh' | 'en' = 'zh') { return renderToString(<App language={language} />); }
