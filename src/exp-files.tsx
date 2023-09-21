import React from 'react';
import { useAtom } from 'jotai';
import { expFilesAtom } from './store';

export function ExpFiles() {
  const [expFiles, setExpFiles] = useAtom(expFilesAtom);

  return (
    <>
      {expFiles.map((f, idx) => (
        <FileMask
          key={f.url}
          onDelete={() => {
            const d = [...expFiles];
            console.log(444, d);
            d.splice(idx, 1);
            setExpFiles(d);
          }}
          onDownload={() => {}}
          onPreview={() => {}}
        >
          {f.type === 'video' ? <video src={f.url}></video> : <div>f</div>}
        </FileMask>
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
