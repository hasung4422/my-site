'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function SettingsPage() {
  const [siteSets, setSiteSets] = useState([])
  const [newCompany, setNewCompany] = useState(''); const [newSite, setNewSite] = useState('')
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

  const addSiteSet = async () => {
    if (!newCompany || !newSite) return alert('입력창을 채워주세요.')
    const { error } = await supabase.from('site_sets').insert([{ company_name: newCompany, site_name: newSite, default_manpower: [], default_equipment: [] }])
    if (!error) { setNewCompany(''); setNewSite(''); loadSiteSets(); }
  }

  const addRow = (setId, field) => {
    const updated = siteSets.map(set => {
      if (set.id === setId) {
        const newItem = field === 'default_manpower' ? { name: '', effort: '1.0' } : { name: '', cost: '' }
        return { ...set, [field]: [...(set[field] || []), newItem] }
      }
      return set
    })
    setSiteSets(updated)
  }

  const handleDataChange = (setId, field, index, key, value) => {
    const updated = siteSets.map(set => {
      if (set.id === setId) {
        const newList = [...(set[field] || [])]; newList[index] = { ...newList[index], [key]: value }
        return { ...set, [field]: newList }
      }
      return set
    })
    setSiteSets(updated)
  }

  const saveToDB = async (set) => {
    const { error } = await supabase.from('site_sets').update({
      default_manpower: set.default_manpower.filter(m => m.name !== ''),
      default_equipment: set.default_equipment.filter(e => e.name !== '')
    }).eq('id', set.id)
    if (!error) alert('저장 완료!'); else alert('에러: ' + error.message)
  }

  if (!isAllowed) return null

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ fontWeight:'bold', textDecoration:'none', color:'#002b5b' }}>← 메인으로 돌아가기</Link>
        <h1 style={{ marginTop:'20px', color: '#002b5b' }}>⚙️ 시스템 설정 (현장 관리)</h1>
        
        <div style={{ display:'flex', gap:'10px', margin:'30px 0', padding:'20px', background:'#f8f9fa', borderRadius:'10px' }}>
          <input placeholder="회사명" value={newCompany} onChange={e=>setNewCompany(e.target.value)} style={inputStyle} />
          <input placeholder="현장명" value={newSite} onChange={e=>setNewSite(e.target.value)} style={inputStyle} />
          <button onClick={addSiteSet} style={{ padding:'12px 25px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' }}>현장 추가</button>
        </div>

        {siteSets.map(set => (
          <div key={set.id} style={{ border:'2px solid #eee', borderRadius:'15px', padding:'20px', marginBottom:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
              <h3 style={{ margin:0, color: '#003d82' }}>📍 {set.company_name} - {set.site_name}</h3>
              <button onClick={()=>saveToDB(set)} style={{ backgroundColor:'#28a745', color:'white', padding:'8px 20px', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' }}>💾 저장</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              <div>
                <button onClick={()=>addRow(set.id, 'default_manpower')} style={addBtnStyle}>+ 인원 추가</button>
                {set.default_manpower?.map((m, i) => (
                  <div key={i} style={{ display:'flex', gap:'5px', marginTop:'5px' }}>
                    <input placeholder="이름" value={m.name} onChange={e=>handleDataChange(set.id, 'default_manpower', i, 'name', e.target.value)} style={smallInput} />
                    <input placeholder="공수" value={m.effort} onChange={e=>handleDataChange(set.id, 'default_manpower', i, 'effort', e.target.value)} style={{ ...smallInput, width:'60px' }} />
                  </div>
                ))}
              </div>
              <div>
                <button onClick={()=>addRow(set.id, 'default_equipment')} style={addBtnStyle}>+ 장비 추가</button>
                {set.default_equipment?.map((e, i) => (
                  <div key={i} style={{ display:'flex', gap:'5px', marginTop:'5px' }}>
                    <input placeholder="장비명" value={e.name} onChange={e=>handleDataChange(set.id, 'default_equipment', i, 'name', e.target.value)} style={smallInput} />
                    <input placeholder="일대" value={e.cost} onChange={e=>handleDataChange(set.id, 'default_equipment', i, 'cost', e.target.value)} style={{ ...smallInput, width:'70px' }} />
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
const inputStyle = { flex:1, padding:'12px', borderRadius:'8px', border:'1px solid #ddd' };
const smallInput = { flex:1, padding:'8px', borderRadius:'5px', border:'1px solid #eee' };
const addBtnStyle = { width:'100%', padding:'5px', fontSize:'0.8rem', cursor:'pointer', backgroundColor: '#eee', border: 'none', borderRadius: '4px' };
