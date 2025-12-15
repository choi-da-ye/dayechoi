import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

function About() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const imageRef = useRef(null)

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

      if (contentRef.current && contentRef.current.children) {
        gsap.from(contentRef.current.children, {
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
        })
      }

      if (imageRef.current) {
        gsap.from(imageRef.current, {
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 80%',
          },
          scale: 0.8,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="about-section">
      <div className="container">
        <h2 ref={titleRef} className="section-title">
          About Me
        </h2>
        <div className="about-content">
          <div ref={contentRef} className="about-text">
            <p className="about-intro">
              겸손히 배우고, 성장 과정을 즐길 줄 아는 개발자 최다예입니다.
            </p>
            <p className="about-description">
              커머스 사이트 구축, 리액트 프로젝트, Java 기반 프로젝트에서 프론트 개발 및 퍼블리싱 작업을 통해 웹 안에 다채로운 경험을 제공하며 성취감을 느끼고 있습니다.
            </p>
            <p className="about-description">
              다양한 라이브러리를 통해 인터랙티브한 사이트를 만들고, 또한 클라이언트들의 니즈에 맞춰 네이버 서치어드바이저, Google PageSpeed Insights 등으로 SEO 작업 및 웹 성능을 개선하는 작업을 경험해 보았습니다.
            </p>
            <p className="about-description">
              빠르게 변화하는 프로젝트 환경 속에서도 학습과 협업을 즐기며, 선임과 함께 프로젝트 성과를 만들어 나가고, 사용자에게 최적화된 경험을 제공하는 프론트엔드 개발자가 되고자 합니다.
            </p>
            <div className="about-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">🛒</span>
                <span>커머스 사이트 구축</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">⚛️</span>
                <span>리액트 프로젝트</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">☕</span>
                <span>Java 기반 프로젝트</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🔍</span>
                <span>SEO 최적화</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">⚡</span>
                <span>웹 성능 개선</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🤝</span>
                <span>협업 및 학습</span>
              </div>
            </div>
          </div>
          <div ref={imageRef} className="about-image">
            <div className="image-placeholder">
              <img src="/profile.png" alt="Choi Daye" className="profile-image" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

