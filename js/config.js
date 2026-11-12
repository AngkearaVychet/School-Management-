/*
 * ការកំណត់ប្រព័ន្ធ (Configuration)
 * ---------------------------------
 * SUPABASE_URL និង SUPABASE_KEY ជា Key សាធារណៈ (publishable) — អាចដាក់ក្នុងគេហទំព័របាន។
 * សុវត្ថិភាពទិន្នន័យត្រូវបានការពារដោយ Row Level Security នៅក្នុង Database។
 */
window.APP_CONFIG = {
  SUPABASE_URL: 'https://ovcapolmdzwiqspmawxi.supabase.co',
  SUPABASE_KEY: 'sb_publishable_hF9yWMuVuEM65xzvDGP35A_9V5o0ItH',
  EMAIL_DOMAIN: 'hampton.school', // username → username@hampton.school (ប្រើខាងក្នុងតែប៉ុណ្ណោះ)

  SCHOOL_NAME_KM: 'សាលាអន្តរជាតិ ហេមតុន',
  SCHOOL_NAME_EN: 'Hampton International School',

  // កម្រិតថ្នាក់ (អាចបន្ថែម ឬកែបាន)
  GRADES: [
    { group: 'មត្តេយ្យ (ខ្មែរ)', items: ['មត្តេយ្យទាប', 'មត្តេយ្យមធ្យម', 'មត្តេយ្យខ្ពស់'] },
    { group: 'បឋមសិក្សា (ខ្មែរ)', items: ['ថ្នាក់ទី១', 'ថ្នាក់ទី២', 'ថ្នាក់ទី៣', 'ថ្នាក់ទី៤', 'ថ្នាក់ទី៥', 'ថ្នាក់ទី៦'] },
    { group: 'English — Early Years', items: ['Pre-Nursery', 'Nursery', 'K1', 'K2', 'K3', 'K4'] },
    { group: 'English — Primary & GEP', items: ['Primary 1', 'Primary 2', 'Primary 3', 'GEP 1', 'GEP 2', 'GEP 3'] },
    { group: 'ថ្នាក់ក្រៅម៉ោង', items: ['ក្រៅម៉ោង អង់គ្លេស', 'ក្រៅម៉ោង ចិន'] }
  ],

  // មុខវិជ្ជា
  SUBJECTS: [
    { id: 'khmer',   name: 'ភាសាខ្មែរ',     icon: 'fa-book-open',    color: 'blue' },
    { id: 'math',    name: 'គណិតវិទ្យា',    icon: 'fa-calculator',   color: 'indigo' },
    { id: 'science', name: 'វិទ្យាសាស្ត្រ',  icon: 'fa-flask',        color: 'emerald' },
    { id: 'english', name: 'English',       icon: 'fa-earth-asia',   color: 'rose' },
    { id: 'chinese', name: 'ភាសាចិន 中文',  icon: 'fa-language',     color: 'amber' },
    { id: 'art',     name: 'សិល្បៈ & តន្ត្រី', icon: 'fa-palette',   color: 'purple' },
    { id: 'other',   name: 'ផ្សេងៗ',        icon: 'fa-shapes',       color: 'slate' }
  ]
};
