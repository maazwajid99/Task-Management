'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import { STATUS_LABELS } from '@/lib/utils'

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

interface TaskBoardProps {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskBoard({ tasks, onStatusChange, onEdit, onDelete }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    if (COLUMNS.includes(newStatus)) {
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== newStatus) {
        await onStatusChange(taskId, newStatus)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(status => {
          const columnTasks = tasks.filter(t => t.status === status)
          return (
            <DroppableColumn
              key={status}
              status={status}
              tasks={columnTasks}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        })}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-1 scale-105 shadow-xl">
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function DroppableColumn({
  status,
  tasks,
  onEdit,
  onDelete,
}: {
  status: TaskStatus
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-2 transition-colors min-h-96 ${
        isOver ? 'border-brand-300 bg-brand-50' : 'border-transparent bg-slate-100'
      }`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">{STATUS_LABELS[status]}</span>
          <span className="text-xs bg-white border border-slate-200 text-slate-500 font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 px-3 pb-3 space-y-2">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}
