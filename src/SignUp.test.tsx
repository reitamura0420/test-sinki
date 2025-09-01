import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import SignUp from './SignUp'

describe('SignUp', () => {
  it('kanji name input autofills katakana furigana', async () => {
    const user = userEvent.setup()
    render(<SignUp />)
    const nameInput = screen.getByLabelText('名前')
    const kanaInput = screen.getByLabelText('フリガナ')
    await user.type(nameInput, '山田太郎')
    expect(kanaInput).toHaveValue('ヤマダタロウ')
  })

  it('hiragana name input autofills katakana furigana', async () => {
    const user = userEvent.setup()
    render(<SignUp />)
    const nameInput = screen.getByLabelText('名前')
    const kanaInput = screen.getByLabelText('フリガナ')
    await user.type(nameInput, 'たなかじろう')
    expect(kanaInput).toHaveValue('タナカジロウ')
  })
})
