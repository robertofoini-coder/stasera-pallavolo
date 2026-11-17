import React,{useEffect,useState} from 'react';
export function AdminPhotos({sb}){
 const [items,setItems]=useState([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function load(){const r=await sb.rpc('pending_avatars');if(r.error)setMessage(r.error.message);else setItems(r.data||[]);}
 useEffect(()=>{load();},[]);
 async function decide(item,approve){setBusy(true);try{const r=await sb.rpc('decide_avatar',{p_id:item.id,p_approve:approve,p_reasons:approve?[]:['NOT_PROFILE_PHOTO']});if(r.error)throw r.error;if(r.data){const removed=await sb.storage.from('avatars').remove([r.data]);if(removed.error)setMessage('Decisione salvata; pulizia del vecchio file non riuscita.');}await load();}catch(e){setMessage(e.message);}finally{setBusy(false);}}
 return <section className="panel"><h2>Foto profilo da approvare</h2>{message&&<p>{message}</p>}{!items.length&&<p>Nessuna foto in attesa.</p>}{items.map(item=><article key={item.id} style={{padding:16}}><img src={sb.storage.from('avatars').getPublicUrl(item.path).data.publicUrl} alt={`Foto inviata da ${item.display_name}`} style={{width:100,height:100,objectFit:'cover',borderRadius:16}}/><p>{item.display_name}</p><button className="primary" disabled={busy} onClick={()=>decide(item,true)}>Approva</button> <button className="outline" disabled={busy} onClick={()=>decide(item,false)}>Rifiuta: foto non adatta</button></article>)}</section>;
}
