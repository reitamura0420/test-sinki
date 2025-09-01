import { useState, useEffect, RefObject } from 'react'
import { toKatakana, toHiragana } from 'wanakana'

interface Options {
  katakana?: boolean
}

function useKana(source: RefObject<HTMLInputElement>, options: Options = {}) {
  const [kana, setKana] = useState('')

  useEffect(() => {
    const src = source.current
    if (!src) return

    const { katakana = true } = options
    const convert = katakana ? toKatakana : toHiragana
    let composing = false

    const update = (text: string) => {
      setKana(convert(text))
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

    return () => {
      src.removeEventListener('compositionstart', handleCompositionStart)
      src.removeEventListener('compositionupdate', handleCompositionUpdate)
      src.removeEventListener('compositionend', handleCompositionEnd)
      src.removeEventListener('input', handleInput)
    }
  }, [source, options.katakana])

  return kana
}

export default useKana
