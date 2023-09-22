import { atom } from 'jotai';

export interface IExpFile {
  type: 'video',
  url: string,
  duration: number
}

export const expFilesAtom = atom<IExpFile[]>([])
