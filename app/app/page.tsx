'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function ConstructionPage() {
  const [site, setSite] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [list, setList] = useState<any[]>([])

  const loadData = async () => {
    const { data } = await supabase.from('construction_files').select('*').order('created_at', { ascending: false })
    if (data) setList(data)
  }
  useEffect(() => { loadData() }, [])

  const save = async () => {
    if (!site || !company || !title) return alert('모두 입력해주세요')
    const { error } = await supabase.from('construction_files').insert([{ site_name: site, company_name: company, doc_title: title }])
    if (!error) { alert('저장 성공!'); setSite(''); setCompany(''); setTitle(''); loadData(); }
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>🏗️ 현장 데이터 관리</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="현장명" value={site} onChange={e => setSite(e.target.value)} style={{padding: '10px'}} />
        <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} style={{padding: '10px'}} />
        <input placeholder="문서제목" value={title} onChange={e => setTitle(e.target.value)} style={{padding: '10px'}} />
        <button onClick={save} style={{padding: '10px', cursor: 'pointer', background: '#007bff', color: '#fff'}}>DB 저장</button>
      </div>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{background: '#eee'}}>
          <tr><th>현장명</th><th>업체명</th><th>문서제목</th><th>작성일</th></tr>
        </thead>
        <tbody>
          {list.map(item => (
            <tr key={item.id} style={{textAlign: 'center'}}>
              <td>{item.site_name}</td><td>{item.company_name}</td><td>{item.doc_title}</td>
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
