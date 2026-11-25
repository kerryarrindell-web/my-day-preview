/* My Day v1.1 development add-on. Uses existing S, save, render, modal, and tabs. */
(function(){
'use strict';
const verses=[
['The LORD is my shepherd; I shall not want.','Psalm 23:1'],
['I can do all things through Christ which strengtheneth me.','Philippians 4:13'],
['Be still, and know that I am God.','Psalm 46:10'],
['Casting all your care upon him; for he careth for you.','1 Peter 5:7'],
['This is the day which the LORD hath made; we will rejoice and be glad in it.','Psalm 118:24'],
['Trust in the LORD with all thine heart; and lean not unto thine own understanding.','Proverbs 3:5'],
['Rejoice evermore.','1 Thessalonians 5:16'],
['Pray without ceasing.','1 Thessalonians 5:17'],
['In every thing give thanks: for this is the will of God in Christ Jesus concerning you.','1 Thessalonians 5:18'],
['Let all your things be done with charity.','1 Corinthians 16:14'],
['The LORD is my light and my salvation; whom shall I fear?','Psalm 27:1'],
['The LORD is good unto them that wait for him, to the soul that seeketh him.','Lamentations 3:25']
];
const day=()=>todayStr();
const verse=()=>{const [y,m,d]=day().split('-').map(Number);return verses[Math.floor(Date.UTC(y,m-1,d)/86400000)%verses.length]};
const safe=t=>esc(String(t??''));
const btn=(label,fn)=>`<button class="a-cal" onclick="MyDay11.${fn}()">${label}</button>`;
function noteCard(){
 const active=S.notes.filter(n=>n.pin&&!n.v11done),done=S.notes.filter(n=>n.v11done);
 return `<section class="card md11-rise"><h2>📌 Home sticky notes</h2><div class="md11-grid">${active.slice(0,4).map(n=>`<article class="md11-sticky" data-md11-note="${n.id}" style="background:${/^#[0-9a-fA-F]{6}$/.test(n.color)?n.color:'#fff3a8'}"><div>${safe(n.text)||'📷 Photo note'}</div>${n.img?'<div class="meta">📷 Photo attached</div>':''}<div class="md11-actions"><button onclick="MyDay11.edit('${n.id}')">Edit</button><button onclick="MyDay11.toggle('${n.id}')">✓ Done</button></div></article>`).join('')}</div>${active.length?'':'<p class="meta">Pin a note to see it on Today.</p>'}<div class="acts">${btn('＋ New sticky note','newNote')}${btn('All notes','notes')}</div>${done.length?`<details><summary>✓ Completed notes (${done.length})</summary>${done.map(n=>`<div class="row"><span class="txt">${safe(n.text)}</span><button class="a-cal" onclick="MyDay11.toggle('${n.id}')">Restore</button></div>`).join('')}</details>`:''}</section>`;
}
function motivationVerse(){if(S.settings.v11verse===false)return '';const [t,ref]=verse();return `<section class="card md11-rise"><h2>📖 Verse of the Day · KJV</h2><blockquote class="md11-verse">“${safe(t)}”<div class="meta">${safe(ref)}</div></blockquote><div class="acts">${btn('Copy verse','copyVerse')}${btn('Share','shareVerse')}</div></section>`}
function priorityIds(){return Array.isArray(S.settings.v11PriorityIds)?S.settings.v11PriorityIds:[]}
function priorities(){
 const td=day(),open=tasksFor(td).filter(t=>!isDone(t,td)),ids=priorityIds();
 const selected=ids.map(id=>open.find(t=>t.id===id)).filter(Boolean).slice(0,3);
 return `<section class="card md11-rise"><h2>⭐ Today's top 3 priorities</h2><p class="meta">Choose up to three tasks to focus on.</p>${selected.length?selected.map(t=>`<div class="row"><button class="chk" onclick="toggleTask('${t.id}','${td}')" aria-label="Complete priority">✓</button><div class="txt" onclick="taskModal('${t.id}')">${safe(t.t)}</div><button class="a-del" onclick="MyDay11.priority('${t.id}')">Remove</button></div>`).join(''):'<p class="meta">No priorities selected yet.</p>'}${open.filter(t=>!ids.includes(t.id)).length&&selected.length<3?`<details><summary>＋ Choose a priority</summary>${open.filter(t=>!ids.includes(t.id)).map(t=>`<div class="row"><span class="txt">${safe(t.t)}</span><button class="a-cal" onclick="MyDay11.priority('${t.id}')">Choose</button></div>`).join('')}</details>`:''}</section>`
}
function tomorrow(){const d=addDays(day(),1),tasks=S.tasks.filter(t=>occursOn(t,d)&&!isDone(t,d)).slice(0,3),appts=S.appts.filter(a=>a.date===d).slice(0,3);return `<section class="card md11-rise"><h2>🌙 Tomorrow preview</h2>${tasks.map(t=>`<p class="meta">✓ ${safe(t.t)}</p>`).join('')}${appts.map(a=>`<p class="meta">📅 ${safe(a.title||a.t||'Appointment')}</p>`).join('')}${!tasks.length&&!appts.length?'<p class="meta">Nothing planned yet.</p>':''}</section>`}
function shopping(){const l=S.lists.find(l=>l.id==='groc'),n=l?l.items.filter(i=>!i.done).length:0;return `<section class="card md11-rise"><h2>🛒 Shopping</h2><p class="meta">${n} item${n===1?'':'s'} remaining</p>${btn('Open shopping list','shopping')}</section>`}
function backupCard(){const last=S.settings.v11BackupDismissed,elapsed=last?(Date.now()-Date.parse(last+'T00:00:00'))/86400000:999;return elapsed>=7?`<section class="card md11-rise"><h2>💾 Backup reminder</h2><p class="meta">Your data is stored on this phone. Export a backup to protect it.</p><div class="acts">${btn('Export backup','backup')}${btn('Remind next week','snooze')}</div></section>`:''}
function renderExtras(){return noteCard()+priorities()+tomorrow()+shopping()+backupCard()}
const originalToday=vToday;
vToday=function(){
 const base=originalToday();
 const motivation=motiCard();
 const extra=motivationVerse()+renderExtras();
 return motivation&&base.includes(motivation)
   ?base.replace(motivation,motivation+extra)
   :extra+base;
};
const originalRender=render;
render=function(){originalRender();let fab=document.getElementById('md11-fab');if(tab==='today'){if(!fab){fab=document.createElement('button');fab.id='md11-fab';fab.textContent='＋ Quick Add';fab.onclick=()=>MyDay11.quick();document.body.appendChild(fab)}}else if(fab)fab.remove()};
const originalSettings=openSettings;
openSettings=function(){originalSettings();const modal=document.querySelector('#modal');if(!modal)return;const node=document.createElement('div');node.innerHTML=`<label>Daily KJV Bible verse</label><div class="seg"><button class="${S.settings.v11verse!==false?'on':''}" onclick="MyDay11.verseSetting(true)">Show</button><button class="${S.settings.v11verse===false?'on':''}" onclick="MyDay11.verseSetting(false)">Hide</button></div>`;modal.appendChild(node)};
const originalBackup=backup;
window.MyDay11={
 newNote(){openModal('<h2>📌 New sticky note</h2><textarea id="md11-note-text" rows="5" placeholder="Write a reminder…"></textarea><div class="mbtns"><button class="btn" onclick="MyDay11.saveNote()">Stick to Today</button><button class="btn alt" onclick="closeModal()">Cancel</button></div>')},
 saveNote(){const t=document.getElementById('md11-note-text')?.value.trim();if(!t)return;S.notes.unshift({id:uid(),text:t,color:noteColor,pin:true,img:'',v11done:false});save();closeModal();render();toast('Note pinned ✨')},
 toggle(id){const n=S.notes.find(n=>n.id===id);if(!n)return;
 const completing=!n.v11done;
 // Persist immediately, before any animation; repeated taps cannot lose the update.
 n.v11done=completing;
 if(!completing)n.pin=true;
 save();
 const tile=completing?Array.from(document.querySelectorAll('[data-md11-note]')).find(el=>el.dataset.md11Note===String(id)):null;
 const animated=tile&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(animated){tile.classList.add('md11-completing');tile.querySelectorAll('button').forEach(b=>b.disabled=true);setTimeout(()=>{render();toast('✨ Note completed')},380)}
 else{render();toast(completing?'Note completed':'Note restored')}
 },
 priority(id){const task=S.tasks.find(t=>t.id===id);if(!task)return;const ids=priorityIds().filter(x=>x!==id);if(!priorityIds().includes(id)&&ids.length<3)ids.push(id);S.settings.v11PriorityIds=ids;save();render()},
 edit(id){noteModal(id)},notes(){tab='notes';render()},shopping(){tab='lists';curList='groc';render()},
 quick(){openModal('<h2>✨ Quick Add</h2><div class="mbtns"><button class="btn" onclick="MyDay11.newNote()">📌 Sticky note</button><button class="btn alt" onclick="MyDay11.jump(\'today\',\'nt\')">✓ Task</button><button class="btn alt" onclick="MyDay11.jump(\'lists\',\'ni\')">🛒 Shopping item</button><button class="btn alt" onclick="MyDay11.jump(\'appts\')">📅 Appointment</button></div>')},
 jump(t,id){closeModal();tab=t;if(t==='lists')curList='groc';render();if(id)setTimeout(()=>document.getElementById(id)?.focus(),50)},
 copyVerse(){const [t,r]=verse();const v=`“${t}” — ${r} (KJV)`;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(v).then(()=>toast('Verse copied')).catch(()=>toast('Copy unavailable'));else toast('Copy unavailable')},
 shareVerse(){const [t,r]=verse();const v=`“${t}” — ${r} (KJV)`;if(navigator.share)navigator.share({text:v}).catch(()=>{});else this.copyVerse()},
 verseSetting(show){S.settings.v11verse=show;save();render();openSettings()},
 backup(){originalBackup();openModal('<h2>💾 Backup check</h2><p>Please check that the backup JSON file is saved in Downloads before confirming.</p><div class="mbtns"><button class="btn" onclick="MyDay11.confirmBackup()">I saved the backup</button><button class="btn alt" onclick="closeModal()">Not saved yet</button></div>')},
 confirmBackup(){S.settings.v11BackupDismissed=day();save();closeModal();render();toast('Backup reminder updated')},snooze(){S.settings.v11BackupDismissed=day();save();render()}
};
render();
})();
