import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from 'assets/icon.svg';
import 'css/App.css';
import { IPC_CHANNELS } from '../../common/ipcChannels';
import { useState } from 'react';

function SampleMain() {
  const [userInfo, setUserInfo] = useState<
    { name: string; email: string } | undefined
  >();

  window.electron.ipcRenderer.on(
    IPC_CHANNELS.RESPONSE_DATA,
    (event, data: any) => {
      console.log('User data received:', data); // 성공적으로 사용자 데이터 수신
      setUserInfo(data);
    },
  );

  const onSendData = () => {
    console.log('onSendData');
    window.electron.ipcRenderer.sendMessage(IPC_CHANNELS.GET_DATA, {
      id: 123,
    });
  };

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Main browser electron-react-boilerplate</h1>
      <div className="Hello">
        {userInfo && <span>Hello!!! {userInfo.name}!!!!</span>}
      </div>
      <div className="Hello">
        <button type="button" onClick={onSendData}>
          Show User Info
        </button>
      </div>
    </div>
  );
}

export default function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SampleMain />} />
      </Routes>
    </Router>
  );
}
