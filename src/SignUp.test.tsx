import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
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
    fireEvent.beforeInput(nameInput, {
      data: 'わ',
      inputType: 'insertCompositionText',
    } as any)
    expect(kanaInput).toHaveValue('ワ')

    fireEvent.compositionUpdate(nameInput, { data: 'おおかわ' })
    expect(kanaInput).toHaveValue('オオカワ')

    // Step 4: compositionend
    fireEvent.compositionEnd(nameInput, { data: 'おおかわ' })
    expect(kanaInput).toHaveValue('オオカワ')
  })
})

