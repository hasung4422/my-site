'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function SettingsPage() {
  const [siteSets, setSiteSets] = useState([])
  const [newCompany, setNewCompany] = useState('')
  const [newSite, setNewSite] = useState('')
  const [isAllowed, setIsAllowed] = useState(false)

  // 로그인 체크 및 데이터 로드
  useEffect(() => {
    const savedName = localStorage.getItem('adminName')
    if (!savedName) {
      window.location.href = '/'
    } else {
      setIsAllowed(true)
      loadSiteSets()
    }
  }, [])

  const loadSiteSets = async () => {
    const { data } = await supabase.from('site_sets').select('*').order('created_at', { ascending: false })
    setSiteSets(data || [])
  }

  // 신규 현장 세트 추가
  const addSiteSet = async () => {
    if (!newCompany || !newSite) return alert('회사명과 현장명을 모두 입력하세요.')
    const { error } = await supabase.from('site_sets').insert([{ company_name: newCompany, site_name: newSite }])
    if (!error) { setNewCompany(''); setNewSite(''); loadSiteSets(); }
    else { alert('이미 등록된 세트이거나 오류가 발생했습니다.') }
  }

  // 인원/장비 업데이트 함수
  const updateDetails = async (id, field, newData) => {
    const { error } = await supabase.from('site_sets').update({ [field]: newData }).eq('id', id)
    if (!error) { alert('설정이 저장되었습니다.'); loadSiteSets(); }
  }

  if (!isAllowed) return null

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px' }}>
        <Link href="/" style={{ color: '#002b5b', textDecoration: 'none', fontWeight: 'bold' }}>← 메인으로 돌아가기</Link>
        <h1 style={{ color: '#002b5b', marginTop: '20px' }}>⚙️ 현장별 고정 설정 (회사-현장 세트)</h1>

        {/* 1. 신규 세트 등록 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
          <input placeholder="회사명 (예: 정현이앤씨)" value={newCompany} onChange={e => setNewCompany(e.target.value)} style={inputStyle} />
          <input placeholder="현장명 (예: 이천 물류센터)" value={newSite} onChange={e => setNewSite(e.target.value)} style={inputStyle} />
          <button onClick={addSiteSet} style={{ padding: '12px 25px', backgroundColor: '#002b5b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>현장 세트 추가</button>
        </div>

        {/* 2. 등록된 세트 목록 및 상세 설정 */}
        {siteSets.map(set => (
          <div key={set.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#003d82' }}>📍 {set.company_name} - {set.site_name}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* 인원 설정 */}
              <div>
                <p style={{ fontWeight: 'bold' }}>👥 고정 인원 명단 (쉼표로 구분)</p>
                <textarea 
                  defaultValue={set.default_manpower.map(m => m.name).join(', ')} 
                  onBlur={(e) => {
                    const names = e.target.value.split(',').map(n => n.trim()).filter(n => n !== '')
                    updateDetails(set.id, 'default_manpower', names.map(n => ({ name: n, effort: '1.0', note: '' })))
                  }}
                  placeholder="홍길동, 김철수, 이영희"
                  style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
              </div>
              {/* 장비 설정 */}
              <div>
                <p style={{ fontWeight: 'bold' }}>🚜 고정 장비 명단 (쉼표로 구분)</p>
                <textarea 
                  defaultValue={set.default_equipment.map(e => e.name).join(', ')}
                  onBlur={(e) => {
                    const names = e.target.value.split(',').map(n => n.trim()).filter(n => n !== '')
                    updateDetails(set.id, 'default_equipment', names.map(n => ({ name: n, cost: '', note: '' })))
                  }}
                  placeholder="굴착기, 지게차, 덤프"
                  style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
            <button 
              onClick={async () => { if(confirm('삭제하시겠습니까?')) { await supabase.from('site_sets').delete().eq('id', set.id); loadSiteSets(); } }}
              style={{ marginTop: '15px', color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              이 현장 세트 삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
