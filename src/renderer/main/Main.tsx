import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from 'assets/icon.svg';
import 'css/App.css';
import { IPC_CHANNELS } from '../../common/ipcChannels';
import { useState } from 'react';
import protobuf from 'protobufjs';
import { protoContent } from '../../common/messageProto';

function SampleMain() {
  const [userInfo, setUserInfo] = useState<
    { name: string; email: string } | undefined
  >();

  window.electron.ipcRenderer.on(
    IPC_CHANNELS.RESPONSE_DATA,
    (event, buffer: any) => {
      console.log('========');
      const root = protobuf.parse(protoContent).root;
      const FetchDataResponse = root.lookupType('userDataReqRes');

      // 데이터 디코딩
      try {
        const decodedResponse = FetchDataResponse.decode(buffer);
        console.log('Decoded Response:', decodedResponse);
        console.log('User data received:', decodedResponse); // 성공적으로 사용자 데이터 수신
      } catch (ex) {
        console.log(ex);
      }
      // setUserInfo('decodedResponse');
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
