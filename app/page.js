'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [loginId, setLoginId] = useState(''); const [loginPw, setLoginPw] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('adminName')
    if (saved) { setIsLoggedIn(true); setAdminName(saved); }
  }, [])

  const handleLogin = async () => {
    const { data } = await supabase.from('admin_users').select('*').eq('user_id', loginId).eq('password', loginPw).single()
    if (data) {
      setIsLoggedIn(true); setAdminName(data.user_name);
      localStorage.setItem('adminName', data.user_name);
    } else { alert('아이디 또는 비밀번호를 확인해주세요.'); }
  }

  const handleLogout = () => {
    if(confirm('로그아웃 하시겠습니까?')) { setIsLoggedIn(false); localStorage.removeItem('adminName'); }
  }

  const btnStyle = (name, isPrimary = false) => ({
    width: '100%', padding: '15px', textAlign: 'left', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s', color: 'white',
    backgroundColor: hoveredBtn === name ? '#004a99' : (isPrimary ? '#003d82' : 'transparent'),
    marginTop: isPrimary ? '0' : '10px', textDecoration: 'none'
  })

  if (!isLoggedIn) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' }}>
        <div style={{ background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'350px' }}>
          <h2 style={{ textAlign:'center', color:'#002b5b', marginBottom:'30px' }}>정현이앤씨 시스템</h2>
          <input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="비밀번호" value={loginPw} onChange={e=>setLoginPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} style={inputStyle} />
          <button onClick={handleLogin} style={{ width:'100%', padding:'12px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' }}>로그인</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f7f6' }}>
      <div style={{ width: '260px', backgroundColor: '#002b5b', color: 'white', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '40px', borderBottom: '1px solid #ffffff33', paddingBottom: '20px' }}>정현이앤씨</h2>
        <div style={{ flex: 1 }}>
          <Link href="/write" style={{textDecoration:'none'}}><button onMouseEnter={()=>setHoveredBtn('w')} onMouseLeave={()=>setHoveredBtn(null)} style={btnStyle('w', true)}>📝 작업일보 작성</button></Link>
          <Link href="/settings" style={{textDecoration:'none'}}><button onMouseEnter={()=>setHoveredBtn('s')} onMouseLeave={()=>setHoveredBtn(null)} style={btnStyle('s')}>⚙️ 시스템 설정</button></Link>
        </div>
        <div style={{ marginTop: '40px', borderTop: '1px solid #ffffff33', paddingTop: '20px' }}>
          <b>{adminName}</b> 님 <button onClick={handleLogout} style={{ color:'#ff4d4d', background:'none', border:'none', cursor:'pointer', marginLeft:'10px' }}>로그아웃</button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '40px' }}>
        <h1>대시보드</h1>
        <div style={{ background: 'white', padding: '25px', borderRadius: '15px', width: '250px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>오늘 등록된 일보</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#002b5b', margin: '10px 0 0 0' }}>0건</p>
        </div>
      </div>
    </div>
  )
}
const inputStyle = { width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' };
