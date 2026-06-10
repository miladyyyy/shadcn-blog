'use client'

import {
  addEdge,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import { useCallback } from 'react'

const initialNodes: Node[] = [
  { id: 'input', position: { x: 0, y: 0 }, data: { label: '输入' } },
  { id: 'output', position: { x: 280, y: 120 }, data: { label: '输出' } },
]

const initialEdges: Edge[] = [
  { id: 'input-output', source: 'input', target: 'output' },
]

export function ControlledFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) => addEdge(connection, currentEdges))
    },
    [setEdges]
  )

  return (
    <div style={{ height: 420 }}>
      <ReactFlow
        edges={edges}
        nodes={nodes}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        fitView
      />
    </div>
  )
}