I18n.insert(document.querySelector('#settings'),'beforeend','<div class="card form-card" style="margin-top:14px"><label for="languageSelect">Lingua</label><select id="languageSelect"><option value="it" data-no-i18n>Italiano</option><option value="en" data-no-i18n>English</option></select></div>');
const languageSelect=document.getElementById('languageSelect');languageSelect.value=I18n.language;
languageSelect.onchange=()=>I18n.setLanguage(languageSelect.value);
I18n.apply();
function refreshLocalizedViews(){renderGroups();if(document.querySelector('#groupDetail.active'))renderGroupDetail();if(document.querySelector('#groupInvite.active'))renderAvailablePlayers();if(document.querySelector('#details.active')){refreshDetail();renderPositionPanel();}if(!document.querySelector('#tourOverlay').hidden)renderContextualTour();document.querySelectorAll('[data-choice-group="days"] button').forEach((button,index)=>{button.textContent=I18n.language==='en'?['M','T','W','T','F','S','S'][index]:['L','M','M','G','V','S','D'][index];button.setAttribute('aria-label',I18n.t(button.dataset.value));});}
document.addEventListener('languagechange',refreshLocalizedViews);
refreshLocalizedViews();
