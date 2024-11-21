import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from 'assets/icon.svg';
import 'css/App.css';

function Hello() {
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Main browser electron-react-boilerplate</h1>
    </div>
  );
}

export default function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
