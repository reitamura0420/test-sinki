import { useState, useRef } from 'react'
import { toKatakana } from 'wanakana'

interface FormState {
  name: string
  nameKana: string
  email: string
  password: string
  confirm: string
}

function SignUp() {
  const [form, setForm] = useState<FormState>({
    name: '',
    nameKana: '',
    email: '',
    password: '',
    confirm: '',
  })

  const nameRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'name') {
      setForm((prev) => ({ ...prev, name: value, nameKana: toKatakana(value) }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      alert('パスワードが一致しません')
      return
    }
    console.log('Registered user:', form)
  }

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>新規登録</h2>
      <label>
        名前
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          ref={nameRef}
        />
      </label>
      <label>
        フリガナ
        <input
          type="text"
          name="nameKana"
          value={form.nameKana}
          onChange={handleChange}
        />
      </label>
      <label>
        メールアドレス
        <input type="email" name="email" value={form.email} onChange={handleChange} />
      </label>
      <label>
        パスワード
        <input type="password" name="password" value={form.password} onChange={handleChange} />
      </label>
      <label>
        パスワード（確認）
        <input type="password" name="confirm" value={form.confirm} onChange={handleChange} />
      </label>
      <button type="submit">登録</button>
    </form>
  )
}

export default SignUp
