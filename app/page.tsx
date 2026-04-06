'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// 1. 수파베이스 연결 (버셀 설정에서 넣은 열쇠를 사용합니다)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function ConstructionSystem() {
  const [site, setSite] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [dataList, setDataList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 2. 저장된 목록 불러오기 함수
  const loadData = async () => {
    const { data, error } = await supabase
      .from('construction_files')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setDataList(data)
    if (error) console.error('데이터 로드 실패:', error.message)
  }

  useEffect(() => { loadData() }, [])

  // 3. [DB 저장] 버튼 눌렀을 때 실행되는 함수
  const handleSave = async () => {
    if (!site || !company || !title) {
      alert('모든 칸을 채워주세요!')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('construction_files').insert([
      { 
        site_name: site, 
        company_name: company, 
        doc_title: title,
        status: '대기중'
      }
    ])

    if (error) {
      alert('저장 실패: ' + error.message)
    } else {
      alert('성공적으로 저장되었습니다!')
      setSite(''); setCompany(''); setTitle('') // 입력창 비우기
      loadData() // 목록 새로고침
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>🏗️ 현장 데이터 관리 시스템</h1>
      
      {/* 입력 영역 */}
      <div style
