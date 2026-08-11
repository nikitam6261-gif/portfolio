export const SUPABASE_URL='https://vvjuwtorumxhltrxejfc.supabase.co';
export const API_URL=`${SUPABASE_URL}/functions/v1/pegas-flow-api`;
const KEY='pegas_flow_session_v3';
try{localStorage.removeItem('pegas_flow_session_v1');localStorage.removeItem('pegas_flow_session_v2')}catch{}
export const getToken=()=>localStorage.getItem(KEY)||'';
export const setToken=t=>t?localStorage.setItem(KEY,t):localStorage.removeItem(KEY);
export async function api(action,payload={}){
  const token=getToken();
  const initData=window?.Telegram?.WebApp?.initData||'';
  let r;
  try{
    r=await fetch(API_URL,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{ }),...(initData?{'x-telegram-init-data':initData}:{})},body:JSON.stringify({action,...payload})});
  }catch{
    throw new Error('Нет связи с сервером PEGAS FLOW. Проверь интернет и повтори попытку.');
  }
  const data=await r.json().catch(()=>({ok:false,error:`HTTP ${r.status}`}));
  if(r.status===401&&!['redeem_code','telegram_session','health'].includes(action)) setToken('');
  if(!r.ok||data.ok===false) throw new Error(data.error||`HTTP ${r.status}`);
  return data;
}
export async function telegramSession(){const initData=window?.Telegram?.WebApp?.initData||'';if(!initData)return null;const d=await api('telegram_session',{initData});setToken(d.token);return d}
export async function redeemCode(code){const clean=String(code||'').replace(/\D/g,'');if(clean.length!==6)throw new Error('Код должен содержать 6 цифр');const d=await api('redeem_code',{code:clean});setToken(d.token);return d}
