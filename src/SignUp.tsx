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
  postalCode: string
  address: string
}

function SignUp() {
  const [form, setForm] = useState<FormState>({
    name: '',
    nameKana: '',
    email: '',
    password: '',
    confirm: '',
    postalCode: '',
    address: '',
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

  const handleAddressLookup = async () => {
    if (!form.postalCode) return
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${form.postalCode}`,
      )
      const data: {
        status: number
        results?: Array<{
          address1: string
          address2: string
          address3: string
        }>
      } = await res.json()
      const result = data.results?.[0]
      if (!result) {
        alert('住所が見つかりません')
        return
      }
      setForm((prev) => ({
        ...prev,
        address: `${result.address1}${result.address2}${result.address3}`,
      }))
    } catch {
      alert('住所検索に失敗しました')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!passwordRegex.test(form.password)) {
      alert('パスワードは8文字以上で英字と数字を含めてください')
      return
    }
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
          id="postalCode"
          type="text"
          name="postalCode"
          value={form.postalCode}
          onChange={handleChange}
        />
        <label htmlFor="postalCode">郵便番号</label>
      </div>
      <button
        type="button"
        className="btn waves-effect waves-light"
        onClick={handleAddressLookup}
      >
        住所自動補完
      </button>
      <div className="input-field">
        <input
          id="address"
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
        />
        <label htmlFor="address">住所</label>
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
          pattern="(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}"
          title="8文字以上で英字と数字を含めてください"
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
          pattern="(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}"
          title="8文字以上で英字と数字を含めてください"
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
