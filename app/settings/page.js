'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function SettingsPage() {
  const [siteSets, setSiteSets] = useState([])
  const [newCompany, setNewCompany] = useState(''); 
  const [newSite, setNewSite] = useState('')
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('userData')
    if (saved && JSON.parse(saved).role === 'admin') {
      setIsAllowed(true)
      loadSiteSets()
    } else {
      alert('관리자 전용 페이지입니다.')
      window.location.href = '/'
    }
  }, [])

  const loadSiteSets = async () => {
    const { data } = await supabase.from('site_sets').select('*').order('created_at', { ascending: false })
    setSiteSets(data || [])
  }

  // 1. 새로운 현장 추가
  const addSiteSet = async () => {
    if (!newCompany || !newSite) return alert('회사명과 현장명을 입력해주세요.')
    const { error } = await supabase.from('site_sets').insert([{ 
      company_name: newCompany, 
      site_name: newSite, 
      default_manpower: [], 
      default_equipment: [] 
    }])
    if (!error) { setNewCompany(''); setNewSite(''); loadSiteSets(); }
  }

  // 2. 입력 칸 추가 (인원/장비)
  const addInputRow = (setId, field) => {
    const updated = siteSets.map(set => {
      if (set.id === setId) {
        const newItem = field === 'default_manpower' ? { name: '', effort: '1.0' } : { name: '', cost: '' }
        return { ...set, [field]: [...(set[field] || []), newItem] }
      }
      return set
    })
    setSiteSets(updated)
  }

  // 3. 실시간 입력값 변경
  const handleDataChange = (setId, field, index, key, value) => {
    const updated = siteSets.map(set => {
      if (set.id === setId) {
        const newList = [...(set[field] || [])]
        newList[index] = { ...newList[index], [key]: value }
        return { ...set, [field]: newList }
      }
      return set
    })
    setSiteSets(updated)
  }

  // 4. DB에 최종 저장
  const saveToDB = async (set) => {
    const { error } = await supabase.from('site_sets').update({
      default_manpower: set.default_manpower.filter(m => m.name !== ''),
      default_equipment: set.default_equipment.filter(e => e.name !== '')
    }).eq('id', set.id)
    
    if (!error) alert(`${set.site_name} 설정이 저장되었습니다!`)
    else alert('저장 실패: ' + error.message)
  }

  if (!isAllowed) return null

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ fontWeight:'bold', textDecoration:'none', color:'#002b5b' }}>← 메인으로 돌아가기</Link>
        <h1 style={{ marginTop:'20px', color: '#002b5b' }}>⚙️ 현장별 인원/장비 기본값 설정</h1>
        
        {/* 현장 추가 입력창 */}
        <div style={{ display:'flex', gap:'10px', margin:'30px 0', padding:'20px', background:'#f8f9fa', borderRadius:'10px', border:'1px solid #eee' }}>
          <input placeholder="회사명 (예: 정현이앤씨)" value={newCompany} onChange={e=>setNewCompany(e.target.value)} style={inputStyle} />
          <input placeholder="현장명 (예: 이천 하이닉스)" value={newSite} onChange={e=>setNewSite(e.target.value)} style={inputStyle} />
          <button onClick={addSiteSet} style={{ padding:'12px 25px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>+ 현장 등록</button>
        </div>

        {/* 등록된 현장 리스트 */}
        {siteSets.map(set => (
          <div key={set.id} style={{ border:'1px solid #ddd', borderRadius:'15px', padding:'25px', marginBottom:'30px', background:'#fff' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom:'2px solid #f4f7f6', paddingBottom:'15px' }}>
              <h3 style={{ margin:0, color: '#003d82' }}>📍 {set.company_name} - {set.site_name}</h3>
              <button onClick={()=>saveToDB(set)} style={{ backgroundColor:'#28a745', color:'white', padding:'10px 25px', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>💾 이 현장 설정 저장</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px' }}>
              {/* 인원 설정 섹션 */}
              <div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                  <span style={{fontWeight:'bold'}}>👥 기본 투입 인원</span>
                  <button onClick={()=>addInputRow(set.id, 'default_manpower')} style={addBtnStyle}>+ 인원 추가</button>
                </div>
                {set.default_manpower?.map((m, i) => (
                  <div key={i} style={{ display:'flex', gap:'5px', marginTop:'8px' }}>
                    <input placeholder="이름" value={m.name} onChange={e=>handleDataChange(set.id, 'default_manpower', i, 'name', e.target.value)} style={smallInput} />
                    <input placeholder="공수" value={m.effort} onChange={e=>handleDataChange(set.id, 'default_manpower', i, 'effort', e.target.value)} style={{ ...smallInput, width:'60px' }} />
                  </div>
                ))}
              </div>

              {/* 장비 설정 섹션 */}
              <div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                  <span style={{fontWeight:'bold'}}>🚜 기본 투입 장비</span>
                  <button onClick={()=>addInputRow(set.id, 'default_equipment')} style={addBtnStyle}>+ 장비 추가</button>
                </div>
                {set.default_equipment?.map((e, i) => (
                  <div key={i} style={{ display:'flex', gap:'5px', marginTop:'8px' }}>
                    <input placeholder="장비명" value={e.name} onChange={e=>handleDataChange(set.id, 'default_equipment', i, 'name', e.target.value)} style={smallInput} />
                    <input placeholder="일대/단가" value={e.cost} onChange={e=>handleDataChange(set.id, 'default_equipment', i, 'cost', e.target.value)} style={{ ...smallInput, width:'80px' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle = { flex:1, padding:'12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem' };
const smallInput = { flex:1, padding:'10px', borderRadius:'6px', border:'1px solid #eee', fontSize:'0.9rem', backgroundColor:'#fafafa' };
const addBtnStyle = { padding:'4px 10px', fontSize:'0.8rem', cursor:'pointer', backgroundColor: '#002b5b', color:'white', border: 'none', borderRadius: '4px' };
