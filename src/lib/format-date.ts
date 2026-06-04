import { format } from 'date-fns'

export const formatChineseDate = (date: Date | string | number) =>
  format(new Date(date), 'yyyy年MM月dd日')
