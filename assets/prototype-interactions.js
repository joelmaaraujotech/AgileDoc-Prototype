export function createInteractions(React, jsx, doctorList) {
  const send = (detail) => document.dispatchEvent(new CustomEvent('agiledoc-action', {detail}));
  const go = screen => send({screen});
  let saved = false;
  let patientName="Stella Lesa",patientInsurance="Unimed Pará",inbox=[];
  function action(event) {
    const button = event.currentTarget;
    const text = button.textContent.trim();
    const icon = button.querySelector('svg')?.getAttribute('class') || '';
    if (text === 'See All') { globalThis.agileDocSearch=''; return go('list'); }
    if (icon.includes('lucide-search')) {const input=button.closest('.inner-phone')?.querySelector('[aria-label="Search specialists"]');if(input){input.focus();return;}return go('list');}
    if (icon.includes('lucide-house')) return go('home');
    if (icon.includes('lucide-message-circle')) return go('messages');
    if (icon.includes('lucide-user')) return go('patientprofile');
    if (icon.includes('lucide-bell')) return send({panel:'notifications'});
    if (icon.includes('lucide-mic')) return send({panel:'voice'});
    if (icon.includes('lucide-heart')) {
      saved = !saved;
      button.setAttribute('aria-pressed', String(saved));
      button.style.color = saved ? '#51950A' : '';
      button.querySelector('svg').style.fill = saved ? '#E2EED5' : 'none';
      return send({panel:'favorite', saved});
    }
    if (text === 'Open WhatsApp') return send({panel:'whatsapp'});
    if (text.includes('Download prescription')) return downloadPrescription();
    if (icon.includes('lucide-switch-camera')) {
      const active = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed',String(active));
      const preview=button.closest('.inner-phone')?.querySelector('img[alt="Stella Lesa"]');if(preview)preview.style.transform=active?'scaleX(-1)':'';
      return send({panel:'camera', active});
    }
    if (icon.includes('lucide-message-square')) return send({panel:'chat'});
  }
  function downloadPrescription() {
    const lines = ['AgileDoc - DEMO prescription', 'Patient: Stella Lesa', 'Budesonida 200mcg - 1 puff every 12h for 30 days', 'Follow-up in 30 days. Avoid dust. Stay hydrated.', 'Portfolio simulation only. Not a medical prescription.'];
    const stream = 'BT /F1 14 Tf 50 780 Td ' + lines.map((line,idx)=>(idx?'0 -28 Td ':'')+'('+line.replace(/[()\\]/g,'\\$&')+') Tj').join('\n')+' ET';
    const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream'];
    let pdf='%PDF-1.4\n'; const offsets=[0];
    objects.forEach((obj,idx)=>{offsets.push(pdf.length);pdf+=(idx+1)+' 0 obj\n'+obj+'\nendobj\n';});
    const xref=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    const url=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));const a=document.createElement('a');a.href=url;a.download='AgileDoc-demo-prescription.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const h=React.createElement;
  const btn=(text,onClick,extra={})=>h('button',{className:'demo-button',onClick,...extra},text);
  function Panel({state,close,onNav}) {
    const [message,setMessage]=React.useState('');
    const [messages,setMessages]=React.useState([]);
    const [status,setStatus]=React.useState('');
    const ref=React.useRef(null);
    React.useEffect(()=>{const old=document.activeElement;ref.current?.focus();const listener=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const items=[...ref.current.querySelectorAll('button,input,a')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',listener);return()=>{document.removeEventListener('keydown',listener);old?.focus();};},[]);
    const titles={notifications:'Notifications',voice:'Voice search',favorite:'Saved specialist',whatsapp:'Appointment confirmation',camera:'Camera preview',chat:'Consultation chat'};
    let content;
    if(state.panel==='notifications') content=h('div',null,h('p',null,'Your appointment with Dr. Pawan is ready.'),btn('View appointments',()=>{close();onNav('appointments');}),h('p',null,status||'You have one unread notification.'),btn('Mark all as read',()=>setStatus('All notifications marked as read.')));
    if(state.panel==='voice') content=h('div',null,h('p',null,'Try a simulated voice search. No microphone access is required.'),btn('Search for pulmonologists',()=>{close();onNav('list');}));
    if(state.panel==='favorite') content=h('p',null,state.saved?'Specialist added to your saved list.':'Specialist removed from your saved list.');
    if(state.panel==='camera') content=h('p',null,state.active?'Rear camera selected (simulated preview).':'Front camera selected (simulated preview).');
    if(state.panel==='whatsapp') content=h('div',null,h('p',null,'Demo confirmation: your AgileDoc appointment is booked. No message has been sent.'),h('a',{className:'demo-button',href:'https://wa.me/?text='+encodeURIComponent('AgileDoc demo: my telemedicine appointment is confirmed.'),target:'_blank',rel:'noopener noreferrer'},'Open WhatsApp to share'));
    if(state.panel==='chat') content=h('div',null,h('p',null,'Dr. Pawan: How are you feeling today?'),...messages.map((m,i)=>h('p',{key:i,className:'demo-bubble'},m)),h('form',{onSubmit:e=>{e.preventDefault();if(message.trim()){setMessages([...messages,message.trim(),'Dr. Pawan: Thank you. We can discuss this during the consultation.']);setMessage('');}}},h('label',null,'Message',h('input',{value:message,onChange:e=>setMessage(e.target.value),required:true,maxLength:1000})),h('button',{className:'demo-button',type:'submit'},'Send')));
    return h('div',{className:'demo-backdrop',onClick:e=>{if(e.target===e.currentTarget)close();}},h('section',{className:'demo-panel',role:'dialog','aria-modal':true,'aria-label':titles[state.panel],tabIndex:-1,ref},h('header',null,h('h2',null,titles[state.panel]),btn('×',close,{'aria-label':'Close dialog'})),content));
  }
  function Layer({onNav,screen}) {
    const [state,setState]=React.useState(null);
    React.useEffect(()=>setState(null),[screen]);
    React.useEffect(()=>{const listener=e=>{if(e.detail.screen){setState(null);onNav(e.detail.screen);}else setState(e.detail);};document.addEventListener('agiledoc-action',listener);return()=>document.removeEventListener('agiledoc-action',listener);},[onNav]);
    return state?h(Panel,{key:state.panel,state,close:()=>setState(null),onNav}):null;
  }
  function StatusIcons() {
    const svg=(label,children)=>h('svg',{viewBox:'0 0 24 18',role:'img','aria-label':label,focusable:false},children);
    return h('div',{className:'phone-status-icons'},svg('Cellular signal',[
      h('rect',{key:1,x:2,y:11,width:4,height:4,rx:1.5,fill:'currentColor'}),
      h('rect',{key:2,x:8,y:8,width:4,height:7,rx:1.5,fill:'currentColor'}),
      h('rect',{key:3,x:14,y:5,width:4,height:10,rx:1.5,fill:'currentColor'}),
      h('rect',{key:4,x:20,y:2,width:4,height:13,rx:1.5,fill:'currentColor',opacity:.3})]),
      svg('Wi-Fi',[
      h('path',{key:1,d:'M2 5.5a15 15 0 0 1 20 0M5.5 9a10 10 0 0 1 13 0M9 12a5 5 0 0 1 6 0',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round'}),
      h('circle',{key:2,cx:12,cy:15,r:1.2,fill:'currentColor'})]),
      svg('Battery full',[
      h('rect',{key:1,x:1,y:3.5,width:19,height:11,rx:2.5,fill:'none',stroke:'currentColor',strokeWidth:1.5}),
      h('rect',{key:2,x:3,y:5.5,width:15,height:7,rx:1,fill:'currentColor'}),
      h('path',{key:3,d:'M22 7v4',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round'})]));
  }
  function BottomNav({screen,onNav}) {
    const tabs=[['home','Home','M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z'],['appointments','Appointments','M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2'],['messages','Messages','M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.8-5A9 9 0 1 1 21 11'],['patientprofile','Profile','M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 21v-2a7 7 0 0 1 14 0v2']];
    if(!tabs.some(([id])=>id===screen))return null;
    return h('nav',{className:'demo-bottom-nav','aria-label':'Main navigation'},tabs.map(([id,label,path])=>h('button',{key:id,type:'button','aria-label':label,'aria-current':screen===id?'page':undefined,onClick:()=>onNav(id)},h('svg',{viewBox:'0 0 24 24',fill:id==='home'&&screen===id?'currentColor':'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},h('path',{d:path})))));
  }
  function ScreenHeader({title,onNav}) {
    const svg=(children)=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},children);
    return h('header',{className:'demo-header'},h('div',{className:'demo-header-leading'},h('button',{className:'demo-icon-button',onClick:()=>onNav('home'),'aria-label':'Back to Home'},svg(h('path',{d:'m15 18-6-6 6-6'}))),h('h2',null,title)),h('button',{className:'demo-icon-button',onClick:()=>send({panel:'notifications'}),'aria-label':'Notifications'},svg([h('path',{key:'bell',d:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9'}),h('path',{key:'base',d:'M10 21h4'})]),h('span',{className:'demo-notification-dot','aria-hidden':true})));
  }
  function ExtraScreen({screen,onNav}) {
    const [opened,setOpened]=React.useState(false),[text,setText]=React.useState(''),[messages,setMessages]=React.useState(inbox),[editing,setEditing]=React.useState(false),[name,setName]=React.useState(patientName),[insurance,setInsurance]=React.useState(patientInsurance);
    React.useEffect(()=>{patientName=name;patientInsurance=insurance;inbox=messages;},[name,insurance,messages]);
    return h('div',{className:'demo-screen'},h(ScreenHeader,{title:screen==='messages'?'Messages':'My profile',onNav}),screen==='messages'?h('div',null,btn('Dr. Pawan — Consultation support',()=>setOpened(!opened)),opened&&h('div',null,h('p',null,'Dr. Pawan: Hello Stella! How can I help?'),...messages.map((m,i)=>h('p',{className:'demo-bubble',key:i},m)),h('form',{onSubmit:e=>{e.preventDefault();if(text.trim()){setMessages([...messages,text.trim(),'Dr. Pawan: Thank you for your message. This is a portfolio demo.']);setText('');}}},h('label',null,'Message',h('input',{value:text,onChange:e=>setText(e.target.value),required:true})),h('button',{className:'demo-button',type:'submit'},'Send')))):h('div',null,h('div',{className:'demo-avatar'},'SL'),editing?h('form',{onSubmit:e=>{e.preventDefault();setEditing(false);}},h('label',null,'Full name',h('input',{value:name,onChange:e=>setName(e.target.value),required:true})),h('label',null,'Insurance',h('input',{value:insurance,onChange:e=>setInsurance(e.target.value)})),h('button',{type:'submit',className:'demo-button'},'Save profile')):h('div',null,h('h3',null,name),h('p',null,insurance),btn('Edit profile',()=>setEditing(true))),btn('My appointments',()=>onNav('appointments')),btn('My consultation summary',()=>onNav('postcall'))));
  }
  return {action,Layer,ExtraScreen,ScreenHeader,BottomNav,StatusIcons,go,send};
}
