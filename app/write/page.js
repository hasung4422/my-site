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
  const [reports, setReports] = useState([])

  const loadReports = async () => {
    const { data } = await supabase.from('daily_reports').select('*').order('report_date', { ascending: false })
    if (data) setReports(data)
  }

  useEffect(() => { loadReports() }, [])

  const saveReport = async () => {
    if (!reportDate || !company || !site) return alert('항목을 다 채워주세요!')
    const { error } = await supabase.from('daily_reports').insert([{ report_date: reportDate, company_name: company, site_name: site }])
    if (!error) { alert('저장 완료!'); setReportDate(''); setCompany(''); setSite(''); loadReports(); }
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#007bff' }}>← 메인으로 돌아가기</Link>
      
      <h2 style={{ marginTop: '20px' }}>📝 새 작업일보 등록</h2>
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:'10px', marginRight:'10px' }} />
        <input placeholder="회사명" value={company} onChange={e=>setCompany(e.target.value)} style={{ padding:'10px', marginRight:'10px' }} />
        <input placeholder="현장명" value={site} onChange={e=>setSite(e.target.value)} style={{ padding:'10px', marginRight:'10px' }} />
        <button onClick={saveReport} style={{ padding:'10px 20px', backgroundColor:'#28a745', color:'white', border:'none', borderRadius:'5px' }}>저장</button>
      </div>

      <h2>📋 작업일보 목록</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign:'left' }}>
            <th style={{ padding: '10px' }}>날짜</th>
            <th style={{ padding: '10px' }}>회사명</th>
            <th style={{ padding: '10px' }}>현장명</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{r.report_date}</td>
              <td style={{ padding: '10px' }}>{r.company_name}</td>
              <td style={{ padding: '10px' }}>{r.site_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
