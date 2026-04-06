'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loginId, setLoginId] = useState(''); const [loginPw, setLoginPw] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('userData')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const handleLogin = async () => {
    const { data } = await supabase.from('users').select('*').eq('user_id', loginId).eq('password', loginPw).single()
    if (data) {
      setUser(data); localStorage.setItem('userData', JSON.stringify(data))
    } else { alert('아이디 또는 비밀번호 확인!') }
  }

  const handleLogout = () => {
    setUser(null); localStorage.removeItem('userData')
  }

  const getBtnStyle = (name) => ({
    width: '100%', padding: '15px', textAlign: 'left', borderRadius: '8px', border: 'none', cursor: 'pointer', 
    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s', color: 'white',
    backgroundColor: hoveredBtn === name ? '#004a99' : '#003d82', marginTop: '10px', textDecoration: 'none'
  })

  if (!user) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' }}>
        <div style={{ background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'350px' }}>
          <h2 style={{ textAlign:'center', color:'#002b5b' }}>정현이앤씨 로그인</h2>
          <input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="비밀번호" value={loginPw} onChange={e=>setLoginPw(e.target.value)} style={inputStyle} />
          <button onClick={handleLogin} style={loginBtn}>로그인</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f7f6' }}>
      <div style={{ width: '260px', backgroundColor: '#002b5b', color: 'white', padding: '20px' }}>
        <h3>정현이앤씨</h3>
        <div style={{ marginTop: '40px' }}>
          {user.role === 'admin' ? (
            <>
              <Link href="/settings" style={{textDecoration:'none'}}>
                <button onMouseEnter={()=>setHoveredBtn('s')} onMouseLeave={()=>setHoveredBtn(null)} style={getBtnStyle('s')}>⚙️ 시스템 설정</button>
              </Link>
              <Link href="/view" style={{textDecoration:'none'}}>
                <button onMouseEnter={()=>setHoveredBtn('v')} onMouseLeave={()=>setHoveredBtn(null)} style={getBtnStyle('v')}>📊 현황 보기</button>
              </Link>
            </>
          ) : (
            <Link href="/write" style={{textDecoration:'none'}}>
              <button onMouseEnter={()=>setHoveredBtn('w')} onMouseLeave={()=>setHoveredBtn(null)} style={getBtnStyle('w')}>📝 일보 작성</button>
            </Link>
          )}
        </div>
        <button onClick={handleLogout} style={{marginTop:'50px', color:'red', background:'none', border:'none', cursor:'pointer'}}>로그아웃</button>
      </div>
      <div style={{ flex: 1, padding: '40px' }}>
        <h1>{user.user_name}님 환영합니다!</h1>
        <p>왼쪽 메뉴를 선택하여 작업을 시작하세요.</p>
      </div>
    </div>
  )
}
const inputStyle = { width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' };
const loginBtn = { width:'100%', padding:'12px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' };
