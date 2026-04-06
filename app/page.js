'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function DailyReportPage() {
  const [view, setView] = useState('list') // 'list' 또는 'write' 화면 전환용
  const [reportDate, setReportDate] = useState('')
  const [company, setCompany] = useState('')
  const [site, setSite] = useState('')
  const [reports, setReports] = useState([])

  // 데이터 불러오기
  const loadReports = async () => {
    const { data } = await supabase.from('daily_reports').select('*').order('report_date', { ascending: false })
    if (data) setReports(data)
  }

  useEffect(() => { loadReports() }, [])

  // 저장 함수
  const saveReport = async () => {
    if (!reportDate || !company || !site) return alert('모든 항목을 채워주세요!')
    
    const { error } = await supabase.from('daily_reports').insert([
      { report_date: reportDate, company_name: company, site_name: site }
    ])

    if (!error) {
      alert('작업일보가 저장되었습니다!')
      setReportDate(''); setCompany(''); setSite('');
      setView('list'); // 저장 후 목록으로 돌아가기
      loadReports();
    } else {
      alert('저장 실패: ' + error.message)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🏗️ 정현 현장 관리 시스템</h1>

      {view === 'list' ? (
        /* --- 목록 화면 --- */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>작업일보 목록</h2>
            <button 
              onClick={() => setView('write')} 
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              📝 작업일보 작성하러 가기
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ padding: '10px' }}>날짜</th>
                <th style={{ padding: '10px' }}>회사명</th>
                <th style={{ padding: '10px' }}>현장명</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <td style={{ padding: '10px' }}>{r.report_date}</td>
                  <td style={{ padding: '10px' }}>{r.company_name}</td>
                  <td style={{ padding: '10px' }}>{r.site_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* --- 작성 화면 --- */
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2>새 작업일보 작성</h2>
          <div style={{ marginBottom: '15px' }}>
            <label>날짜: </label>
            <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>회사명: </label>
            <input type="text" placeholder="회사명을 입력하세요" value={company} onChange={e => setCompany(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>현장명: </label>
            <input type="text" placeholder="현장명을 입력하세요" value={site} onChange={e => setSite(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={saveReport} style={{ flex: 2, padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>저장하기</button>
            <button onClick={() => setView('list')} style={{ flex: 1, padding: '15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>취소</button>
          </div>
        </div>
      )}
    </div>
  )
}
