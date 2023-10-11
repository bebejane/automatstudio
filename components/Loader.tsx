import s from './Loader.module.scss'
import cn from 'classnames'

export type Props = {
	className?: string
}

export default function Loader({ className }: Props) {

	return (
		<span className={cn(s.loader, className)} />
	)
}