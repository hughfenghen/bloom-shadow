import { atom } from 'jotai';

interface IExpFile {
  type: 'video',
  url: string,
  duration: number
}

export const expFilesAtom = atom<IExpFile[]>([])
