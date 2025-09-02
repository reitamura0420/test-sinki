import { useState, useEffect, useRef } from 'react'

interface KuroshiroInstance {
  init(analyzer: unknown): Promise<void>
  convert(text: string, options: { to: string }): Promise<string>
}

interface KuroshiroConstructor {
  new (): KuroshiroInstance
}

interface KuromojiConstructor {
  new (): unknown
}

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
  const kuroshiroRef = useRef<KuroshiroInstance | null>(null)

  useEffect(() => {
    const nameInput = document.getElementById('name') as HTMLInputElement | null
    if (!nameInput) return

    const toKatakana = (text: string) =>
      text.replace(/[ぁ-ん]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) + 0x60),
      )

    const updateKana = (data: string | null) => {
      if (!data) return
      const kana = toKatakana(data)
      setForm((prev) => ({ ...prev, nameKana: kana }))
    }

    const handleCompositionUpdate = (e: CompositionEvent) => {
      updateKana(e.data)
    }

    const handleBeforeInput = (e: InputEvent) => {
      if (e.inputType === 'insertCompositionText') {
        updateKana(e.data)
      }
    }

    const handleCompositionEnd = (e: CompositionEvent) => {
      if (!/[ぁ-ん]/.test(e.data)) return
      const kana = toKatakana(e.data)
      setForm((prev) =>
        prev.nameKana === kana ? prev : { ...prev, nameKana: kana },
      )
    }

    nameInput.addEventListener('compositionupdate', handleCompositionUpdate)
    nameInput.addEventListener(
      'beforeinput',
      handleBeforeInput as unknown as EventListener,
    )
    nameInput.addEventListener('compositionend', handleCompositionEnd)

    return () => {
      nameInput.removeEventListener('compositionupdate', handleCompositionUpdate)
      nameInput.removeEventListener(
        'beforeinput',
        handleBeforeInput as unknown as EventListener,
      )
      nameInput.removeEventListener('compositionend', handleCompositionEnd)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const { Kuroshiro, KuromojiAnalyzer } =
        window as unknown as {
          Kuroshiro?: KuroshiroConstructor
          KuromojiAnalyzer?: KuromojiConstructor
        }
      if (!Kuroshiro || !KuromojiAnalyzer) return
      const k = new Kuroshiro()
      await k.init(new KuromojiAnalyzer())
      kuroshiroRef.current = k
    }
    init()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleConvert = async () => {
    if (!kuroshiroRef.current) return
    const kana = await kuroshiroRef.current.convert(form.name, {
      to: 'katakana',
    })
    setForm((prev) => ({ ...prev, nameKana: kana }))
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
      <button
        type="button"
        className="btn waves-effect waves-light"
        onClick={handleConvert}
      >
        カナ変換
      </button>
      <div className="input-field">
        <input
          id="nameKana"
          type="text"
          name="nameKana"
          value={form.nameKana}
          onChange={handleChange}
        />
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
