import { useAtom } from 'jotai';
import { resourceListAtom } from '../store/store';
import { recorder } from '../avcanvas';

export function ResourceList() {
  const [resList, setResList] = useAtom(resourceListAtom);

  return (
    <ul className="px-2">
      {resList.map((res) => (
        <li className="flex">
          <span className="flex-1">{res.name}</span>
          <button
            onClick={() => {
              recorder.getAVCanvas().spriteManager.removeSprite(res);
              setResList(resList.filter((it) => it !== res));
            }}
          >
            X
          </button>
        </li>
      ))}
    </ul>
  );
}
