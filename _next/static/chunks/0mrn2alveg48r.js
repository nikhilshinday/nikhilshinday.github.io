(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,67113,e=>{"use strict";var t=e.i(43476),i=e.i(71645);let r={density:15e5,pointScale:.75,opacity:.65,fieldDepth:1.55,noiseScale:.006,noiseSpeed:.88,flowDistance:10,turbulence:.4,microDrift:8,repulsion:.2},a=[{key:"density",param:"n",label:"rendered particles",min:3e4,max:15e6,step:1e4,format:e=>e>=1e6?`${(e/1e6).toFixed(2)}m`:`${Math.round(e/1e3)}k`},{key:"pointScale",param:"size",label:"point size",min:.4,max:7.5,step:.05,format:e=>`${e.toFixed(2)}\xd7`},{key:"opacity",param:"opacity",label:"point opacity",min:.25,max:4.5,step:.05,format:e=>`${e.toFixed(2)}\xd7`},{key:"fieldDepth",param:"depth",label:"field depth",min:.45,max:5.4,step:.05,format:e=>e.toFixed(2)},{key:"noiseScale",param:"noise",label:"noise scale",min:.001,max:.06,step:5e-4,format:e=>e.toFixed(4)},{key:"noiseSpeed",param:"speed",label:"evolution speed",min:0,max:3,step:.02,format:e=>e.toFixed(2)},{key:"flowDistance",param:"flow",label:"flow distance",min:0,max:90,step:.5,format:e=>`${e.toFixed(1)}px`},{key:"turbulence",param:"turb",label:"turbulence",min:0,max:4.5,step:.05,format:e=>e.toFixed(2)},{key:"microDrift",param:"drift",label:"micro drift",min:0,max:24,step:.25,format:e=>`${e.toFixed(2)}px`},{key:"repulsion",param:"repel",label:"repelling force",min:0,max:6,step:.05,format:e=>`${e.toFixed(2)}px`}];function n(e){let t=43758.5453123*Math.sin(12.9898*e+78.233);return t-Math.floor(t)}let o=`
  precision highp float;

  attribute vec2 a_home;
  attribute float a_size;
  attribute float a_seed;
  attribute vec2 a_repel;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_pixel_ratio;
  uniform float u_point_scale;
  uniform float u_opacity_scale;
  uniform float u_noise_scale;
  uniform float u_noise_speed;
  uniform float u_flow_distance;
  uniform float u_turbulence;
  uniform float u_micro_drift;
  uniform float u_repulsion;
  uniform float u_sample_layer;
  uniform float u_density_weight;

  varying vec2 v_field_uv;
  varying float v_alpha;

  vec2 random_gradient(vec2 point) {
    vec2 seed = vec2(
      dot(point, vec2(127.1, 311.7)),
      dot(point, vec2(269.5, 183.3))
    );
    return normalize(-1.0 + 2.0 * fract(sin(seed) * 43758.5453123));
  }

  float perlin_noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    vec2 fade = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);
    float bottom_left = dot(random_gradient(cell), local);
    float bottom_right = dot(random_gradient(cell + vec2(1.0, 0.0)), local - vec2(1.0, 0.0));
    float top_left = dot(random_gradient(cell + vec2(0.0, 1.0)), local - vec2(0.0, 1.0));
    float top_right = dot(random_gradient(cell + vec2(1.0, 1.0)), local - vec2(1.0, 1.0));
    return mix(mix(bottom_left, bottom_right, fade.x), mix(top_left, top_right, fade.x), fade.y);
  }

  float layered_noise(vec2 point) {
    float detail = clamp(u_turbulence, 0.0, 4.5);
    float value = perlin_noise(point);
    value += perlin_noise(point * 2.03 + vec2(13.7, -8.4)) * 0.5 * detail;
    value += perlin_noise(point * 4.07 + vec2(-5.2, 19.1)) * 0.24 * detail * detail;
    return value;
  }

  vec2 curl_noise(vec2 point) {
    float epsilon = 0.075;
    float left = layered_noise(point - vec2(epsilon, 0.0));
    float right = layered_noise(point + vec2(epsilon, 0.0));
    float down = layered_noise(point - vec2(0.0, epsilon));
    float up = layered_noise(point + vec2(0.0, epsilon));
    return normalize(vec2(up - down, -(right - left)) + vec2(0.0001));
  }

  void main() {
    float layer_seed = fract(a_seed + u_sample_layer * 0.61803398875);
    float layer_active = step(0.5, u_sample_layer);
    float layer_radius = min(0.78, 0.18 + u_sample_layer * 0.065) * layer_active;
    vec2 layer_jitter = random_gradient(a_home + vec2(u_sample_layer * 17.31, -u_sample_layer * 11.73)) * layer_radius;
    vec2 sample_home = a_home + layer_jitter;
    vec2 evolution = vec2(u_time * u_noise_speed * 0.27, -u_time * u_noise_speed * 0.19);
    vec2 flow = curl_noise(sample_home * u_noise_scale + evolution);
    float breathing = 0.74 + sin(u_time * u_noise_speed * 0.9 + layer_seed * 6.28318530718) * 0.26;
    float drift_angle = layer_seed * 6.28318530718 + u_time * u_noise_speed * (0.38 + layer_seed * 0.32);
    vec2 micro_drift = vec2(cos(drift_angle), sin(drift_angle)) * u_micro_drift;
    float repulsion_angle = u_sample_layer * 2.39996322973;
    mat2 repulsion_rotation = mat2(cos(repulsion_angle), -sin(repulsion_angle), sin(repulsion_angle), cos(repulsion_angle));
    float repulsion_breath = 0.94 + sin(u_time * 0.21 + layer_seed * 6.28318530718) * 0.06;
    vec2 position = sample_home + flow * u_flow_distance * breathing + micro_drift + repulsion_rotation * a_repel * u_repulsion * repulsion_breath;
    vec2 clip = vec2(position.x / u_resolution.x * 2.0 - 1.0, 1.0 - position.y / u_resolution.y * 2.0);
    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = max(1.0, a_size * 2.0 * u_pixel_ratio * u_point_scale);
    v_field_uv = clamp(position / u_resolution, 0.0, 1.0);
    v_alpha = min(1.0, u_opacity_scale * u_density_weight);
  }
`,l=`
  precision mediump float;
  uniform sampler2D u_field;
  uniform float u_field_depth;
  varying vec2 v_field_uv;
  varying float v_alpha;

  void main() {
    vec2 point = gl_PointCoord * 2.0 - 1.0;
    float distance_from_center = length(point);
    if (distance_from_center > 1.0) discard;
    vec4 field_color = texture2D(u_field, v_field_uv);
    vec3 field_rgb = clamp(1.0 - (1.0 - field_color.rgb) * u_field_depth, 0.0, 1.0);
    float soft_edge = smoothstep(1.0, 0.68, distance_from_center);
    gl_FragColor = vec4(field_rgb, v_alpha * soft_edge);
  }
`;function s(e,t,i){let r=e.createShader(t);return r?(e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(e.deleteShader(r),null):null}e.s(["PhotoField",0,function(){let e=(0,i.useRef)(null),c=(0,i.useRef)(null),u=(0,i.useRef)(null),d=(0,i.useRef)(null),m=(0,i.useRef)({...r}),f=(0,i.useRef)("cover"),p=(0,i.useRef)(!1),_=(0,i.useRef)(()=>{}),[h,v]=(0,i.useState)({...r}),[g,y]=(0,i.useState)("cover"),[x,b]=(0,i.useState)(!1),[w,E]=(0,i.useState)(!1),[T,R]=(0,i.useState)(!1),[A,S]=(0,i.useState)(""),[L,P]=(0,i.useState)(!1),U=(0,i.useCallback)(()=>{d.current?.getTracks().forEach(e=>e.stop()),d.current=null,u.current&&(u.current.srcObject=null),u.current=null},[]);(0,i.useEffect)(()=>{let e=function(){let e=new URLSearchParams(window.location.search),t={...r};for(let r of a){var i;let a=e.get(r.param),n=null===a?NaN:Number(a);Number.isFinite(n)&&(t[r.key]=(i=r.min,Math.min(r.max,Math.max(i,n))))}let n=e.get("fit");return{settings:t,fit:"contain"===n||"stretch"===n?n:"cover"}}();m.current=e.settings,f.current=e.fit;let t=window.requestAnimationFrame(()=>{v(e.settings),y(e.fit),P(!0)});return()=>window.cancelAnimationFrame(t)},[]),(0,i.useEffect)(()=>{if(!L)return;let e=new URL(window.location.href);for(let t of a)e.searchParams.set(t.param,String(h[t.key]));e.searchParams.set("fit",g),window.history.replaceState(null,"",`${e.pathname}?${e.searchParams.toString()}${e.hash}`)},[g,h,L]),(0,i.useEffect)(()=>{let t=e.current;if(!t)return;let i=t.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1});if(!i)return void S("WebGL is unavailable in this browser");let r=function(e,t){let i=function(e){let t=s(e,e.VERTEX_SHADER,o),i=s(e,e.FRAGMENT_SHADER,l);if(!t||!i)return null;let r=e.createProgram();return r?(e.attachShader(r,t),e.attachShader(r,i),e.linkProgram(r),e.deleteShader(t),e.deleteShader(i),e.getProgramParameter(r,e.LINK_STATUS))?r:(e.deleteProgram(r),null):null}(t),r=t.createBuffer(),a=t.createTexture();if(!i||!r||!a)return null;let n={home:t.getAttribLocation(i,"a_home"),size:t.getAttribLocation(i,"a_size"),seed:t.getAttribLocation(i,"a_seed"),repel:t.getAttribLocation(i,"a_repel")},c={resolution:t.getUniformLocation(i,"u_resolution"),time:t.getUniformLocation(i,"u_time"),pixelRatio:t.getUniformLocation(i,"u_pixel_ratio"),pointScale:t.getUniformLocation(i,"u_point_scale"),opacity:t.getUniformLocation(i,"u_opacity_scale"),fieldDepth:t.getUniformLocation(i,"u_field_depth"),noiseScale:t.getUniformLocation(i,"u_noise_scale"),noiseSpeed:t.getUniformLocation(i,"u_noise_speed"),flowDistance:t.getUniformLocation(i,"u_flow_distance"),turbulence:t.getUniformLocation(i,"u_turbulence"),microDrift:t.getUniformLocation(i,"u_micro_drift"),repulsion:t.getUniformLocation(i,"u_repulsion"),sampleLayer:t.getUniformLocation(i,"u_sample_layer"),densityWeight:t.getUniformLocation(i,"u_density_weight"),field:t.getUniformLocation(i,"u_field")};return t.useProgram(i),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.disable(t.DEPTH_TEST),t.bindTexture(t.TEXTURE_2D,a),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),{setPointData:e=>{t.bindBuffer(t.ARRAY_BUFFER,r),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW)},setField:e=>{t.bindTexture(t.TEXTURE_2D,a),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e)},resize:()=>t.viewport(0,0,e.width,e.height),draw:o=>{t.clearColor(.035,.035,.032,1),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(i),t.bindBuffer(t.ARRAY_BUFFER,r);let l=6*Float32Array.BYTES_PER_ELEMENT;t.enableVertexAttribArray(n.home),t.vertexAttribPointer(n.home,2,t.FLOAT,!1,l,0),t.enableVertexAttribArray(n.size),t.vertexAttribPointer(n.size,1,t.FLOAT,!1,l,2*Float32Array.BYTES_PER_ELEMENT),t.enableVertexAttribArray(n.seed),t.vertexAttribPointer(n.seed,1,t.FLOAT,!1,l,3*Float32Array.BYTES_PER_ELEMENT),t.enableVertexAttribArray(n.repel),t.vertexAttribPointer(n.repel,2,t.FLOAT,!1,l,4*Float32Array.BYTES_PER_ELEMENT),t.uniform2f(c.resolution,o.width,o.height),t.uniform1f(c.time,o.time),t.uniform1f(c.pixelRatio,o.pixelRatio),t.uniform1f(c.pointScale,o.settings.pointScale),t.uniform1f(c.opacity,o.settings.opacity),t.uniform1f(c.fieldDepth,o.settings.fieldDepth),t.uniform1f(c.noiseScale,o.settings.noiseScale),t.uniform1f(c.noiseSpeed,o.settings.noiseSpeed),t.uniform1f(c.flowDistance,o.settings.flowDistance),t.uniform1f(c.turbulence,o.settings.turbulence),t.uniform1f(c.microDrift,o.settings.microDrift),t.uniform1f(c.repulsion,o.settings.repulsion),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,a),t.uniform1i(c.field,0);let s=Math.max(1,Math.round(o.settings.density));t.uniform1f(c.densityWeight,Math.min(1,Math.sqrt(32e4/s)));let u=0,d=0;for(;u<s;){let e=Math.min(32e4,s-u);t.uniform1f(c.sampleLayer,d),t.drawArrays(t.POINTS,0,e),u+=e,d+=1}e.dataset.renderedPoints=String(u),e.dataset.renderPasses=String(d)},destroy:()=>{t.deleteBuffer(r),t.deleteTexture(a),t.deleteProgram(i)}}}(t,i);if(!r)return void S("the particle renderer could not start");c.current=r;let a=document.createElement("canvas"),d=!0,h=0,v=0,g=0,y=()=>{let e=window.innerWidth,t=window.innerHeight;r.setField(function(e,t,i,r,a){let n=Math.min(1,1280/Math.max(i,r)),o=Math.max(1,Math.round(i*n)),l=Math.max(1,Math.round(r*n));e.width!==o&&(e.width=o),e.height!==l&&(e.height=l);let s=e.getContext("2d");if(!s)return e;if(s.fillStyle="#10100f",s.fillRect(0,0,e.width,e.height),!t||t.readyState<HTMLMediaElement.HAVE_CURRENT_DATA||!t.videoWidth||!t.videoHeight){let t=s.createLinearGradient(0,0,e.width,e.height);return t.addColorStop(0,"#26282d"),t.addColorStop(.38,"#5a493f"),t.addColorStop(.72,"#333b45"),t.addColorStop(1,"#151515"),s.fillStyle=t,s.fillRect(0,0,e.width,e.height),e}if("stretch"===a)return s.drawImage(t,0,0,e.width,e.height),e;let c="contain"===a?Math.min(e.width/t.videoWidth,e.height/t.videoHeight):Math.max(e.width/t.videoWidth,e.height/t.videoHeight),u=t.videoWidth*c,d=t.videoHeight*c,m=(e.width-u)/2,f=(e.height-d)/2;return s.drawImage(t,m,f,u,d),e}(a,u.current,e,t,f.current))};_.current=y;let x=()=>{let e=window.innerWidth,i=window.innerHeight,a=Math.min(window.devicePixelRatio||1,2);t.width=Math.round(e*a),t.height=Math.round(i*a),t.style.width=`${e}px`,t.style.height=`${i}px`,r.resize(),r.setPointData(function(e,t){let i=new Float32Array(192e4);for(let r=0;r<32e4;r+=1){let a=n(r+1),o=(r+.5)*.7548776662466927%1*e,l=(r+.5)*.5698402909980532%1*t,s=a*Math.PI*2,c=6*r;i[c]=o,i[c+1]=l,i[c+2]=.62+.72*n(r+17),i[c+3]=a,i[c+4]=Math.cos(s),i[c+5]=Math.sin(s)}return i}(e,i)),y()},b=e=>{if(!d)return;h=requestAnimationFrame(b);let t=m.current.density;p.current||e-v<1e3/(t>1e7?8:t>5e6?12:t>2e6?20:30)||(v=e,u.current&&e-g>=1e3/15&&(g=e,y()),r.draw({time:e/1e3,width:window.innerWidth,height:window.innerHeight,pixelRatio:Math.min(window.devicePixelRatio||1,2),settings:m.current}))};return window.addEventListener("resize",x),x(),h=requestAnimationFrame(b),()=>{d=!1,cancelAnimationFrame(h),window.removeEventListener("resize",x),r.destroy(),U(),c.current=null,_.current=()=>{}}},[U]);let F=async()=>{if(!navigator.mediaDevices?.getUserMedia)return void S("camera unavailable");try{U();let e=await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:{ideal:"environment"}}}),t=document.createElement("video");t.muted=!0,t.playsInline=!0,t.srcObject=e,d.current=e,u.current=t,await t.play(),R(!0),S("camera streaming"),_.current()}catch{U(),R(!1),S("camera permission required")}},D=()=>{U(),R(!1),S(""),_.current()},M=async()=>{try{await navigator.clipboard.writeText(window.location.href),S("parameter URL copied")}catch{S("copy the URL from the address bar")}};return(0,t.jsxs)("main",{className:"field-shell",children:[(0,t.jsx)("canvas",{ref:e,className:"field-canvas","aria-hidden":"true"}),T?null:(0,t.jsxs)("section",{className:"photo-intro","aria-labelledby":"photo-intro-title",children:[(0,t.jsx)("h1",{id:"photo-intro-title",children:"you know what you’re simulating."}),(0,t.jsx)("div",{className:"photo-actions",children:(0,t.jsx)("button",{className:"primary-action",type:"button",onClick:F,children:"start camera"})})]}),(0,t.jsxs)("div",{className:"field-controls",children:[T?(0,t.jsx)("button",{type:"button",onClick:D,children:"stop camera"}):null,(0,t.jsx)("button",{type:"button",onClick:()=>{p.current=!p.current,b(p.current)},children:x?"resume":"pause"}),(0,t.jsx)("button",{type:"button",onClick:()=>E(e=>!e),"aria-expanded":w,"aria-controls":"field-parameters",children:w?"hide inputs":"tune inputs"}),(0,t.jsx)("button",{type:"button",onClick:M,children:"copy URL"})]}),(0,t.jsx)("div",{className:"sr-only","aria-live":"polite",children:A}),w?(0,t.jsxs)("aside",{id:"field-parameters",className:"field-panel","aria-label":"Acid parameters",children:[(0,t.jsxs)("div",{className:"panel-heading",children:[(0,t.jsx)("h2",{children:"inputs"}),(0,t.jsx)("button",{type:"button",onClick:()=>E(!1),"aria-label":"Close parameter panel",children:"×"})]}),(0,t.jsxs)("label",{className:"parameter fit-parameter",children:[(0,t.jsxs)("span",{children:["video fit ",(0,t.jsx)("output",{children:g})]}),(0,t.jsxs)("select",{value:g,onChange:e=>{var t;f.current=t=e.currentTarget.value,y(t),window.requestAnimationFrame(()=>_.current())},children:[(0,t.jsx)("option",{value:"cover",children:"cover"}),(0,t.jsx)("option",{value:"contain",children:"contain"}),(0,t.jsx)("option",{value:"stretch",children:"stretch"})]})]}),(0,t.jsx)("div",{className:"parameter-list",children:a.map(e=>(0,t.jsxs)("label",{className:"parameter",children:[(0,t.jsxs)("span",{children:[e.label,(0,t.jsx)("output",{children:e.format(h[e.key])})]}),(0,t.jsx)("input",{type:"range",min:e.min,max:e.max,step:e.step,value:h[e.key],onChange:t=>{var i,r;let a;return i=e.key,r=Number(t.currentTarget.value),a={...m.current,[i]:r},void(m.current=a,v(a))}})]},e.key))}),(0,t.jsxs)("div",{className:"panel-footer",children:[(0,t.jsx)("button",{type:"button",onClick:()=>{m.current={...r},f.current="cover",v({...r}),y("cover"),window.requestAnimationFrame(()=>_.current())},children:"reset defaults"}),T?(0,t.jsx)("button",{type:"button",onClick:D,children:"stop camera"}):null]})]}):null]})}])}]);