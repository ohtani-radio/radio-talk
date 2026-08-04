const escapeHTML = (s) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function formatText(text){
  const lines = text.replace(/\r/g,'').split('\n');
  let html = '';
  let inList = false;
  const closeList = () => { if(inList){ html += '</ul>'; inList = false; } };

  for(const raw of lines){
    const line = raw.trim();
    if(!line){ closeList(); continue; }
    if(line.startsWith('◆')){ closeList(); html += `<h4>${escapeHTML(line.slice(1).trim())}</h4>`; }
    else if(line.startsWith('■')){ closeList(); html += `<h5>${escapeHTML(line.slice(1).trim())}</h5>`; }
    else if(line.startsWith('・')){
      if(!inList){ html += '<ul>'; inList = true; }
      html += `<li>${escapeHTML(line.slice(1).trim())}</li>`;
    }
    else if(line.startsWith('>')){ closeList(); html += `<blockquote>${escapeHTML(line.slice(1).trim())}</blockquote>`; }
    else { closeList(); html += `<p>${escapeHTML(line)}</p>`; }
  }
  closeList();
  return html;
}

async function loadText(path){
  const res = await fetch(path, {cache:'no-store'});
  if(!res.ok) throw new Error(path);
  return await res.text();
}

async function init(){
  try{ document.getElementById('theme-title').textContent = (await loadText('text/title.txt')).trim(); }
  catch{ document.getElementById('theme-title').textContent = 'テーマを読み込めませんでした'; }

  document.querySelectorAll('.script-box').forEach(async box => {
    try{ box.innerHTML = formatText(await loadText(box.dataset.text)); }
    catch{ box.textContent = '原稿を読み込めませんでした'; }
  });

  const buttons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tab-panel');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    panels.forEach(p => { p.hidden = true; p.classList.remove('active'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    const panel = document.querySelector(`[data-panel="${btn.dataset.tab}"]`);
    panel.hidden = false; panel.classList.add('active');
  }));
}

document.addEventListener('DOMContentLoaded', init);
