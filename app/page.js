'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link' // 페이지 이동을 위한 도구

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')

  const handleLogin = async () => {
    const { data } = await supabase.from('admin_users').select('*').eq('user_id', loginId).eq('password', loginPw).single()
    if (data) {
      setIsLoggedIn(true); setAdminName(data.user_name);
    } else { alert('로그인 실패!'); }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' }}>
        <div style={{ background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'350px' }}>
          <h2 style={{ textAlign:'center', color:'#007bff', marginBottom:'30px' }}>정현 현장 관리</h2>
          <input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} style={{ width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ddd' }} />
          <input type="password" placeholder="비밀번호" value={loginPw} onChange={e=>setLoginPw(e.target.value)} style={{ width:'100%', padding:'12px', marginBottom:'25px', borderRadius:'8px', border:'1px solid #ddd' }} />
          <button onClick={handleLogin} style={{ width:'100%', padding:'12px', backgroundColor:'#007bff', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>로그인</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>🏗️ 정현 현장 관리 메인</h1>
      <p>반갑습니다, <b>{adminName}</b>님!</p>
      <div style={{ marginTop: '30px' }}>
        {/* 작업일보 전용 페이지로 이동하는 버튼 */}
        <Link href="/write">
          <button style={{ padding: '20px 40px', fontSize: '1.2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            📝 작업일보 작성/목록 보러가기
          </button>
        </Link>
      </div>
    </div>
  )
}
