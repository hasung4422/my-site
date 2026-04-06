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

  // 삭제 함수 추가
  const deleteItem = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('construction_files').delete().eq('id', id)
    if (!error) { alert('삭제되었습니다'); loadData(); }
    else { alert('삭제 실패: ' + error.message); }
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🏗️ 현장 데이터 관리</h1>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input placeholder="현장명" value={site} onChange={e => setSite(e.target.value)} style={{padding:'8px'}} />
        <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} style={{padding:'8px'}} />
        <input placeholder="문서제목" value={title} onChange={e => setTitle(e.target.value)} style={{padding:'8px'}} />
        <button onClick={save} style={{padding:'8px 20px', backgroundColor:'#007bff', color:'white', border:'none', cursor:'pointer'}}>저장</button>
      </div>
      <hr />
      <table border="1" style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
        <thead><tr style={{background: '#f4f4f4'}}>
          <th style={{padding:'10px'}}>현장명</th>
          <th style={{padding:'10px'}}>업체명</th>
          <th style={{padding:'10px'}}>문서제목</th>
          <th style={{padding:'10px'}}>관리</th>
        </tr></thead>
        <tbody>
          {list.map(item => (
            <tr key={item.id} style={{textAlign: 'center'}}>
              <td style={{padding:'10px'}}>{item.site_name}</td>
              <td style={{padding:'10px'}}>{item.company_name}</td>
              <td style={{padding:'10px'}}>{item.doc_title}</td>
              <td style={{padding:'10px'}}>
                <button onClick={() => deleteItem(item.id)} style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px'}}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
