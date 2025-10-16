import {type MdDialog} from '@material/web/dialog/dialog.js'
import {html, render} from 'lit-html'
import {ifDefined} from 'lit-html/directives/if-defined.js'
import {createRef, ref} from 'lit-html/directives/ref.js'
import {styleMap} from 'lit-html/directives/style-map.js'
import {until} from 'lit-html/directives/until.js'
import {literal, html as staticHtml} from 'lit-html/static.js'
import type {DialogButton, DialogOptions} from './types.js'

export class DialogBuilder {
	#o: DialogOptions
	#dialogRef = createRef<MdDialog>()

	#initialRenderPWR = Promise.withResolvers<void>()
	get initialRenderComplete() {
		return this.#initialRenderPWR.promise
	}

	get dialog() {
		return this.#dialogRef.value!
	}

	constructor(options?: Partial<DialogOptions>) {
		this.#o = {
			quick: false,
			blockScrimClick: false,
			blockEscapeKey: false,
			preventCancel: false,
			content: '',
			confirmButton: 'Ok',
			cancelButton: undefined,
			style: undefined,
			headline: undefined,
			onDialogReady: undefined,
			...options,
		}

		const container = document.createElement('div')
		document.body.appendChild(container)

		const importPromise = import('@material/web/dialog/dialog.js')

		render(
			html`<!---->
				<md-dialog
					${ref(this.#dialogRef)}
					?quick="${this.#o.quick}"
					style="${ifDefined(
						this.#o.style ? styleMap(this.#o.style) : undefined,
					)}"
					@cancel="${(e: Event) => {
						// returnValue = ''
						if (this.#o.preventCancel) {
							e.preventDefault()
							// TODO: <dialog> default behavior closes on 2 escape key presses.
						}
					}}"
					@closed=${() => {
						container.remove()
					}}
				>
					<!-- headline -->
					${this.#renderHeadline()}
					<!-- content -->
					<div slot="content">${this.#renderContent()}</div>
					<!-- actions -->
					${this.#renderActions()}
				</md-dialog>
				<!----> `,
			container,
		)

		Promise.all([this.dialog.updateComplete, importPromise]).then(() =>
			this.#postInitialRender(),
		)
	}
	#postInitialRender() {
		this.#initialRenderPWR.resolve()
	}

	#renderHeadline() {
		if (!this.#o.headline) return
		return html`<div slot="headline">${this.#o.headline}</div>`
	}

	#renderContent() {
		const render = async () => {
			await this.initialRenderComplete
			if (typeof this.#o.content === 'function') {
				return this.#o.content(this.dialog)
			} else {
				return this.#o.content
			}
		}
		return until(render())
	}

	#renderActions() {
		return this.#o.confirmButton !== undefined ||
			this.#o.cancelButton !== undefined
			? html`<!-- -->
					<div slot="actions">
						${this.#renderButton(
							this.#o.cancelButton !== undefined
								? typeof this.#o.cancelButton === 'string'
									? {label: this.#o.cancelButton}
									: {label: 'Cancel', ...this.#o.cancelButton}
								: undefined,
						)}
						${this.#renderButton(
							this.#o.confirmButton !== undefined
								? typeof this.#o.confirmButton === 'string'
									? {label: this.#o.confirmButton}
									: {label: 'Confirm', ...this.#o.confirmButton}
								: undefined,
						)}
					</div>
					<!-- -->`
			: null
	}
	#renderButton(options: Partial<DialogButton> | string | undefined) {
		if (options === undefined) {
			return null
		}
		const _o: DialogButton = {
			callback: (dialog) => dialog.close(),
			label: 'Undefined',
			styles: undefined,
			variant: 'md-text-button',
		}

		if (typeof options === 'string') {
			_o.label = options
		} else {
			Object.assign(_o, options)
		}

		const tagname = (() => {
			switch (_o.variant) {
				case 'md-text-button':
					import('@material/web/button/text-button.js')
					return literal`md-text-button`
				case 'md-filled-button':
					import('@material/web/button/filled-button.js')
					return literal`md-filled-button`
				case 'md-filled-tonal-button':
					import('@material/web/button/filled-tonal-button.js')
					return literal`md-filled-tonal-button`
				case 'md-elevated-button':
					import('@material/web/button/elevated-button.js')
					return literal`md-elevated-button`
				default:
					import('@material/web/button/text-button.js')
					return literal`md-text-button`
			}
		})()

		// const value = _o.returnValue !== undefined ? _o.returnValue : _o.label

		return staticHtml`
			<${tagname}
				@click=${ifDefined(_o.callback ? () => _o.callback!(this.dialog) : undefined)}
			>
				${_o.label}
			</${tagname}>
		`
	}

	show() {
		this.dialog.show()
	}
}
