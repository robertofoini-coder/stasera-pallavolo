const rows=`
app|StaseraVolley|StaseraVolley
demo|Demo locale|Local demo
demoExplanation|Dati, persone, notifiche e permessi simulati nello stesso browser. Nessun account reale o sincronizzazione tra dispositivi.|Data, people, notifications and permissions are simulated in this browser. No real accounts or cross-device synchronization.
version|Versione|Version
actor|Personaggio demo|Demo character
demoPerson|Profilo dimostrativo|Demo profile
explore|Esplora|Explore
bookings|Prenotazioni|Bookings
groups|Gruppi|Groups
profile|Profilo|Profile
settings|Impostazioni|Settings
notifications|Notifiche|Notifications
requests|Gestione richieste|Request management
back|Indietro|Back
close|Chiudi|Close
ok|OK|OK
cancel|Annulla|Cancel
save|Salva modifiche|Save changes
yes|Conferma|Confirm
search|Cerca|Search
searchMatches|Cerca palestra, gruppo o località|Search gym, group or location
searchGroups|Cerca nome, palestra, città o provincia|Search name, gym, city or province
province|Provincia|Province
allProvinces|Tutte le province|All provinces
list|Elenco|List
map|Mappa|Map
mapCaption|Mappa demo per provincia: i punti indicano i gruppi, non indirizzi reali delle palestre.|Demo province map: points represent groups, not real gym addresses.
mapHint|Seleziona un punto per aprire il cartellino. Gli stessi filtri si applicano a elenco e mappa.|Select a point to open the group card. The same filters apply to list and map.
noResults|Nessun risultato con questi filtri.|No results for these filters.
allDates|Prossime serate|Upcoming matches
today|Oggi|Today
tomorrow|Domani|Tomorrow
week|Questa settimana|This week
exactDate|Scegli data|Choose date
groupCard|Cartellino del gruppo|Group card
demoGroup|Gruppo dimostrativo|Demo group
demoProfiles|Tutti i profili demo rappresentano persone adulte immaginarie. Le foto artificiali sono indicate come tali.|All demo profiles represent fictional adults. Artificial photos are labelled accordingly.
organizer|Organizzatore|Organizer
organizerNotPlaying|Organizzatore · non iscritto a questa partita|Organizer · not registered for this match
story|Storia del gruppo|Group history
bergamoStory|Gruppo del prototipo originale di Bergamo. La storia e i profili qui mostrati sono dimostrativi; i nomi originali dei gruppi sono conservati.|Group from the original Bergamo prototype. The history and profiles shown here are demonstrative; the original group names are preserved.
bresciaStory|Gruppo amatoriale completamente dimostrativo, creato per provare serate, richieste e riserve a Brescia. Non rappresenta un’associazione reale.|Entirely fictional recreational group, created to test matches, requests and substitutes in Brescia. It does not represent a real club.
usualVenue|Palestra abituale|Usual gym
usualDay|Giorno abituale|Usual day
openMap|Apri ricerca della località|Open location search
mapPrecision|Posizione indicativa del comune; nessun indirizzo verificato per gli impianti demo.|Approximate town location; no verified address for demo gyms.
members|Membri permanenti|Permanent members
membersCount|{n} membri del gruppo|{n} group members
membersVsPlayers|I membri appartengono al gruppo. Per prenotare una singola serata devi prima essere un membro approvato.|Members belong to the group. You must be an approved member before booking an individual match.
accessRules|Regole di adesione|Membership rules
join|Entra nel gruppo|Join group
joinRequest|Richiedi ingresso|Request membership
membershipPending|Richiesta di adesione in attesa|Membership request pending
alreadyMember|Sei membro del gruppo|You are a group member
upcoming|Prossime serate attive|Upcoming active matches
noUpcoming|Nessuna serata attiva. L’organizzatore può crearne una.|No active matches. The organizer can create one.
openMatch|Apri dettaglio partita|Open match details
newGroup|Crea gruppo|Create group
newMatch|Crea serata|Create match
editMatch|Modifica serata|Edit match
duplicateMatch|Duplica serata|Duplicate match
groupName|Nome del gruppo|Group name
city|Città|City
venue|Palestra o luogo demo|Demo gym or venue
description|Descrizione|Description
groupHistory|Storia (dimostrativa)|History (demo)
day0|Domenica|Sunday
day1|Lunedì|Monday
day2|Martedì|Tuesday
day3|Mercoledì|Wednesday
day4|Giovedì|Thursday
day5|Venerdì|Friday
day6|Sabato|Saturday
level_mixed|Amatoriale misto|Recreational mixed
level_intermediate|Intermedio misto|Intermediate mixed
accessManagement|Gestione accessi|Access management
memberApproval|Approvazione nuovi membri|New member approval
memberAuto|Ingresso automatico|Automatic membership
memberManual|Ingresso soggetto ad approvazione|Membership requires approval
bookingApproval|Approvazione prenotazioni|Booking approval
bookingAuto|Prenotazione immediata|Immediate booking
bookingManual|Prenotazione soggetta ad approvazione|Booking requires approval
independentRules|Ingresso nel gruppo e conferma della prenotazione hanno impostazioni separate. Per prenotare occorre prima essere membri approvati. Le richieste concluse non cambiano.|Group membership and booking confirmation have separate settings. Booking requires approved membership first. Completed requests remain unchanged.
saveAccess|Salva gestione accessi|Save access settings
matchDetails|Dettaglio partita|Match details
court|Campo|Court
participants|Partecipanti|Participants
info|Info|Info
registrationCount|{n} confermati · {pending} in attesa · {total} posti totali|{n} confirmed · {pending} pending · {total} total spots
available|{n} posti disponibili|{n} spots available
confirmedCount|{n} iscritti confermati|{n} confirmed players
book|Prenota un posto|Book a spot
requestBooking|Invia richiesta di prenotazione|Send booking request
chooseSeat|Scegli un posto nel campo tra quelli a disposizione|Choose an available spot on the court
selectedSeat|Posto selezionato: {slot}|Selected spot: {slot}
freeSeat|Posto libero|Free spot
position|Posizione {n}|Position {n}
reserve|Riserva R{n}|Substitute R{n}
selectReserve|Seleziona riserva R{n}|Select substitute R{n}
reserves|Riserve|Substitutes
yourSpot|Il tuo posto|Your spot
yourHold|La tua richiesta|Your request
teamA|Squadra A|Team A
teamB|Squadra B|Team B
held|Bloccato temporaneamente|Temporarily held
heldUntil|Bloccato fino a {date}|Held until {date}
holdExplanation|La candidatura blocca temporaneamente il posto. Rifiuto, scadenza o disdetta lo liberano; l’accettazione lo conferma.|A request temporarily holds the spot. Rejection, expiry or cancellation releases it; acceptance confirms it.
changeSeat|Conferma cambio posto|Confirm position change
yourBooking|La tua prenotazione|Your booking
cancelBooking|Disdici prenotazione|Cancel booking
cancelQuestion|Confermi la disdetta? Il posto tornerà disponibile.|Confirm cancellation? The spot will become available again.
refundRule|Rimborso demo della quota fino a 24 ore prima. La commissione non viene rimborsata.|Demo match-fee refund until 24 hours before the match. Commission is not refunded.
refundAmount|Rimborso demo previsto: {amount}. Commissione trattenuta.|Expected demo refund: {amount}. Commission retained.
meeting|Orario di ritrovo|Meeting time
fee|Quota per persona|Fee per person
warmup|Riscaldamento obbligatorio|Mandatory warm-up
warmupRule|30 minuti prima dell’inizio del gioco|30 minutes before play starts
playStarts|Inizio del gioco|Play starts
eveningEnds|Fine serata|End of match
date|Data|Date
startTime|Inizio gioco|Play start
endTime|Fine gioco|Play end
capacity|Capienza totale (2–30)|Total capacity (2–30)
weekly|Ripeti ogni settimana|Repeat weekly
until|Fino al giorno (incluso)|Until date (inclusive)
skipHolidays|Escludi festività nazionali italiane|Exclude Italian national holidays
holidayHint|Controllo festività nazionali, Pasqua e Pasquetta. Verificare patrono locale e chiusure palestra.|Checks national holidays, Easter and Easter Monday. Check local patron holidays and gym closures.
recurrencePreview|{n} serate da creare · {skipped} festivi esclusi|{n} matches to create · {skipped} holidays excluded
editNotice|Iscritti e richieste vengono conservati. I cambiamenti saranno notificati localmente agli iscritti. Le quote già concordate restano invariate.|Players and requests are preserved. Changes will be notified locally to participants. Previously agreed fees remain unchanged.
requestsIntro|Richieste e autorizzazioni sono simulate nello stesso browser. Cambia personaggio demo per provare i diversi ruoli.|Requests and permissions are simulated in this browser. Switch demo character to try different roles.
groupFilter|Gruppo|Group
typeFilter|Tipo|Type
statusFilter|Stato|Status
all|Tutti|All
membership|Adesione al gruppo|Group membership
booking|Prenotazione partita|Match booking
requestCreated|Richiesta del {date}|Requested on {date}
expires|Scade: {date}|Expires: {date}
accept|Accetta|Accept
reject|Rifiuta|Reject
history|Storico decisioni|Decision history
noRequests|Nessuna richiesta con questi filtri.|No requests match these filters.
noHistory|Nessuna decisione registrata.|No decisions recorded.
by|Decisione di {name}|Decision by {name}
status_pending|In attesa|Pending
status_confirmed|Confermata|Confirmed
status_accepted|Accettata|Accepted
status_rejected|Rifiutata|Rejected
status_expired|Scaduta|Expired
status_cancelled|Annullata|Cancelled
status_active|Attiva|Active
status_unpaid|Da pagare|Unpaid
status_paid|Pagato · demo|Paid · demo
status_refunded|Quota rimborsata · demo|Fee refunded · demo
status_retained|Quota trattenuta · demo|Fee retained · demo
status_joined|Ingresso nel gruppo|Joined group
status_moved|Posto modificato|Position changed
status_settingsChanged|Accessi aggiornati|Access settings updated
status_groupCreated|Gruppo creato|Group created
status_matchCreated|Serata creata|Match created
status_matchChanged|Serata aggiornata|Match updated
noNotifications|Nessuna notifica per questo personaggio.|No notifications for this character.
markRead|Segna tutte come lette|Mark all as read
notice_newRequest|Nuova richiesta da gestire|New request to review
notice_accepted|La richiesta è stata accettata|The request was accepted
notice_rejected|La richiesta è stata rifiutata|The request was rejected
notice_expired|La richiesta è scaduta: il posto è stato liberato|The request expired: the spot was released
notice_cancelled|La richiesta è stata annullata|The request was cancelled
notice_confirmed|Prenotazione confermata|Booking confirmed
notice_paid|Pagamento dimostrativo registrato|Demo payment recorded
notice_matchChanged|L’organizzatore ha aggiornato la serata|The organizer updated the match
notice_invitation|Nuovo invito a una partita|New match invitation
read|Letta|Read
unread|Non letta|Unread
goToMatch|Vai alla partita|Go to match
goToRequests|Apri Gestione richieste|Open request management
payment|Pagamento demo|Demo payment
pay|Simula pagamento|Simulate payment
paymentIntro|Simulazione: nessun addebito o trasferimento reale. Disponibile solo dopo la conferma della prenotazione.|Simulation: no real charge or transfer. Available only after booking confirmation.
method|Metodo|Method
commission|Commissione piattaforma (5%)|Platform commission (5%)
total|Totale|Total
paidMessage|Pagamento demo registrato.|Demo payment recorded.
paymentWait|Il pagamento sarà disponibile dopo la conferma della prenotazione.|Payment will be available once the booking is confirmed.
noBookings|Nessuna prenotazione per questo personaggio.|No bookings for this character.
pastMatches|Partite concluse|Past matches
rate|Valuta partita e giocatori|Rate match and players
ratingHelp|Valuta solo ciò che conosci. Campo, affidabilità e tecnica sono indipendenti. Dati demo locali.|Rate only what you know. Court, reliability and technique are independent. Local demo data.
venueRating|Valutazione struttura|Venue rating
reliability|Affidabilità|Reliability
technique|Tecnica|Technique
submitRatings|Invia valutazioni|Submit ratings
ratingsSent|Valutazioni già inviate|Ratings already submitted
profileTitle|Profilo giocatore|Player profile
fictionalAdult|Profilo dimostrativo · persona adulta immaginaria|Demo profile · fictional adult
artificialPhoto|Fotografia generata artificialmente|Artificially generated photograph
localPhoto|Foto caricata localmente|Locally uploaded photo
photoFallback|Foto non disponibile: avatar con iniziali|Photo unavailable: initials avatar
name|Nome visualizzato|Display name
role|Ruolo|Role
role_outside|Schiacciatore|Outside hitter
role_setter|Palleggiatore|Setter
role_middle|Centrale|Middle blocker
role_opposite|Opposto|Opposite hitter
role_libero|Libero|Libero
role_universal|Universale|All-rounder
level|Livello|Level
level_advanced|Avanzato|Advanced
level_beginner|Principiante|Beginner
bio|Presentazione|About me
demoBio|Profilo adulto immaginario per la demo di pallavolo. Nessuna identità reale è associata ai dati mostrati.|Fictional adult volleyball demo profile. No real identity is associated with the displayed data.
availability|Disponibilità|Availability
availablePlayer|Disponibile per inviti demo|Available for demo invitations
unavailablePlayer|Non disponibile per inviti|Not available for invitations
days|Giorni disponibili|Available days
strengths|Punti di forza|Strengths
attack|Attacco|Attack
reception|Ricezione|Reception
serve|Battuta|Serve
defence|Difesa|Defence
block|Muro|Block
uploadPhoto|Carica foto del personaggio|Upload character photo
removePhoto|Elimina foto caricata|Remove uploaded photo
photoHint|Le foto dei personaggi fittizi sono artificiali. Caricamenti personali restano solo in questo browser.|Fictional character photos are artificial. Personal uploads stay only in this browser.
editProfile|Modifica profilo|Edit profile
saveProfile|Salva profilo|Save profile
invitePlayer|Invita un giocatore|Invite a player
invite|Invita|Invite
inviteSent|Invito demo inviato|Demo invitation sent
invitation|Invito alla partita|Match invitation
invitationHint|Accettare l’invito apre la partita. Devi comunque scegliere un posto e seguire le regole di prenotazione.|Accepting an invitation opens the match. You must still choose a spot and follow booking rules.
acceptInvite|Accetta invito|Accept invitation
rejectInvite|Rifiuta invito|Decline invitation
theme|Tema|Theme
light|Chiaro|Light
dark|Scuro|Dark
auto|Automatico|Automatic
language|Lingua|Language
devicePreview|Anteprima dispositivo|Device preview
mobile|Smartphone|Smartphone
tablet|Tablet|Tablet
desktop|Desktop|Desktop
prototype|Configurazione prototipo|Prototype configuration
holdHours|Scadenza richieste di prenotazione (ore)|Booking request expiry (hours)
holdConfigHint|Valore demo iniziale: 24 ore. Le richieste esistenti mantengono la scadenza già assegnata.|Initial demo value: 24 hours. Existing requests keep their assigned expiry.
admin|Pannello amministratore demo|Demo administrator panel
adminHint|Per il rendiconto globale seleziona il personaggio Amministratore Demo. Non è un’autenticazione reale.|Select the Demo Administrator character for the global report. This is not real authentication.
adminCode|Codice locale dimostrativo (2468)|Local demo code (2468)
openAdmin|Apri rendiconto demo|Open demo report
charges|Quote e commissioni simulate|Simulated fees and commissions
refunds|Rimborsi simulati|Simulated refunds
noPayments|Nessun pagamento simulato.|No simulated payments.
resetDemo|Ripristina solo i dati V002|Reset only V002 data
resetQuestion|Vuoi ripristinare la demo V002? V000 e V001 non saranno toccate.|Reset the V002 demo? V000 and V001 will not be touched.
tutorial|Tutorial della schermata|Screen tutorial
tour_explore|Scegli zona e data, cerca una serata e apri il dettaglio. La prenotazione parte dalla partita.|Choose an area and date, search for a match and open its details. Booking starts from a match.
tour_groups|Cerca un gruppo o filtra per provincia. Elenco e mappa mostrano gli stessi risultati; apri un cartellino per vedere membri e serate.|Search a group or filter by province. List and map show the same results; open a card for members and matches.
tour_group|I membri sono permanenti e distinti dagli iscritti alle serate. Puoi entrare nel gruppo e aprire una delle prossime partite.|Members are permanent and separate from match attendees. Join the group and open an upcoming match.
tour_match|Scegli un posto libero o una riserva. Il pulsante si evidenzia. Le richieste in attesa bloccano il posto fino alla scadenza. Info riporta ritrovo e riscaldamento.|Choose a free field or substitute spot. The booking button is highlighted. Pending requests hold a spot until expiry. Info shows meeting and warm-up times.
tour_bookings|Qui trovi le tue prenotazioni. Puoi annullare una richiesta o una prenotazione e pagare solo quelle confermate.|Find your bookings here. Cancel a request or booking and pay only confirmed bookings.
tour_requests|Solo organizzatore o amministratore demo autorizzato può accettare o rifiutare. Ogni decisione aggiorna posti, storico e notifiche.|Only an organizer or authorized demo administrator can accept or reject. Each decision updates spots, history and notifications.
tour_profile|Modifica nome, ruolo, livello, capacità e disponibilità del personaggio demo. La fotografia può essere caricata o rimossa localmente.|Edit the demo character name, role, level, strengths and availability. Upload or remove a photo locally.
tour_settings|Tema e lingua valgono solo per V002. Le notifiche sono locali; il personaggio selezionato non è un account reale.|Theme and language apply only to V002. Notifications are local; the selected character is not a real account.
versionNotes|Confronto versioni|Version comparison
versionNotesBody|V002 aggiunge directory, gruppi permanenti, serate unificate, richieste con scadenza e gestione accessi indipendente. V000 e V001 restano originali e separate.|V002 adds a directory, permanent groups, unified matches, expiring requests and independent access management. V000 and V001 remain unchanged and separate.
errorTitle|Operazione non completata|Action not completed
unauthorized|Questo personaggio non è autorizzato a gestire il gruppo.|This character is not authorized to manage this group.
unknownPerson|Personaggio demo non trovato.|Demo character not found.
notFound|Elemento non trovato.|Item not found.
matchClosed|La partita non è più aperta alle prenotazioni.|The match is no longer open for booking.
duplicateRequest|Esiste già un’adesione, una richiesta o un invito attivo.|An active membership, request or invitation already exists.
duplicateBooking|Hai già una prenotazione o richiesta attiva per questa partita.|You already have an active booking or request for this match.
invalidSeat|Il posto selezionato non è valido per questa partita.|The selected spot is not valid for this match.
full|La partita è completa.|The match is full.
occupied|Il posto è occupato o bloccato temporaneamente. Scegli un altro posto.|The spot is occupied or temporarily held. Choose another spot.
alreadyDecided|La richiesta è già stata gestita. Non è possibile una seconda decisione.|This request has already been handled. A second decision is not allowed.
requestExpired|La richiesta è scaduta e non può essere approvata.|The request has expired and cannot be approved.
notActive|La prenotazione non è più attiva.|The booking is no longer active.
paymentNotAllowed|Il pagamento è consentito solo per prenotazioni confermate.|Payment is allowed only for confirmed bookings.
alreadyPaid|Il pagamento demo è già stato registrato.|The demo payment has already been recorded.
invalidPayment|Scegli Satispay o PayPal per la simulazione.|Choose Satispay or PayPal for the simulation.
invalidForm|Controlla i dati del modulo.|Check the form fields.
invalidDates|Scegli un intervallo valido con almeno una data disponibile (massimo 104 serate).|Choose a valid range with at least one available date (maximum 104 matches).
capacityTooSmall|La capienza non può essere inferiore alle prenotazioni confermate e ai blocchi temporanei.|Capacity cannot be below confirmed bookings and temporary holds.
occupiedReserve|Una riserva occupata o bloccata verrebbe eliminata. Libera prima quel posto.|An occupied or held substitute spot would be removed. Release that spot first.
futureDate|Scegli una data futura e orari validi.|Choose a future date and valid times.
invalidImage|Scegli un’immagine PNG, JPEG o WebP valida e di dimensioni ridotte.|Choose a valid, small PNG, JPEG or WebP image.
ratingNotAllowed|Puoi valutare solo una partita conclusa alla quale eri iscritto.|You can only rate a completed match you were registered for.
alreadyRated|Hai già inviato una valutazione per questa partita.|You have already submitted a rating for this match.
unknownAction|Operazione sconosciuta.|Unknown action.
storageError|Salvataggio locale non riuscito. Nessuna modifica confermata: verifica lo spazio disponibile.|Local save failed. No change was confirmed: check available storage.
invalidStorage|I dati V002 non sono leggibili. Puoi esportarli o ripristinare solo la V002 dalle Impostazioni.|V002 data cannot be read. Export it or reset only V002 from Settings.
conflict|I dati sono stati aggiornati in un’altra scheda. La vista è stata ricaricata: ricontrolla il posto.|Data changed in another tab. The view was refreshed: check your spot again.
saved|Modifiche salvate localmente.|Changes saved locally.
requestSent|Richiesta inviata; il posto è bloccato temporaneamente.|Request sent; the spot is temporarily held.
bookingConfirmed|Prenotazione confermata.|Booking confirmed.
cancelledMessage|Prenotazione annullata: posto liberato.|Booking cancelled: spot released.
decisionSaved|Decisione registrata e notifica locale generata.|Decision recorded and local notification created.
groupCreated|Gruppo creato. L’appartenenza non prenota automaticamente una serata.|Group created. Membership does not automatically book a match.
memberJoined|Adesione al gruppo registrata.|Group membership recorded.
membershipSent|Richiesta di adesione inviata all’organizzatore demo.|Membership request sent to the demo organizer.
matchSaved|Serata salvata. Iscritti e richieste conservati.|Match saved. Players and requests preserved.
ratingSaved|Valutazione demo salvata.|Demo rating saved.
system|Sistema demo|Demo system
noMembers|Nessun membro permanente.|No permanent members.
noParticipants|Nessuna prenotazione per questa partita.|No bookings for this match.
newYear|Capodanno|New Year's Day
epiphany|Epifania|Epiphany
liberation|Liberazione|Liberation Day
labour|Festa del Lavoro|Labour Day
republic|Festa della Repubblica|Republic Day
assumption|Ferragosto|Assumption Day
allSaints|Ognissanti|All Saints' Day
immaculate|Immacolata|Immaculate Conception
christmas|Natale|Christmas Day
boxing|Santo Stefano|Boxing Day
easter|Pasqua|Easter
easterMonday|Pasquetta|Easter Monday
francis|San Francesco d’Assisi|Saint Francis of Assisi
downloadData|Esporta dati demo V002|Export V002 demo data
noRealVenue|Palestra demo: nessun indirizzo reale dichiarato.|Demo gym: no real address is claimed.
joinFirst|Prima entra nel gruppo|Join the group first
membershipRequired|Per prenotare devi essere un membro approvato del gruppo.|You must be an approved group member before booking.
membershipWaiting|Richiesta inviata|Request sent
membershipWaitingHint|L’organizzatore deve approvare il tuo ingresso. Dopo potrai scegliere il posto e prenotare.|The organizer needs to approve your membership. Then you can select a seat and book.
stepDiscover|Scopri il gruppo|Discover the group
stepJoin|Entra nel gruppo|Join the group
stepBook|Scegli e prenota|Choose and book
uploadGroupLogo|Carica logo del gruppo|Upload group logo
removeGroupLogo|Rimuovi logo|Remove logo
courtPosition|Posizione preferita in campo|Preferred court position
organizerPositionHint|Quando organizzi una serata, il tuo posto viene confermato automaticamente in questa posizione.|When you organize a match, your seat is automatically confirmed in this position.
organizerNoSeat|Il posto preferito dell’organizzatore non è disponibile. Nessun giocatore esistente è stato spostato.|The organizer's preferred position is unavailable. No existing player has been moved.

`;
export const catalog={it:{},en:{}};for(const row of rows.trim().split('\n')){const [key,it,en]=row.split('|');catalog.it[key]=it;catalog.en[key]=en;}
export const missingKeys=new Set();
export function translator(language='it'){return (key,params={})=>{const text=catalog[language]?.[key];if(text===undefined){missingKeys.add(key);return `⟦${key}⟧`;}return text.replace(/\{(\w+)\}/g,(_,p)=>String(params[p]??''));};}
