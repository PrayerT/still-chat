import { hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
hydrateRoot(document.getElementById('root')!, <App language={window.location.pathname.startsWith('/en') ? 'en' : 'zh'} />);
