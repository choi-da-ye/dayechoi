import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Projects.css'

gsap.registerPlugin(ScrollTrigger)

function Projects() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const projectsRef = useRef(null)
  const icon1Ref = useRef(null)
  const icon2Ref = useRef(null)
  const icon3Ref = useRef(null)

  const projects = [
    {
      title: '커머스 사이트 구축',
      description: '전자상거래 플랫폼의 프론트엔드 개발 및 퍼블리싱 작업을 통해 사용자 경험을 개선하고 매출 증대에 기여',
      tech: ['React', 'JavaScript', 'HTML/CSS', 'GSAP'],
      image: '🛒',
    },
    {
      title: '리액트 프로젝트',
      description: '컴포넌트 기반 개발을 통한 재사용 가능한 UI 구축 및 상태 관리 최적화',
      tech: ['React', 'JavaScript', 'CSS3', 'State Management'],
      image: '⚛️',
    },
    {
      title: 'Java 기반 프로젝트',
      description: '백엔드와의 협업을 통한 풀스택 개발 경험 및 API 연동 작업',
      tech: ['Java', 'JavaScript', 'HTML/CSS', 'REST API'],
      image: '☕',
    },
    {
      title: 'SEO & 성능 최적화',
      description: '네이버 서치어드바이저, Google PageSpeed Insights를 활용한 SEO 작업 및 웹 성능 개선',
      tech: ['SEO', 'Performance', 'Optimization', 'Analytics'],
      image: '🔍',
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 초기 상태 설정 - 먼저 보이도록
      if (projectsRef.current && projectsRef.current.children) {
        Array.from(projectsRef.current.children).forEach((child) => {
          gsap.set(child, {
            opacity: 1,
            y: 0,
          })
        })
      }

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

      if (projectsRef.current && projectsRef.current.children) {
        // 초기 상태를 opacity 0으로 설정 후 애니메이션
        Array.from(projectsRef.current.children).forEach((child) => {
          gsap.set(child, { opacity: 0, y: 80 })
        })

        gsap.to(projectsRef.current.children, {
          scrollTrigger: {
            trigger: projectsRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        })

        // 호버 효과
        Array.from(projectsRef.current.children).forEach((project) => {
          project.addEventListener('mouseenter', () => {
            gsap.to(project, {
              y: -10,
              duration: 0.3,
              ease: 'power2.out',
            })
          })

          project.addEventListener('mouseleave', () => {
            gsap.to(project, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            })
          })
        })
      }

      // 아이콘 패럴랙스 효과
      if (icon1Ref.current && sectionRef.current) {
        gsap.set(icon1Ref.current, { y: 0 })
        gsap.to(icon1Ref.current, {
          y: -500,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      }

      if (icon2Ref.current && sectionRef.current) {
        gsap.set(icon2Ref.current, { y: 0 })
        gsap.to(icon2Ref.current, {
          y: -400,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      }

      if (icon3Ref.current && sectionRef.current) {
        gsap.set(icon3Ref.current, { y: 0 })
        gsap.to(icon3Ref.current, {
          y: 400,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      }

      // ScrollTrigger 새로고침
      ScrollTrigger.refresh()
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="projects-section">
      {/* 패럴랙스 아이콘들 */}
      <div ref={icon1Ref} className="parallax-icon parallax-icon-1">
        <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/icon01.png`} alt="Icon 1" className="parallax-icon-img" />
      </div>
      <div ref={icon2Ref} className="parallax-icon parallax-icon-2">
        <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/icon02.png`} alt="Icon 2" className="parallax-icon-img" />
      </div>
      <div ref={icon3Ref} className="parallax-icon parallax-icon-3">
        <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/icon03.png`} alt="Icon 3" className="parallax-icon-img" />
      </div>
      
      <div className="container">
        <h2 ref={titleRef} className="section-title">
          Projects
        </h2>
        <div ref={projectsRef} className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-image">
                <span className="project-emoji">{project.image}</span>
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                <button className="project-button">자세히 보기</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects

