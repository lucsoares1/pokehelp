export const normalizeSearch = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').toLowerCase().trim();
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const formatNumber = value => value==null?'Não informado':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
export const percent = (value,scale='fraction') => value==null?'Não informado':`${formatNumber(scale==='fraction'?value*100:value)}%`;

export function localized(dictionary, fallback, namespace, id) {
  const pt=dictionary[namespace]?.[id], en=fallback[namespace]?.[id];
  if((pt!=null&&typeof pt!=='string')||(en!=null&&typeof en!=='string'))throw new Error(`Tradução inválida: ${namespace}.${id}`);
  return {text:pt??en??id,language:pt!=null?'pt':en!=null?'en':'missing'};
}

export function explainText(text, dictionary, fallback, depth=0) {
  if(depth>5)return String(text);
  const merged=Object.assign({ADJACENT:'adjacentes',GOLD:'ouro'},fallback.stat,fallback.damage,fallback.status,fallback.synergy,dictionary.stat,dictionary.damage,dictionary.status,dictionary.synergy);
  return String(text??'')
    .replace(/\$t\((\w+)\.([\w]+)\)/g,(_,ns,id)=>explainText(localized(dictionary,fallback,ns,id).text,dictionary,fallback,depth+1))
    .replace(/\[([\d.,\s+%-]+?)(?:,\s*(SP|AP|AD))?\s*\]/g,(_,values,scaling)=>`${values.split(',').map(s=>s.trim()).join(' / ')}${scaling?' (escala com '+(scaling==='AD'?'Ataque':'Poder de Habilidade')+')':''}`)
    .replace(/\b[A-Z][A-Z_]+\b/g,token=>typeof merged[token]==='string'?merged[token]:token)
    .replace(/\{\{([^}]+)\}\}/g,(_,name)=>`(valor variável: ${name})`);
}

export function rangeProfile(range) {
  if(!Number.isFinite(range)||range<0)throw new Error('Alcance inválido');
  return {kind:range<=1?'melee':'ranged',label:range<=1?'Corpo a corpo':'À distância',reason:`Alcance base ${range}; modificadores de itens e habilidades podem alterá-lo.`};
}
