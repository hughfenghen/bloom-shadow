import { useState } from 'react'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className='h-screen flex flex-col'>
      <div className='flex flex-1'>
        <div className='left border-solid border-2 w-{100} w-px-200'>
          <div className='add-sprite'>
            <div className='font-bold'>添加素材</div>
          </div>
          <div className='sprite-list'>
            <div className='font-bold'>素材列表</div>
          </div>
          <div className='tpl-list'>
            <div className='font-bold'>模板列表</div>
          </div>
        </div>
        <div className='main flex-1'></div>
        <div className='right'></div>
      </div>
      <footer>111</footer>
    </div>
  )
}

export default App
