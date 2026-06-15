import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { TablePaginationConfig, TableProps } from 'ant-design-vue'

export type TableListResult<RecordType> = {
  list: RecordType[]
  total: number
}

export type TableApi<SearchParams, ApiResponse> = (
  params: SearchParams & Record<string, unknown>,
) => Promise<ApiResponse>

export type UseTableConfig<RecordType> = Omit<
  TableProps<RecordType>,
  'dataSource' | 'loading' | 'pagination'
> & {
  pagination?: false | TablePaginationConfig
}

export type UseTableOptions<
  RecordType,
  SearchParams extends Record<string, unknown> = Record<string, unknown>,
  ApiResponse = unknown,
> = {
  api: TableApi<SearchParams, ApiResponse>
  tableConfig?: UseTableConfig<RecordType>
  defaultParams?: Partial<SearchParams>
  immediate?: boolean
  pageField?: string
  pageSizeField?: string
  beforeRequest?: (
    params: SearchParams & Record<string, unknown>,
  ) => SearchParams & Record<string, unknown>
  transformResponse?: (response: ApiResponse) => TableListResult<RecordType>
  afterRequest?: (result: TableListResult<RecordType>, response: ApiResponse) => void
  onError?: (error: unknown) => void
}

export type UseTableReturn<
  RecordType,
  SearchParams extends Record<string, unknown> = Record<string, unknown>,
> = {
  tableProps: ComputedRef<TableProps<RecordType>>
  dataSource: Ref<RecordType[]>
  loading: Ref<boolean>
  error: Ref<unknown>
  pagination: Ref<TablePaginationConfig>
  params: Ref<Partial<SearchParams>>
  run: (nextParams?: Partial<SearchParams>, resetPage?: boolean) => Promise<void>
  reload: () => Promise<void>
  search: (nextParams?: Partial<SearchParams>) => Promise<void>
  reset: () => Promise<void>
  setParams: (nextParams: Partial<SearchParams>) => void
}

const defaultPagination: TablePaginationConfig = {
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: total => `共 ${total} 条`,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pickFirstRecord(...values: unknown[]) {
  return values.find(isRecord)
}

function pickArray(source: Record<string, unknown> | undefined) {
  if (!source) return undefined

  const keys = ['list', 'records', 'rows', 'items', 'data']
  const value = keys.map(key => source[key]).find(Array.isArray)

  return value as unknown[] | undefined
}

function pickTotal(source: Record<string, unknown> | undefined) {
  if (!source) return undefined

  const keys = ['total', 'totalCount', 'count']
  const value = keys.map(key => source[key]).find(item => typeof item === 'number')

  return value as number | undefined
}

function defaultTransformResponse<RecordType>(response: unknown): TableListResult<RecordType> {
  if (Array.isArray(response)) {
    return {
      list: response as RecordType[],
      total: response.length,
    }
  }

  const responseRecord = isRecord(response) ? response : undefined
  const dataRecord = isRecord(responseRecord?.data) ? responseRecord.data : undefined
  const pageRecord = pickFirstRecord(dataRecord, responseRecord)
  const list = pickArray(pageRecord) ?? []
  const total = pickTotal(pageRecord) ?? list.length

  return {
    list: list as RecordType[],
    total,
  }
}

export function useTable<
  RecordType,
  SearchParams extends Record<string, unknown> = Record<string, unknown>,
  ApiResponse = unknown,
>(
  options: UseTableOptions<RecordType, SearchParams, ApiResponse>,
): UseTableReturn<RecordType, SearchParams> {
  const {
    api,
    tableConfig,
    defaultParams = {},
    immediate = true,
    pageField = 'page',
    pageSizeField = 'pageSize',
  } = options

  const dataSource = ref<RecordType[]>([]) as Ref<RecordType[]>
  const loading = ref(false)
  const error = ref<unknown>(null)
  const params = ref({ ...defaultParams }) as Ref<Partial<SearchParams>>
  const pagination = ref<TablePaginationConfig>({
    ...defaultPagination,
    ...tableConfig?.pagination,
  })
  let requestId = 0

  const setParams = (nextParams: Partial<SearchParams>) => {
    params.value = {
      ...params.value,
      ...nextParams,
    }
  }

  const buildRequestParams = () => {
    const requestParams: Record<string, unknown> = {
      ...params.value,
    }

    if (tableConfig?.pagination !== false) {
      requestParams[pageField] = pagination.value.current ?? defaultPagination.current
      requestParams[pageSizeField] = pagination.value.pageSize ?? defaultPagination.pageSize
    }

    const typedRequestParams = requestParams as SearchParams & Record<string, unknown>

    return options.beforeRequest?.(typedRequestParams) ?? typedRequestParams
  }

  const run = async (nextParams?: Partial<SearchParams>, resetPage = false) => {
    if (nextParams) {
      setParams(nextParams)
    }

    if (resetPage && tableConfig?.pagination !== false) {
      pagination.value.current = 1
    }

    const currentRequestId = ++requestId
    loading.value = true
    error.value = null

    try {
      const response = await api(buildRequestParams())

      if (currentRequestId !== requestId) {
        return
      }

      const result = options.transformResponse
        ? options.transformResponse(response)
        : defaultTransformResponse<RecordType>(response)

      dataSource.value = result.list

      if (tableConfig?.pagination !== false) {
        pagination.value.total = result.total
      }

      options.afterRequest?.(result, response)
    } catch (currentError) {
      if (currentRequestId === requestId) {
        error.value = currentError
        options.onError?.(currentError)
      }
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  const reload = () => run()
  const search = (nextParams?: Partial<SearchParams>) => run(nextParams, true)
  const reset = () => {
    params.value = { ...defaultParams }
    return run(undefined, true)
  }

  const handleTableChange: NonNullable<TableProps<RecordType>['onChange']> = (
    nextPagination,
    filters,
    sorter,
    extra,
  ) => {
    if (tableConfig?.pagination !== false) {
      pagination.value.current = nextPagination.current ?? 1
      pagination.value.pageSize = nextPagination.pageSize ?? pagination.value.pageSize
    }

    tableConfig?.onChange?.(nextPagination, filters, sorter, extra)
    void run()
  }

  const tableProps = computed<TableProps<RecordType>>(() => {
    const { pagination: tablePagination, ...restTableConfig } = tableConfig ?? {}

    return {
      ...restTableConfig,
      dataSource: dataSource.value,
      loading: loading.value,
      pagination: tablePagination === false ? false : pagination.value,
      onChange: handleTableChange,
    }
  })

  if (immediate) {
    void run()
  }

  return {
    tableProps,
    dataSource,
    loading,
    error,
    pagination,
    params,
    run,
    reload,
    search,
    reset,
    setParams,
  }
}
