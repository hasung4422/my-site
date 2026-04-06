'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function WritePage() {
  const [reportDate, setReportDate] = useState('')
  const [company, setCompany] = useState('')
  const [site, setSite] = useState('')
  const [workDetail, setWorkDetail] = useState('')
  const [directWork, setDirectWork] = useState('')

  // 설정 데이터 저장용
  const [siteList, setSiteList] = useState([])
  const [companyList, setCompanyList] = useState([])

  // 인원 및 장비 초기화
  const [manpower, setManpower] = useState(Array(20).fill({ name: '', effort: '', note: '' }))
  const [equipment, setEquipment] = useState(Array(10).fill({ name: '', cost: '', note: '' }))

  // [기능 1] 페이지 로드 시 설정 데이터 불러오기 및 로그인 체크
  useEffect(() => {
    const savedName = localStorage.getItem('adminName')
    if (!savedName) {
      alert('로그인이 필요합니다.')
      window.location.href = '/'
      return
    }

    const fetchSettings = async () => {
      const { data: info } = await supabase.from('settings_info').select('*')
      if (info) {
        setSiteList(info.filter(i => i.type === 'site'))
        setCompanyList(info.filter(i => i.type === 'company'))
      }
    }
    fetchSettings()
  }, [])

  // [기능 2] 설정에 등록된 인원 명단 한 번에 불러오기
  const loadWorkerList = async () => {
    const { data } = await supabase.from('worker_list').select('name').eq('is_active', true)
    if (data && data.length > 0) {
      const newMan = [...manpower]
      data.forEach((worker, i) => {
        if (i < 20) newMan[i] = { ...newMan[i], name: worker.name, effort: '1.0' } // 기본 공수 1.0 세팅
      })
      setManpower(newMan)
      alert('인원 명단을 불러왔습니다.')
    } else {
      alert('등록된 인원 명단이 없습니다. 설정에서 먼저 등록해주세요.')
    }
  }

  const saveReport = async () => {
    if (!reportDate || !company || !site) return alert('기본 정보(날짜, 회사, 현장)는 필수입니다!')
    const { error } = await supabase.from('daily_reports').insert([{
      report_date: reportDate, company_name: company, site_name: site,
      work_detail: workDetail, direct_work: directWork,
      manpower_data: manpower.filter(m => m.name !== ''),
      equipment_data: equipment.filter(e => e.name !== '')
    }])
    if (!error) { alert('성공적으로 저장되었습니다!'); window.location.href = '/'; }
    else { alert('저장 실패: ' + error.message); }
  }

  const handleManChange = (index, field, value) => {
    const newMan = [...manpower]; newMan[index] = { ...newMan[index], [field]: value }; setManpower(newMan);
  }
  const handleEquipChange = (index, field, value) => {
    const newEquip = [...equipment]; newEquip[index] = { ...newEquip[index], [field]: value }; setEquipment(newEquip);
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        <Link href="/" style={{ color: '#002b5b', textDecoration: 'none', fontWeight: 'bold' }}>← 메인으로 돌아가기</Link>
        <h1 style={{ color: '#002b5b', borderBottom: '3px solid #002b5b', paddingBottom: '10px', marginTop: '20px' }}>🏗️ 작업일보 작성</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div><label>날짜</label><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={inputStyle} /></div>
          
          {/* 회사명 선택 (설정에서 불러옴) */}
          <div>
            <label>회사명</label>
            <select value={company} onChange={e=>setCompany(e.target.value)} style={inputStyle}>
              <option value="">-- 회사 선택 --</option>
              {companyList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* 현장명 선택 (설정에서 불러옴) */}
          <div>
            <label>현장명</label>
            <select value={site} onChange={e=>setSite(e.target.value)} style={inputStyle}>
              <option value="">-- 현장 선택 --</option>
              {siteList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>작업사항</label>
          <textarea placeholder="오늘의 주요 작업 내용" value={workDetail} onChange={e=>setWorkDetail(e.target.value)} style={{ ...inputStyle, height: '80px' }} />
        </div>

        {/* 인원 영역 */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop: '40px' }}>
          <h3 style={{ color: '#002b5b', margin:0 }}>👥 출역 인원 (최대 20명)</h3>
          <button onClick={loadWorkerList} style={{ padding:'8px 15px', backgroundColor:'#002b5b', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'0.85rem' }}>
            📋 설정된 명단 불러오기
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '5px', background: '#002b5b', color: 'white', padding: '10px', borderRadius: '5px 5px 0 0', marginTop:'10px' }}>
          <span>이름</span><span>공수</span><span>비고</span>
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px' }}>
          {manpower.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '5px', marginBottom: '5px' }}>
              <input placeholder="이름" value={m.name} onChange={e => handleManChange(i, 'name', e.target.value)} style={tableInputStyle} />
              <input placeholder="공수" value={m.effort} onChange={e => handleManChange(i, 'effort', e.target.value)} style={tableInputStyle} />
              <input placeholder="비고" value={m.note} onChange={e => handleManChange(i, 'note', e.target.value)} style={tableInputStyle} />
            </div>
          ))}
        </div>

        {/* 장비 영역 (동일) */}
        <h3 style={{ marginTop: '40px', color: '#002b5b' }}>🚜 장비 투입 (최대 10개)</h3>
        {equipment.map((e, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '5px', marginBottom: '5px' }}>
            <input placeholder="장비명" value={e.name} onChange={e => handleEquipChange(i, 'name', e.target.value)} style={tableInputStyle} />
            <input placeholder="일대" value={e.cost} onChange={e => handleEquipChange(i, 'cost', e.target.value)} style={tableInputStyle} />
            <input placeholder="비고" value={e.note} onChange={e => handleEquipChange(i, 'note', e.target.value)} style={tableInputStyle} />
          </div>
        ))}

        <button onClick={saveReport} style={{ width: '100%', padding: '20px', backgroundColor: '#002b5b', color: 'white', border: 'none', borderRadius: '10px', marginTop: '40px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
          작업일보 최종 저장하기
        </button>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const tableInputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #eee' };
