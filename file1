'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [site, setSite] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [list, setList] = useState<any[]>([])

  const getList = async () => {
    const { data } = await supabase.from('construction_files').select('*').order('created_at', { ascending: false })
    if (data) setList(data)
  }

  useEffect(() => { getList() }, [])

  const save = async () => {
    if (!site || !company || !title) return alert('모두 입력해주세요')
    const { error } = await supabase.from('construction_files').insert([{ site_name: site, company_name: company, doc_title: title }])
    if (!error) {
      alert('저장되었습니다!')
      setSite(''); setCompany(''); setTitle('');
      getList()
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🏗️ 현장 데이터 입력 시스템</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="현장명" value={site} onChange={e => setSite(e.target.value)} style={{padding: '10px'}} />
        <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} style={{padding: '10px'}} />
        <input placeholder="문서제목" value={title} onChange={e => setTitle(e.target.value)} style={{padding: '10px'}} />
        <button onClick={save} style={{padding: '10px', cursor: 'pointer'}}>DB 저장</button>
      </div>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>현장명</th><th>업체명</th><th>문서제목</th><th>날짜</th><th>관리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <tr key={item.id}>
              <td>{item.site_name}</td><td>{item.company_name}</td><td>{item.doc_title}</td>
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
              <td><button>엑셀 다운</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
