import { toKatakana, toHiragana } from 'wanakana'

interface Options {
  katakana?: boolean
}

class AutoKana {
  static bind(
    source: string | HTMLInputElement,
    target: string | HTMLInputElement,
    options: Options = {}
  ) {
    const src =
      typeof source === 'string'
        ? (document.querySelector(source) as HTMLInputElement)
        : source
    const tgt =
      typeof target === 'string'
        ? (document.querySelector(target) as HTMLInputElement)
        : target
    const { katakana = true } = options
    const convert = katakana ? toKatakana : toHiragana
    let composing = false

    const update = (text: string) => {
      const kana = convert(text)
      tgt.value = kana
      tgt.dispatchEvent(new Event('input', { bubbles: true }))
    }

    const handleCompositionStart = () => {
      composing = true
    }

    const handleCompositionUpdate = (e: CompositionEvent) => {
      update(e.data)
    }

    const handleCompositionEnd = (e: CompositionEvent) => {
      composing = false
      if (e.data) {
        update(e.data)
      }
    }

    const handleInput = (e: Event) => {
      if (composing) return
      const value = (e.target as HTMLInputElement).value
      update(value)
    }

    src.addEventListener('compositionstart', handleCompositionStart)
    src.addEventListener('compositionupdate', handleCompositionUpdate)
    src.addEventListener('compositionend', handleCompositionEnd)
    src.addEventListener('input', handleInput)

    return {
      unbind() {
        src.removeEventListener('compositionstart', handleCompositionStart)
        src.removeEventListener('compositionupdate', handleCompositionUpdate)
        src.removeEventListener('compositionend', handleCompositionEnd)
        src.removeEventListener('input', handleInput)
      },
    }
  }
}

export default AutoKana
