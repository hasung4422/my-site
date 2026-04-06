'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')

  const handleLogin = async () => {
    const { data } = await supabase.from('admin_users').select('*').eq('user_id', loginId).eq('password', loginPw).single()
    if (data) {
      setIsLoggedIn(true); setAdminName(data.user_name);
    } else { alert('로그인 정보를 확인해주세요.'); }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f0f2f5' }}>
        <div style={{ background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'350px' }}>
          <h2 style={{ textAlign:'center', color:'#002b5b', marginBottom:'30px', fontWeight:'bold' }}>정현이앤씨 시스템</h2>
          <input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} style={{ width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ddd' }} />
          <input type="password" placeholder="비밀번호" value={loginPw} onChange={e=>setLoginPw(e.target.value)} style={{ width:'100%', padding:'12px', marginBottom:'25px', borderRadius:'8px', border:'1px solid #ddd' }} />
          <button onClick={handleLogin} style={{ width:'100%', padding:'12px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>로그인</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6' }}>
      
      {/* [좌측 사이드바] */}
      <div style={{ width: '260px', backgroundColor: '#002b5b', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '40px', borderBottom: '1px solid #ffffff33', paddingBottom: '20px' }}>
          정현이앤씨 시스템
        </h2>
        
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8rem', color: '#ffffff99', marginBottom: '15px' }}>MAIN MENU</p>
          
          <Link href="/write" style={{ textDecoration: 'none' }}>
            <button style={{ 
              width: '100%', padding: '15px', textAlign: 'left', backgroundColor: '#003d82', 
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              📝 작업일보 작성하기
            </button>
          </Link>

          {/* 여기에 시스템 설정 버튼이 들어와야 함! */}
          <Link href="/settings" style={{ textDecoration: 'none' }}>
            <button style={{ 
              width: '100%', padding: '15px', textAlign: 'left', backgroundColor: 'transparent', 
              color: '#ffffffcc', border: 'none', borderRadius: '8px', cursor: 'pointer',
              marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              ⚙️ 시스템 설정
            </button>
          </Link>

          <button style={{ width: '100%', padding: '15px', textAlign: 'left', backgroundColor: 'transparent', color: '#ffffff99', border: 'none', marginTop: '10px', cursor: 'not-allowed' }}>
            📊 현장 현황 (준비중)
          </button>
        </div>

        {/* 하단 관리자 정보 및 로그아웃 */}
        <div style={{ borderTop: '1px solid #ffffff33', paddingTop: '20px', fontSize: '0.9rem' }}>
          <b>{adminName}</b> 님 로그인 중
          <br />
          <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', marginTop: '10px', padding: 0 }}>로그아웃</button>
        </div>
      </div>

      {/* [우측 컨텐츠 영역] */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#333', fontSize: '1.8rem' }}>대시보드</h1>
          <p style={{ color: '#666' }}>오늘의 현장 소식을 관리하세요.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>오늘 등록된 일보</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#002b5b', margin: '10px 0 0 0' }}>0건</p>
          </div>
        </div>
      </div>

    </div>
  )
}
