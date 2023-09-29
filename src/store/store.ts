import { BaseSprite } from '@webav/av-cliper';
import { atom } from 'jotai';

export interface IExpFile {
  type: 'video',
  url: string,
  duration: number
  createTime: string
}

export const expFilesAtom = atom<IExpFile[]>([])

export const resourceListAtom = atom<BaseSprite[]>([])