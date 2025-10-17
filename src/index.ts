import {DialogBuilder} from './dialog-builder.js'
import type {DialogOptions} from './types.js'

export type {DialogButton} from './types.js'

export function materialDialog(options?: Partial<DialogOptions>) {
	const dialog = new DialogBuilder(options)
	dialog.initialRenderComplete.then(() => {
		dialog.show()
	})
}
