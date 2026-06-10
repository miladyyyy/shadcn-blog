'use client'

import {
  addEdge,
  Background,
  BaseEdge,
  type Connection,
  Controls,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  type EdgeTypes,
  getBezierPath,
  Handle,
  MarkerType,
  MiniMap,
  type Node,
  type NodeProps,
  type NodeTypes,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { useCallback } from 'react'

type WorkflowNodeData = {
  description: string
  status: 'Ready' | 'Running' | 'Review'
  title: string
}

type WorkflowNode = Node<WorkflowNodeData, 'workflow'>

const initialNodes: WorkflowNode[] = [
  {
    id: 'draft',
    type: 'workflow',
    position: { x: 0, y: 40 },
    data: {
      title: '写作草稿',
      description: '收集资料，确定文章结构。',
      status: 'Ready',
    },
  },
  {
    id: 'demo',
    type: 'workflow',
    position: { x: 300, y: 0 },
    data: {
      title: '交互示例',
      description: '拖拽节点，连线，观察状态。',
      status: 'Running',
    },
  },
  {
    id: 'publish',
    type: 'workflow',
    position: { x: 600, y: 80 },
    data: {
      title: '发布检查',
      description: '验证样式、搜索和类型检查。',
      status: 'Review',
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'draft-demo',
    source: 'draft',
    target: 'demo',
    animated: true,
  },
  {
    id: 'demo-publish',
    source: 'demo',
    target: 'publish',
    type: 'smoothstep',
  },
]

const statusClassName: Record<WorkflowNodeData['status'], string> = {
  Ready: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Running: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  Review: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
}

function WorkflowCardNode({ data }: NodeProps<WorkflowNode>) {
  return (
    <div className='min-w-48 rounded-md border border-border bg-card px-4 py-3 text-card-foreground shadow-sm'>
      <Handle className='!bg-primary' position={Position.Left} type='target' />
      <div className='flex items-center justify-between gap-3'>
        <div className='font-medium text-sm'>{data.title}</div>
        <span
          className={`rounded px-2 py-0.5 text-[11px] ${statusClassName[data.status]}`}
        >
          {data.status}
        </span>
      </div>
      <p className='mt-2 text-muted-foreground text-xs leading-5'>
        {data.description}
      </p>
      <Handle className='!bg-primary' position={Position.Right} type='source' />
    </div>
  )
}

const nodeTypes = {
  workflow: WorkflowCardNode,
} satisfies NodeTypes

export function ReactFlowGuideDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge({ ...connection, type: 'smoothstep' }, currentEdges)
      )
    },
    [setEdges]
  )

  return (
    <div className='not-prose overflow-hidden rounded-md border border-border bg-background'>
      <div className='flex items-center justify-between border-border border-b px-4 py-3'>
        <div>
          <div className='font-medium text-sm'>React Flow 工作流示例</div>
          <div className='text-muted-foreground text-xs'>
            节点可拖拽，右侧 Handle 可以继续连线。
          </div>
        </div>
      </div>
      <div className='h-[420px] w-full'>
        <ReactFlow
          edges={edges}
          fitView
          nodes={nodes}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
        >
          <Background />
          <MiniMap pannable zoomable />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

type LabeledEdgeData = {
  label: string
}

type LabeledEdge = Edge<LabeledEdgeData, 'labeled'>

function LabeledEdgeComponent({
  data,
  id,
  markerEnd,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<LabeledEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  })

  return (
    <>
      <BaseEdge id={id} markerEnd={markerEnd} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className='nodrag nopan absolute rounded border border-border bg-background px-2 py-1 text-xs shadow-sm'
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const edgeTypes = {
  labeled: LabeledEdgeComponent,
} satisfies EdgeTypes

const edgeDemoNodes: Node[] = [
  {
    id: 'api',
    position: { x: 0, y: 30 },
    data: { label: 'API Request' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'validate',
    position: { x: 260, y: 0 },
    data: { label: 'Validate' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'cache',
    position: { x: 520, y: 90 },
    data: { label: 'Write Cache' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
]

const edgeDemoEdges: LabeledEdge[] = [
  {
    id: 'api-validate',
    source: 'api',
    target: 'validate',
    type: 'labeled',
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { label: '校验参数' },
  },
  {
    id: 'validate-cache',
    source: 'validate',
    target: 'cache',
    type: 'labeled',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { label: '成功后写入' },
  },
]

export function ReactFlowEdgeDemo() {
  return (
    <div className='not-prose overflow-hidden rounded-md border border-border bg-background'>
      <div className='border-border border-b px-4 py-3'>
        <div className='font-medium text-sm'>自定义边和边标签</div>
        <div className='text-muted-foreground text-xs'>
          这条线不是普通 SVG path，还带有可以交互的标签层。
        </div>
      </div>
      <div className='h-[360px] w-full'>
        <ReactFlow
          defaultEdges={edgeDemoEdges}
          defaultNodes={edgeDemoNodes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

type LayoutDirection = 'TB' | 'LR'

const layoutEdges: Edge[] = [
  {
    id: 'trigger-fetch',
    source: 'trigger',
    target: 'fetch',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'fetch-transform',
    source: 'fetch',
    target: 'transform',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'fetch-error',
    source: 'fetch',
    target: 'error',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'transform-notify',
    source: 'transform',
    target: 'notify',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
]

const layoutNodeDefinitions = [
  ['trigger', '触发器'],
  ['fetch', '读取数据'],
  ['transform', '转换格式'],
  ['error', '错误分支'],
  ['notify', '发送通知'],
] as const

type LayoutNodeId = (typeof layoutNodeDefinitions)[number][0]

function getLayoutNodes(direction: LayoutDirection): Node[] {
  const isHorizontal = direction === 'LR'
  const positions: Record<LayoutNodeId, { x: number; y: number }> = isHorizontal
    ? {
        trigger: { x: 0, y: 80 },
        fetch: { x: 240, y: 80 },
        transform: { x: 480, y: 0 },
        error: { x: 480, y: 160 },
        notify: { x: 720, y: 0 },
      }
    : {
        trigger: { x: 260, y: 0 },
        fetch: { x: 260, y: 120 },
        transform: { x: 120, y: 260 },
        error: { x: 420, y: 260 },
        notify: { x: 120, y: 400 },
      }

  return layoutNodeDefinitions.map(([id, label]) => ({
    id,
    data: { label },
    position: positions[id],
    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    targetPosition: isHorizontal ? Position.Left : Position.Top,
  }))
}

function LayoutPanel({
  setNodes,
}: {
  setNodes: ReturnType<typeof useNodesState<Node>>[1]
}) {
  const { fitView } = useReactFlow()

  const applyLayout = useCallback(
    (direction: LayoutDirection) => {
      setNodes(getLayoutNodes(direction))
      window.requestAnimationFrame(() => {
        fitView({ duration: 240, padding: 0.2 })
      })
    },
    [fitView, setNodes]
  )

  return (
    <Panel className='flex gap-2' position='top-left'>
      <button
        className='rounded border border-border bg-background px-3 py-1 text-xs shadow-sm'
        onClick={() => applyLayout('LR')}
        type='button'
      >
        横向
      </button>
      <button
        className='rounded border border-border bg-background px-3 py-1 text-xs shadow-sm'
        onClick={() => applyLayout('TB')}
        type='button'
      >
        纵向
      </button>
    </Panel>
  )
}

export function ReactFlowLayoutDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    getLayoutNodes('LR')
  )
  const [edges, , onEdgesChange] = useEdgesState(layoutEdges)

  return (
    <div className='not-prose overflow-hidden rounded-md border border-border bg-background'>
      <div className='border-border border-b px-4 py-3'>
        <div className='font-medium text-sm'>布局切换示例</div>
        <div className='text-muted-foreground text-xs'>
          这里用固定坐标模拟布局结果，真实项目可以换成 dagre 或 elkjs。
        </div>
      </div>
      <div className='h-[430px] w-full'>
        <ReactFlow
          edges={edges}
          fitView
          nodes={nodes}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
        >
          <LayoutPanel setNodes={setNodes} />
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  )
}
