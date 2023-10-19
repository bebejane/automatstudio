import { format } from 'date-fns';
export const isServer = typeof window === 'undefined';
export const formatDate = (date: string | Date) => format(new Date(date), 'yyyy-MM-dd')

export const parseFilenameData = (filename: string) => {
  const parts = filename.split('_')

  if (!parts || parts.length < 8)
    throw new Error('Invalid filename. Expected format: clientid_productid_YYYY_MM_DD_HH_mm_ss.ext')

  const clientId = parts[0]
  const productId = parts[1]
  const [year, month, day] = parts.slice(2, 5).map(n => parseInt(n))
  const [hour, minute, second] = parts.slice(5, 8).map(n => parseInt(n))

  if ([year, month, day, hour, minute, second].some(n => isNaN(n)))
    throw new Error('Invalid date format in filename')

  return {
    clientId,
    productId,
    date: new Date(year, month - 1, day, hour, minute, second),
    filename
  }
}
