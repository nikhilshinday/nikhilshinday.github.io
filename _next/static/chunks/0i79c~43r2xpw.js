(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,67113,e=>{"use strict";var t=e.i(43476),i=e.i(71645);let r={density:15e5,pointScale:.75,opacity:.65,fieldDepth:1.55,noiseScale:.006,noiseSpeed:.88,flowDistance:10,turbulence:.4,microDrift:8,repulsion:.2},a=[{key:"density",param:"n",label:"rendered particles",min:3e4,max:15e6,step:1e4,format:e=>e>=1e6?`${(e/1e6).toFixed(2)}m`:`${Math.round(e/1e3)}k`},{key:"pointScale",param:"size",label:"point size",min:.4,max:7.5,step:.05,format:e=>`${e.toFixed(2)}\xd7`},{key:"opacity",param:"opacity",label:"point opacity",min:.25,max:4.5,step:.05,format:e=>`${e.toFixed(2)}\xd7`},{key:"fieldDepth",param:"depth",label:"field depth",min:.45,max:5.4,step:.05,format:e=>e.toFixed(2)},{key:"noiseScale",param:"noise",label:"noise scale",min:.001,max:.06,step:5e-4,format:e=>e.toFixed(4)},{key:"noiseSpeed",param:"speed",label:"evolution speed",min:0,max:3,step:.02,format:e=>e.toFixed(2)},{key:"flowDistance",param:"flow",label:"flow distance",min:0,max:90,step:.5,format:e=>`${e.toFixed(1)}px`},{key:"turbulence",param:"turb",label:"turbulence",min:0,max:4.5,step:.05,format:e=>e.toFixed(2)},{key:"microDrift",param:"drift",label:"micro drift",min:0,max:24,step:.25,format:e=>`${e.toFixed(2)}px`},{key:"repulsion",param:"repel",label:"repelling force",min:0,max:6,step:.05,format:e=>`${e.toFixed(2)}px`}];function o(e){let t=43758.5453123*Math.sin(12.9898*e+78.233);return t-Math.floor(t)}let n=`
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
`;function s(e,t,i){let r=e.createShader(t);return r?(e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(e.deleteShader(r),null):null}e.s(["PhotoField",0,function(){let e=(0,i.useRef)(null),c=(0,i.useRef)(null),u=(0,i.useRef)(null),d=(0,i.useRef)({...r}),m=(0,i.useRef)("cover"),f=(0,i.useRef)(!1),p=(0,i.useRef)(()=>{}),[h,_]=(0,i.useState)({...r}),[g,v]=(0,i.useState)("cover"),[x,y]=(0,i.useState)(!1),[b,w]=(0,i.useState)(!1),[E,R]=(0,i.useState)(!1),[T,S]=(0,i.useState)(""),[A,L]=(0,i.useState)("photo stays on this device"),[j,U]=(0,i.useState)(!1);(0,i.useEffect)(()=>{let e=function(){let e=new URLSearchParams(window.location.search),t={...r};for(let r of a){var i;let a=e.get(r.param),o=null===a?NaN:Number(a);Number.isFinite(o)&&(t[r.key]=(i=r.min,Math.min(r.max,Math.max(i,o))))}let o=e.get("fit");return{settings:t,fit:"contain"===o||"stretch"===o?o:"cover"}}();d.current=e.settings,m.current=e.fit;let t=window.requestAnimationFrame(()=>{_(e.settings),v(e.fit),U(!0)});return()=>window.cancelAnimationFrame(t)},[]),(0,i.useEffect)(()=>{if(!j)return;let e=new URL(window.location.href);for(let t of a)e.searchParams.set(t.param,String(h[t.key]));e.searchParams.set("fit",g),window.history.replaceState(null,"",`${e.pathname}?${e.searchParams.toString()}${e.hash}`)},[g,h,j]),(0,i.useEffect)(()=>{let t=e.current;if(!t)return;let i=t.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1});if(!i)return void L("WebGL is unavailable in this browser");let r=function(e,t){let i=function(e){let t=s(e,e.VERTEX_SHADER,n),i=s(e,e.FRAGMENT_SHADER,l);if(!t||!i)return null;let r=e.createProgram();return r?(e.attachShader(r,t),e.attachShader(r,i),e.linkProgram(r),e.deleteShader(t),e.deleteShader(i),e.getProgramParameter(r,e.LINK_STATUS))?r:(e.deleteProgram(r),null):null}(t),r=t.createBuffer(),a=t.createTexture();if(!i||!r||!a)return null;let o={home:t.getAttribLocation(i,"a_home"),size:t.getAttribLocation(i,"a_size"),seed:t.getAttribLocation(i,"a_seed"),repel:t.getAttribLocation(i,"a_repel")},c={resolution:t.getUniformLocation(i,"u_resolution"),time:t.getUniformLocation(i,"u_time"),pixelRatio:t.getUniformLocation(i,"u_pixel_ratio"),pointScale:t.getUniformLocation(i,"u_point_scale"),opacity:t.getUniformLocation(i,"u_opacity_scale"),fieldDepth:t.getUniformLocation(i,"u_field_depth"),noiseScale:t.getUniformLocation(i,"u_noise_scale"),noiseSpeed:t.getUniformLocation(i,"u_noise_speed"),flowDistance:t.getUniformLocation(i,"u_flow_distance"),turbulence:t.getUniformLocation(i,"u_turbulence"),microDrift:t.getUniformLocation(i,"u_micro_drift"),repulsion:t.getUniformLocation(i,"u_repulsion"),sampleLayer:t.getUniformLocation(i,"u_sample_layer"),densityWeight:t.getUniformLocation(i,"u_density_weight"),field:t.getUniformLocation(i,"u_field")};return t.useProgram(i),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.disable(t.DEPTH_TEST),t.bindTexture(t.TEXTURE_2D,a),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),{setPointData:e=>{t.bindBuffer(t.ARRAY_BUFFER,r),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW)},setField:e=>{t.bindTexture(t.TEXTURE_2D,a),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e)},resize:()=>t.viewport(0,0,e.width,e.height),draw:n=>{t.clearColor(.035,.035,.032,1),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(i),t.bindBuffer(t.ARRAY_BUFFER,r);let l=6*Float32Array.BYTES_PER_ELEMENT;t.enableVertexAttribArray(o.home),t.vertexAttribPointer(o.home,2,t.FLOAT,!1,l,0),t.enableVertexAttribArray(o.size),t.vertexAttribPointer(o.size,1,t.FLOAT,!1,l,2*Float32Array.BYTES_PER_ELEMENT),t.enableVertexAttribArray(o.seed),t.vertexAttribPointer(o.seed,1,t.FLOAT,!1,l,3*Float32Array.BYTES_PER_ELEMENT),t.enableVertexAttribArray(o.repel),t.vertexAttribPointer(o.repel,2,t.FLOAT,!1,l,4*Float32Array.BYTES_PER_ELEMENT),t.uniform2f(c.resolution,n.width,n.height),t.uniform1f(c.time,n.time),t.uniform1f(c.pixelRatio,n.pixelRatio),t.uniform1f(c.pointScale,n.settings.pointScale),t.uniform1f(c.opacity,n.settings.opacity),t.uniform1f(c.fieldDepth,n.settings.fieldDepth),t.uniform1f(c.noiseScale,n.settings.noiseScale),t.uniform1f(c.noiseSpeed,n.settings.noiseSpeed),t.uniform1f(c.flowDistance,n.settings.flowDistance),t.uniform1f(c.turbulence,n.settings.turbulence),t.uniform1f(c.microDrift,n.settings.microDrift),t.uniform1f(c.repulsion,n.settings.repulsion),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,a),t.uniform1i(c.field,0);let s=Math.max(1,Math.round(n.settings.density));t.uniform1f(c.densityWeight,Math.min(1,Math.sqrt(32e4/s)));let u=0,d=0;for(;u<s;){let e=Math.min(32e4,s-u);t.uniform1f(c.sampleLayer,d),t.drawArrays(t.POINTS,0,e),u+=e,d+=1}e.dataset.renderedPoints=String(u),e.dataset.renderPasses=String(d)},destroy:()=>{t.deleteBuffer(r),t.deleteTexture(a),t.deleteProgram(i)}}}(t,i);if(!r)return void L("the particle renderer could not start");c.current=r;let a=!0,h=0,_=0,g=()=>{let e=window.innerWidth,t=window.innerHeight;r.setField(function(e,t,i,r){let a=document.createElement("canvas");a.width=Math.max(1,Math.round(t)),a.height=Math.max(1,Math.round(i));let o=a.getContext("2d");if(!o)return a;if(o.fillStyle="#10100f",o.fillRect(0,0,a.width,a.height),!e){let e=o.createLinearGradient(0,0,a.width,a.height);return e.addColorStop(0,"#26282d"),e.addColorStop(.38,"#5a493f"),e.addColorStop(.72,"#333b45"),e.addColorStop(1,"#151515"),o.fillStyle=e,o.fillRect(0,0,a.width,a.height),a}if("stretch"===r)return o.drawImage(e,0,0,a.width,a.height),a;let n="contain"===r?Math.min(a.width/e.width,a.height/e.height):Math.max(a.width/e.width,a.height/e.height),l=e.width*n,s=e.height*n,c=(a.width-l)/2,u=(a.height-s)/2;return o.drawImage(e,c,u,l,s),a}(u.current,e,t,m.current))};p.current=g;let v=()=>{let e=window.innerWidth,i=window.innerHeight,a=Math.min(window.devicePixelRatio||1,2);t.width=Math.round(e*a),t.height=Math.round(i*a),t.style.width=`${e}px`,t.style.height=`${i}px`,r.resize(),r.setPointData(function(e,t){let i=new Float32Array(192e4);for(let r=0;r<32e4;r+=1){let a=o(r+1),n=(r+.5)*.7548776662466927%1*e,l=(r+.5)*.5698402909980532%1*t,s=a*Math.PI*2,c=6*r;i[c]=n,i[c+1]=l,i[c+2]=.62+.72*o(r+17),i[c+3]=a,i[c+4]=Math.cos(s),i[c+5]=Math.sin(s)}return i}(e,i)),g()},x=e=>{if(!a)return;h=requestAnimationFrame(x);let t=d.current.density;f.current||e-_<1e3/(t>1e7?8:t>5e6?12:t>2e6?20:30)||(_=e,r.draw({time:e/1e3,width:window.innerWidth,height:window.innerHeight,pixelRatio:Math.min(window.devicePixelRatio||1,2),settings:d.current}))};return window.addEventListener("resize",v),v(),h=requestAnimationFrame(x),()=>{a=!1,cancelAnimationFrame(h),window.removeEventListener("resize",v),r.destroy(),c.current=null,p.current=()=>{}}},[]);let P=e=>{let t=e.currentTarget.files?.[0];if(e.currentTarget.value="",!t)return;if(!t.type.startsWith("image/"))return void L("choose an image file");let i=URL.createObjectURL(t),r=new Image;r.onload=()=>{URL.revokeObjectURL(i),u.current=r,R(!0),S(t.name||"camera image"),L("photo loaded locally · URL carries parameters only"),p.current()},r.onerror=()=>{URL.revokeObjectURL(i),L("that image could not be decoded")},r.src=i},F=async()=>{try{await navigator.clipboard.writeText(window.location.href),L("parameter URL copied")}catch{L("copy the URL from the address bar")}};return(0,t.jsxs)("main",{className:"field-shell",children:[(0,t.jsx)("canvas",{ref:e,className:"field-canvas","aria-hidden":"true"}),(0,t.jsxs)("header",{className:"field-header",children:[(0,t.jsx)("p",{children:"nikhil shinday · chromatic study 01"}),(0,t.jsx)("h1",{children:"Photo Field"}),(0,t.jsx)("span",{children:"color belongs to space; particles borrow it in motion"})]}),E?null:(0,t.jsxs)("section",{className:"photo-intro","aria-labelledby":"photo-intro-title",children:[(0,t.jsx)("p",{children:"begin with light"}),(0,t.jsxs)("h2",{id:"photo-intro-title",children:["Take a photograph.",(0,t.jsx)("br",{}),"Set its color loose."]}),(0,t.jsxs)("div",{className:"photo-actions",children:[(0,t.jsxs)("label",{className:"primary-action",children:["take photo",(0,t.jsx)("input",{type:"file",accept:"image/*",capture:"environment",onChange:P})]}),(0,t.jsxs)("label",{className:"secondary-action",children:["choose image",(0,t.jsx)("input",{type:"file",accept:"image/*",onChange:P})]})]}),(0,t.jsx)("span",{children:"images never leave your browser"})]}),(0,t.jsxs)("div",{className:"field-controls",children:[E?(0,t.jsxs)("label",{className:"control-pill",children:["new photo",(0,t.jsx)("input",{type:"file",accept:"image/*",capture:"environment",onChange:P})]}):null,(0,t.jsx)("button",{type:"button",onClick:()=>{f.current=!f.current,y(f.current)},children:x?"resume":"pause"}),(0,t.jsx)("button",{type:"button",onClick:()=>w(e=>!e),"aria-expanded":b,"aria-controls":"field-parameters",children:b?"hide inputs":"tune inputs"}),(0,t.jsx)("button",{type:"button",onClick:F,children:"copy URL"})]}),(0,t.jsxs)("div",{className:"field-status","aria-live":"polite",children:[(0,t.jsx)("span",{children:T||"no photo selected"}),(0,t.jsx)("span",{children:A})]}),b?(0,t.jsxs)("aside",{id:"field-parameters",className:"field-panel","aria-label":"Photo field parameters",children:[(0,t.jsxs)("div",{className:"panel-heading",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{children:"all values live in the URL"}),(0,t.jsx)("h2",{children:"Field inputs"})]}),(0,t.jsx)("button",{type:"button",onClick:()=>w(!1),"aria-label":"Close parameter panel",children:"×"})]}),(0,t.jsxs)("label",{className:"parameter fit-parameter",children:[(0,t.jsxs)("span",{children:["photo fit ",(0,t.jsx)("output",{children:g})]}),(0,t.jsxs)("select",{value:g,onChange:e=>{var t;m.current=t=e.currentTarget.value,v(t),window.requestAnimationFrame(()=>p.current())},children:[(0,t.jsx)("option",{value:"cover",children:"cover"}),(0,t.jsx)("option",{value:"contain",children:"contain"}),(0,t.jsx)("option",{value:"stretch",children:"stretch"})]})]}),(0,t.jsx)("div",{className:"parameter-list",children:a.map(e=>(0,t.jsxs)("label",{className:"parameter",children:[(0,t.jsxs)("span",{children:[e.label,(0,t.jsx)("output",{children:e.format(h[e.key])})]}),(0,t.jsx)("input",{type:"range",min:e.min,max:e.max,step:e.step,value:h[e.key],onChange:t=>{var i,r;let a;return i=e.key,r=Number(t.currentTarget.value),a={...d.current,[i]:r},void(d.current=a,_(a))}})]},e.key))}),(0,t.jsxs)("div",{className:"panel-footer",children:[(0,t.jsx)("button",{type:"button",onClick:()=>{d.current={...r},m.current="cover",_({...r}),v("cover"),window.requestAnimationFrame(()=>p.current())},children:"reset defaults"}),E?(0,t.jsx)("button",{type:"button",onClick:()=>{u.current=null,R(!1),S(""),L("photo stays on this device"),p.current()},children:"remove photo"}):null]})]}):null]})}])}]);