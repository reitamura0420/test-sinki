/// <reference types="vitest" />
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import SignUp from './SignUp'

test('名前入力でフリガナが自動入力される', async () => {
  render(<SignUp />)
  const nameInput = screen.getByLabelText('名前')
  const kanaInput = screen.getByLabelText('フリガナ')
  await userEvent.type(nameInput, 'やまだ')
  expect(kanaInput).toHaveValue('ヤマダ')
})

test('漢字入力でもフリガナが自動入力される', () => {
  render(<SignUp />)
  const nameInput = screen.getByLabelText('名前') as HTMLInputElement
  const kanaInput = screen.getByLabelText('フリガナ') as HTMLInputElement

  fireEvent.compositionStart(nameInput)
  fireEvent.change(nameInput, { target: { value: 'やまだたろう' } })
  fireEvent.compositionUpdate(nameInput, { data: 'やまだたろう' })
  fireEvent.compositionEnd(nameInput, { data: 'やまだたろう' })
  fireEvent.change(nameInput, { target: { value: '山田太郎' } })

  expect(kanaInput.value).toBe('ヤマダタロウ')
})
