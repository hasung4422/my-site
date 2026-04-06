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

  const deleteItem = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('construction_files').delete().eq('id', id)
    if (!error) { alert('삭제되었습니다'); loadData(); }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderLeft: '5px solid #007bff', paddingLeft: '15px', color: '#333' }}>🏗️ 현장 문서 관리 시스템</h2>
      
      {/* 입력 섹션 */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <input placeholder="현장명 (예: ○○아파트)" value={site} onChange={e => setSite(e.target.value)} style={{flex: '1', padding: '12px', borderRadius: '5px', border: '1px solid #ddd'}} />
        <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} style={{flex: '1', padding: '12px', borderRadius: '5px', border: '1px solid #ddd'}} />
        <input placeholder="문서 제목" value={title} onChange={e => setTitle(e.target.value)} style={{flex: '1', padding: '12px', borderRadius: '5px', border: '1px solid #ddd'}} />
        <button onClick={save} style={{ padding: '12px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>저장하기</button>
      </div>

      {/* 테이블 섹션 */}
      <div style={{ overflowX: 'auto' }}> {/* 모바일 대응: 표가 길어지면 옆으로 스크롤 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#343a40', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>No</th>
              <th style={{ padding: '15px' }}>등록일</th>
              <th style={{ padding: '15px' }}>현장명</th>
              <th style={{ padding: '15px' }}>업체명</th>
              <th style={{ padding: '15px' }}>문서제목</th>
              <th style={{ padding: '15px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{list.length - index}</td>
                <td style={{ padding: '15px', fontSize: '0.9em', color: '#666' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.site_name}</td>
                <td style={{ padding: '15px' }}>{item.company_name}</td>
                <td style={{ padding: '15px' }}>{item.doc_title}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => deleteItem(item.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>등록된 데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
