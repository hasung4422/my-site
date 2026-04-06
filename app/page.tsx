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
    if (!site || !company || !title) return alert('모든 칸을 채워주세요!')
    const { error } = await supabase.from('construction_files').insert([{ site_name: site, company_name: company, doc_title: title }])
    if (!error) { alert('데이터 저장 성공!'); setSite(''); setCompany(''); setTitle(''); loadData(); }
    else { alert('저장 실패: ' + error.message); }
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>🏗️ 현장 데이터 관리 시스템</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '20px' }}>
        <input placeholder="현장명" value={site} onChange={e => setSite(e.target.value)} style={{padding: '10px', flex: 1}} />
        <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} style={{padding: '10px', flex: 1}} />
        <input placeholder="문서제목" value={title} onChange={e => setTitle(e.target.value)} style={{padding: '10px', flex: 1}} />
        <button onClick={save} style={{padding: '10px 20px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px'}}>DB 저장</button>
      </div>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead style={{background: '#f4f4f4'}}>
          <tr>
            <th style={{padding: '10px'}}>현장명</th><th style={{padding: '10px'}}>업체명</th>
            <th style={{padding: '10px'}}>문서제목</th><th style={{padding: '10px'}}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan={4} style={{padding: '20px'}}>데이터가 없습니다.</td></tr>
          ) : (
            list.map(item => (
              <tr key={item.id}>
                <td style={{padding: '10px'}}>{item.site_name}</td>
                <td style={{padding: '10px'}}>{item.company_name}</td>
                <td style={{padding: '10px'}}>{item.doc_title}</td>
                <td style={{padding: '10px'}}>{new Date(item.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
