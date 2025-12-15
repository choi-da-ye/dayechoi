import { useEffect, useRef } from 'react'
import './Footer.css'

function Footer() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const host = containerRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    // 블랙 앤 화이트 팔레트
    const palette = ['#000000', '#1a1a1a', '#333333', '#4a4a4a', '#666666']
    
    const applyPalette = (colors) => {
      colors.forEach((c, i) => {
        host.style.setProperty(`--gradient-color-${i + 1}`, c)
      })
      for (let i = colors.length + 1; i <= 8; i++) {
        host.style.setProperty(`--gradient-color-${i}`, '')
      }
    }
    applyPalette(palette)

    function normalizeColor(hexCode) {
      return [
        ((hexCode >> 16) & 255) / 255,
        ((hexCode >> 8) & 255) / 255,
        (255 & hexCode) / 255,
      ]
    }

    // MiniGl 클래스 (간소화 버전)
    class MiniGl {
      constructor(canvas) {
        this.canvas = canvas
        this.gl = canvas.getContext('webgl', { antialias: true })
        this.meshes = []
        const g = this.gl
        const mini = this

        Object.defineProperties(this, {
          Uniform: {
            enumerable: !1,
            value: class {
              constructor(o) {
                this.type = 'float'
                Object.assign(this, o)
                this.typeFn =
                  {
                    float: '1f',
                    int: '1i',
                    vec2: '2fv',
                    vec3: '3fv',
                    vec4: '4fv',
                    mat4: 'Matrix4fv',
                  }[this.type] || '1f'
                this.update()
              }
              update(loc) {
                if (void 0 !== this.value) {
                  const fnName = `uniform${this.typeFn}`
                  if (this.typeFn.indexOf('Matrix') === 0) {
                    g[fnName](loc, false, this.value)
                  } else {
                    g[fnName](loc, this.value)
                  }
                }
              }
              getDeclaration(name, type, length) {
                const u = this
                if (u.excludeFrom === type) return ''
                if (u.type === 'array')
                  return (
                    u.value[0].getDeclaration(name, type, u.value.length) +
                    `\nconst int ${name}_length = ${u.value.length};`
                  )
                if (u.type === 'struct') {
                  let s = name.replace('u_', '')
                  s = s.charAt(0).toUpperCase() + s.slice(1)
                  return (
                    `uniform struct ${s} {\n` +
                    Object.entries(u.value)
                      .map(([n, val]) =>
                        val.getDeclaration(n, type).replace(/^uniform/, '')
                      )
                      .join('') +
                    `\n} ${name}${length > 0 ? `[${length}]` : ''};`
                  )
                }
                return `uniform ${u.type} ${name}${length > 0 ? `[${length}]` : ''};`
              }
            },
          },
          Material: {
            enumerable: !1,
            value: class {
              constructor(vs, fs, uniforms = {}) {
                const c = g
                const m = this
                function sh(t, src) {
                  const s = c.createShader(t)
                  c.shaderSource(s, src)
                  c.compileShader(s)
                  if (!c.getShaderParameter(s, c.COMPILE_STATUS)) {
                    console.error(
                      '[WebGL] Shader compile error:',
                      c.getShaderInfoLog(s)
                    )
                  }
                  return s
                }
                function decl(u, t) {
                  return Object.entries(u)
                    .map(([n, val]) => val.getDeclaration(n, t))
                    .join('\n')
                }
                m.uniforms = uniforms
                m.uniformInstances = []
                const prefix = `\nprecision highp float;\n`
                m.vertexSource = `${prefix}\nattribute vec4 position;\nattribute vec2 uv;\nattribute vec2 uvNorm;\n${decl(
                  mini.commonUniforms,
                  'vertex'
                )}\n${decl(uniforms, 'vertex')}\n${vs}`
                m.Source = `${prefix}\n${decl(
                  mini.commonUniforms,
                  'fragment'
                )}\n${decl(uniforms, 'fragment')}\n${fs}`
                m.vertexShader = sh(c.VERTEX_SHADER, m.vertexSource)
                m.fragmentShader = sh(c.FRAGMENT_SHADER, m.Source)
                m.program = c.createProgram()
                c.attachShader(m.program, m.vertexShader)
                c.attachShader(m.program, m.fragmentShader)
                c.linkProgram(m.program)
                if (!c.getProgramParameter(m.program, c.LINK_STATUS)) {
                  console.error(
                    '[WebGL] Program link error:',
                    c.getProgramInfoLog(m.program)
                  )
                }
                c.useProgram(m.program)
                m.attachUniforms(void 0, mini.commonUniforms)
                m.attachUniforms(void 0, m.uniforms)
              }
              attachUniforms(name, uniforms) {
                const m = this,
                  c = g
                if (void 0 === name)
                  Object.entries(uniforms).forEach(([n, u]) =>
                    m.attachUniforms(n, u)
                  )
                else if (uniforms.type === 'array')
                  uniforms.value.forEach((u, i) =>
                    m.attachUniforms(`${name}[${i}]`, u)
                  )
                else if (uniforms.type === 'struct')
                  Object.entries(uniforms.value).forEach(([n, u]) =>
                    m.attachUniforms(`${name}.${n}`, u)
                  )
                else
                  m.uniformInstances.push({
                    uniform: uniforms,
                    location: c.getUniformLocation(m.program, name),
                  })
              }
            },
          },
          Attribute: {
            enumerable: !1,
            value: class {
              constructor(o) {
                this.type = g.FLOAT
                this.normalized = !1
                this.buffer = g.createBuffer()
                Object.assign(this, o)
                this.update()
              }
              update() {
                if (void 0 !== this.values) {
                  g.bindBuffer(this.target, this.buffer)
                  g.bufferData(this.target, this.values, g.STATIC_DRAW)
                }
              }
              attach(n, p) {
                const loc = g.getAttribLocation(p, n)
                if (this.target === g.ARRAY_BUFFER) {
                  g.enableVertexAttribArray(loc)
                  g.vertexAttribPointer(
                    loc,
                    this.size,
                    this.type,
                    this.normalized,
                    0,
                    0
                  )
                }
                return loc
              }
              use(loc) {
                g.bindBuffer(this.target, this.buffer)
                if (this.target === g.ARRAY_BUFFER) {
                  g.enableVertexAttribArray(loc)
                  g.vertexAttribPointer(
                    loc,
                    this.size,
                    this.type,
                    this.normalized,
                    0,
                    0
                  )
                }
              }
            },
          },
          PlaneGeometry: {
            enumerable: !1,
            value: class {
              constructor() {
                g.createBuffer()
                this.attributes = {
                  position: new mini.Attribute({
                    target: g.ARRAY_BUFFER,
                    size: 3,
                  }),
                  uv: new mini.Attribute({
                    target: g.ARRAY_BUFFER,
                    size: 2,
                  }),
                  uvNorm: new mini.Attribute({
                    target: g.ARRAY_BUFFER,
                    size: 2,
                  }),
                  index: new mini.Attribute({
                    target: g.ELEMENT_ARRAY_BUFFER,
                    size: 3,
                    type: g.UNSIGNED_SHORT,
                  }),
                }
                this.setTopology(1, 1)
                this.setSize(1, 1, 'xz')
              }
              setTopology(xSeg = 1, ySeg = 1) {
                const n = this
                n.xSegCount = xSeg
                n.ySegCount = ySeg
                n.vertexCount = (n.xSegCount + 1) * (n.ySegCount + 1)
                n.quadCount = n.xSegCount * n.ySegCount * 2
                n.attributes.uv.values = new Float32Array(2 * n.vertexCount)
                n.attributes.uvNorm.values = new Float32Array(2 * n.vertexCount)
                n.attributes.index.values = new Uint16Array(3 * n.quadCount)
                for (let y = 0; y <= n.ySegCount; y++) {
                  for (let x = 0; x <= n.xSegCount; x++) {
                    const i = y * (n.xSegCount + 1) + x
                    n.attributes.uv.values[2 * i] = x / n.xSegCount
                    n.attributes.uv.values[2 * i + 1] = 1 - y / n.ySegCount
                    n.attributes.uvNorm.values[2 * i] =
                      (x / n.xSegCount) * 2 - 1
                    n.attributes.uvNorm.values[2 * i + 1] =
                      1 - (y / n.ySegCount) * 2
                    if (x < n.xSegCount && y < n.ySegCount) {
                      const s = y * n.xSegCount + x
                      n.attributes.index.values[6 * s] = i
                      n.attributes.index.values[6 * s + 1] =
                        i + 1 + n.xSegCount
                      n.attributes.index.values[6 * s + 2] = i + 1
                      n.attributes.index.values[6 * s + 3] = i + 1
                      n.attributes.index.values[6 * s + 4] =
                        i + 1 + n.xSegCount
                      n.attributes.index.values[6 * s + 5] =
                        i + 2 + n.xSegCount
                    }
                  }
                }
                n.attributes.uv.update()
                n.attributes.uvNorm.update()
                n.attributes.index.update()
              }
              setSize(width = 1, height = 1, orientation = 'xz') {
                const geo = this
                geo.width = width
                geo.height = height
                geo.orientation = orientation
                if (
                  !geo.attributes.position.values ||
                  geo.attributes.position.values.length !== 3 * geo.vertexCount
                ) {
                  geo.attributes.position.values = new Float32Array(
                    3 * geo.vertexCount
                  )
                }
                const o = width / -2,
                  r = height / -2,
                  sw = width / geo.xSegCount,
                  sh = height / geo.ySegCount
                for (let yi = 0; yi <= geo.ySegCount; yi++) {
                  const ty = r + yi * sh
                  for (let xi = 0; xi <= geo.xSegCount; xi++) {
                    const rx = o + xi * sw
                    const l = yi * (geo.xSegCount + 1) + xi
                    geo.attributes.position.values[
                      3 * l + 'xyz'.indexOf(orientation[0])
                    ] = rx
                    geo.attributes.position.values[
                      3 * l + 'xyz'.indexOf(orientation[1])
                    ] = -ty
                  }
                }
                geo.attributes.position.update()
              }
            },
          },
          Mesh: {
            enumerable: !1,
            value: class {
              constructor(geometry, material) {
                this.geometry = geometry
                this.material = material
                this.wireframe = !1
                this.attributeInstances = []
                Object.entries(this.geometry.attributes).forEach(([name, attr]) => {
                  this.attributeInstances.push({
                    attribute: attr,
                    location: attr.attach(name, this.material.program),
                  })
                })
                mini.meshes.push(this)
              }
              draw() {
                g.useProgram(this.material.program)
                this.material.uniformInstances.forEach(({ uniform, location }) =>
                  uniform.update(location)
                )
                this.attributeInstances.forEach(({ attribute, location }) =>
                  attribute.use(location)
                )
                g.drawElements(
                  this.wireframe ? g.LINES : g.TRIANGLES,
                  this.geometry.attributes.index.values.length,
                  g.UNSIGNED_SHORT,
                  0
                )
              }
            },
          },
        })
        const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        this.commonUniforms = {
          projectionMatrix: new this.Uniform({ type: 'mat4', value: I }),
          modelViewMatrix: new this.Uniform({ type: 'mat4', value: I }),
          resolution: new this.Uniform({ type: 'vec2', value: [1, 1] }),
          aspectRatio: new this.Uniform({ type: 'float', value: 1 }),
        }
        this.setSize = function (w = 640, h = 480) {
          this.width = w
          this.height = h
          this.canvas.width = w
          this.canvas.height = h
          g.viewport(0, 0, w, h)
          this.commonUniforms.resolution.value = [w, h]
          this.commonUniforms.aspectRatio.value = w / h
        }
        this.setOrthographicCamera = function () {
          this.commonUniforms.projectionMatrix.value = [
            2 / this.width,
            0,
            0,
            0,
            0,
            2 / this.height,
            0,
            0,
            0,
            0,
            2 / -4000,
            0,
            0,
            0,
            0,
            1,
          ]
        }
        this.render = function () {
          g.clearColor(0, 0, 0, 0)
          g.clearDepth(1)
          this.meshes.forEach((m) => m.draw())
        }
      }
    }

    class Gradient {
      constructor() {
        this.amp = 480
        this.seed = 5
        this.freqX = 14e-5
        this.freqY = 29e-5
        this.activeColors = [1, 1, 1, 1, 1]
        this.width = window.innerWidth
        this.height = 600
        this.conf = { density: [0.1, 0.22], playing: true }
        this.t = 0
        this.last = 0
        this.mouse = { x: 0, y: 0, inside: false, strength: 0 }
        this.trails = []
        this.TRAIL_MAX = 12
        this._lastTrailPos = null
        this._lastTrailTime = 0
      }
      initGradient(selector) {
        this.el = document.querySelector(selector)
        this.connect()
        return this
      }
      connect() {
        this.shaderFiles = {
          vertex: `varying vec3 v_color;\nvarying vec2 v_uvNorm;\nvoid main(){ float time=u_time*u_global.noiseSpeed; float tilt=0.0; float incline=0.0; float offset=0.0; float noise=0.0; vec3 pos=vec3(position.x, position.z, 0.0); vec2 m = u_mousePos; vec2 d = uvNorm - m; float md = max(length(d), 0.0001); vec2 dir = d / md; float infl = 0.0; vec2 disp = dir * infl * 160.0; pos.x += disp.x; pos.y += disp.y; vec2 uvWarped = uvNorm; float sigma = u_warpRadius; float fall = exp(-(md*md)/(sigma*sigma)); uvWarped += dir * (u_warpStrength * fall); vec2 noiseCoord=resolution*uvWarped*u_global.noiseFreq; v_uvNorm = uvNorm; if(u_active_colors[0]==1.){ v_color=u_baseColor; } for(int i=0;i<u_waveLayers_length;i++){ if(u_active_colors[i+1]==1.){ WaveLayers layer=u_waveLayers[i]; float noise=smoothstep(layer.noiseFloor, layer.noiseCeil, snoise(vec3(noiseCoord.x*layer.noiseFreq.x+time*layer.noiseFlow, noiseCoord.y*layer.noiseFreq.y, time*layer.noiseSpeed+layer.noiseSeed))/2.0+0.5); v_color=blendNormal(v_color, layer.color, pow(noise,4.)); } } gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0); }`,
          noise: `vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;} float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0); vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx); vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy); vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i); vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0)); float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww; vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w); vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w; vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m; return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3))); }`,
          blend: `vec3 blendNormal(vec3 base, vec3 blend){return blend;} vec3 blendNormal(vec3 base, vec3 blend, float opacity){return (blendNormal(base,blend)*opacity + base*(1.0-opacity)); }`,
          fragment: `varying vec3 v_color;\nvarying vec2 v_uvNorm;\nvoid main(){\n  vec3 color = v_color;\n  float md = length(v_uvNorm - u_mousePos);\n  float halo = 1.0 - smoothstep(0.12, 0.60, md);\n  float core = 1.0 - smoothstep(0.00, 0.22, md);\n  core = pow(core, 3.0);\n  float trail = 0.0;\n  for (int i = 0; i < u_pathPos_length; i++) {\n    float life = u_pathLife[i];\n    if (life > 0.001) {\n      float dd = length(v_uvNorm - u_pathPos[i]);\n      float m = exp(-(dd*dd)/(0.04*0.04));\n      trail = max(trail, m * life);\n    }\n  }\n  halo = clamp(halo * 0.7 + trail * 1.0, 0.0, 1.0);\n  float k = halo * (0.85 * u_mouseStrength);\n  vec3 lightenCol = 1.0 - (1.0 - color) * (1.0 - k);\n  float blendOpacity = clamp(0.85 * halo + 1.0 * core, 0.0, 1.0);\n  color = mix(color, lightenCol, blendOpacity);\n  color = mix(color, vec3(1.0), core * 0.85);\n  color = min(color, 1.0);\n  gl_FragColor = vec4(color, 1.0);\n}`,
        }
        this.minigl = new MiniGl(canvas)
        requestAnimationFrame(() => {
          this.computedCanvasStyle = getComputedStyle(canvas)
          this.waitForCssVars()
        })
      }
      waitForCssVars() {
        if (
          this.computedCanvasStyle &&
          this.computedCanvasStyle
            .getPropertyValue('--gradient-color-1')
            .indexOf('#') !== -1
        ) {
          this.init()
        } else {
          requestAnimationFrame(() => this.waitForCssVars())
        }
      }
      init() {
        this.initGradientColors()
        this.initMesh()
        this.resize()
        requestAnimationFrame(this.animate)
        window.addEventListener('resize', this.resize.bind(this))
        const rectHost = host
        const handlePointer = (clientX, clientY) => {
          const r = rectHost.getBoundingClientRect()
          const inside =
            clientX >= r.left &&
            clientX <= r.right &&
            clientY >= r.top &&
            clientY <= r.bottom
          this.mouse.inside = inside
          const cx = Math.max(r.left, Math.min(clientX, r.right))
          const cy = Math.max(r.top, Math.min(clientY, r.bottom))
          const nx = ((cx - r.left) / r.width) * 2 - 1
          const ny = 1 - ((cy - r.top) / r.height) * 2
          this.mouse.x = nx
          this.mouse.y = ny
          const now = performance.now()
          if (this._lastTrailPos) {
            const dx = nx - this._lastTrailPos[0]
            const dy = ny - this._lastTrailPos[1]
            const dist = Math.hypot(dx, dy)
            if (dist > 0.003 || now - this._lastTrailTime > 24) {
              const invLen = dist > 0 ? 1.0 / dist : 0.0
              this.trails.unshift({
                pos: [nx, ny],
                dir: [dx * invLen, dy * invLen],
                life: 1,
              })
              if (this.trails.length > this.TRAIL_MAX) this.trails.pop()
              this._lastTrailPos = [nx, ny]
              this._lastTrailTime = now
            }
          } else {
            this._lastTrailPos = [nx, ny]
            this._lastTrailTime = now
          }
        }
        window.addEventListener('mousemove', (e) =>
          handlePointer(e.clientX, e.clientY)
        )
        window.addEventListener('touchmove', (e) => {
          if (e.touches && e.touches[0])
            handlePointer(e.touches[0].clientX, e.touches[0].clientY)
        })
      }
      initGradientColors() {
        const varNames = Array.from({ length: 8 }, (_, i) => `--gradient-color-${i + 1}`)
        this.sectionColors = varNames
          .map((n) => {
            let hex = this.computedCanvasStyle.getPropertyValue(n).trim()
            if (hex && hex.length === 4) {
              const t = hex
                .substr(1)
                .split('')
                .map((h) => h + h)
                .join('')
              hex = `#${t}`
            }
            return hex ? `0x${hex.substr(1)}` : null
          })
          .filter(Boolean)
          .map((h) => normalizeColor(parseInt(h, 16)))
      }
      initMaterial() {
        this.uniforms = {
          u_time: new this.minigl.Uniform({ value: 0 }),
          u_shadow_power: new this.minigl.Uniform({ value: 5 }),
          u_darken_top: new this.minigl.Uniform({ value: 1 }),
          u_active_colors: new this.minigl.Uniform({
            value: Array.from({ length: this.sectionColors.length }, () =>
              new this.minigl.Uniform({ value: 1 })
            ),
            type: 'array',
          }),
          u_pathPos: new this.minigl.Uniform({
            value: Array.from({ length: this.TRAIL_MAX }, () =>
              new this.minigl.Uniform({ value: [0, 0], type: 'vec2' })
            ),
            type: 'array',
          }),
          u_pathLife: new this.minigl.Uniform({
            value: Array.from({ length: this.TRAIL_MAX }, () =>
              new this.minigl.Uniform({ value: 0 })
            ),
            type: 'array',
          }),
          u_mousePos: new this.minigl.Uniform({ value: [0, 0], type: 'vec2' }),
          u_mouseStrength: new this.minigl.Uniform({ value: 0 }),
          u_warpStrength: new this.minigl.Uniform({ value: 0.8 }),
          u_warpRadius: new this.minigl.Uniform({ value: 0.5 }),
          u_brightnessGain: new this.minigl.Uniform({ value: 0.35 }),
          u_global: new this.minigl.Uniform({
            value: {
              noiseFreq: new this.minigl.Uniform({
                value: [14e-5, 29e-5],
                type: 'vec2',
              }),
              noiseSpeed: new this.minigl.Uniform({ value: 5e-6 }),
            },
            type: 'struct',
          }),
          u_vertDeform: new this.minigl.Uniform({
            value: {
              incline: new this.minigl.Uniform({ value: 0 }),
              offsetTop: new this.minigl.Uniform({ value: -0.6 }),
              offsetBottom: new this.minigl.Uniform({ value: -0.6 }),
              noiseFreq: new this.minigl.Uniform({
                value: [2.2, 3.2],
                type: 'vec2',
              }),
              noiseAmp: new this.minigl.Uniform({ value: 520 }),
              noiseSpeed: new this.minigl.Uniform({ value: 14 }),
              noiseFlow: new this.minigl.Uniform({ value: 4.2 }),
              noiseSeed: new this.minigl.Uniform({ value: 5 }),
            },
            type: 'struct',
            excludeFrom: 'fragment',
          }),
          u_baseColor: new this.minigl.Uniform({
            value: this.sectionColors[0],
            type: 'vec3',
            excludeFrom: 'fragment',
          }),
          u_waveLayers: new this.minigl.Uniform({
            value: [],
            type: 'array',
            excludeFrom: 'fragment',
          }),
        }
        for (let i = 1; i < this.sectionColors.length; i++) {
          this.uniforms.u_waveLayers.value.push(
            new this.minigl.Uniform({
              value: {
                color: new this.minigl.Uniform({
                  value: this.sectionColors[i],
                  type: 'vec3',
                }),
                noiseFreq: new this.minigl.Uniform({
                  value: [
                    2 + i / this.sectionColors.length,
                    3 + i / this.sectionColors.length,
                  ],
                  type: 'vec2',
                }),
                noiseSpeed: new this.minigl.Uniform({ value: 11 + 0.3 * i }),
                noiseFlow: new this.minigl.Uniform({ value: 6.5 + 0.3 * i }),
                noiseSeed: new this.minigl.Uniform({ value: 5 + 10 * i }),
                noiseFloor: new this.minigl.Uniform({ value: 0.1 }),
                noiseCeil: new this.minigl.Uniform({
                  value: 0.63 + 0.07 * i,
                }),
              },
              type: 'struct',
            })
          )
        }
        this.vertexShader = [
          this.shaderFiles.noise,
          this.shaderFiles.blend,
          this.shaderFiles.vertex,
        ].join('\n\n')
        return new this.minigl.Material(
          this.vertexShader,
          this.shaderFiles.fragment,
          this.uniforms
        )
      }
      initMesh() {
        this.material = this.initMaterial()
        this.geometry = new this.minigl.PlaneGeometry()
        this.mesh = new this.minigl.Mesh(this.geometry, this.material)
      }
      resize() {
        this.width = host.clientWidth
        this.height = host.clientHeight
        this.minigl.setSize(this.width, this.height)
        this.minigl.setOrthographicCamera()
        this.xSegCount = Math.ceil(this.width * 0.06)
        this.ySegCount = Math.ceil(this.height * 0.16)
        this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount)
        this.mesh.geometry.setSize(this.width, this.height)
        this.mesh.material.uniforms.u_shadow_power.value =
          this.width < 600 ? 5 : 6
      }
      animate = (t) => {
        if (!this.last) this.last = t
        this.t += Math.min(t - this.last, 1000 / 15)
        this.last = t
        if (!this.mesh || !this.mesh.material) {
          if (this.conf.playing) requestAnimationFrame(this.animate)
          return
        }
        this.mesh.material.uniforms.u_time.value = this.t
        const ms = this.mouse.inside ? 1 : 0
        this.uniforms.u_mouseStrength.value +=
          ((ms ? 1 : 0) - this.uniforms.u_mouseStrength.value) * 0.12
        this.uniforms.u_mousePos.value = [this.mouse.x, this.mouse.y]
        for (let i = 0; i < this.TRAIL_MAX; i++) {
          const p = this.trails[i]
          if (p) {
            const fx = this.mouse.x - p.pos[0]
            const fy = this.mouse.y - p.pos[1]
            p.pos[0] += fx * 0.01
            p.pos[1] += fy * 0.01
            p.life *= 0.92
          }
          const src = p || { pos: [0, 0], life: 0 }
          this.uniforms.u_pathPos.value[i].value = src.pos
          this.uniforms.u_pathLife.value[i].value = src.life
        }
        this.minigl.render()
        if (this.conf.playing) requestAnimationFrame(this.animate)
      }
      pause() {
        this.conf.playing = false
      }
      play() {
        if (!this.conf.playing) {
          this.conf.playing = true
          requestAnimationFrame(this.animate)
        }
      }
    }

    const grad = new Gradient().initGradient('.footer-gradient-container')
    grad.pause()
    try {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) grad.play()
            else grad.pause()
          })
        },
        { root: null, threshold: 0.1 }
      )
      io.observe(host)
    } catch (_) {
      grad.play()
    }

    return () => {
      grad.pause()
    }
  }, [])

  return (
    <footer className="footer-section">
      <div ref={containerRef} className="footer-gradient-container">
        <canvas ref={canvasRef} className="mesh-gradient"></canvas>
        <div className="footer-blur-layer"></div>
        <div className="footer-blur-layer footer-blur-layer-2"></div>
        <div className="footer-content">
          <div className="footer-info">
            <h3 className="footer-name">Choi Daye</h3>
            <p className="footer-title">Frontend Developer</p>
            <div className="footer-links">
              <a href="mailto:mododa17@naver.com" className="footer-link">
                Email
              </a>
              <span className="footer-divider">|</span>
              <a
                href="https://github.com/choi-da-ye"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                GitHub
              </a>
            </div>
            <p className="footer-copyright">
              © 2025 Daye Choi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

