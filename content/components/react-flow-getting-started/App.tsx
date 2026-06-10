'use client'

import { ReactFlow } from '@xyflow/react'

const nodes = [
  {
    id: 'start',
    position: { x: 0, y: 0 },
    data: { label: '开始' },
  },
  {
    id: 'review',
    position: { x: 260, y: 120 },
    data: { label: '人工审核' },
  },
]

const edges = [
  {
    id: 'start-review',
    source: 'start',
    target: 'review',
  },
]

export default function App() {
  return (
    <div className='not-prose overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-sm'>
      <div className='h-[420px] w-full'>
        <ReactFlow
          className='bg-white text-zinc-950'
          edges={edges}
          fitView
          nodes={nodes}
        />
      </div>
    </div>
  )
}
