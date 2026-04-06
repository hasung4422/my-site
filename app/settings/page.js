'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('site') // 'site', 'company', 'worker'
  const [inputValue, setInputValue] = useState('')
  const [list, setList] = useState([])

  const loadData = async () => {
    if (activeTab === 'worker') {
      const { data } = await supabase.from('worker_list').select('*').order('name')
      setList(data || [])
    } else {
      const { data } = await supabase.from('settings_info').select('*').eq('type', activeTab).order('name')
      setList(data || [])
    }
  }

  useEffect(() => { loadData() }, [activeTab])

  const addItem = async () => {
    if (!inputValue) return
    const table = activeTab === 'worker' ? 'worker_list' : 'settings_info'
    const payload = activeTab === 'worker' ? { name: inputValue } : { type: activeTab, name: inputValue }
    
    const { error } = await supabase.from(table).insert([payload])
    if (!error) { setInputValue(''); loadData(); }
    else { alert('이미 등록되었거나 오류가 발생했습니다.') }
  }

  const deleteItem = async (id) => {
    const table = activeTab === 'worker' ? 'worker_list' : 'settings_info'
    await supabase.from(table).delete().eq('id', id)
    loadData()
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px' }}>
        <Link href="/" style={{ color: '#002b5b', textDecoration: 'none', fontWeight: 'bold' }}>← 메인으로 돌아가기</Link>
        <h1 style={{ color: '#002b5b', marginTop: '20px' }}>⚙️ 시스템 설정</h1>

        {/* 탭 메뉴 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
          {['site', 'company', 'worker'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', cursor: 'pointer', border: 'none', background: activeTab === tab ? '#002b5b' : 'none',
              color: activeTab === tab ? 'white' : '#666', borderRadius: '5px 5px 0 0', fontWeight: 'bold'
            }}>
              {tab === 'site' ? '현장 관리' : tab === 'company' ? '회사 관리' : '인원 명단 관리'}
            </button>
          ))}
        </div>

        {/* 등록 영역 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="새로운 이름을 입력하세요" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button onClick={addItem} style={{ padding: '12px 25px', backgroundColor: '#002b5b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>추가하기</button>
        </div>

        {/* 목록 영역 */}
        <div style={{ borderTop: '1px solid #eee' }}>
          {list.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #f9f9f9', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.name}</span>
              <button onClick={() => deleteItem(item.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
