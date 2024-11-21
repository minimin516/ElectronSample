import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../../assets/icon.svg';
import './App.css';
// const ipcRenderer = require('electron').ipcRenderer;

function Hello() {
  const goMain = () => {
    window.electron.ipcRenderer.sendMessage('ipc-example', ['goMain']);
  };
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          // href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button" onClick={goMain}>
            <span role="img" aria-label="books">
              📚
            </span>
            goMain!!!
          </button>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
