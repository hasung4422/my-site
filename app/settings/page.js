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

  useEffect(() => {
    const savedName = localStorage.getItem('adminName')
    if (!savedName) { window.location.href = '/' } 
    else { setIsAllowed(true); loadSiteSets(); }
  }, [])

  const loadSiteSets = async () => {
    const { data } = await supabase.from('site_sets').select('*').order('created_at', { ascending: false })
    setSiteSets(data || [])
  }

  const addSiteSet = async () => {
    if (!newCompany || !newSite) return alert('회사명과 현장명을 입력하세요.')
    const { error } = await supabase.from('site_sets').insert([{ 
      company_name: newCompany, 
      site_name: newSite,
      default_manpower: [],
      default_equipment: []
    }])
    if (!error) { setNewCompany(''); setNewSite(''); loadSiteSets(); }
  }

  // --- 리스트 수정 핸들러 ---
  const handleDataChange = (setId, field, index, key, value) => {
    const updatedSets = siteSets.map(set => {
      if (set.id === setId) {
        const newList = [...set[field]]
        newList[index] = { ...newList[index], [key]: value }
        return { ...set, [field]: newList }
      }
      return set
    })
    setSiteSets(updatedSets)
  }

  const addRow = (setId, field) => {
    const updatedSets = siteSets.map(set => {
      if (set.id === setId) {
        const newItem = field === 'default_manpower' ? { name: '', effort: '1.0' } : { name: '', cost: '' }
        return { ...set, [field]: [...set[field], newItem] }
      }
      return set
    })
    setSiteSets(updatedSets)
  }

  const removeRow = (setId, field, index) => {
    const updatedSets = siteSets.map(set => {
      if (set.id === setId) {
        const newList = set[field].filter((_, i) => i !== index)
        return { ...set, [field]: newList }
      }
      return set
    })
    setSiteSets(updatedSets)
  }

  // --- 최종 저장 버튼 ---
  const saveToDB = async (set) => {
    const { error } = await supabase.from('site_sets').update({
      default_manpower: set.default_manpower.filter(m => m.name !== ''),
      default_equipment: set.default_equipment.filter(e => e.name !== '')
    }).eq('id', set.id)
    
    if (!error) alert(`[${set.site_name}] 설정이 저장되었습니다!`)
    else alert('저장 오류: ' + error.message)
  }

  if (!isAllowed) return null

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ color: '#002b5b', textDecoration: 'none', fontWeight: 'bold' }}>← 메인으로 돌아가기</Link>
        <h1 style={{ color: '#002b5b', marginTop: '20px' }}>⚙️ 현장별 고정 명단 설정</h1>

        {/* 1. 신규 현장 등록 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
          <input placeholder="회사명" value={newCompany} onChange={e => setNewCompany(e.target.value)} style={inputStyle} />
          <input placeholder="현장명" value={newSite} onChange={e => setNewSite(e.target.value)} style={inputStyle} />
          <button onClick={addSiteSet} style={{ padding: '12px 25px', backgroundColor: '#002b5b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>현장 추가</button>
        </div>

        {/* 2. 현장별 상세 설정 */}
        {siteSets.map(set => (
          <div key={set.id} style={{ border: '2px solid #eee', borderRadius: '15px', padding: '25px', marginBottom: '30px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ color: '#003d82', margin:0 }}>📍 {set.company_name} - {set.site_name}</h2>
              <button onClick={() => saveToDB(set)} style={{ padding:'10px 30px', backgroundColor:'#28a745', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>💾 이 현장 설정 저장</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* 인원 설정 칸 */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                  <span style={{ fontWeight:'bold' }}>👥 고정 인원</span>
                  <button onClick={() => addRow(set.id, 'default_manpower')} style={addBtnStyle}>+ 인원 추가</button>
                </div>
                {set.default_manpower.map((m, i) => (
                  <div key={i} style={{ display:'flex', gap:'5px', marginBottom:'5px' }}>
                    <input placeholder="이름" value={m.name} onChange={e => handleDataChange(set.id, 'default_manpower', i, 'name', e.target.value)} style={itemInputStyle} />
                    <input placeholder="공수" value={m.effort} onChange={e => handleDataChange(set.id, 'default_manpower', i, 'effort', e.target.value)} style={{ ...itemInputStyle, width:'60px' }} />
                    <button onClick={() => removeRow(set.id, 'default_manpower', i)} style={delBtnStyle}>x</button>
                  </div>
                ))}
              </div>

              {/* 장비 설정 칸 */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                  <span style={{ fontWeight:'bold' }}>🚜 고정 장비</span>
                  <button onClick={() => addRow(set.id, 'default_equipment')} style={addBtnStyle}>+ 장비 추가</button>
                </div>
                {set.default_equipment.map((e, i) => (
                  <div key={i} style={{ display:'flex', gap:'5px', marginBottom:'5px' }}>
                    <input placeholder="장비명" value={e.name} onChange={e => handleDataChange(set.id, 'default_equipment', i, 'name', e.target.value)} style={itemInputStyle} />
                    <input placeholder="일대" value={e.cost} onChange={e => handleDataChange(set.id, 'default_equipment', i, 'cost', e.target.value)} style={{ ...itemInputStyle, width:'80px' }} />
                    <button onClick={() => removeRow(set.id, 'default_equipment', i)} style={delBtnStyle}>x</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign:'right', marginTop:'20px' }}>
              <button onClick={async () => { if(confirm('정말 삭제할까요?')) { await supabase.from('site_sets').delete().eq('id', set.id); loadSiteSets(); } }} style={{ color:'#999', background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem' }}>이 현장 세트 아예 삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const itemInputStyle = { flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #eee', fontSize: '0.9rem' };
const addBtnStyle = { padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const delBtnStyle = { padding: '0 8px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
