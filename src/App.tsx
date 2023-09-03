import './App.css';
import { Player } from './player';
import { AddResource } from './AddResource';

function App() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="left flex flex-col border-solid border-2 w-[200px]">
          <div className="flex-1">
            <AddResource></AddResource>
          </div>
          <div className="sprite-list flex-1">
            <div className="font-bold">素材列表</div>
            <div>开发中</div>
          </div>
          <div className="tpl-list flex-1">
            <div className="font-bold">模板列表</div>
            <div>开发中</div>
          </div>
        </div>
        <div className="main flex-1 border-solid border-2">
          <Player></Player>
        </div>
        <div className="right border-solid border-2 w-[200px]">开发中</div>
      </div>
      <footer className="text-center">开发中</footer>
    </div>
  );
}

export default App;
