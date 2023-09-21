import { atom } from 'jotai';

interface IExpFile {
  type: 'video',
  url: string
}

export const expFilesAtom = atom<IExpFile[]>([])
