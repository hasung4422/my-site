'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Page() {
  const [site, setSite] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [list, setList] = useState([])

  const loadData = async () => {
    const { data } = await supabase.from('construction_files').select('*').order('created_at', { ascending: false })
    if (data) setList(data)
  }
  useEffect(() => { loadData() }, [])

  const save = async () => {
    if (!site || !company || !title) return alert('모든 칸을 채워주세요')
    const { error } = await supabase.from('construction_files').insert([{ site_name: site, company_name: company, doc_title: title }])
    if (!error) { alert('저장 성공!'); setSite(''); setCompany(''); setTitle(''); loadData(); }
  }

  return (
    <div style={{ padding: '30px' }}>
      <h1>🏗️ 현장 데이터 관리</h1>
      <input placeholder="현장명" value={site} onChange={e => setSite(e.target.value)} />
      <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} />
      <input placeholder="문서제목" value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={save}>DB 저장</button>
      <hr />
      <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead><tr style={{background: '#eee'}}><th>현장명</th><th>업체명</th><th>문서제목</th></tr></thead>
        <tbody>
          {list.map(item => (
            <tr key={item.id}><td>{item.site_name}</td><td>{item.company_name}</td><td>{item.doc_title}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
