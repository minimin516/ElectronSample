import { createRoot } from 'react-dom/client';
import Main from './Main';

const container = document.getElementById('root')!;
if (container.getAttribute('data-type') == 'main') {
  const root = createRoot(container);
  root.render(<Main></Main>);
}
// const container = document.getElementById('root') as HTMLElement;
// const root = createRoot(container);
// root.render(<Main />);
