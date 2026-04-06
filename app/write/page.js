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

  // 인원 (20명 초기화)
  const [manpower, setManpower] = useState(Array(20).fill({ name: '', effort: '', note: '' }))
  // 장비 (10개 초기화)
  const [equipment, setEquipment] = useState(Array(10).fill({ name: '', cost: '', note: '' }))

  const saveReport = async () => {
    if (!reportDate || !company || !site) return alert('기본 정보(날짜, 회사, 현장)는 필수입니다!')

    const { error } = await supabase.from('daily_reports').insert([{
      report_date: reportDate,
      company_name: company,
      site_name: site,
      work_detail: workDetail,
      direct_work: directWork,
      manpower_data: manpower.filter(m => m.name !== ''), // 이름이 있는 것만 저장
      equipment_data: equipment.filter(e => e.name !== '') // 장비명이 있는 것만 저장
    }])

    if (!error) {
      alert('작업일보가 성공적으로 저장되었습니다!')
      window.location.href = '/' // 저장 후 메인으로
    } else {
      alert('저장 실패: ' + error.message)
    }
  }

  // 입력 핸들러
  const handleManChange = (index, field, value) => {
    const newMan = [...manpower];
    newMan[index] = { ...newMan[index], [field]: value };
    setManpower(newMan);
  }

  const handleEquipChange = (index, field, value) => {
    const newEquip = [...equipment];
    newEquip[index] = { ...newEquip[index], [field]: value };
    setEquipment(newEquip);
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        <Link href="/" style={{ color: '#002b5b', textDecoration: 'none', fontWeight: 'bold' }}>← 메인으로 돌아가기</Link>
        <h1 style={{ color: '#002b5b', borderBottom: '3px solid #002b5b', paddingBottom: '10px', marginTop: '20px' }}>🏗️ 작업일보 작성</h1>

        {/* 기본 정보 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div><label>날짜</label><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={inputStyle} /></div>
          <div><label>회사명</label><input placeholder="회사명" value={company} onChange={e=>setCompany(e.target.value)} style={inputStyle} /></div>
          <div><label>현장명</label><input placeholder="현장명" value={site} onChange={e=>setSite(e.target.value)} style={inputStyle} /></div>
        </div>

        {/* 작업 내역 */}
        <div style={{ marginTop: '20px' }}>
          <label>작업사항</label>
          <textarea placeholder="오늘의 주요 작업 내용을 적으세요" value={workDetail} onChange={e=>setWorkDetail(e.target.value)} style={{ ...inputStyle, height: '80px' }} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>직영공사 내역</label>
          <textarea placeholder="직영공사 세부 사항" value={directWork} onChange={e=>setDirectWork(e.target.value)} style={{ ...inputStyle, height: '80px' }} />
        </div>

        {/* 출역 인원 (20줄) */}
        <h3 style={{ marginTop: '40px', color: '#002b5b' }}>👥 출역 인원 (최대 20명)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '5px', background: '#002b5b', color: 'white', padding: '10px', borderRadius: '5px 5px 0 0' }}>
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

        {/* 장비 투입 (10줄) */}
        <h3 style={{ marginTop: '40px', color: '#002b5b' }}>🚜 장비 투입 (최대 10개)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '5px', background: '#444', color: 'white', padding: '10px', borderRadius: '5px 5px 0 0' }}>
          <span>장비명</span><span>일대</span><span>비고</span>
        </div>
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
