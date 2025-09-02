import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import SignUp from './SignUp'

describe('SignUp IME input flow', () => {
  it('updates kana field through typical composition events', () => {
    render(<SignUp />)
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement
    const kanaInput = screen.getByLabelText('フリガナ') as HTMLInputElement

    // Step 0: initial state
    expect(kanaInput).toHaveValue('')

    // Step 1: compositionstart
    fireEvent.compositionStart(nameInput, { data: '' })
    expect(kanaInput).toHaveValue('')

    // Step 2: incremental compositionupdate
    fireEvent.compositionUpdate(nameInput, { data: 'お' })
    expect(kanaInput).toHaveValue('オ')
    fireEvent.compositionUpdate(nameInput, { data: 'おお' })
    expect(kanaInput).toHaveValue('オオ')
    fireEvent.compositionUpdate(nameInput, { data: 'おおか' })
    expect(kanaInput).toHaveValue('オオカ')

    // beforeinput with difference "わ"
    fireEvent(
      nameInput,
      new InputEvent('beforeinput', {
        data: 'わ',
        inputType: 'insertCompositionText',
        bubbles: true,
        cancelable: true,
      }),
    )
    expect(kanaInput).toHaveValue('ワ')

    fireEvent.compositionUpdate(nameInput, { data: 'おおかわ' })
    expect(kanaInput).toHaveValue('オオカワ')

    // Step 4: compositionend produces kanji
    fireEvent.compositionEnd(nameInput, { data: '大川' })
    expect(kanaInput).toHaveValue('オオカワ')
  })

  it('converts kanji to kana when button is clicked', async () => {
    interface MockKuroshiro {
      init(): Promise<void>
      convert(text: string): Promise<string>
    }
    ;(window as unknown as {
      Kuroshiro?: new () => MockKuroshiro
      KuromojiAnalyzer?: new () => unknown
    }).Kuroshiro = class implements MockKuroshiro {
      async init() {}
      async convert(text: string) {
        if (text === '大川') return 'オオカワ'
        return ''
      }
    }
    ;(window as unknown as { KuromojiAnalyzer?: new () => unknown }).KuromojiAnalyzer = class {}
    render(<SignUp />)
    await new Promise((r) => setTimeout(r, 0))
    const nameInput = screen.getByLabelText('名前') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: '大川', name: 'name' } })
    const button = screen.getByRole('button', { name: 'カナ変換' })
    fireEvent.click(button)
    const kanaInput = screen.getByLabelText('フリガナ') as HTMLInputElement
    await waitFor(() => expect(kanaInput).toHaveValue('オオカワ'))
  })
})

