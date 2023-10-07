import { format } from 'date-fns';
export const isServer = typeof window === 'undefined';
export const formatDate = (date: string) => format(new Date(date), 'yyyy-MM-dd')
export const pingEndpoint = async (path: string | string[], method: 'GET' | 'POST' = 'POST') => {
  path = !Array.isArray(path) ? [path] : path;
  path.forEach(p =>
    fetch(p, {
      method,
      body: method == 'POST' ? JSON.stringify({ ping: true }) : undefined
    })
      .then(() => console.log(`pinged ${path} endpoint`))
      .catch(err => console.error(`Failed: ping ${path} endpoint`, err))
  )
}