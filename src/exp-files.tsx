import React from 'react';
import { useAtom } from 'jotai';
import { expFilesAtom } from './store';

export function ExpFiles() {
  const [expFiles, setExpFiles] = useAtom(expFilesAtom);

  return (
    <>
      {expFiles.map((f, idx) => (
        <div>
          <FileMask
            key={f.url}
            onDelete={() => {
              const d = [...expFiles];
              d.splice(idx, 1);
              setExpFiles(d);
            }}
            onDownload={() => {
              download(f.url);
            }}
            onPreview={() => {}}
          >
            {f.type === 'video' ? <video src={f.url}></video> : <div>f</div>}
          </FileMask>
          <div className="text-center">
            {f.type} {f.duration}s
          </div>
        </div>
      ))}
    </>
  );
}

const FileMask: React.FC<
  React.PropsWithChildren<{
    onDelete: () => void;
    onPreview: () => void;
    onDownload: () => void;
  }>
> = function FileMask({ children, onDelete, onPreview, onDownload }) {
  const btnCls = 'm-auto border rounded-full inline-block h-[40px] w-[40px]';
  return (
    <div className="relative text-white group text-xs">
      <div className="absolute w-full h-full bg-[#00000066] hidden group-hover:flex items-center content-center z-10 px-8">
        <button onClick={onPreview} className={btnCls}>
          预览
        </button>
        <button onClick={onDownload} className={btnCls}>
          下载
        </button>
        <button onClick={onDelete} className={btnCls}>
          删除
        </button>
      </div>
      {children}
    </div>
  );
};

function download(url: string) {
  const aEl = document.createElement('a');
  document.body.appendChild(aEl);
  aEl.setAttribute('href', url);
  aEl.setAttribute('download', `WebAv-export-${Date.now()}.mp4`);
  aEl.setAttribute('target', '_self');
  aEl.click();
}
