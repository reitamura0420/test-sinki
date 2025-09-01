/// <reference types="vitest" />
import { render, screen } from '@testing-library/react'
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

test('漢字入力ではフリガナは自動入力されない', async () => {
  render(<SignUp />)
  const nameInput = screen.getByLabelText('名前')
  const kanaInput = screen.getByLabelText('フリガナ')
  await userEvent.type(nameInput, '山田')
  expect(kanaInput).toHaveValue('')
  await userEvent.type(kanaInput, 'やまだ')
  expect(kanaInput).toHaveValue('ヤマダ')
})
