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
    // [중요] users 테이블에서 아이디/비번 확인
    const { data, error } = await supabase.from('users').select('*').eq('user_id', loginId).eq('password', loginPw).single()
    
    if (data) {
      setUser(data)
      localStorage.setItem('userData', JSON.stringify(data))
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다. (SQL 설정을 확인하세요)')
    }
  }

  const handleLogout = () => {
    if(confirm('로그아웃 하시겠습니까?')) {
      setUser(null); localStorage.removeItem('userData')
    }
  }

  // 좌측 버튼 스타일 (마우스 오버 시 불 들어옴)
  const getBtnStyle = (name, isPrimary = false) => ({
    width: '100%', padding: '15px', textAlign: 'left', borderRadius: '8px', border: 'none', cursor: 'pointer', 
    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.3s', color: 'white', textDecoration: 'none',
    backgroundColor: hoveredBtn === name ? '#004a99' : (isPrimary ? '#003d82' : 'transparent'),
    marginTop: '10px'
  })

  // --- 1. 로그인 전 화면 ---
  if (!user) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' }}>
        <div style={{ background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'350px' }}>
          <h2 style={{ textAlign:'center', color:'#002b5b', marginBottom:'30px', fontWeight:'bold' }}>정현이앤씨 시스템</h2>
          <input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="비밀번호" value={loginPw} onChange={e=>setLoginPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} style={inputStyle} />
          <button onClick={handleLogin} style={{ width:'100%', padding:'12px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>로그인</button>
          <p style={{fontSize:'12px', color:'#999', marginTop:'15px', textAlign:'center'}}>관리자(a1) / 근로자(w1) 계정으로 접속하세요.</p>
        </div>
      </div>
    )
  }

  // --- 2. 로그인 후 메인 화면 (사이드바 구조) ---
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6' }}>
      {/* 좌측 사이드바 */}
      <div style={{ width: '260px', backgroundColor: '#002b5b', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '40px', borderBottom: '1px solid #ffffff33', paddingBottom: '20px' }}>정현이앤씨</h2>
        
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8rem', color: '#ffffff99', marginBottom: '10px' }}>메뉴 바로가기</p>
          
          {/* 권한별 메뉴 분기 */}
          {user.role === 'admin' ? (
            <>
              <Link href="/settings" style={{textDecoration:'none'}}>
                <button onMouseEnter={()=>setHoveredBtn('s')} onMouseLeave={()=>setHoveredBtn(null)} style={getBtnStyle('s', true)}>⚙️ 시스템 설정</button>
              </Link>
              <Link href="/view" style={{textDecoration:'none'}}>
                <button onMouseEnter={()=>setHoveredBtn('v')} onMouseLeave={()=>setHoveredBtn(null)} style={getBtnStyle('v')}>📊 일보 현황 보기</button>
              </Link>
            </>
          ) : (
            <Link href="/write" style={{textDecoration:'none'}}>
              <button onMouseEnter={()=>setHoveredBtn('w')} onMouseLeave={()=>setHoveredBtn(null)} style={getBtnStyle('w', true)}>📝 작업일보 작성</button>
            </Link>
          )}
        </div>

        {/* 하단 유저 정보 및 로그아웃 */}
        <div style={{ borderTop: '1px solid #ffffff33', paddingTop: '20px' }}>
          <div style={{fontSize:'0.9rem', marginBottom:'10px'}}>
            <b>{user.user_name}</b> ({user.role === 'admin' ? '관리자' : '근로자'})
          </div>
          <button onClick={handleLogout} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>로그아웃</button>
        </div>
      </div>

      {/* 우측 메인 콘텐츠 공간 */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header>
          <h1 style={{ color: '#333' }}>안녕하세요, {user.user_name}님!</h1>
          <p style={{ color: '#666' }}>오늘도 안전한 하루 되시길 바랍니다.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
          <div style={cardStyle}>
            <h3>공지사항</h3>
            <p style={{color:'#888'}}>현장 안전 수칙을 준수해 주세요.</p>
          </div>
          <div style={cardStyle}>
            <h3>오늘의 현장</h3>
            <p style={{color:'#888'}}>등록된 현장 소식이 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = { width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' };
const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
