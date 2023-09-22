import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { IExpFile, expFilesAtom } from './store';

export function ExpFiles() {
  const [expFiles, setExpFiles] = useAtom(expFilesAtom);
  const [pvFile, setPVFile] = useState<null | IExpFile>(null);

  const genFile = (f: IExpFile, isPreview = false) => {
    return f.type === 'video' ? (
      <video src={f.url} controls={isPreview}></video>
    ) : (
      <div></div>
    );
  };

  useEffect(() => {
    const onKeyDown = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
      if (key === 'Escape' && pvFile != null) setPVFile(null);
    };
    document.addEventListener('keydown', onKeyDown, false);

    return () => {
      document.removeEventListener('keydown', onKeyDown, false);
    };
  }, [pvFile]);

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
            onPreview={() => {
              setPVFile(f);
            }}
          >
            {genFile(f)}
          </FileMask>
          <div className="text-center">
            {f.type} {f.duration}s
          </div>
          {pvFile && (
            <div
              onClick={() => setPVFile(null)}
              className="fixed z-50 top-0 left-0 w-full h-full bg-[#0009]"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute w-[900px] h-[500px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                {genFile(f, true)}
              </div>
            </div>
          )}
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
