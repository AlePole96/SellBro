import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PhotoWithUrl } from '../../hooks/usePhotos'
import { Badge } from '../ui'

interface PhotoGridProps {
  photos: PhotoWithUrl[]
  onReorder: (photos: PhotoWithUrl[]) => void
  onDelete: (id: string) => void
}

export function PhotoGrid({ photos, onReorder, onDelete }: PhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    onReorder(arrayMove(photos, oldIndex, newIndex))
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-edge py-8 text-center text-sm text-faint">
        Nessuna foto
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={photos.map((p) => p.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <SortablePhoto
              key={photo.id}
              photo={photo}
              index={index}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortablePhoto({
  photo,
  index,
  onDelete,
}: {
  photo: PhotoWithUrl
  index: number
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-lg border border-edge bg-raised"
      {...attributes}
      {...listeners}
    >
      <img
        src={photo.url}
        alt={`Foto ${index + 1}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />

      <div className="absolute left-1 top-1 flex gap-1">
        {index === 0 && (
          <span className="rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-base">
            Copertina
          </span>
        )}
        {photo.photo_type === 'generated' && (
          <Badge>Gen.</Badge>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(photo.id)
        }}
        className="absolute right-1 top-1 rounded-full bg-base/80 p-1 text-danger opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Elimina foto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
