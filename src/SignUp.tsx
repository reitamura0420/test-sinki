import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const autoKana = (window as any).autoKana
    if (autoKana) {
      autoKana('#name', '#nameKana', { katakana: true })
    }
    const kanaInput = document.getElementById('nameKana') as HTMLInputElement | null
    const syncKana = () => {
      if (kanaInput) {
        setForm((prev) => ({ ...prev, nameKana: kanaInput.value }))
      }
    }
    kanaInput?.addEventListener('input', syncKana)
    return () => {
      kanaInput?.removeEventListener('input', syncKana)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
    <form onSubmit={handleSubmit} className="container">
      <h2 className="center-align">新規登録</h2>
      <div className="input-field">
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <label htmlFor="name">名前</label>
      </div>
      <div className="input-field">
        <input id="nameKana" type="text" name="nameKana" onChange={handleChange} />
        <label htmlFor="nameKana">フリガナ</label>
      </div>
      <div className="input-field">
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <label htmlFor="email">メールアドレス</label>
      </div>
      <div className="input-field">
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        <label htmlFor="password">パスワード</label>
      </div>
      <div className="input-field">
        <input
          id="confirm"
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
        />
        <label htmlFor="confirm">パスワード（確認）</label>
      </div>
      <button className="btn waves-effect waves-light" type="submit">
        登録
      </button>
    </form>
  )
}

export default SignUp
