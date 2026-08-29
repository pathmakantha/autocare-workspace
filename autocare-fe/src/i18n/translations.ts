// Ported verbatim from the AutoCare.dc.html design reference's STRINGS dictionary.
export type Lang = 'en' | 'si' | 'ta' | 'hi' | 'ru';

export interface Strings {
  tagline: string; secure: string;
  welcomeBack: string; createAccount: string; login: string; signUp: string;
  fullName: string; enterName: string; email: string; password: string;
  noAccount: string; haveAccount: string;
  or: string; continueGuest: string; guestNote: string;
  guestNote2: string; fillFields: string;
  hello: string; fleetToday: string; overview: string;
  vehicles: string; expiringSoon: string; next: string; view: string;
  recentVehicles: string; seeAll: string; noVehiclesYet: string;
  addVehicleShort: string; addNewVehicle: string; registerNew: string;
  yourFleet: string; add: string; searchPh: string;
  editDetails: string; cancel: string; confirmRemove: string; removeMachine: string;
  noVehiclesFound: string; noMatch: string;
  urgent: string; dueSoon: string; healthy: string;
  dashboard: string; settings: string; profile: string; account: string;
  editProfile: string; appPermissions: string; subscription: string;
  notificationTimings: string; days30: string; days14: string;
  days7: string; day1: string; system: string; pushNotifications: string;
  appearance: string; darkMode: string; darkModeDesc: string; language: string;
  logout: string; resetGuest: string; confirm: string;
  guestUser: string; localMode: string;
  back: string; addVehicleT: string; editVehicleT: string; basicInfo: string;
  vehicleName: string; vehicleNamePh: string; regNumber: string;
  vehicleType: string; typePh: string; modelDetails: string;
  brand: string; model: string; year: string; odometer: string; currentMileage: string;
  expiryDates: string; licenseExpiry: string; insuranceExpiry: string;
  emissionTest: string; serviceReminder: string; saveMachine: string;
  fillRequired: string; guestLimit: string;
  history: string; totalSpent: string; services: string; avgCost: string;
  noRecords: string; addServiceRecord: string; serviceType: string;
  serviceTypePh: string; serviceDate: string; mileage: string; cost: string;
  notes: string; notesPh: string; save: string; mi: string;
  upcomingReminders: string; remindersNote: string;
  nothingExpiring: string; today: string; dLeft: string;
  name: string; phone: string; saveChanges: string; savedMsg: string;
  permNote: string;
  permNotif: string; permNotifDesc: string;
  permLocation: string; permLocationDesc: string;
  permCamera: string; permCameraDesc: string;
  permStorage: string; permStorageDesc: string;
  allowed: string; denied: string; ofFour: string;
  currentPlan: string; planFree: string; planPro: string; planFleet: string;
  freeDesc: string; proDesc: string;
  fleetDesc: string;
  perMonth: string; forever: string; currentLabel: string; planChanged: string;
  vehiclesUsed: string;
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    tagline: 'Precision Vehicle Concierge', secure: 'Secure • Reliable • Automated',
    welcomeBack: 'Welcome Back', createAccount: 'Create Account', login: 'Login', signUp: 'Sign Up',
    fullName: 'Full Name', enterName: 'Enter your name', email: 'Email', password: 'Password',
    noAccount: "Don't have an account? Sign Up", haveAccount: 'Already have an account? Login',
    or: 'OR', continueGuest: 'Continue as Guest', guestNote: 'Add up to 1 vehicle without an account.',
    guestNote2: 'Data is stored locally.', fillFields: 'Please fill all fields',
    hello: 'Hello', fleetToday: 'How is your fleet today?', overview: 'Overview',
    vehicles: 'Vehicles', expiringSoon: 'Expiring Soon', next: 'Next', view: 'View',
    recentVehicles: 'Recent Vehicles', seeAll: 'See All', noVehiclesYet: 'No vehicles added yet.',
    addVehicleShort: '+ Add Vehicle', addNewVehicle: 'Add New Vehicle', registerNew: 'Register a new machine to your fleet',
    yourFleet: 'Your Fleet', add: '+ Add', searchPh: 'Search by name, plate, or brand',
    editDetails: 'Edit Details', cancel: 'Cancel', confirmRemove: 'Confirm Remove', removeMachine: 'Remove Machine',
    noVehiclesFound: 'No vehicles found.', noMatch: 'No vehicles match your search.',
    urgent: 'Urgent', dueSoon: 'Due Soon', healthy: 'Healthy',
    dashboard: 'Dashboard', settings: 'Settings', profile: 'Profile', account: 'Account',
    editProfile: 'Edit Profile', appPermissions: 'App Permissions', subscription: 'Subscription',
    notificationTimings: 'Notification Timings', days30: '30 Days Before Expiry', days14: '14 Days Before Expiry',
    days7: '7 Days Before Expiry', day1: '1 Day Before Expiry', system: 'System', pushNotifications: 'Push Notifications',
    appearance: 'Appearance', darkMode: 'Dark Mode', darkModeDesc: 'Easier on the eyes at night', language: 'Language',
    logout: 'Logout', resetGuest: 'Reset Guest Data', confirm: 'Confirm',
    guestUser: 'Guest User', localMode: 'Local storage mode',
    back: 'Back', addVehicleT: 'Add Vehicle', editVehicleT: 'Edit Vehicle', basicInfo: 'Basic Info',
    vehicleName: 'Vehicle Name', vehicleNamePh: 'e.g. My Daily Car', regNumber: 'Registration Number',
    vehicleType: 'Vehicle Type', typePh: 'e.g. Sedan, SUV, Bike', modelDetails: 'Model Details',
    brand: 'Brand', model: 'Model', year: 'Year', odometer: 'Odometer', currentMileage: 'Current Mileage',
    expiryDates: 'Expiry Dates (YYYY-MM-DD)', licenseExpiry: 'License Expiry', insuranceExpiry: 'Insurance Expiry',
    emissionTest: 'Emission Test', serviceReminder: 'Service Reminder', saveMachine: 'Save Machine',
    fillRequired: 'Please fill all required fields', guestLimit: 'Guest mode allows 1 vehicle. Log in to add more.',
    history: 'History', totalSpent: 'Total Spent', services: 'Services', avgCost: 'Avg Cost',
    noRecords: 'No service records yet.', addServiceRecord: 'Add Service Record', serviceType: 'Service Type',
    serviceTypePh: 'e.g. Oil Change', serviceDate: 'Service Date', mileage: 'Mileage', cost: 'Cost ($)',
    notes: 'Notes (Optional)', notesPh: 'Additional details...', save: 'Save', mi: 'mi',
    upcomingReminders: 'Upcoming Reminders', remindersNote: 'License, insurance, emission & service dates due within 30 days.',
    nothingExpiring: 'Nothing expiring in the next 30 days.', today: 'Today', dLeft: 'd left',
    name: 'Name', phone: 'Phone', saveChanges: 'Save Changes', savedMsg: 'Profile updated',
    permNote: 'Control what AutoCare can access on this device.',
    permNotif: 'Notifications', permNotifDesc: 'Expiry and service alerts',
    permLocation: 'Location', permLocationDesc: 'Find nearby service centres',
    permCamera: 'Camera', permCameraDesc: 'Scan documents and plates',
    permStorage: 'Storage', permStorageDesc: 'Save receipts and photos',
    allowed: 'Allowed', denied: 'Denied', ofFour: 'of 4',
    currentPlan: 'Current Plan', planFree: 'Free', planPro: 'Pro', planFleet: 'Fleet',
    freeDesc: '1 vehicle, manual reminders', proDesc: '5 vehicles, auto reminders, receipt storage',
    fleetDesc: 'Unlimited vehicles, team access, data export',
    perMonth: '/ month', forever: 'forever', currentLabel: 'Current', planChanged: 'Plan updated',
    vehiclesUsed: 'vehicles in use',
  },
  si: {
    tagline: 'නිරවද්‍ය වාහන සේවාව', secure: 'ආරක්ෂිත • විශ්වාසනීය • ස්වයංක්‍රීය',
    welcomeBack: 'නැවත සාදරයෙන් පිළිගනිමු', createAccount: 'ගිණුමක් සාදන්න', login: 'පිවිසෙන්න', signUp: 'ලියාපදිංචි වන්න',
    fullName: 'සම්පූර්ණ නම', enterName: 'ඔබේ නම ඇතුළත් කරන්න', email: 'විද්‍යුත් තැපෑල', password: 'මුරපදය',
    noAccount: 'ගිණුමක් නැද්ද? ලියාපදිංචි වන්න', haveAccount: 'දැනටමත් ගිණුමක් තිබේද? පිවිසෙන්න',
    or: 'නැතහොත්', continueGuest: 'අමුත්තෙකු ලෙස ඉදිරියට', guestNote: 'ගිණුමකින් තොරව වාහන 1ක් එකතු කරන්න.',
    guestNote2: 'දත්ත ස්ථානීයව ගබඩා වේ.', fillFields: 'සියලු තොරතුරු පුරවන්න',
    hello: 'ආයුබෝවන්', fleetToday: 'ඔබේ වාහන අද කෙසේද?', overview: 'දළ විශ්ලේෂණය',
    vehicles: 'වාහන', expiringSoon: 'ඉක්මනින් කල් ඉකුත්', next: 'ඊළඟ', view: 'බලන්න',
    recentVehicles: 'මෑත වාහන', seeAll: 'සියල්ල', noVehiclesYet: 'තවම වාහන එකතු කර නැත.',
    addVehicleShort: '+ වාහනයක් එකතු කරන්න', addNewVehicle: 'නව වාහනයක් එකතු කරන්න', registerNew: 'ඔබේ සමූහයට නව යන්ත්‍රයක් ලියාපදිංචි කරන්න',
    yourFleet: 'ඔබේ වාහන', add: '+ එකතු', searchPh: 'නම, අංකය හෝ සන්නාමය අනුව සොයන්න',
    editDetails: 'විස්තර සංස්කරණය', cancel: 'අවලංගු', confirmRemove: 'ඉවත් කිරීම තහවුරු', removeMachine: 'ඉවත් කරන්න',
    noVehiclesFound: 'වාහන හමු නොවීය.', noMatch: 'සෙවුමට ගැලපෙන වාහන නැත.',
    urgent: 'හදිසි', dueSoon: 'ඉක්මනින්', healthy: 'හොඳ තත්වයේ',
    dashboard: 'උපකරණ පුවරුව', settings: 'සැකසුම්', profile: 'පැතිකඩ', account: 'ගිණුම',
    editProfile: 'පැතිකඩ සංස්කරණය', appPermissions: 'යෙදුම් අවසර', subscription: 'දායකත්වය',
    notificationTimings: 'දැනුම්දීම් වේලාවන්', days30: 'කල් ඉකුත්වීමට දින 30 පෙර', days14: 'කල් ඉකුත්වීමට දින 14 පෙර',
    days7: 'කල් ඉකුත්වීමට දින 7 පෙර', day1: 'කල් ඉකුත්වීමට දින 1 පෙර', system: 'පද්ධතිය', pushNotifications: 'තල්ලු දැනුම්දීම්',
    appearance: 'පෙනුම', darkMode: 'අඳුරු මාදිලිය', darkModeDesc: 'රාත්‍රියේ ඇසට පහසුය', language: 'භාෂාව',
    logout: 'පිටවීම', resetGuest: 'අමුත්තා දත්ත යළි පිහිටුවන්න', confirm: 'තහවුරු කරන්න',
    guestUser: 'අමුත්තා', localMode: 'ස්ථානීය ගබඩා මාදිලිය',
    back: 'ආපසු', addVehicleT: 'වාහනය එකතු කරන්න', editVehicleT: 'වාහනය සංස්කරණය', basicInfo: 'මූලික තොරතුරු',
    vehicleName: 'වාහනයේ නම', vehicleNamePh: 'උදා: මගේ දෛනික රථය', regNumber: 'ලියාපදිංචි අංකය',
    vehicleType: 'වාහන වර්ගය', typePh: 'උදා: සෙඩාන්, SUV, යතුරුපැදිය', modelDetails: 'ආකෘති විස්තර',
    brand: 'සන්නාමය', model: 'ආකෘතිය', year: 'වර්ෂය', odometer: 'දුරමානය', currentMileage: 'වත්මන් දුර',
    expiryDates: 'කල් ඉකුත් දින (YYYY-MM-DD)', licenseExpiry: 'බලපත්‍ර කල් ඉකුත්', insuranceExpiry: 'රක්ෂණ කල් ඉකුත්',
    emissionTest: 'විමෝචන පරීක්ෂණය', serviceReminder: 'සේවා සිහිකැඳවීම', saveMachine: 'සුරකින්න',
    fillRequired: 'අවශ්‍ය සියලු තොරතුරු පුරවන්න', guestLimit: 'අමුත්තා මාදිලියේ වාහන 1ක් පමණි. තවත් එකතු කිරීමට පිවිසෙන්න.',
    history: 'ඉතිහාසය', totalSpent: 'මුළු වියදම', services: 'සේවා', avgCost: 'සාමාන්‍ය පිරිවැය',
    noRecords: 'තවම සේවා වාර්තා නැත.', addServiceRecord: 'සේවා වාර්තාවක් එකතු කරන්න', serviceType: 'සේවා වර්ගය',
    serviceTypePh: 'උදා: තෙල් මාරු කිරීම', serviceDate: 'සේවා දිනය', mileage: 'දුර', cost: 'පිරිවැය ($)',
    notes: 'සටහන් (විකල්ප)', notesPh: 'අමතර විස්තර...', save: 'සුරකින්න', mi: 'කි.මී.',
    upcomingReminders: 'ඉදිරි සිහිකැඳවීම්', remindersNote: 'දින 30 තුළ කල් ඉකුත් වන බලපත්‍ර, රක්ෂණ, විමෝචන සහ සේවා දින.',
    nothingExpiring: 'ඉදිරි දින 30 තුළ කිසිවක් කල් ඉකුත් නොවේ.', today: 'අද', dLeft: 'දින ඉතිරි',
    name: 'නම', phone: 'දුරකථනය', saveChanges: 'වෙනස්කම් සුරකින්න', savedMsg: 'පැතිකඩ යාවත්කාලීන විය',
    permNote: 'මෙම උපාංගයේ AutoCare වෙත ප්‍රවේශ විය හැකි දේ පාලනය කරන්න.',
    permNotif: 'දැනුම්දීම්', permNotifDesc: 'කල් ඉකුත් සහ සේවා ඇඟවීම්',
    permLocation: 'ස්ථානය', permLocationDesc: 'අවට සේවා මධ්‍යස්ථාන සොයන්න',
    permCamera: 'කැමරාව', permCameraDesc: 'ලේඛන සහ අංක තැටි ස්කෑන් කරන්න',
    permStorage: 'ගබඩාව', permStorageDesc: 'රිසිට්පත් සහ ඡායාරූප සුරකින්න',
    allowed: 'අවසර ඇත', denied: 'අවසර නැත', ofFour: '/ 4',
    currentPlan: 'වත්මන් සැලසුම', planFree: 'නොමිලේ', planPro: 'ප්‍රෝ', planFleet: 'සමූහය',
    freeDesc: 'වාහන 1, අතින් සිහිකැඳවීම්', proDesc: 'වාහන 5, ස්වයං සිහිකැඳවීම්, රිසිට්පත්',
    fleetDesc: 'අසීමිත වාහන, කණ්ඩායම් ප්‍රවේශය, දත්ත නිර්යාත',
    perMonth: '/ මසකට', forever: 'සදාකාලික', currentLabel: 'වත්මන්', planChanged: 'සැලසුම යාවත්කාලීන විය',
    vehiclesUsed: 'වාහන භාවිතයේ',
  },
  ta: {
    tagline: 'துல்லிய வாகன சேவை', secure: 'பாதுகாப்பான • நம்பகமான • தானியங்கி',
    welcomeBack: 'மீண்டும் வருக', createAccount: 'கணக்கை உருவாக்கு', login: 'உள்நுழை', signUp: 'பதிவு செய்',
    fullName: 'முழு பெயர்', enterName: 'உங்கள் பெயரை உள்ளிடுக', email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்',
    noAccount: 'கணக்கு இல்லையா? பதிவு செய்', haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழை',
    or: 'அல்லது', continueGuest: 'விருந்தினராக தொடர்', guestNote: 'கணக்கு இல்லாமல் 1 வாகனம் சேர்க்கலாம்.',
    guestNote2: 'தரவு உள்ளூரில் சேமிக்கப்படும்.', fillFields: 'அனைத்து புலங்களையும் நிரப்புக',
    hello: 'வணக்கம்', fleetToday: 'உங்கள் வாகனங்கள் இன்று எப்படி?', overview: 'மேலோட்டம்',
    vehicles: 'வாகனங்கள்', expiringSoon: 'விரைவில் காலாவதி', next: 'அடுத்து', view: 'பார்',
    recentVehicles: 'சமீபத்திய வாகனங்கள்', seeAll: 'அனைத்தும்', noVehiclesYet: 'இன்னும் வாகனம் இல்லை.',
    addVehicleShort: '+ வாகனம் சேர்', addNewVehicle: 'புதிய வாகனம் சேர்', registerNew: 'உங்கள் அணிக்கு புதிய வாகனம் பதிவு செய்',
    yourFleet: 'உங்கள் வாகனங்கள்', add: '+ சேர்', searchPh: 'பெயர், எண் அல்லது பிராண்ட் மூலம் தேடு',
    editDetails: 'விவரங்களைத் திருத்து', cancel: 'ரத்து', confirmRemove: 'நீக்கலை உறுதிப்படுத்து', removeMachine: 'நீக்கு',
    noVehiclesFound: 'வாகனங்கள் இல்லை.', noMatch: 'தேடலுக்கு பொருந்தவில்லை.',
    urgent: 'அவசரம்', dueSoon: 'விரைவில்', healthy: 'நல்ல நிலை',
    dashboard: 'டாஷ்போர்டு', settings: 'அமைப்புகள்', profile: 'சுயவிவரம்', account: 'கணக்கு',
    editProfile: 'சுயவிவரத்தைத் திருத்து', appPermissions: 'பயன்பாட்டு அனுமதிகள்', subscription: 'சந்தா',
    notificationTimings: 'அறிவிப்பு நேரங்கள்', days30: 'காலாவதிக்கு 30 நாட்கள் முன்', days14: 'காலாவதிக்கு 14 நாட்கள் முன்',
    days7: 'காலாவதிக்கு 7 நாட்கள் முன்', day1: 'காலாவதிக்கு 1 நாள் முன்', system: 'அமைப்பு', pushNotifications: 'புஷ் அறிவிப்புகள்',
    appearance: 'தோற்றம்', darkMode: 'இருண்ட பயன்முறை', darkModeDesc: 'இரவில் கண்களுக்கு எளிது', language: 'மொழி',
    logout: 'வெளியேறு', resetGuest: 'விருந்தினர் தரவை மீட்டமை', confirm: 'உறுதிப்படுத்து',
    guestUser: 'விருந்தினர்', localMode: 'உள்ளூர் சேமிப்பு',
    back: 'பின்', addVehicleT: 'வாகனம் சேர்', editVehicleT: 'வாகனத்தைத் திருத்து', basicInfo: 'அடிப்படை தகவல்',
    vehicleName: 'வாகனப் பெயர்', vehicleNamePh: 'எ.கா. என் தினசரி கார்', regNumber: 'பதிவு எண்',
    vehicleType: 'வாகன வகை', typePh: 'எ.கா. செடான், SUV, பைக்', modelDetails: 'மாடல் விவரங்கள்',
    brand: 'பிராண்ட்', model: 'மாடல்', year: 'ஆண்டு', odometer: 'ஓடோமீட்டர்', currentMileage: 'தற்போதைய மைலேஜ்',
    expiryDates: 'காலாவதி தேதிகள் (YYYY-MM-DD)', licenseExpiry: 'உரிம காலாவதி', insuranceExpiry: 'காப்பீட்டு காலாவதி',
    emissionTest: 'புகை சோதனை', serviceReminder: 'சேவை நினைவூட்டல்', saveMachine: 'சேமி',
    fillRequired: 'தேவையான புலங்களை நிரப்புக', guestLimit: 'விருந்தினர் பயன்முறையில் 1 வாகனம் மட்டும். மேலும் சேர்க்க உள்நுழைக.',
    history: 'வரலாறு', totalSpent: 'மொத்த செலவு', services: 'சேவைகள்', avgCost: 'சராசரி செலவு',
    noRecords: 'சேவை பதிவுகள் இல்லை.', addServiceRecord: 'சேவை பதிவைச் சேர்', serviceType: 'சேவை வகை',
    serviceTypePh: 'எ.கா. எண்ணெய் மாற்றம்', serviceDate: 'சேவை தேதி', mileage: 'மைலேஜ்', cost: 'செலவு ($)',
    notes: 'குறிப்புகள் (விரும்பினால்)', notesPh: 'கூடுதல் விவரங்கள்...', save: 'சேமி', mi: 'கி.மீ.',
    upcomingReminders: 'வரவிருக்கும் நினைவூட்டல்கள்', remindersNote: '30 நாட்களுக்குள் காலாவதியாகும் உரிமம், காப்பீடு, புகை மற்றும் சேவை தேதிகள்.',
    nothingExpiring: 'அடுத்த 30 நாட்களில் எதுவும் இல்லை.', today: 'இன்று', dLeft: 'நாட்கள்',
    name: 'பெயர்', phone: 'தொலைபேசி', saveChanges: 'மாற்றங்களைச் சேமி', savedMsg: 'சுயவிவரம் புதுப்பிக்கப்பட்டது',
    permNote: 'இந்த சாதனத்தில் AutoCare அணுகலைக் கட்டுப்படுத்துங்கள்.',
    permNotif: 'அறிவிப்புகள்', permNotifDesc: 'காலாவதி மற்றும் சேவை எச்சரிக்கைகள்',
    permLocation: 'இருப்பிடம்', permLocationDesc: 'அருகிலுள்ள சேவை மையங்கள்',
    permCamera: 'கேமரா', permCameraDesc: 'ஆவணங்கள் மற்றும் எண் தகடுகளை ஸ்கேன்',
    permStorage: 'சேமிப்பு', permStorageDesc: 'ரசீதுகள் மற்றும் புகைப்படங்கள்',
    allowed: 'அனுமதி', denied: 'மறுக்கப்பட்டது', ofFour: '/ 4',
    currentPlan: 'தற்போதைய திட்டம்', planFree: 'இலவசம்', planPro: 'ப்ரோ', planFleet: 'ஃபிளீட்',
    freeDesc: '1 வாகனம், கைமுறை நினைவூட்டல்கள்', proDesc: '5 வாகனங்கள், தானியங்கி நினைவூட்டல்கள், ரசீதுகள்',
    fleetDesc: 'வரம்பற்ற வாகனங்கள், குழு அணுகல், தரவு ஏற்றுமதி',
    perMonth: '/ மாதம்', forever: 'எப்போதும்', currentLabel: 'தற்போது', planChanged: 'திட்டம் புதுப்பிக்கப்பட்டது',
    vehiclesUsed: 'வாகனங்கள் பயன்பாட்டில்',
  },
  hi: {
    tagline: 'सटीक वाहन सेवा', secure: 'सुरक्षित • विश्वसनीय • स्वचालित',
    welcomeBack: 'वापस स्वागत है', createAccount: 'खाता बनाएं', login: 'लॉगिन', signUp: 'साइन अप',
    fullName: 'पूरा नाम', enterName: 'अपना नाम दर्ज करें', email: 'ईमेल', password: 'पासवर्ड',
    noAccount: 'खाता नहीं है? साइन अप करें', haveAccount: 'खाता है? लॉगिन करें',
    or: 'या', continueGuest: 'अतिथि के रूप में जारी रखें', guestNote: 'बिना खाते के 1 वाहन जोड़ें।',
    guestNote2: 'डेटा स्थानीय रूप से सहेजा जाता है।', fillFields: 'सभी फ़ील्ड भरें',
    hello: 'नमस्ते', fleetToday: 'आपका फ़्लीट आज कैसा है?', overview: 'अवलोकन',
    vehicles: 'वाहन', expiringSoon: 'जल्द समाप्त', next: 'अगला', view: 'देखें',
    recentVehicles: 'हाल के वाहन', seeAll: 'सभी देखें', noVehiclesYet: 'अभी कोई वाहन नहीं।',
    addVehicleShort: '+ वाहन जोड़ें', addNewVehicle: 'नया वाहन जोड़ें', registerNew: 'अपने फ़्लीट में नया वाहन दर्ज करें',
    yourFleet: 'आपका फ़्लीट', add: '+ जोड़ें', searchPh: 'नाम, नंबर या ब्रांड से खोजें',
    editDetails: 'विवरण संपादित करें', cancel: 'रद्द करें', confirmRemove: 'हटाना पुष्ट करें', removeMachine: 'हटाएं',
    noVehiclesFound: 'कोई वाहन नहीं मिला।', noMatch: 'खोज से मेल नहीं खाता।',
    urgent: 'अत्यावश्यक', dueSoon: 'जल्द', healthy: 'ठीक',
    dashboard: 'डैशबोर्ड', settings: 'सेटिंग्स', profile: 'प्रोफ़ाइल', account: 'खाता',
    editProfile: 'प्रोफ़ाइल संपादित करें', appPermissions: 'ऐप अनुमतियां', subscription: 'सदस्यता',
    notificationTimings: 'सूचना समय', days30: 'समाप्ति से 30 दिन पहले', days14: 'समाप्ति से 14 दिन पहले',
    days7: 'समाप्ति से 7 दिन पहले', day1: 'समाप्ति से 1 दिन पहले', system: 'सिस्टम', pushNotifications: 'पुश सूचनाएं',
    appearance: 'दिखावट', darkMode: 'डार्क मोड', darkModeDesc: 'रात में आंखों के लिए आसान', language: 'भाषा',
    logout: 'लॉग आउट', resetGuest: 'अतिथि डेटा रीसेट करें', confirm: 'पुष्टि करें',
    guestUser: 'अतिथि', localMode: 'स्थानीय स्टोरेज',
    back: 'वापस', addVehicleT: 'वाहन जोड़ें', editVehicleT: 'वाहन संपादित करें', basicInfo: 'मूल जानकारी',
    vehicleName: 'वाहन का नाम', vehicleNamePh: 'जैसे मेरी रोज़ की कार', regNumber: 'रजिस्ट्रेशन नंबर',
    vehicleType: 'वाहन प्रकार', typePh: 'जैसे सेडान, SUV, बाइक', modelDetails: 'मॉडल विवरण',
    brand: 'ब्रांड', model: 'मॉडल', year: 'वर्ष', odometer: 'ओडोमीटर', currentMileage: 'वर्तमान माइलेज',
    expiryDates: 'समाप्ति तिथियां (YYYY-MM-DD)', licenseExpiry: 'लाइसेंस समाप्ति', insuranceExpiry: 'बीमा समाप्ति',
    emissionTest: 'उत्सर्जन जांच', serviceReminder: 'सर्विस रिमाइंडर', saveMachine: 'सहेजें',
    fillRequired: 'आवश्यक फ़ील्ड भरें', guestLimit: 'अतिथि मोड में केवल 1 वाहन। अधिक जोड़ने के लिए लॉगिन करें।',
    history: 'इतिहास', totalSpent: 'कुल खर्च', services: 'सर्विस', avgCost: 'औसत लागत',
    noRecords: 'कोई सर्विस रिकॉर्ड नहीं।', addServiceRecord: 'सर्विस रिकॉर्ड जोड़ें', serviceType: 'सर्विस प्रकार',
    serviceTypePh: 'जैसे तेल बदलना', serviceDate: 'सर्विस तिथि', mileage: 'माइलेज', cost: 'लागत ($)',
    notes: 'नोट्स (वैकल्पिक)', notesPh: 'अतिरिक्त विवरण...', save: 'सहेजें', mi: 'कि.मी.',
    upcomingReminders: 'आने वाले रिमाइंडर', remindersNote: '30 दिनों में समाप्त होने वाली लाइसेंस, बीमा, उत्सर्जन और सर्विस तिथियां।',
    nothingExpiring: 'अगले 30 दिनों में कुछ समाप्त नहीं हो रहा।', today: 'आज', dLeft: 'दिन शेष',
    name: 'नाम', phone: 'फ़ोन', saveChanges: 'परिवर्तन सहेजें', savedMsg: 'प्रोफ़ाइल अपडेट हुई',
    permNote: 'इस डिवाइस पर AutoCare की पहुंच नियंत्रित करें।',
    permNotif: 'सूचनाएं', permNotifDesc: 'समाप्ति और सर्विस अलर्ट',
    permLocation: 'स्थान', permLocationDesc: 'नज़दीकी सर्विस सेंटर खोजें',
    permCamera: 'कैमरा', permCameraDesc: 'दस्तावेज़ और प्लेट स्कैन करें',
    permStorage: 'स्टोरेज', permStorageDesc: 'रसीदें और फ़ोटो सहेजें',
    allowed: 'अनुमति', denied: 'अस्वीकृत', ofFour: '/ 4',
    currentPlan: 'वर्तमान प्लान', planFree: 'मुफ़्त', planPro: 'प्रो', planFleet: 'फ़्लीट',
    freeDesc: '1 वाहन, मैनुअल रिमाइंडर', proDesc: '5 वाहन, ऑटो रिमाइंडर, रसीद स्टोरेज',
    fleetDesc: 'असीमित वाहन, टीम एक्सेस, डेटा एक्सपोर्ट',
    perMonth: '/ माह', forever: 'हमेशा', currentLabel: 'वर्तमान', planChanged: 'प्लान अपडेट हुआ',
    vehiclesUsed: 'वाहन उपयोग में',
  },
  ru: {
    tagline: 'Точный автосервис-консьерж', secure: 'Надёжно • Безопасно • Автоматически',
    welcomeBack: 'С возвращением', createAccount: 'Создать аккаунт', login: 'Вход', signUp: 'Регистрация',
    fullName: 'Полное имя', enterName: 'Введите имя', email: 'Эл. почта', password: 'Пароль',
    noAccount: 'Нет аккаунта? Зарегистрируйтесь', haveAccount: 'Уже есть аккаунт? Войти',
    or: 'ИЛИ', continueGuest: 'Продолжить как гость', guestNote: 'Без аккаунта можно добавить 1 автомобиль.',
    guestNote2: 'Данные хранятся локально.', fillFields: 'Заполните все поля',
    hello: 'Привет', fleetToday: 'Как ваш автопарк сегодня?', overview: 'Обзор',
    vehicles: 'Автомобили', expiringSoon: 'Истекает скоро', next: 'Далее', view: 'Открыть',
    recentVehicles: 'Недавние', seeAll: 'Все', noVehiclesYet: 'Автомобилей пока нет.',
    addVehicleShort: '+ Добавить', addNewVehicle: 'Добавить автомобиль', registerNew: 'Зарегистрируйте машину в автопарке',
    yourFleet: 'Ваш автопарк', add: '+ Добавить', searchPh: 'Поиск по имени, номеру, марке',
    editDetails: 'Изменить', cancel: 'Отмена', confirmRemove: 'Подтвердить', removeMachine: 'Удалить',
    noVehiclesFound: 'Автомобили не найдены.', noMatch: 'Ничего не найдено.',
    urgent: 'Срочно', dueSoon: 'Скоро', healthy: 'В порядке',
    dashboard: 'Панель', settings: 'Настройки', profile: 'Профиль', account: 'Аккаунт',
    editProfile: 'Изменить профиль', appPermissions: 'Разрешения', subscription: 'Подписка',
    notificationTimings: 'Время уведомлений', days30: 'За 30 дней до истечения', days14: 'За 14 дней до истечения',
    days7: 'За 7 дней до истечения', day1: 'За 1 день до истечения', system: 'Система', pushNotifications: 'Push-уведомления',
    appearance: 'Внешний вид', darkMode: 'Тёмная тема', darkModeDesc: 'Комфортнее для глаз ночью', language: 'Язык',
    logout: 'Выйти', resetGuest: 'Сбросить данные гостя', confirm: 'Подтвердить',
    guestUser: 'Гость', localMode: 'Локальное хранение',
    back: 'Назад', addVehicleT: 'Добавить авто', editVehicleT: 'Изменить авто', basicInfo: 'Основное',
    vehicleName: 'Название', vehicleNamePh: 'напр. Моя машина', regNumber: 'Гос. номер',
    vehicleType: 'Тип', typePh: 'напр. Седан, SUV, Мото', modelDetails: 'Модель',
    brand: 'Марка', model: 'Модель', year: 'Год', odometer: 'Пробег', currentMileage: 'Текущий пробег',
    expiryDates: 'Сроки (ГГГГ-ММ-ДД)', licenseExpiry: 'Срок прав', insuranceExpiry: 'Срок страховки',
    emissionTest: 'Техосмотр', serviceReminder: 'Напоминание о ТО', saveMachine: 'Сохранить',
    fillRequired: 'Заполните обязательные поля', guestLimit: 'В гостевом режиме 1 авто. Войдите, чтобы добавить ещё.',
    history: 'История', totalSpent: 'Всего', services: 'Работы', avgCost: 'Средняя',
    noRecords: 'Записей пока нет.', addServiceRecord: 'Добавить запись', serviceType: 'Тип работ',
    serviceTypePh: 'напр. Замена масла', serviceDate: 'Дата', mileage: 'Пробег', cost: 'Стоимость ($)',
    notes: 'Заметки (необязательно)', notesPh: 'Дополнительно...', save: 'Сохранить', mi: 'км',
    upcomingReminders: 'Напоминания', remindersNote: 'Права, страховка, техосмотр и ТО — сроки в течение 30 дней.',
    nothingExpiring: 'В следующие 30 дней ничего не истекает.', today: 'Сегодня', dLeft: 'дн.',
    name: 'Имя', phone: 'Телефон', saveChanges: 'Сохранить', savedMsg: 'Профиль обновлён',
    permNote: 'Управляйте доступом AutoCare на этом устройстве.',
    permNotif: 'Уведомления', permNotifDesc: 'Оповещения о сроках и ТО',
    permLocation: 'Геолокация', permLocationDesc: 'Поиск сервисов рядом',
    permCamera: 'Камера', permCameraDesc: 'Сканирование документов и номеров',
    permStorage: 'Память', permStorageDesc: 'Хранение чеков и фото',
    allowed: 'Разрешено', denied: 'Запрещено', ofFour: 'из 4',
    currentPlan: 'Текущий план', planFree: 'Бесплатно', planPro: 'Pro', planFleet: 'Автопарк',
    freeDesc: '1 автомобиль, ручные напоминания', proDesc: '5 авто, авто-напоминания, чеки',
    fleetDesc: 'Без лимита, доступ команды, экспорт',
    perMonth: '/ месяц', forever: 'навсегда', currentLabel: 'Текущий', planChanged: 'План обновлён',
    vehiclesUsed: 'авто используется',
  },
};

export const LANG_LABELS: Record<Lang, string> = { en: 'English', si: 'සිංහල', ta: 'தமிழ்', hi: 'हिन्दी', ru: 'Русский' };
export const LANG_ORDER: Lang[] = ['en', 'si', 'ta', 'hi', 'ru'];
