'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function WritePage() {
  const [reportDate, setReportDate] = useState('')
  const [siteSets, setSiteSets] = useState([])
  const [selectedSet, setSelectedSet] = useState(null)
  const [workDetail, setWorkDetail] = useState('')
  const [manpower, setManpower] = useState(Array(20).fill({ name: '', effort: '', note: '' }))

  useEffect(() => {
    const saved = localStorage.getItem('userData')
    if (!saved) window.location.href = '/'
    else loadSiteSets()
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
  }

  const saveReport = async () => {
    if (!reportDate || !selectedSet) return alert('날짜와 현장을 선택하세요.')
    const { error } = await supabase.from('daily_reports').insert([{
      report_date: reportDate, company_name: selectedSet.company_name, site_name: selectedSet.site_name,
      work_detail: workDetail, manpower_data: manpower.filter(m => m.name !== '')
    }])
    if (!error) { alert('저장 완료!'); window.location.href = '/'; }
    else alert(error.message)
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        <Link href="/" style={{fontWeight:'bold', textDecoration:'none', color:'#002b5b'}}>← 메인으로 돌아가기</Link>
        <h1 style={{borderBottom:'3px solid #002b5b', paddingBottom:'10px', marginTop: '20px'}}>📝 작업일보 작성</h1>
        
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px' }}>
          <div><label>날짜</label><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={inputStyle} /></div>
          <div><label>현장 선택</label>
            <select onChange={e=>handleSiteSelect(e.target.value)} style={inputStyle}>
              <option value="">-- 현장을 선택하세요 --</option>
              {siteSets.map(s => <option key={s.id} value={s.id}>{s.company_name} - {s.site_name}</option>)}
            </select>
          </div>
        </div>

        <textarea placeholder="오늘의 작업 내역" value={workDetail} onChange={e=>setWorkDetail(e.target.value)} style={{...inputStyle, height:'100px', marginTop:'20px'}} />
        
        <h3 style={{marginTop:'30px'}}>👥 인원 명단 (자동 로드됨)</h3>
        {manpower.map((m, i) => (
          <div key={i} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
            <input placeholder="이름" value={m.name} onChange={e=>{const n=[...manpower]; n[i].name=e.target.value; setManpower(n);}} style={smallInput} />
            <input placeholder="공수" value={m.effort} onChange={e=>{const n=[...manpower]; n[i].effort=e.target.value; setManpower(n);}} style={{...smallInput, width:'60px'}} />
          </div>
        ))}

        <button onClick={saveReport} style={{width:'100%', padding:'20px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'10px', marginTop:'30px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer'}}>저장하기</button>
      </div>
    </div>
  )
}
const inputStyle = { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const smallInput = { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #eee' };
