import {
  createIframe,
  hasDom,
  isFullscreen,
  unmountElement,
  lazyInitialize,
  makeAutoResize,
  changeColorOpacity,
} from '../../utils'
import {
  getFormHeightChangedHandler,
  getFormReadyHandler,
  getFormThemeHandler,
  getWelcomeScreenHiddenHandler,
} from '../../utils/create-iframe/get-form-event-handler'
import { EmbedWidget } from '../../base'

import { WidgetOptions } from './widget-options'
import { buildWidget } from './elements'
import { overrideFullScreenStyles } from './elements/override-full-screen-styles'

export type Widget = EmbedWidget

const buildCloseButton = () => {
  const closeButton = document.createElement('a')
  closeButton.className = 'tf-v1-widget-close tf-v1-close-icon'
  closeButton.innerHTML = '&times;'
  return closeButton
}

export const createWidget = (formId: string, options: WidgetOptions): Widget => {
  if (!hasDom()) {
    return {
      refresh: () => {},
      focus: () => {},
      unmount: () => {},
    }
  }

  const { domain, ...widgetOptions } = options
  widgetOptions.inlineOnMobile = options.inlineOnMobile || options.fullScreen

  if (!widgetOptions.inlineOnMobile && (widgetOptions.forceTouch || isFullscreen())) {
    widgetOptions.displayAsFullScreenModal = true
    widgetOptions.forceTouch = true
  }

  const { embedId, iframe, refresh, focus } = createIframe('widget', { formId, domain, options: widgetOptions })
  const widget = buildWidget(iframe, widgetOptions.width, widgetOptions.height)

  let mobileAutoResize: () => void

  if (widgetOptions.fullScreen) {
    overrideFullScreenStyles(options.container, iframe)
    mobileAutoResize = makeAutoResize(options.container, true)
    window.addEventListener('resize', mobileAutoResize)
    mobileAutoResize()
  }

  if (widgetOptions.autoResize) {
    const [minHeight, maxHeight] =
      typeof widgetOptions.autoResize === 'string'
        ? widgetOptions.autoResize.split(',').map((value) => parseInt(value))
        : []

    window.addEventListener(
      'message',
      getFormHeightChangedHandler(embedId, (data) => {
        let containerHeight = Math.max(data.height, minHeight || 0)
        if (maxHeight) {
          containerHeight = Math.min(containerHeight, maxHeight)
        }
        options.container.style.height = `${containerHeight}px`
      })
    )
  }

  if (widgetOptions.autoFocus) {
    window.addEventListener(
      'message',
      getFormReadyHandler(embedId, () => {
        setTimeout(() => {
          focus()
        }, 1000)
      })
    )
  }

  const appendWidget = () => options.container.append(widget)

  options.container.innerHTML = ''

  if (options.lazy) {
    lazyInitialize(options.container, appendWidget)
  } else {
    appendWidget()
  }

  if (widgetOptions.displayAsFullScreenModal) {
    let backgroundColor = ''
    const { container } = options
    mobileAutoResize = makeAutoResize(container)
    const originalHeight = container.style.height
    const openPopup = () => {
      container.classList.add('tf-v1-widget-fullscreen')
      if (options.opacity !== undefined) {
        container.style.backgroundColor = backgroundColor
      }
      mobileAutoResize()
      window.addEventListener('resize', mobileAutoResize)
    }
    const onTheme = (data: any) => {
      backgroundColor = changeColorOpacity(data?.theme?.backgroundColor)
    }
    window.addEventListener('message', getWelcomeScreenHiddenHandler(embedId, openPopup))
    window.addEventListener('message', getFormThemeHandler(embedId, onTheme))
    const closeButton = buildCloseButton()

    const close = () => {
      window.removeEventListener('resize', mobileAutoResize)
      container.style.height = originalHeight
      options.onClose?.()
      container.classList.remove('tf-v1-widget-fullscreen')
      container.style.backgroundColor = ''

      if (options.keepSession) {
        const overlay = document.createElement('div')
        overlay.className = 'tf-v1-widget-iframe-overlay'
        overlay.onclick = () => {
          container.classList.add('tf-v1-widget-fullscreen')
          unmountElement(overlay)
        }
        widget.append(overlay)
      } else {
        options.container.innerHTML = ''
        appendWidget()
        container.append(closeButton)
      }
    }

    closeButton.onclick = close
    container.append(closeButton)
  }

  return {
    refresh,
    focus,
    unmount: () => {
      if (mobileAutoResize) {
        window.removeEventListener('resize', mobileAutoResize)
      }
      unmountElement(widget)
    },
  }
}
