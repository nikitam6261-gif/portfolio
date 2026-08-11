export const SUPABASE_URL='https://vvjuwtorumxhltrxejfc.supabase.co';
export const API_URL=`${SUPABASE_URL}/functions/v1/app-api`;
const KEY='pegas_flow_session_v1';
export const getToken=()=>localStorage.getItem(KEY)||'';
export const setToken=t=>t?localStorage.setItem(KEY,t):localStorage.removeItem(KEY);
export async function api(action,payload={}){
  const token=getToken();
  const initData=window?.Telegram?.WebApp?.initData||'';
  const r=await fetch(API_URL,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{ }),...(initData?{'x-telegram-init-data':initData}:{})},body:JSON.stringify({action,...payload})});
  const data=await r.json().catch(()=>({ok:false,error:`HTTP ${r.status}`}));
  if(r.status===401&&action!=='redeem_code'&&action!=='telegram_session') setToken('');
  if(!r.ok||data.ok===false) throw new Error(data.error||`HTTP ${r.status}`);
  return data;
}
export async function telegramSession(){const initData=window?.Telegram?.WebApp?.initData||'';if(!initData)return null;const d=await api('telegram_session',{initData});setToken(d.token);return d}
export async function redeemCode(code){const d=await api('redeem_code',{code});setToken(d.token);return d}
