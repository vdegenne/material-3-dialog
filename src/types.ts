import {type MdDialog} from '@material/web/dialog/dialog.js'
import {type TemplateResult} from 'lit-html'
import {type StyleInfo} from 'lit-html/directives/style-map.js'

type ButtonVariant =
	| 'md-text-button'
	| 'md-filled-button'
	| 'md-filled-tonal-button'
	| 'md-elevated-button'

export interface DialogButton {
	/**
	 * The label of the button.
	 *
	 * @default 'Undefined'
	 */
	label: string

	/**
	 * Tagname used for the button.
	 *
	 * @default 'md-text-button'
	 */
	variant: ButtonVariant

	/**
	 * Option callback to execute when the button is clicked.
	 *
	 * By default the dialog closes and do nothing.
	 * Overriding the callback will prevent the dialog to close, you'll have to close the dialog manually
	 * calling `dialog.close()`. This allows you to implement your own logic (both sync and async).
	 */
	callback: ((dialog: MdDialog) => void) | undefined

	/**
	 * Set of additional styles for the button
	 *
	 * @default undefined
	 */
	style: StyleInfo | undefined
}

export type RenderButtonOptionType =
	| Partial<DialogButton>
	| string
	| TemplateResult
	| undefined

export interface DialogOptions {
	/**
	 * @default false
	 */
	quick: boolean
	/**
	 * Headline of the header of the dialog.
	 *
	 * @default undefined
	 */
	headline: string | TemplateResult | undefined
	/**
	 * Content of the dialog.
	 */
	content:
		| string
		| TemplateResult
		| ((
				dialog: MdDialog,
		  ) => string | TemplateResult | Promise<string | TemplateResult>)
	/**
	 * Confirm button options.
	 *
	 * @default undefined
	 */
	confirmButton: RenderButtonOptionType
	/**
	 * Cancel button options.
	 *
	 * @default 'Close'
	 */
	cancelButton: RenderButtonOptionType

	/**
	 * Callback when the dialog content is ready (before it opens).
	 *
	 * @param dialog the prompt dialog
	 * @default undefined
	 * @deprecated
	 */
	// onDialogReady: ((dialog: MdDialog) => void | Promise<void>) | undefined

	/**
	 * Whether or not to close the dialog on scrim click.
	 *
	 * @default false
	 * @deprecated
	 */
	blockScrimClick: boolean

	/**
	 * Whether or not to close the dialog on escape key.
	 *
	 * @default false
	 * @deprecated
	 */
	blockEscapeKey: boolean

	/**
	 * Prevent closing the dialog on escape key press or scrim click.
	 *
	 * @default false
	 */
	preventCancel: boolean

	/**
	 * Additional styles for the dialog (e.g. width control)
	 *
	 * @default undefined
	 */
	style: StyleInfo | undefined
}
