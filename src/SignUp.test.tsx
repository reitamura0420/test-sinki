import { describe, it, expect, vi } from 'vitest'
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

  it('fills address field when postal code lookup button is clicked', async () => {
    render(<SignUp />)
    const zipInput = screen.getByLabelText('郵便番号') as HTMLInputElement
    fireEvent.change(zipInput, {
      target: { value: '1000001', name: 'postalCode' },
    })
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({
        status: 200,
        results: [
          { address1: '東京都', address2: '千代田区', address3: '千代田' },
        ],
      }),
    })
    const originalFetch = global.fetch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).fetch = mockFetch
    const button = screen.getByRole('button', { name: '住所自動補完' })
    fireEvent.click(button)
    const addressInput = screen.getByLabelText('住所') as HTMLInputElement
    await waitFor(() =>
      expect(addressInput).toHaveValue('東京都千代田区千代田'),
    )
    ;(global as any).fetch = originalFetch
  })
})

