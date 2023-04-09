import { buildOptionsFromAttributes } from './build-options-from-attributes'

describe('build-options-from-attributes', () => {
  describe('#buildOptionsFromAttributes', () => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `<div id="element"
        data-bai-source="unit-test-source"
        data-bai-medium="unit-test-medium"
        data-bai-medium-version="unit-test-version"
        data-bai-hide-footer="yes"
        data-bai-hide-headers="no"
        data-bai-opacity="50"
        data-bai-disable-tracking
        data-bai-disable-auto-focus
        data-bai-on-ready="onTypeformReady"
        data-bai-on-submit="onTypeformSubmit"
        data-bai-on-question-changed="onTypeformQuestionChanged"
        data-bai-on-height-changed="onTypeformHeightChanged"
        data-bai-auto-resize="100,300"
        data-bai-open="exit"
        data-bai-open-value="3000"
        data-bai-hidden="foo=foo value,bar=some bar value"
        data-bai-chat
        data-bai-share-ga-instance="ua-hello-1"
        data-bai-tracking="utm_foo=utm foo value,foobar=foobar value"
        data-bai-redirect-target="_blank"
        data-bai-domain="custom.example.com"
        data-bai-lazy
        data-bai-keep-session
        data-bai-disable-scroll
        data-bai-full-screen
      ></div>`

    it('should load correct options', () => {
      const win = window as any
      win.onTypeformReady = jest.fn()
      win.onTypeformSubmit = jest.fn()
      win.onTypeformQuestionChanged = jest.fn()
      win.onTypeformHeightChanged = jest.fn()

      const element = wrapper.querySelector('#element') as HTMLElement
      const options = buildOptionsFromAttributes(element)

      expect(options).toMatchObject({
        source: 'unit-test-source',
        medium: 'unit-test-medium',
        mediumVersion: 'unit-test-version',
        hideFooter: true,
        hideHeaders: false,
        opacity: 50,
        disableTracking: true,
        onReady: win.onTypeformReady,
        onSubmit: win.onTypeformSubmit,
        onQuestionChanged: win.onTypeformQuestionChanged,
        onHeightChanged: win.onTypeformHeightChanged,
        autoResize: '100,300',
        open: 'exit',
        openValue: 3000,
        hidden: {
          foo: 'foo value',
          bar: 'some bar value',
        },
        chat: true,
        shareGaInstance: 'ua-hello-1',
        tracking: {
          utm_foo: 'utm foo value',
          foobar: 'foobar value',
        },
        redirectTarget: '_blank',
        domain: 'custom.example.com',
        lazy: true,
        keepSession: true,
        disableScroll: true,
        fullScreen: true,
      })
    })
  })
})
