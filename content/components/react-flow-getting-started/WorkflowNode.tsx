import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'

type WorkflowNodeData = {
  title: string
  description: string
  status: 'Ready' | 'Running' | 'Failed'
}

type WorkflowNode = Node<WorkflowNodeData, 'workflow'>

function WorkflowNodeCard({ data }: NodeProps<WorkflowNode>) {
  return (
    <div className='rounded-md border bg-background px-4 py-3 shadow-sm'>
      <Handle type='target' position={Position.Left} />
      <div className='font-medium'>{data.title}</div>
      <p className='text-muted-foreground text-sm'>{data.description}</p>
      <Handle type='source' position={Position.Right} />
    </div>
  )
}

export const nodeTypes = {
  workflow: WorkflowNodeCard,
} satisfies NodeTypes