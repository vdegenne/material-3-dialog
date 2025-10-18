import {type MdDialog} from '@material/web/dialog/dialog.js'
import {html, render} from 'lit-html'
import {isTemplateResult} from 'lit-html/directive-helpers.js'
import {ifDefined} from 'lit-html/directives/if-defined.js'
import {createRef, ref} from 'lit-html/directives/ref.js'
import {styleMap} from 'lit-html/directives/style-map.js'
import {until} from 'lit-html/directives/until.js'
import {literal, html as staticHtml} from 'lit-html/static.js'
import type {
	DialogButton,
	DialogOptions,
	RenderButtonOptionType,
} from './types.js'

export class DialogBuilder {
	#o: DialogOptions
	#dialogRef = createRef<MdDialog>()

	#initialRenderPWR = Promise.withResolvers<MdDialog>()
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
			confirmButton: undefined,
			cancelButton: options?.confirmButton ? 'Cancel' : 'Close',
			style: undefined,
			headline: undefined,
			...options,
		}

		this.#o.style = {
			width: '400px',
			...this.#o.style,
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
						if (this.#o.preventCancel) {
							e.preventDefault()
							// <dialog> default behavior closes on 2 escape key presses.
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

		importPromise.then(async () => {
			await this.dialog.updateComplete
			this.#postInitialRender()
		})
	}
	#postInitialRender() {
		this.#initialRenderPWR.resolve(this.dialog)
	}

	#renderHeadline() {
		if (!this.#o.headline) return
		return html`<div slot="headline">${this.#o.headline}</div>`
	}

	#renderContent() {
		const render = async () => {
			await this.initialRenderComplete
			if (typeof this.#o.content === 'function') {
				return await this.#o.content(this.dialog)
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
						${this.#renderButton(this.#o.cancelButton, 'Cancel')}
						${this.#renderButton(this.#o.confirmButton, 'Confirm')}
					</div>
					<!-- -->`
			: null
	}

	#renderButton(options: RenderButtonOptionType, labelFallBack: string) {
		if (options === undefined) return

		if (isTemplateResult(options)) {
			return options
		}

		switch (typeof options) {
			case 'string':
				options = {label: options}
				break
			case 'object':
				options = {label: labelFallBack, ...options}
				break
			case 'function':
				options = {label: labelFallBack, callback: options}
				break
		}

		const opts: DialogButton = {
			callback: (dialog) => dialog.close(),
			label: 'Undefined',
			style: undefined,
			variant: 'md-text-button',
			...options,
		}

		const tagname = (() => {
			switch (opts.variant) {
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

		return staticHtml`
			<${tagname}
				@click=${ifDefined(opts.callback ? () => opts.callback!(this.dialog) : undefined)}
				style="${ifDefined(opts.style ? styleMap(opts.style) : undefined)}"
			>
				${opts.label}
			</${tagname}>
		`
	}

	show() {
		this.dialog.show()
	}
}
