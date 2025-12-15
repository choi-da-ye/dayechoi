import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

function Hero() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const buttonRef = useRef(null)
  const svgRef = useRef(null)
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const animationFrameRef = useRef(null)
  const topLabelRef = useRef(null)
  const bottomLabelRef = useRef(null)

  useEffect(() => {
    // 마우스 따라오기 인터랙션 변수들
    let mouseX = 0
    let mouseY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e) => {
      if (!heroRef.current || !svgRef.current) return

      const rect = heroRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // 마우스 위치를 중심점 기준으로 상대 좌표로 변환 (아주 살짝만 이동)
      mouseX = ((e.clientX - centerX) / rect.width) * 20 // 최대 20px 이동
      mouseY = ((e.clientY - centerY) / rect.height) * 20 // 최대 20px 이동
    }

    // 부드러운 애니메이션으로 반짝이 위치 업데이트
    const updateSparklePosition = () => {
      if (!svgRef.current) return

      // 현재 위치에서 목표 위치로 부드럽게 이동 (0.08 = 더 부드럽게)
      currentX += (mouseX - currentX) * 0.08
      currentY += (mouseY - currentY) * 0.08

      gsap.to(svgRef.current, {
        x: currentX,
        y: currentY,
        duration: 0.2,
        ease: 'power1.out',
      })

      animationFrameRef.current = requestAnimationFrame(updateSparklePosition)
    }

    const ctx = gsap.context(() => {
      // 초기 상태: 검은 배경, 하얀 반짝이만 보임
      if (svgRef.current) {
        gsap.set(svgRef.current, {
          scale: 0.3,
          opacity: 1,
          x: 0,
          y: 0,
        })
      }

      if (contentRef.current) {
        gsap.set(contentRef.current, {
          opacity: 0,
        })
      }

      if (overlayRef.current) {
        gsap.set(overlayRef.current, {
          backgroundColor: '#000000',
        })
      }

      // 상단/하단 라벨 초기 상태
      if (topLabelRef.current) {
        gsap.set(topLabelRef.current, {
          opacity: 0.6,
        })
      }

      if (bottomLabelRef.current) {
        gsap.set(bottomLabelRef.current, {
          opacity: 0.6,
        })
      }

      // 마우스 이벤트 리스너 추가
      window.addEventListener('mousemove', handleMouseMove)
      updateSparklePosition()

      // 스크롤 애니메이션
      const scrollTween = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
        },
      })

      // 반짝이 크기 증가 (0.3 -> 15)
      if (svgRef.current) {
        scrollTween.to(svgRef.current, {
          scale: 15,
          duration: 1,
          ease: 'power2.out',
        })
      }

      // 배경색 변경 (검은색 -> 흰색)
      if (overlayRef.current) {
        scrollTween.to(
          overlayRef.current,
          {
            backgroundColor: '#ffffff',
            duration: 1,
            ease: 'power2.out',
          },
          '<'
        )
      }

      // 컨텐츠 페이드 인
      if (contentRef.current) {
        scrollTween.to(
          contentRef.current,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.3'
        )
      }

      // 상단/하단 라벨 페이드 아웃 (배경이 하얗게 변할 때)
      if (topLabelRef.current) {
        scrollTween.to(
          topLabelRef.current,
          {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.5'
        )
      }

      if (bottomLabelRef.current) {
        scrollTween.to(
          bottomLabelRef.current,
          {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.5'
        )
      }

      // 타이틀 애니메이션 (컨텐츠가 보인 후)
      if (titleRef.current && titleRef.current.children) {
        scrollTween.from(
          titleRef.current.children,
          {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.2'
        )
      }

      // 서브타이틀 애니메이션
      if (subtitleRef.current) {
        scrollTween.from(
          subtitleRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.4'
        )
      }

      // 버튼 애니메이션
      if (buttonRef.current) {
        scrollTween.from(
          buttonRef.current,
          {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        )

        // 마우스 호버 효과
        buttonRef.current.addEventListener('mouseenter', () => {
          gsap.to(buttonRef.current, {
            scale: 1.05,
            duration: 0.3,
          })
        })

        buttonRef.current.addEventListener('mouseleave', () => {
          gsap.to(buttonRef.current, {
            scale: 1,
            duration: 0.3,
          })
        })
      }
    }, heroRef)

    return () => {
      ctx.revert()
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const scrollToProjects = () => {
    const projectsSection = document.querySelector('.projects-section')
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section ref={heroRef} className="hero-section">
      <div ref={overlayRef} className="hero-overlay"></div>
      <div ref={topLabelRef} className="hero-label hero-label-top-left">
        Daye Choi's Portfolio
      </div>
      <div ref={bottomLabelRef} className="hero-label hero-label-bottom-right">
        Frontend Developer
      </div>
      <div ref={svgRef} className="hero-svg-container">
        <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/shape.svg`} alt="sparkle" className="hero-sparkle" />
      </div>
      <div ref={contentRef} className="hero-content">
        <h1 ref={titleRef} className="hero-title">
          <span className="title-line">안녕하세요,</span>
          <span className="title-line">프론트엔드 개발자 최다예입니다</span>
        </h1>
        <p ref={subtitleRef} className="hero-subtitle">
          학습과 협업을 즐기며 성장하는 프론트엔드 개발자
        </p>
        <button
          ref={buttonRef}
          className="hero-button"
          onClick={scrollToProjects}
        >
          프로젝트 보기
        </button>
      </div>
    </section>
  )
}

export default Hero
