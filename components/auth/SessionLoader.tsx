import s from './SessionLoader.module.scss'
import cn from 'classnames'

export type Props = {

}

export default function SessionLoader({ }: Props) {

	return (
		<div className={cn(s.loader)}>

		</div>
	)
}