import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Skills.css'

gsap.registerPlugin(ScrollTrigger)

function Skills() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const skillsRef = useRef(null)

  const skills = [
    { name: 'React', level: 85, icon: '⚛️' },
    { name: 'JavaScript', level: 90, icon: '⚡' },
    { name: 'HTML', level: 95, icon: '💻' },
    { name: 'SCSS', level: 95, icon: '🎨' },
    { name: 'GSAP', level: 85, icon: '🎨' },
    { name: '웹 성능 개선', level: 85, icon: '🔍' }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
          },
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        })
      }

      if (skillsRef.current && skillsRef.current.children) {
        gsap.from(skillsRef.current.children, {
          scrollTrigger: {
            trigger: skillsRef.current,
            start: 'top 80%',
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        })
      }

      // 프로그레스 바 애니메이션
      if (skillsRef.current && skillsRef.current.children) {
        Array.from(skillsRef.current.children).forEach((skillItem) => {
          const progressBar = skillItem.querySelector('.skill-progress-bar')
          const skillName = skillItem.querySelector('.skill-name')?.textContent
          const skill = skills.find((s) => s.name === skillName)

          if (skill && progressBar) {
            ScrollTrigger.create({
              trigger: skillItem,
              start: 'top 80%',
              onEnter: () => {
                gsap.to(progressBar, {
                  width: `${skill.level}%`,
                  duration: 1.5,
                  ease: 'power2.out',
                })
              },
            })
          }
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="skills-section">
      <div className="container">
        <h2 ref={titleRef} className="section-title">
          Skills
        </h2>
        <div ref={skillsRef} className="skills-grid">
          {skills.map((skill, index) => (
            <div key={index} className="skill-item">
              <div className="skill-header">
                <span className="skill-icon">{skill.icon}</span>
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percentage">{skill.level}%</span>
              </div>
              <div className="skill-progress">
                <div className="skill-progress-bar"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills

