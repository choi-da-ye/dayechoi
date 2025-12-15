import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Contact.css'

gsap.registerPlugin(ScrollTrigger)

function Contact() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const formRef = useRef(null)

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
          stagger: 0.1,
          ease: 'power3.out',
        })
      }

      if (formRef.current) {
        gsap.from(formRef.current, {
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 80%',
          },
          scale: 0.95,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // 폼 제출 로직
    alert('메시지가 전송되었습니다!')
  }

  return (
    <section ref={sectionRef} className="contact-section">
      <div className="container">
        <h2 ref={titleRef} className="section-title">
          Contact
        </h2>
        <div className="contact-content">
          <div ref={contentRef} className="contact-info">
            <h3>함께 일하고 싶으신가요?</h3>
            <p>
              새로운 프로젝트나 협업 기회에 대해 이야기하고 싶으시다면
              언제든지 연락주세요.
            </p>
            <div className="contact-links">
              <a href="mailto:976431zico@gmail.com" className="contact-link">
                <span className="contact-icon">📧</span>
                <span>976431zico@gmail.com</span>
              </a>
              <a href="https://github.com/choi-da-ye" className="contact-link">
                <span className="contact-icon">💻</span>
                <span>GitHub</span>
              </a>
            </div>
          </div>
          <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">메시지</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">
              보내기
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact

