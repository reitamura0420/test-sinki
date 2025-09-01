import { useEffect, useState } from 'react'
import Kuroshiro from 'kuroshiro'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'
import { useMemo } from 'react'

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

  const toKatakana = (input: string) =>
    input.replace(/[\u3041-\u3096]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60)
    )

  const kuroshiro = useMemo(() => new Kuroshiro(), [])
  useEffect(() => {
    kuroshiro.init(new KuromojiAnalyzer()).catch(console.error)
  }, [kuroshiro])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'name') {
      let kana = toKatakana(value)
      try {
        kana = await kuroshiro.convert(value, { to: 'katakana' })
      } catch {
        /* ignore conversion errors */
      }
      setForm((prev) => ({ ...prev, name: value, nameKana: kana }))
    } else if (name === 'nameKana') {
      setForm((prev) => ({ ...prev, nameKana: toKatakana(value) }))
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
        <input type="text" name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>
        フリガナ
        <input type="text" name="nameKana" value={form.nameKana} onChange={handleChange} />
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
