import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import './TextAnimation.css'

function TextAnimation() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // 텍스트가 끊기지 않고 연속적으로 흐르도록
  const textCount = 5
  const textSpacing = 40 // 텍스트 간격 (겹치지 않도록 충분한 간격)
  
  const offsets = Array.from({ length: textCount }, (_, i) => {
    // 스크롤에 따라 모든 텍스트가 함께 이동하면서 연속적으로 보이도록
    const start = i * textSpacing
    const end = start + 100 // 스크롤 진행도에 따라 이동
    return useTransform(scrollYProgress, [0, 1], [start, end])
  })

  const [offsetValues, setOffsetValues] = useState(
    Array.from({ length: textCount }, (_, i) => `${i * textSpacing}%`)
  )

  useEffect(() => {
    const unsubscribes = offsets.map((offset, i) => {
      return offset.on('change', (latest) => {
        setOffsetValues((prev) => {
          const newValues = [...prev]
          newValues[i] = `${latest}%`
          return newValues
        })
      })
    })

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [offsets])

  const text = 'Curabitur mattis efficitur velit'

  return (
    <section ref={containerRef} className="text-animation-section">
      <div className="text-animation-container">
        <svg
          className="text-animation-svg"
          viewBox="-50 0 350 120"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            fill="none"
            id="curve"
            d="m-50,100c61.37,0,61.5-68,126.5-68,58,0,51,68,223,68"
            stroke="none"
          />

          <text
            className="text-path"
            style={{ fill: '#000000' }}
          >
            {Array.from({ length: textCount }).map((_, i) => (
              <textPath
                key={i}
                startOffset={offsetValues[i]}
                href="#curve"
                style={{ fontSize: '6px', textTransform: 'uppercase' }}
              >
                {text}
              </textPath>
            ))}
          </text>
        </svg>
      </div>
    </section>
  )
}

export default TextAnimation

