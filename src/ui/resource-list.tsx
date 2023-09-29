import { useAtom } from 'jotai';
import { resourceListAtom } from '../store/store';
import { recorder } from '../avcanvas';
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from 'react-beautiful-dnd';

export function ResourceList() {
  const [resList, setResList] = useAtom(resourceListAtom);

  // Function to update list on drop
  const handleDrop: OnDragEndResponder = (droppedItem) => {
    // Ignore drop outside droppable container
    if (!droppedItem.destination) return;
    const updatedList = [...resList];
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
    updatedList.forEach((res, idx) => {
      res.zIndex = idx + 1;
    });
    // Update State
    setResList(updatedList);
    recorder.getAVCanvas().spriteManager.sortSprite();
  };

  return (
    <div className="px-2 res-list">
      <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId="list-container">
          {(provided) => (
            <div
              className="list-container"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {resList.map((res, idx) => (
                <Draggable key={res.name} draggableId={res.name} index={idx}>
                  {(provided) => (
                    <div
                      className="item-container"
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                    >
                      <div className="flex">
                        <span className="flex-1">{res.name}</span>
                        <button
                          onClick={() => {
                            recorder
                              .getAVCanvas()
                              .spriteManager.removeSprite(res);
                            setResList(resList.filter((it) => it !== res));
                          }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
