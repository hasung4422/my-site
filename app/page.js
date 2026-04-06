'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')
  
  const [site, setSite] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [list, setList] = useState([])

  // 데이터 로드
  const loadData = async () => {
    const { data } = await supabase.from('construction_files').select('*').order('created_at', { ascending: false })
    if (data) setList(data)
  }

  useEffect(() => { loadData() }, [])

  // 로그인 함수
  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', loginId)
      .eq('password', loginPw)
      .single()

    if (data) {
      setIsLoggedIn(true)
      setAdminName(data.user_name)
      alert(`${data.user_name}님, 환영합니다!`)
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.')
    }
  }

  const save = async () => {
    const { error } = await supabase.from('construction_files').insert([{ site_name: site, company_name: company, doc_title: title }])
    if (!error) { alert('저장 성공!'); setSite(''); setCompany(''); setTitle(''); loadData(); }
  }

  const deleteItem = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('construction_files').delete().eq('id', id)
    loadData()
  }

  // --- 로그인 전 화면 ---
  if (!isLoggedIn) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' }}>
        <div style={{ background:'white', padding:'40px', borderRadius:'10px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign:'center', marginBottom:'20px' }}>🏗️ 현장 관리 로그인</h2>
          <input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} style={{ width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ddd' }} />
          <input type="password" placeholder="비밀번호" value={loginPw} onChange={e=>setLoginPw(e.target.value)} style={{ width:'100%', padding:'12px', marginBottom:'20px', borderRadius:'5px', border:'1px solid #ddd' }} />
          <button onClick={handleLogin} style={{ width:'100%', padding:'12px', backgroundColor:'#007bff', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' }}>로그인</button>
        </div>
      </div>
    )
  }

  // --- 로그인 후 관리자 화면 ---
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <h2 style={{ borderLeft: '5px solid #007bff', paddingLeft: '15px' }}>🏗️ 관리자: {adminName}</h2>
        <button onClick={() => setIsLoggedIn(false)} style={{ padding:'5px 10px', cursor:'pointer' }}>로그아웃</button>
      </div>
      
      {/* 입력 영역 */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input placeholder="현장명" value={site} onChange={e => setSite(e.target.value)} style={{flex: 1, padding: '10px'}} />
        <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} style={{flex: 1, padding: '10px'}} />
        <input placeholder="문서 제목" value={title} onChange={e => setTitle(e.target.value)} style={{flex: 1, padding: '10px'}} />
        <button onClick={save} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>저장</button>
      </div>

      {/* 목록 영역 */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
            <th style={{ padding: '12px' }}>현장명</th>
            <th style={{ padding: '12px' }}>업체명</th>
            <th style={{ padding: '12px' }}>문서제목</th>
            <th style={{ padding: '12px' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign:'center' }}>
              <td style={{ padding: '12px' }}>{item.site_name}</td>
              <td style={{ padding: '12px' }}>{item.company_name}</td>
              <td style={{ padding: '12px' }}>{item.doc_title}</td>
              <td style={{ padding: '12px' }}>
                <button onClick={() => deleteItem(item.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
