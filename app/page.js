'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function HomePage() {
  const [user, setUser] = useState(null) // 로그인한 유저 정보 저장
  const [loginId, setLoginId] = useState(''); const [loginPw, setLoginPw] = useState('')

  // 브라우저에 저장된 로그인 정보 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('userData')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const handleLogin = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('user_id', loginId).eq('password', loginPw).single()
    
    if (data) {
      setUser(data)
      localStorage.setItem('userData', JSON.stringify(data))
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.')
    }
  }

  const handleLogout = () => {
    setUser(null); localStorage.removeItem('userData')
  }

  // --- 로그인 화면 ---
  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={loginBoxStyle}>
          <h2 style={{color: '#002b5b', marginBottom: '30px'}}>정현이앤씨 시스템</h2>
          <input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="비밀번호" value={loginPw} onChange={e=>setLoginPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} style={inputStyle} />
          <button onClick={handleLogin} style={btnStyle}>로그인</button>
        </div>
      </div>
    )
  }

  // --- 로그인 성공 후 화면 (관리자 vs 근로자) ---
  return (
    <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <h1>{user.user_name}님, 반갑습니다!</h1>
      <p style={{color: '#666'}}>현재 권한: <b>{user.role === 'admin' ? '관리자' : '근로자'}</b></p>
      <hr style={{margin: '30px 0'}} />

      {user.role === 'admin' ? (
        // 관리자 전용 메뉴
        <div>
          <button style={menuBtnStyle} onClick={() => window.location.href='/settings'}>⚙️ 현장 및 인원 설정</button>
          <button style={menuBtnStyle} onClick={() => window.location.href='/view'}>📊 작업일보 현황 보기</button>
        </div>
      ) : (
        // 근로자 전용 메뉴
        <div>
          <button style={menuBtnStyle} onClick={() => window.location.href='/write'}>📝 오늘 작업일보 작성하기</button>
        </div>
      )}

      <button onClick={handleLogout} style={{marginTop: '50px', background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>로그아웃</button>
    </div>
  )
}

// 스타일 정의
const containerStyle = { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' };
const loginBoxStyle = { background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'320px', textAlign:'center' };
const inputStyle = { width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' };
const btnStyle = { width:'100%', padding:'12px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' };
const menuBtnStyle = { width: '250px', padding: '20px', margin: '10px', fontSize: '1.1rem', cursor: 'pointer', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: 'white' };
