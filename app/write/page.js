'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function WritePage() {
  const [reportDate, setReportDate] = useState('')
  const [siteSets, setSiteSets] = useState([])
  const [selectedSet, setSelectedSet] = useState(null)
  const [workDetail, setWorkDetail] = useState(''); const [directWork, setDirectWork] = useState('')
  
  const [manpower, setManpower] = useState(Array(20).fill({ name: '', effort: '', note: '' }))
  const [equipment, setEquipment] = useState(Array(10).fill({ name: '', cost: '', note: '' }))

  useEffect(() => {
    loadSiteSets()
  }, [])

  const loadSiteSets = async () => {
    const { data } = await supabase.from('site_sets').select('*')
    setSiteSets(data || [])
  }

  const handleSiteSelect = (id) => {
    const set = siteSets.find(s => s.id === id)
    if (!set) return
    setSelectedSet(set)
    const newMan = Array(20).fill({ name: '', effort: '', note: '' })
    set.default_manpower.forEach((m, i) => { if(i < 20) newMan[i] = { ...m, note: '' } })
    setManpower(newMan)
    const newEquip = Array(10).fill({ name: '', cost: '', note: '' })
    set.default_equipment.forEach((e, i) => { if(i < 10) newEquip[i] = { ...e, note: '' } })
    setEquipment(newEquip)
  }

  const handleTableInput = (field, index, key, value) => {
    if (field === 'man') {
      const n = [...manpower]; n[index] = { ...n[index], [key]: value }; setManpower(n);
    } else {
      const n = [...equipment]; n[index] = { ...n[index], [key]: value }; setEquipment(n);
    }
  }

  const saveReport = async () => {
    if (!reportDate || !selectedSet) return alert('날짜와 현장을 선택해주세요.')
    const { error } = await supabase.from('daily_reports').insert([{
      report_date: reportDate, company_name: selectedSet.company_name, site_name: selectedSet.site_name,
      work_detail: workDetail, direct_work: directWork,
      manpower_data: manpower.filter(m => m.name !== ''),
      equipment_data: equipment.filter(e => e.name !== '')
    }])
    if (!error) { alert('저장 완료!'); window.location.href = '/'; }
    else { alert('저장 실패: ' + error.message); }
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        <Link href="/" style={{fontWeight:'bold', textDecoration:'none', color:'#002b5b'}}>← 돌아가기</Link>
        <h1 style={{borderBottom:'3px solid #002b5b', paddingBottom:'10px', marginTop: '20px'}}>🏗️ 작업일보 작성</h1>
        
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px' }}>
          <div><label style={{fontWeight:'bold'}}>날짜</label><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={inputStyle} /></div>
          <div><label style={{fontWeight:'bold'}}>현장 선택</label>
            <select onChange={e=>handleSiteSelect(e.target.value)} style={inputStyle}>
              <option value="">-- 등록된 현장을 선택하세요 --</option>
              {siteSets.map(s => <option key={s.id} value={s.id}>{s.company_name} - {s.site_name}</option>)}
            </select>
          </div>
        </div>

        <div style={{marginTop: '20px'}}><label style={{fontWeight:'bold'}}>주요 작업 내역</label>
          <textarea value={workDetail} onChange={e=>setWorkDetail(e.target.value)} style={{...inputStyle, height:'80px'}} />
        </div>

        <h3 style={{marginTop:'40px', color: '#002b5b', borderLeft: '5px solid #002b5b', paddingLeft: '10px'}}>👥 인원 투입 현황</h3>
        <div style={{maxHeight:'300px', overflowY:'auto', border:'1px solid #ddd', padding:'10px', borderRadius: '8px'}}>
          {manpower.map((m, i) => (
            <div key={i} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
              <input placeholder="이름" value={m.name} onChange={e => handleTableInput('man', i, 'name', e.target.value)} style={smallInput} />
              <input placeholder="공수" value={m.effort} onChange={e => handleTableInput('man', i, 'effort', e.target.value)} style={{...smallInput, width:'60px'}} />
              <input placeholder="비고" value={m.note} onChange={e => handleTableInput('man', i, 'note', e.target.value)} style={smallInput} />
            </div>
          ))}
        </div>

        <button onClick={saveReport} style={{width:'100%', padding:'20px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'10px', marginTop:'40px', fontSize:'1.2rem', fontWeight:'bold', cursor:'pointer'}}>저장 및 제출하기</button>
      </div>
    </div>
  )
}
const inputStyle = { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const smallInput = { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #eee' };
