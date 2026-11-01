(() => {
 'use strict';
 const KEY='retrocenter_comercial_v12';
 const TODAY=new Date().toLocaleDateString('en-CA',{timeZone:'America/Lima'}); // usa fecha del navegador; ajustable
 const baseCompany={name:'RETROCENTER MULTISERVICIOS',tagline:'Soluciones integrales en ingeniería y automatización de procesos.',ruc:'',email:'',phone:'',address:''};
 const baseClient={name:'',document:'',email:'',phone:'',address:''};
 const basePayments=[
  {enabled:false,title:'Banco de Crédito (BCP)',detail:''},
  {enabled:false,title:'Interbank',detail:''},
  {enabled:false,title:'Yape / Plin',detail:''}
 ];
 const defaultTerms='Se requiere un adelanto del 50 % del monto total antes de iniciar los trabajos. El saldo restante se abonará al finalizar el servicio, previa conformidad del cliente.';
 function fresh(){return {type:'cotizacion',documentNo:'',issueDate:TODAY,validUntil:'',subject:'',introduction:'Por medio de la presente, remitimos nuestra propuesta económica de acuerdo con los productos y servicios detallados a continuación.',showSubject:false,company:{...baseCompany},client:{...baseClient},items:[],optional:[],currency:'PEN',discountPercent:0,taxMode:'none',recommendations:'',important:'',paymentTerms:defaultTerms,advancePercent:50,showAdvance:true,showPayments:true,showRecommendations:true,showImportant:true,showFooter:true,payments:structuredClone(basePayments),theme:{primary:'#102f41',secondary:'#b9d8e1',fontFamily:'Arial',applyToEditor:true},logo:''};}
 const cleanText=(v)=>String(v??'');
 function mergeSaved(value){const d=fresh(); if(!value || typeof value!=='object'||Array.isArray(value))return d; const obj={...d,...value,company:{...d.company,...(value.company||{})},client:{...d.client,...(value.client||{})},theme:{...d.theme,...(value.theme||{})}};if(!['Arial','Aptos','Calibri','Segoe UI','Tahoma','Verdana','Trebuchet MS','Helvetica Neue','Georgia','Cambria','Garamond','Times New Roman'].includes(obj.theme.fontFamily))obj.theme.fontFamily='Arial';obj.theme.applyToEditor=obj.theme.applyToEditor!==false;obj.items=Array.isArray(value.items)?value.items.slice(0,100).map(it=>({description:cleanText(it.description),details:cleanText(it.details),qty:Math.max(0,Number(it.qty)||0),price:it.price===''?'':Math.max(0,Number(it.price)||0)})):[];obj.optional=Array.isArray(value.optional)?value.optional.slice(0,100).map(it=>({description:cleanText(it.description),price:it.price===''?'':Math.max(0,Number(it.price)||0)})):[];obj.payments=Array.isArray(value.payments)?value.payments.slice(0,20).map(p=>({enabled:!!p.enabled,title:cleanText(p.title),detail:cleanText(p.detail)})):structuredClone(basePayments);return obj;}
 let model=fresh();try{const cached=localStorage.getItem(KEY);if(cached)model=mergeSaved(JSON.parse(cached));}catch(e){console.warn('Sin guardado local:',e)}
 const $=(s)=>document.querySelector(s); const $$=(s)=>Array.from(document.querySelectorAll(s));
 function set(path,value){const parts=path.split('.');let obj=model;for(let i=0;i<parts.length-1;i++)obj=obj[parts[i]];obj[parts.at(-1)]=value;persist();render();}
 function get(path){return path.split('.').reduce((o,k)=>o?.[k],model)}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(model))}catch(e){/* archivo o almacenamiento deshabilitado */}}
 const escape=(s)=>cleanText(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
 const money=(value)=> (model.currency==='USD'?'US$ ':'S/ ')+Number(value||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 const cents=x=>Math.round((Number(x)||0)*100)/100;
 const qtyVal=x=>Math.max(0,Number(x)||0);
 const sum=()=>{const sub=cents(model.items.reduce((a,it)=>a+cents(qtyVal(it.qty)*Math.max(0,Number(it.price)||0)),0));const disc=cents(sub*Math.min(100,Math.max(0,Number(model.discountPercent)||0))/100);const after=cents(sub-disc);let tax=0,net=after,total=after;if(model.taxMode==='add'){tax=cents(after*.18);total=cents(after+tax)}else if(model.taxMode==='included'){tax=cents(after-after/1.18);net=cents(after-tax)}return{sub,disc,after,net,tax,total,advance:cents(total*Math.min(100,Math.max(0,Number(model.advancePercent)||0))/100)};}
 function formatDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '—';const[y,m,d]=value.split('-');return `${d}/${m}/${y}`}
 function fillForm(){ $$('[data-bind]').forEach(el=>{const v=get(el.dataset.bind);if(el.type==='checkbox')el.checked=!!v;else el.value=v??'';});$$('[data-type]').forEach(el=>el.classList.toggle('active',el.dataset.type===model.type));$('#validityField').hidden=model.type!=='cotizacion';}
 function itemUI(){
  const dst=$('#itemsEditor');
  dst.innerHTML=model.items.map((it,i)=>`<div class="editCard"><div class="cardTop"><strong>Concepto ${i+1}</strong><div class="smallTools"><button type="button" class="miniBtn" data-move-item="${i}" data-dir="-1" title="Mover arriba" aria-label="Subir concepto ${i+1}">Subir</button><button type="button" class="miniBtn" data-move-item="${i}" data-dir="1" title="Mover abajo" aria-label="Bajar concepto ${i+1}">Bajar</button><button type="button" class="miniBtn remove" data-delete-item="${i}" aria-label="Quitar concepto ${i+1}">Quitar</button></div></div><div class="field"><label>Descripción</label><input data-item-index="${i}" data-item-key="description" value="${escape(it.description)}" placeholder="Producto o servicio"></div><div class="fields2"><div class="field"><label>Cantidad</label><input type="number" min="0" step="0.01" data-item-index="${i}" data-item-key="qty" value="${escape(it.qty)}"></div><div class="field"><label>Precio unitario</label><input type="number" min="0" step="0.01" data-item-index="${i}" data-item-key="price" value="${escape(it.price)}" placeholder="0.00"></div></div><details class="itemDetails"><summary>Agregar detalle del concepto</summary><div class="field" style="margin-top:11px;margin-bottom:0"><textarea data-item-index="${i}" data-item-key="details" rows="3" placeholder="Actividades incluidas, materiales, alcance...">${escape(it.details)}</textarea></div></details></div>`).join('')||'<p class="emptyState">Todavía no hay conceptos. Añade el primero para comenzar.</p>';
  $('#optionalEditor').innerHTML=model.optional.map((it,i)=>`<div class="editCard"><div class="cardTop"><strong>Servicio opcional ${i+1}</strong><button type="button" class="miniBtn remove" data-delete-optional="${i}">Quitar</button></div><div class="field"><label>Descripción</label><textarea rows="2" data-optional-index="${i}" data-optional-key="description">${escape(it.description)}</textarea></div><div class="field"><label>Precio referencial</label><input type="number" min="0" step="0.01" data-optional-index="${i}" data-optional-key="price" value="${escape(it.price)}"></div></div>`).join('')||'<p class="hint">No has añadido servicios opcionales.</p>';
 }

 function paymentUI(){ $('#paymentsEditor').innerHTML=model.payments.map((p,i)=>`<div class="paymentEditCard"><div class="paymentEditTop"><label class="switchLine" style="margin:0"><input type="checkbox" data-payment-index="${i}" data-payment-key="enabled" ${p.enabled?'checked':''}> ${escape(p.title||'Nuevo medio de pago')}</label><button type="button" class="miniBtn remove" data-delete-payment="${i}">Quitar</button></div><details class="itemDetails"><summary>Editar datos</summary><div class="field" style="margin-top:11px"><label>Nombre</label><input data-payment-index="${i}" data-payment-key="title" value="${escape(p.title)}"></div><div class="field"><label>Cuenta / CCI / referencia</label><textarea data-payment-index="${i}" data-payment-key="detail" rows="3">${escape(p.detail)}</textarea></div></details></div>`).join('')}

 function detail(label,value,wide=false){return `<div class="detail ${wide?'wide':''}"><small>${escape(label)}</small><span>${escape(value||'—')}</span></div>`}
 const fontStacks={
  'Arial':'Arial,Helvetica,sans-serif',
  'Aptos':'Aptos,Calibri,"Segoe UI",Arial,sans-serif',
  'Calibri':'Calibri,"Segoe UI",Arial,sans-serif',
  'Segoe UI':'"Segoe UI",Arial,sans-serif',
  'Tahoma':'Tahoma,Verdana,Arial,sans-serif',
  'Verdana':'Verdana,Geneva,Arial,sans-serif',
  'Trebuchet MS':'"Trebuchet MS",Arial,sans-serif',
  'Helvetica Neue':'"Helvetica Neue",Helvetica,Arial,sans-serif',
  'Georgia':'Georgia,"Times New Roman",serif',
  'Cambria':'Cambria,Georgia,"Times New Roman",serif',
  'Garamond':'Garamond,Georgia,"Times New Roman",serif',
  'Times New Roman':'"Times New Roman",Times,serif'
 };
 function updateTypography(){
  const selected=Object.prototype.hasOwnProperty.call(fontStacks,model.theme.fontFamily)?model.theme.fontFamily:'Arial';
  const font=fontStacks[selected];
  document.documentElement.style.setProperty('--doc-font',font);
  document.documentElement.style.setProperty('--interface-font',model.theme.applyToEditor?font:fontStacks.Arial);
  $('#fontSample').style.fontFamily=font;
 }
 function render(){updateTypography();document.documentElement.style.setProperty('--brand',/^#[a-f\d]{6}$/i.test(model.theme.primary)?model.theme.primary:'#102f41');document.documentElement.style.setProperty('--accent',/^#[a-f\d]{6}$/i.test(model.theme.secondary)?model.theme.secondary:'#b9d8e1');
  const title=model.type==='nota'?'NOTA DE VENTA':'COTIZACIÓN'; $('#stageName').textContent=title;$('#viewTitle').textContent=title;$('#viewDocNo').textContent=model.documentNo?'N.º '+model.documentNo:'N.º —';
  const logo=$('#paperLogo'),preview=$('#logoControlPreview'),hasLogo=!!(model.logo&&/^data:image\//.test(model.logo));
  logo.replaceChildren();preview.replaceChildren();logo.hidden=!hasLogo;
  if(hasLogo){const img=new Image();img.src=model.logo;img.className='paperLogo';img.alt='Logo del emisor';logo.append(img);const small=new Image();small.src=model.logo;small.alt='Vista previa del logotipo';preview.append(small)}
  else{const empty=document.createElement('span');empty.className='logoEmpty';empty.textContent='Sin logo';preview.append(empty)}
  $('#removeLogo').disabled=!hasLogo;
  $('#viewCompany').textContent=model.company.name||'NOMBRE DE LA EMPRESA';$('#viewTagline').textContent=model.company.tagline;$('#viewContact').textContent=[model.company.email,model.company.phone].filter(Boolean).join('  ·  ');$('#viewIssuerExtra').innerHTML=[model.company.ruc?`RUC: ${escape(model.company.ruc)}`:'',model.company.address?escape(model.company.address).replaceAll('\n','<br>'):''].filter(Boolean).join('<br>');
  $('#viewDates').innerHTML=`<div class="muted">Emisión</div><strong>${escape(formatDate(model.issueDate))}</strong>${model.type==='cotizacion'&&model.validUntil?`<div class="muted" style="margin-top:6px">Válida hasta</div><strong>${escape(formatDate(model.validUntil))}</strong>`:''}`;
  $('#viewIntro').textContent=(model.showSubject&&model.subject?model.subject+'\n':'')+model.introduction;$('#viewIntro').style.whiteSpace='pre-line';$('#viewIntro').hidden=!((model.showSubject&&model.subject)||model.introduction);
  $('#viewClient').innerHTML=detail('Nombre / Razón social',model.client.name,true)+[model.client.document?detail('DNI / RUC',model.client.document):'',model.client.phone?detail('Teléfono',model.client.phone):'',model.client.email?detail('Correo electrónico',model.client.email):'',model.client.address?detail('Dirección',model.client.address,true):''].join('');
  $('#viewItems').innerHTML=model.items.length?model.items.map(it=>`<tr><td>${escape(Number(qtyVal(it.qty).toFixed(2)).toString())}</td><td><div class="itemName">${escape(it.description||'—')}</div>${it.details?`<p class="itemDesc">${escape(it.details)}</p>`:''}</td><td>${it.price===''?'—':money(it.price)}</td><td>${it.price===''?'—':money(cents(qtyVal(it.qty)*(Number(it.price)||0)))}</td></tr>`).join(''):'<tr><td colspan="4" class="emptyItems">Agrega conceptos desde el editor para generar tu documento.</td></tr>';
  const a=sum(); $('#editorTotalPrice').textContent=money(a.total);
  $('#summaryType').textContent=model.type==='nota'?'Nota de venta':'Cotización';
  $('#summaryClient').textContent=model.client.name.trim()||'Sin asignar';
  $('#summaryAmount').textContent=money(a.total); const hasDisc=a.disc>0; const t=[`<div class="totalRow"><span>Subtotal</span><b>${money(a.sub)}</b></div>`];if(hasDisc)t.push(`<div class="totalRow"><span>Descuento (${Math.min(100,Math.max(0,Number(model.discountPercent)||0))}%)</span><b>− ${money(a.disc)}</b></div>`);if(model.taxMode==='add')t.push(`<div class="totalRow"><span>IGV (18%)</span><b>${money(a.tax)}</b></div>`);if(model.taxMode==='included'){t.push(`<div class="totalRow"><span>Base imponible</span><b>${money(a.net)}</b></div>`);t.push(`<div class="totalRow"><span>IGV incluido (18%)</span><b>${money(a.tax)}</b></div>`)}t.push(`<div class="totalRow final"><span>TOTAL</span><b>${money(a.total)}</b></div>`);$('#viewTotals').innerHTML=t.join('');
  const split=$('#viewAdvance'); split.hidden=!model.showAdvance; if(model.showAdvance)split.innerHTML=`<div><span>Adelanto (${Math.min(100,Math.max(0,Number(model.advancePercent)||0))}%)</span><strong>${money(a.advance)}</strong></div><div><span>Saldo al finalizar</span><strong>${money(cents(a.total-a.advance))}</strong></div>`;
  const options=model.optional.filter(x=>x.description.trim());$('#optionalSection').hidden=!options.length;$('#viewOptional').innerHTML=options.map(o=>`<tr><td>${escape(o.description).replaceAll('\n','<br>')}</td><td>${o.price===''?'A cotizar':money(o.price)}</td></tr>`).join('');
  const rec=model.recommendations.split('\n').map(x=>x.trim().replace(/^[-•*]\s*/,'' )).filter(Boolean);$('#recommendationsSection').hidden=!(model.showRecommendations&&rec.length);$('#viewRecommendations').innerHTML=rec.map(v=>`<li>${escape(v)}</li>`).join('');$('#importantSection').hidden=!(model.showImportant&&model.important.trim());$('#viewImportant').textContent=model.important;
  $('#paymentTermsSection').hidden=!model.paymentTerms.trim();$('#viewPaymentTerms').textContent=model.paymentTerms;
  const methods=model.payments.filter(p=>p.enabled&&(p.title.trim()||p.detail.trim()));$('#paymentMethodsSection').hidden=!(model.showPayments&&methods.length);$('#viewPayments').innerHTML=methods.map(p=>`<div class="paymentCard"><strong>${escape(p.title)}</strong><p>${escape(p.detail)}</p></div>`).join('');
  $('#viewFooter').hidden=!model.showFooter;$('#viewFooter').innerHTML=`<span>${escape(model.company.name)}${model.company.ruc?' · RUC '+escape(model.company.ruc):''}</span><span>${escape([model.company.email,model.company.phone].filter(Boolean).join(' · '))}</span>`;
 }
 function syncAll(){fillForm();itemUI();paymentUI();render()}
 function toast(text){const t=$('#toast');t.textContent=text;t.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.style.display='none',2500)}
 function openTab(tab){$$('[data-tab]').forEach(x=>{const selected=x.dataset.tab===tab;x.classList.toggle('active',selected);x.setAttribute('aria-current',selected?'step':'false')});$$('[data-panel]').forEach(x=>x.classList.toggle('active',x.dataset.panel===tab));document.querySelector('.control').scrollTo({top:0,behavior:'instant'});}
 $$('[data-tab]').forEach(el=>el.addEventListener('click',()=>openTab(el.dataset.tab)));
 $$('[data-go]').forEach(el=>el.addEventListener('click',()=>openTab(el.dataset.go)));
 $$('[data-type]').forEach(el=>el.addEventListener('click',()=>{set('type',el.dataset.type);fillForm();}));
 $$('[data-bind]').forEach(el=>el.addEventListener(el.type==='checkbox'?'change':'input',()=>{let value=el.type==='checkbox'?el.checked:el.value;if(el.type==='number')value=value===''?0:Number(value);set(el.dataset.bind,value)}));
 $('#itemsEditor').addEventListener('input',e=>{const el=e.target;if(!el.dataset.itemKey)return;const i=Number(el.dataset.itemIndex);let v=el.value;if(['price','qty'].includes(el.dataset.itemKey))v=v===''?'':Number(v);model.items[i][el.dataset.itemKey]=v;persist();render()});
 $('#itemsEditor').addEventListener('click',e=>{const del=e.target.closest('[data-delete-item]'),mov=e.target.closest('[data-move-item]');if(del){model.items.splice(Number(del.dataset.deleteItem),1);persist();itemUI();render()}else if(mov){const from=Number(mov.dataset.moveItem),to=from+Number(mov.dataset.dir);if(to>=0&&to<model.items.length){const [it]=model.items.splice(from,1);model.items.splice(to,0,it);persist();itemUI();render()}}});
 $('#optionalEditor').addEventListener('input',e=>{const el=e.target;if(!el.dataset.optionalKey)return;let v=el.value;if(el.dataset.optionalKey==='price')v=v===''?'':Number(v);model.optional[Number(el.dataset.optionalIndex)][el.dataset.optionalKey]=v;persist();render()});
 $('#optionalEditor').addEventListener('click',e=>{const el=e.target.closest('[data-delete-optional]');if(!el)return;model.optional.splice(Number(el.dataset.deleteOptional),1);persist();itemUI();render()});
 $('#paymentsEditor').addEventListener('input',e=>{const el=e.target;if(!el.dataset.paymentKey||el.type==='checkbox')return;model.payments[Number(el.dataset.paymentIndex)][el.dataset.paymentKey]=el.value;persist();render()});
 $('#paymentsEditor').addEventListener('change',e=>{const el=e.target;if(el.dataset.paymentKey==='enabled'){model.payments[Number(el.dataset.paymentIndex)].enabled=el.checked;persist();render()}});
 $('#paymentsEditor').addEventListener('click',e=>{const el=e.target.closest('[data-delete-payment]');if(el){model.payments.splice(Number(el.dataset.deletePayment),1);persist();paymentUI();render()}});
 $('#addItem').addEventListener('click',()=>{model.items.push({description:'',details:'',qty:1,price:''});persist();itemUI();render();$('#itemsEditor .editCard:last-of-type input')?.focus()});
 $('#addOptional').addEventListener('click',()=>{model.optional.push({description:'',price:''});persist();itemUI();render()});
 $('#addPayment').addEventListener('click',()=>{model.payments.push({enabled:true,title:'',detail:''});persist();paymentUI();render()});
 $('#logoUpload').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)){alert('Usa un logo PNG, JPG, WebP o SVG.');return}if(file.size>3*1024*1024){alert('El logo debe ocupar como máximo 3 MB.');return}const r=new FileReader();r.onload=()=>{model.logo=String(r.result||'');persist();render();toast('Logo actualizado')};r.readAsDataURL(file)});
 $('#removeLogo').addEventListener('click',()=>{model.logo='';$('#logoUpload').value='';persist();render();toast('Logo retirado')});
 $('#logoSelectButton').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#logoUpload').click()}});
 $$('[data-preset]').forEach(el=>el.addEventListener('click',()=>{const[p,s]=el.dataset.preset.split(',');model.theme={...model.theme,primary:p,secondary:s};persist();fillForm();render()}));
 function printDoc(){const noDescription=model.items.some(x=>!x.description.trim());const noPrice=model.items.some(x=>x.price===''||!Number.isFinite(Number(x.price)));if(!model.client.name.trim()||!model.items.length||noDescription||noPrice){if(!confirm('Faltan datos del cliente o conceptos con precio. ¿Deseas imprimir de todos modos?'))return}window.print()}
 $('#printTop').addEventListener('click',printDoc);
 $('#printStage').addEventListener('click',printDoc);
 function newDocument(){if(!confirm('¿Crear un documento nuevo? Se conservarán la empresa, los medios de pago, el logo y el diseño.'))return;const old=model;model=fresh();model.company={...old.company};model.theme={...old.theme};model.logo=old.logo;model.payments=structuredClone(old.payments);model.type=old.type;model.currency=old.currency;persist();syncAll();toast('Nuevo documento listo')}
 $('#newDoc').addEventListener('click',newDocument);
 $('#resetStorage').addEventListener('click',()=>{if(!confirm('¿Restablecer todos los datos de este editor?'))return;model=fresh();persist();syncAll();toast('Editor restablecido')});
 function sample(){const chosen=model.type;if(!confirm('¿Cargar el ejemplo basado en tu PDF de '+(chosen==='nota'?'nota de venta':'cotización')+'? Se reemplazará el documento actual.'))return;const x=fresh();x.type=chosen;x.company={...baseCompany};x.currency='PEN';x.payments=structuredClone(basePayments);x.company.tagline=chosen==='nota'?'Soluciones integrales en ingeniería y automatización de procesos.':'Soluciones integrales en ingeniería y procesos informáticos.';
 if(chosen==='nota'){
  x.documentNo='03.2024';x.issueDate='2024-12-01';x.client.name='Cliente de ejemplo';x.subject='Configuración e instalación de un sistema de alarma comunitaria HAGROY AlcomVOZ LTE';x.showSubject=true;
  x.introduction='Por medio de la presente, se detalla el servicio de configuración e instalación del sistema de alarma comunitaria.';
  x.items=[{qty:1,description:'Hagroy AlcomVOZ LTE',details:'• Instalación de aplicativo para 7 pulsadores inalámbricos Hagroy de 500 metros.\n• Implementación de computadora y configuración del programa Alcom.\n• Implementación y configuración de celulares para usuarios, de acuerdo con el listado proporcionado.\n• El servicio de cableado incluye materiales de instalación.',price:200}];
  x.optional=[{description:'Diagnóstico ante fallas del sistema, mantenimiento preventivo y limpieza de computadora. Se recomienda una revisión mensual.',price:10},{description:'Adición de pulsadores inalámbricos Hagroy de 500 metros al sistema.',price:20}];
  x.important='Se esperará el plazo de una semana para adicionar los números telefónicos a la computadora y habilitar el sistema de llamadas y perifoneo.';
 }else{
  x.documentNo='03.2025';x.issueDate='2026-10-31';x.client.name='Cliente de ejemplo';x.subject='Diagnóstico, mantenimiento correctivo y cambio del sistema de almacenamiento';x.showSubject=true;
  x.introduction='Presentamos la cotización para el servicio de diagnóstico, mantenimiento correctivo y cambio del sistema de almacenamiento.';
  x.items=[{qty:1,description:'Diagnóstico, mantenimiento correctivo y cambio del sistema de almacenamiento',details:'Alcance y precio por completar según evaluación.',price:''}];
  x.recommendations='Mantenimiento preventivo anual como mínimo.\nEvitar mantener el equipo suspendido durante periodos prolongados o permitir que se descargue completamente.\nAbrir la tapa del equipo desde el centro o con ambas manos para evitar forzar las bisagras.\nLa recuperación de datos por daño físico del disco requiere una evaluación especializada.';
 }
 x.theme={...model.theme};x.logo=model.logo;model=x;persist();syncAll();toast('Ejemplo cargado. Verifica y modifica los datos.');}
 $('#loadExample').addEventListener('click',sample);
 $('#downloadJSON').addEventListener('click',()=>{const data=new Blob([JSON.stringify({application:'Retrocenter-Documentos',version:'1.4.0',data:model},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=`${model.type==='nota'?'nota-de-venta':'cotizacion'}-${(model.documentNo||'sin-numero').replace(/[^\w.-]/g,'_')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Respaldo JSON descargado')});
 $('#importJSON').addEventListener('click',()=>$('#jsonFile').click());
 $('#jsonFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());if(!obj||!(obj.data||obj.items))throw Error('Estructura incorrecta');if(!confirm('¿Importar este documento y reemplazar los datos actuales?'))return;model=mergeSaved(obj.data||obj);persist();syncAll();toast('Documento restaurado')}catch(err){alert('No se pudo leer el JSON: '+err.message)}finally{e.target.value=''}});
 syncAll();
})();