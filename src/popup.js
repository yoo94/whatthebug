// 데이터 로드: public/error.json에서 상태코드 정보 읽기
let errorData = [];

// 영문 키워드 별칭 매핑
const aliasMap = {
  'not found': '404',
  'bad request': '400',
  'unauthorized': '401',
  'forbidden': '403',
  'method not allowed': '405',
  'not acceptable': '406',
  'proxy authentication required': '407',
  'request timeout': '408',
  conflict: '409',
  gone: '410',
  'length required': '411',
  'precondition failed': '412',
  'payload too large': '413',
  'uri too long': '414',
  'unsupported media type': '415',
  'range not satisfiable': '416',
  'expectation failed': '417',
  'too early': '425',
  'upgrade required': '426',
  'precondition required': '428',
  'too many requests': '429',
  'request header fields too large': '431',
  'unavailable for legal reasons': '451',
  'internal server error': '500',
  'not implemented': '501',
  'bad gateway': '502',
  'service unavailable': '503',
  'gateway timeout': '504',
  'http version not supported': '505'
};

async function loadData() {
  try {
    const res = await fetch('error.json');
    if (!res.ok) throw new Error('failed to load error.json');
    errorData = await res.json();
  } catch (e) {
    console.error(e);
    renderMessage('데이터를 불러오는 중 오류가 발생했습니다.');
  }
}

function normalize(str) {
  return (str || '').toString().trim().toLowerCase();
}

function resolveAlias(q) {
  return aliasMap[q] || q;
}

function searchError(query) {
  const raw = normalize(query);
  const q = resolveAlias(raw);
  if (!q) return [];

  // 모든 일치하는 항목들을 찾기
  const results = [];
  
  // 1. title(코드 숫자) 정확 일치
  const exactMatch = errorData.find(item => normalize(item.title) === q);
  if (exactMatch) results.push(exactMatch);
  
  // 2. subtitle에서 포함 검색
  const subtitleMatches = errorData.filter(item => 
    normalize(item.subtitle || '').includes(q) && !results.includes(item)
  );
  results.push(...subtitleMatches);
  
  // 3. reason/solve에서 포함 검색
  const contentMatches = errorData.filter(item => 
    (normalize(item.reason).includes(q) || normalize(item.solve).includes(q)) && 
    !results.includes(item)
  );
  results.push(...contentMatches);
  
  return results;
}

function renderMessage(msg) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `<div>${msg}</div>`;
}

function renderResult(results) {
  const resultDiv = document.getElementById('result');
  
  if (!results || results.length === 0) {
    renderMessage('검색 결과가 없습니다.');
    return;
  }

  // 결과가 1개일 때는 바로 상세 내용 표시
  if (results.length === 1) {
    renderSingleResult(results[0]);
    return;
  }

  // 결과가 여러 개일 때는 목록으로 표시
  renderResultList(results);
}

function renderSingleResult(item) {
  const resultDiv = document.getElementById('result');
  const subtitleHtml = item.subtitle ? `<div style="margin-top:2px; color:#000000; font-style:italic;">${escapeHtml(item.subtitle)}</div>` : '';

  resultDiv.innerHTML = `
    <div style="line-height:1.4">
      <div><strong>코드</strong>: ${item.title}${subtitleHtml}</div>
      <div style="margin-top:6px"><strong>설명</strong>: ${escapeHtml(item.reason)}</div>
      <div style="margin-top:6px"><strong>대처</strong>: ${escapeHtml(item.solve)}</div>
    </div>
  `;
}

function renderResultList(results) {
  const resultDiv = document.getElementById('result');
  
  let html = `<div style="margin-bottom:10px; font-weight:bold; color:#333;">검색 결과 ${results.length}개</div>`;
  
  results.forEach((item, index) => {
    const subtitleText = item.subtitle ? ` - ${item.subtitle}` : '';
    html += `
      <div class="result-item" data-index="${index}" style="
        padding: 8px; 
        margin: 4px 0; 
        border: 1px solid #ddd; 
        border-radius: 4px; 
        cursor: pointer;
        background: #f9f9f9;
        transition: background-color 0.2s;
      " 
      onmouseover="this.style.backgroundColor='#e6f3ff'" 
      onmouseout="this.style.backgroundColor='#f9f9f9'">
        <strong>${item.title}</strong>${subtitleText}
        <div style="font-size:12px; color:#666; margin-top:2px;">
          ${escapeHtml(item.reason.substring(0, 60))}...
        </div>
      </div>
    `;
  });
  
  resultDiv.innerHTML = html;
  
  // 클릭 이벤트 추가
  resultDiv.querySelectorAll('.result-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      renderSingleResult(results[index]);
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function handleSearch() {
  const inputEl = document.getElementById('searchInput');
  const q = inputEl.value;
  const results = searchError(q);
  renderResult(results);
}

// 초기화
(async function init() {
  await loadData();
  const btn = document.getElementById('searchBtn');
  const input = document.getElementById('searchInput');
  btn.addEventListener('click', handleSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // 숫자만 입력 시 바로 일치 검색 보조
  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (/^\d{3}$/.test(val)) {
      const results = searchError(val);
      if (results.length > 0) renderResult(results);
    }
  });
})();
