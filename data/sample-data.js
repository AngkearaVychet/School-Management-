/**
 * ទិន្នន័យគំរូមេរៀន និងលំហាត់សម្រាប់ សាលាអន្តរជាតិ ហេមតុន (Hampton International School)
 */

const SCHOOL_INFO = {
  nameKhmer: 'សាលាអន្តរជាតិ ហេមតុន',
  nameEnglish: 'Hampton International School',
  ministry: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
  logo: 'images/logo.png',
  slogan: 'ឃ្លាំងផ្ទុកមេរៀន វីដេអូ និងកម្រងលំហាត់ សម្រាប់លោកគ្រូ-អ្នកគ្រូ និងសិស្សានុសិស្ស'
};

const PROGRAMS = [
  { id: 'all', name: 'គ្រប់កម្មវិធីសិក្សា', icon: 'fa-globe' },
  { id: 'khmer_kg', name: 'មត្តេយ្យភាសាខ្មែរ', icon: 'fa-shapes' },
  { id: 'khmer_primary', name: 'បឋមសិក្សាខ្មែរ (ទី១-៦)', icon: 'fa-book-open-reader' },
  { id: 'english_ey', name: 'English (Pre-Nursery - K4)', icon: 'fa-child-reaching' },
  { id: 'english_pri', name: 'English (Primary 1-3 & GEP)', icon: 'fa-graduation-cap' },
  { id: 'parttime_en', name: 'ក្រៅម៉ោង ភាសាអង់គ្លេស', icon: 'fa-language' },
  { id: 'parttime_zh', name: 'ក្រៅម៉ោង ភាសាចិន (中文)', icon: 'fa-laptop-code' }
];

const INITIAL_SUBJECTS = [
  { id: 'all', name: 'ទាំងអស់', icon: 'fa-border-all', color: 'slate' },
  { id: 'khmer', name: 'ភាសាខ្មែរ', icon: 'fa-book-bookmark', color: 'blue' },
  { id: 'math', name: 'គណិតវិទ្យា', icon: 'fa-calculator', color: 'indigo' },
  { id: 'science', name: 'វិទ្យាសាស្ត្រ & សង្គម', icon: 'fa-flask', color: 'emerald' },
  { id: 'english', name: 'ភាសាអង់គ្លេស', icon: 'fa-earth-americas', color: 'rose' },
  { id: 'chinese', name: 'ភាសាចិន (中文)', icon: 'fa-language', color: 'amber' },
  { id: 'art_music', name: 'សិល្បៈ & តន្ត្រី', icon: 'fa-music', color: 'purple' },
  { id: 'ict', name: 'កុំព្យូទ័រ & IT', icon: 'fa-laptop', color: 'teal' }
];

// កម្រិតថ្នាក់ទាំងអស់តាមការកំណត់របស់សាលាអន្តរជាតិ ហេមតុន
const GRADE_GROUPS = [
  {
    groupName: 'កម្មវិធីចំណេះទូទៅខ្មែរ - កម្រិតមត្តេយ្យ',
    grades: ['មត្តេយ្យទាប', 'មត្តេយ្យមធ្យម', 'មត្តេយ្យខ្ពស់']
  },
  {
    groupName: 'កម្មវិធីចំណេះទូទៅខ្មែរ - បឋមសិក្សា',
    grades: ['ថ្នាក់ទី១', 'ថ្នាក់ទី២', 'ថ្នាក់ទី៣', 'ថ្នាក់ទី៤', 'ថ្នាក់ទី៥', 'ថ្នាក់ទី៦']
  },
  {
    groupName: 'កម្មវិធីភាសាអង់គ្លេស - Early Years & Kindergarten',
    grades: ['Pre-Nursery', 'Nursery', 'K1', 'K2', 'K3', 'K4']
  },
  {
    groupName: 'កម្មវិធីភាសាអង់គ្លេស - Primary & GEP',
    grades: ['Primary 1', 'Primary 2', 'Primary 3', 'GEP 1', 'GEP 2', 'GEP 3']
  },
  {
    groupName: 'ថ្នាក់ក្រៅម៉ោង (Part-Time Programs)',
    grades: ['ថ្នាក់ក្រៅម៉ោង ភាសាអង់គ្លេស', 'ថ្នាក់ក្រៅម៉ោង ភាសាចិន']
  }
];

const ALL_GRADES = GRADE_GROUPS.flatMap(g => g.grades);

const SAMPLE_ITEMS = [
  // 1. មត្តេយ្យខ្មែរ (ក ខ គ)
  {
    id: 'hpt-1',
    title: 'រៀនព្យញ្ជនៈខ្មែរគ្រឹះ (ក ខ គ ឃ ង) និងការផ្គុំស្រៈ',
    subject: 'khmer',
    grade: 'មត្តេយ្យខ្ពស់',
    program: 'khmer_kg',
    type: 'lesson',
    teacher: 'អ្នកគ្រូ សុខ ស្រីម៉ៅ',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-22',
    views: 420,
    bookmarks: 28,
    summary: 'មេរៀនស្គាល់តួអក្សរព្យញ្ជនៈខ្មែរ ៥ តួដំបូង រូបភាពសត្វ និងការបញ្ចេញសំឡេងសម្រាប់កុមារតូច។',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### ១. ព្យញ្ជនៈខ្មែរ ពួក (អ)
- **ក** ៖ ក្អែក, កែវ, ក្ងោក
- **ខ** ៖ ខោ, ខ្នើយ, ខ្យង
- **គ** ៖ គោ, គោម, គំនូរ
- **ឃ** ៖ ឃ្មុំ, ឃ្លោក
- **ង** ៖ ងាវ, ងងុយ

### ២. ចម្រៀងព្យញ្ជនៈ
ក អើយ ក ក្អែក! ខ អើយ ខ ខោ! គ អើយ គ គោ!
កូនៗត្រូវហាត់សរសេរតាមគន្លងចំនុចចុច និងអានបញ្ចេញសំឡេងឱ្យបានច្បាស់។
    `,
    attachments: [
      { name: 'សន្លឹកកិច្ចការ_ផាត់ពណ៌_ក_ដល់_ង.pdf', size: '1.4 MB', url: '#' }
    ],
    questions: [
      {
        question: 'តើរូបភាពសត្វ "គោ" ត្រូវនឹងព្យញ្ជនៈខ្មែរមួយណា?',
        options: ['ក', 'ខ', 'គ', 'ឃ'],
        answer: 2,
        explanation: 'ពាក្យ "គោ" ផ្ដើមឡើងដោយព្យញ្ជនៈ "គ"។'
      },
      {
        question: 'តើព្យញ្ជនៈណាដែលតាមពីក្រោយព្យញ្ជនៈ "ក"?',
        options: ['គ', 'ខ', 'ង', 'ច'],
        answer: 1,
        explanation: 'តាមលំដាប់ព្យញ្ជនៈខ្មែរគឺ ក បន្ទាប់មក ខ។'
      }
    ]
  },

  // 2. ថ្នាក់ទី១ គណិតវិទ្យា
  {
    id: 'hpt-2',
    title: 'គណិតវិទ្យាថ្នាក់ទី១៖ ការបូក និងដកលេខក្នុងរង្វង់ ២០',
    subject: 'math',
    grade: 'ថ្នាក់ទី១',
    program: 'khmer_primary',
    type: 'lesson',
    teacher: 'លោកគ្រូ អ៊ុក វិបុល',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-20',
    views: 530,
    bookmarks: 35,
    summary: 'រៀនរាប់ចំនួន ការបូកបន្ថែម និងការដកចេញដោយប្រើរូបភាពផ្លែឈើ និងបន្ទាត់ចំនួន។',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### ១. វិធីបូកលេខ (ការបន្ថែម)
- ឧទាហរណ៍៖ មានប៉ោម $5$ ផ្លែ ម៉ាក់ទិញថែម $3$ ផ្លែទៀត
- យើងបាន៖ $5 + 3 = 8$ ផ្លែ

### ២. វិធីដកលេខ (ការយកចេញ)
- ឧទាហរណ៍៖ មានស្ករគ្រាប់ $10$ គ្រាប់ ញ៉ាំអស់ $4$ គ្រាប់
- យើងបាន៖ $10 - 4 = 6$ គ្រាប់

### ៣. ល្បះលេខសំខាន់ៗ
- $7 + 5 = 12$
- $15 - 8 = 7$
- $9 + 9 = 18$
    `,
    attachments: [
      { name: 'លំហាត់បូកដកលេខ_ថ្នាក់ទី១.pdf', size: '980 KB', url: '#' }
    ],
    questions: [
      {
        question: 'គណនាផលបូក៖ $8 + 6 = ?$',
        options: ['12', '13', '14', '15'],
        answer: 2,
        explanation: '$8 + 6 = 14$'
      },
      {
        question: 'គណនាផលដក៖ $16 - 7 = ?$',
        options: ['9', '8', '10', '11'],
        answer: 0,
        explanation: '$16 - 7 = 9$'
      }
    ]
  },

  // 3. ថ្នាក់ទី៣ ភាសាខ្មែរ
  {
    id: 'hpt-3',
    title: 'ភាសាខ្មែរថ្នាក់ទី៣៖ ព្យញ្ជនៈផ្ញើជើង និងការតែងល្បះខ្លី',
    subject: 'khmer',
    grade: 'ថ្នាក់ទី៣',
    program: 'khmer_primary',
    type: 'exercise',
    teacher: 'អ្នកគ្រូ ម៉ៅ ចិន្តា',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-18',
    views: 610,
    bookmarks: 42,
    summary: 'កម្រងលំហាត់ហាត់អាន ស្គាល់ជើងព្យញ្ជនៈ (្ត, ្ន, ្រ, ្ល) និងការរៀបចំល្បះឱ្យមានន័យពេញលេញ។',
    videoUrl: '',
    content: `
### សេចក្តីណែនាំលំហាត់
សូមប្អូនៗសិស្សានុសិស្សថ្នាក់ទី៣ អានសំណួរឱ្យបានម៉ត់ចត់ រួចជ្រើសរើសចម្លើយដែលត្រឹមត្រូវបំផុត។
កុំភ្លេចផ្ទៀងផ្ទាត់ពិន្ទុ និងអានការពន្យល់ក្រោយពេលធ្វើចប់!
    `,
    attachments: [
      { name: 'សន្លឹកលំហាត់_ភាសាខ្មែរ_ថ្នាក់ទី៣.pdf', size: '1.1 MB', url: '#' }
    ],
    questions: [
      {
        question: 'តើពាក្យណាខ្លះខាងក្រោមនេះជាពាក្យមាន "ជើង រ" (្រ)?',
        options: ['សាលា', 'គ្រូ', 'សៀវភៅ', 'មិត្តភក្តិ'],
        answer: 1,
        explanation: 'ពាក្យ "គ្រូ" មានព្យញ្ជនៈ "គ" ផ្ញើជើង "រ" (គ្រ)។'
      },
      {
        question: 'ចូរបំពេញពាក្យក្នុងល្បះ៖ "សិស្សានុសិស្សកំពុង [...] មេរៀនយ៉ាងយកចិត្តទុកដាក់។"',
        options: ['រត់លេង', 'រៀនសូត្រ', 'គេងលក់', 'ញ៉ាំបាយ'],
        answer: 1,
        explanation: 'ពាក្យ "រៀនសូត្រ" បង្កើតបានជាល្បះសមស្រប និងត្រឹមត្រូវតាមក្បួនខ្នាត។'
      }
    ]
  },

  // 4. ថ្នាក់ទី៦ វិទ្យាសាស្ត្រ
  {
    id: 'hpt-4',
    title: 'វិទ្យាសាស្ត្រថ្នាក់ទី៦៖ ប្រព័ន្ធរំលាយអាហារ និងសារធាតុចិញ្ចឹម',
    subject: 'science',
    grade: 'ថ្នាក់ទី៦',
    program: 'khmer_primary',
    type: 'lesson',
    teacher: 'លោកគ្រូ ចាន់ សុផល',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-19',
    views: 780,
    bookmarks: 59,
    summary: 'ស្វែងយល់ពីដំណើរការរំលាយអាហារពីមាត់ ក្រពះ រហូតដល់ពោះវៀនតូច និងក្រុមចំណីអាហារ ៣ ក្រុម។',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### ១. សរីរាង្គនៃប្រព័ន្ធរំលាយអាហារ
1. **មាត់** ៖ ទំពារអាហារឱ្យម៉ដ្ឋ និងលាយជាមួយទឹកមាត់ដែលមានអង់ស៊ីមអាមីឡាស។
2. **បំពង់អាហារ** ៖ រុញអាហារទៅកាន់ក្រពះដោយចលនាកន្ត្រាក់។
3. **ក្រពះ** ៖ បំប្លែងអាហារជាមួយទឹកអាស៊ីតក្រពះ (HCl) និងអង់ស៊ីមប៉ិបស៊ីន។
4. **ពោះវៀនតូច** ៖ ជាកន្លែងដែលស្រូបយកសារធាតុចិញ្ចឹមចូលទៅក្នុងចរន្តឈាមច្រើនជាងគេ។

### ២. អាហារ ៣ ក្រុម
- **ក្រុមទី១ (អាហារថាមពល)** ៖ បាយ ប៉័ង ដំឡូង (កាបូអ៊ីដ្រាត)
- **ក្រុមទី២ (អាហារស្ថាបនា)** ៖ សាច់ ត្រី ស៊ុត ទឹកដោះគោ (ប្រូតេអ៊ីន)
- **ក្រុមទី៣ (អាហារការពារ)** ៖ បន្លែ ផ្លែឈើ (វីតាមីន និងជាតិរ៉ែ)
    `,
    attachments: [
      { name: 'វិទ្យាសាស្ត្រ_ប្រព័ន្ធរំលាយអាហារ_ថ្នាក់ទី៦.pdf', size: '2.2 MB', url: '#' }
    ],
    questions: [
      {
        question: 'តើសរីរាង្គណាដែលស្រូបយកសារធាតុចិញ្ចឹមចូលក្នុងឈាមច្រើនជាងគេ?',
        options: ['ក្រពះ', 'ពោះវៀនធំ', 'ពោះវៀនតូច', 'បំពង់អាហារ'],
        answer: 2,
        explanation: 'ពោះវៀនតូចមានបណ្តាញសរសៃឈាមច្រើន និងជាកន្លែងស្រូបយកសារធាតុចិញ្ចឹមចម្បងនៃរាងកាយ។'
      },
      {
        question: 'តើសាច់ ស៊ុត និងត្រី ស្ថិតក្នុងក្រុមអាហារអ្វី?',
        options: ['អាហារថាមពល', 'អាហារស្ថាបនា (ប្រូតេអ៊ីន)', 'អាហារការពារ', 'អាហារគ្មានប្រយោជន៍'],
        answer: 1,
        explanation: 'សាច់ ស៊ុត ត្រី សម្បូរទៅដោយសារធាតុប្រូតេអ៊ីន ជួយជួសជុលកោសិកា និងលូតលាស់រាងកាយ។'
      }
    ]
  },

  // 5. English Early Years (K2 / K3)
  {
    id: 'hpt-5',
    title: 'Phonics Fun: Short Vowel Sounds (a, e, i, o, u)',
    subject: 'english',
    grade: 'K3',
    program: 'english_ey',
    type: 'lesson',
    teacher: 'Teacher Sarah Jenkins',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-21',
    views: 640,
    bookmarks: 51,
    summary: 'Fun phonics sounds, blending CVC words (cat, bed, pig, fox, sun) with engaging songs and activities.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### 1. Let's Learn Short Vowels!
- **/a/** as in **Apple, Cat, Hat**
- **/e/** as in **Elephant, Bed, Pen**
- **/i/** as in **Igloo, Pig, Sit**
- **/o/** as in **Octopus, Fox, Box**
- **/u/** as in **Umbrella, Sun, Cup**

### 2. CVC Blending Practice
- c + a + t = **CAT**
- b + e + d = **BED**
- s + u + n = **SUN**

Sing along with Teacher Sarah to master the sounds!
    `,
    attachments: [
      { name: 'K3_Phonics_CVC_Worksheet.pdf', size: '1.8 MB', url: '#' }
    ],
    questions: [
      {
        question: 'Which word has the short vowel sound /a/?',
        options: ['Pig', 'Cat', 'Bed', 'Sun'],
        answer: 1,
        explanation: '"Cat" has the /æ/ short vowel sound.'
      },
      {
        question: 'Fill in the missing letter: S _ N (A big yellow star in the sky)',
        options: ['A', 'E', 'O', 'U'],
        answer: 3,
        explanation: 'S + U + N = SUN.'
      }
    ]
  },

  // 6. English Primary 2
  {
    id: 'hpt-6',
    title: 'Primary 2 English: Describing Animals & Using "Have / Has got"',
    subject: 'english',
    grade: 'Primary 2',
    program: 'english_pri',
    type: 'lesson',
    teacher: 'Teacher Michael Ross',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-23',
    views: 890,
    bookmarks: 63,
    summary: 'Learn animal body parts (wings, tails, claws) and how to form sentences using "It has got..." and "They have got...".',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### 1. Grammar Rule: Have got / Has got
- **I / You / We / They** + **have got** (e.g., Birds have got wings.)
- **He / She / It** + **has got** (e.g., An elephant has got a long trunk.)

### 2. Animal Vocabulary
- **Trunk** (ប្រមោយ)
- **Wings** (ស្លាប)
- **Tail** (កន្ទុយ)
- **Stripes** (ឆ្នូត)

### 3. Example Sentences
- A zebra **has got** black and white stripes.
- Tigers **have got** sharp teeth.
    `,
    attachments: [
      { name: 'P2_English_Grammar_Animals.pdf', size: '1.5 MB', url: '#' }
    ],
    questions: [
      {
        question: 'An elephant ________ a long trunk and big ears.',
        options: ['have got', 'has got', 'having', 'are got'],
        answer: 1,
        explanation: 'We use "has got" with singular nouns like "An elephant".'
      },
      {
        question: 'Birds ________ feathers and wings to fly.',
        options: ['has got', 'have got', 'is got', 'does have'],
        answer: 1,
        explanation: '"Birds" is plural, so we use "have got".'
      }
    ]
  },

  // 7. GEP 2 (General English Program)
  {
    id: 'hpt-7',
    title: 'GEP 2: Past Simple vs Past Continuous with "When" and "While"',
    subject: 'english',
    grade: 'GEP 2',
    program: 'english_pri',
    type: 'exercise',
    teacher: 'Teacher David Sok',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-24',
    views: 940,
    bookmarks: 77,
    summary: 'Practice narrative tenses for intermediate young learners: combining ongoing past actions interrupted by sudden events.',
    videoUrl: '',
    content: `
### Grammar Overview
- **Past Continuous** (was/were + V-ing) = ongoing action in the past.
- **Past Simple** (V2) = completed action that interrupted.
- **Formula**:
  - *While + Past Continuous, Past Simple.*
  - *Past Continuous + when + Past Simple.*

**Example**:
- While I was doing my homework, the telephone rang.
- She was walking to school when she saw an eagle.
    `,
    attachments: [
      { name: 'GEP2_Past_Tenses_Test_Sheet.pdf', size: '1.2 MB', url: '#' }
    ],
    questions: [
      {
        question: 'I was reading a book when the lights ________ out.',
        options: ['go', 'went', 'was going', 'have gone'],
        answer: 1,
        explanation: 'The sudden interrupting action takes the Past Simple ("went").'
      },
      {
        question: 'While they ________ football, it started to rain heavily.',
        options: ['were playing', 'played', 'are playing', 'was playing'],
        answer: 0,
        explanation: '"They" is plural, so we use "were playing" with "While".'
      }
    ]
  },

  // 8. ថ្នាក់ក្រៅម៉ោង ភាសាចិន (Part-time Chinese 中文)
  {
    id: 'hpt-8',
    title: 'ថ្នាក់ក្រៅម៉ោងភាសាចិន៖ Pinyin មូលដ្ឋាន និងការរាប់លេខ ១ ដល់ ១០ (一 到 十)',
    subject: 'chinese',
    grade: 'ថ្នាក់ក្រៅម៉ោង ភាសាចិន',
    program: 'parttime_zh',
    type: 'lesson',
    teacher: 'អ្នកគ្រូ លី ឈីង (Teacher Li Qing)',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-25',
    views: 1120,
    bookmarks: 88,
    summary: 'រៀនប្រព័ន្ធ Pinyin សំឡេងទាំង ៤ តួអក្សរចិន (汉字) នៃការរាប់លេខ និងការសួរសុខទុក្ខប្រចាំថ្ងៃ (你好!)។',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### ១. ការរាប់លេខ ១ ដល់ ១០ ជាភាសាចិន (数字)
- **一 (yī)** ៖ លេខ ១
- **二 (èr)** ៖ លេខ ២
- **三 (sān)** ៖ លេខ ៣
- **四 (sì)** ៖ លេខ ៤
- **五 (wǔ)** ៖ លេខ ៥
- **六 (liù)** ៖ លេខ ៦
- **七 (qī)** ៖ លេខ ៧
- **八 (bā)** ៖ លេខ ៨
- **九 (jiǔ)** ៖ លេខ ៩
- **十 (shí)** ៖ លេខ ១០

### ២. ពាក្យសួរសុខទុក្ខប្រចាំថ្ងៃ
- **你好 (nǐ hǎo)** ៖ សួស្តី!
- **谢谢 (xièxie)** ៖ អរគុណ!
- **再见 (zàijiàn)** ៖ ជម្រាបលា / ជួបគ្នាពេលក្រោយ!
- **老师好 (lǎoshī hǎo)** ៖ ជម្រាបសួរលោកគ្រូ/អ្នកគ្រូ!
    `,
    attachments: [
      { name: 'សៀវភៅហាត់សរសេរអក្សរចិន_លេខ១ដល់១០.pdf', size: '2.5 MB', url: '#' }
    ],
    questions: [
      {
        question: 'តើតួអក្សរចិន "五" អានតាម Pinyin យ៉ាងដូចម្តេច?',
        options: ['sān', 'sì', 'wǔ', 'liù'],
        answer: 2,
        explanation: '五 អានថា "wǔ" មានន័យថា លេខ ៥។'
      },
      {
        question: 'តើឃ្លា "你好" (nǐ hǎo) មានន័យដូចម្តេចជាភាសាខ្មែរ?',
        options: ['អរគុណ', 'ជម្រាបលា', 'សួស្តី', 'សូមទោស'],
        answer: 2,
        explanation: '你好 (nǐ hǎo) មានន័យថា "សួស្តី"។'
      }
    ]
  },

  // 9. ថ្នាក់ក្រៅម៉ោង ភាសាអង់គ្លេស (Part-time English)
  {
    id: 'hpt-9',
    title: 'Part-Time English: Daily Speaking & Classroom Expressions',
    subject: 'english',
    grade: 'ថ្នាក់ក្រៅម៉ោង ភាសាអង់គ្លេស',
    program: 'parttime_en',
    type: 'lesson',
    teacher: 'Teacher Alex Smith',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-24',
    views: 730,
    bookmarks: 49,
    summary: 'Key phrases for young learners to speak fluently inside the classroom: asking for help, permissions, and sharing.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### Essential Classroom Expressions
- **May I come in, teacher?** (តើខ្ញុំអាចចូលថ្នាក់បានទេអ្នកគ្រូ?)
- **May I drink some water?** (តើខ្ញុំអាចសុំផឹកទឹកបានទេ?)
- **Can you please repeat that?** (តើអ្នកគ្រូអាចនិយាយម្តងទៀតបានទេ?)
- **I have finished my work!** (ខ្ញុំបានធ្វើកិច្ចការរួចរាល់ហើយ!)
- **Can I borrow your pencil, please?** (តើខ្ញុំអាចសុំខ្ចីខ្មៅដៃអ្នកបានទេ?)
    `,
    attachments: [
      { name: 'Classroom_English_Phrases_Card.pdf', size: '890 KB', url: '#' }
    ],
    questions: [
      {
        question: 'When you want permission to enter the classroom, what should you say?',
        options: [
          'Goodbye teacher!',
          'May I come in, please?',
          'Where is my bag?',
          'I am hungry.'
        ],
        answer: 1,
        explanation: '"May I come in, please?" is the polite expression to ask permission to enter.'
      }
    ]
  },

  // 10. កុំព្យូទ័រ & ICT (Computer for Kids)
  {
    id: 'hpt-10',
    title: 'មូលដ្ឋានគ្រឹះកុំព្យូទ័រសម្រាប់កុមារ៖ ស្គាល់ផ្នែករឹង និងការប្រើ Mouse & Keyboard',
    subject: 'ict',
    grade: 'ថ្នាក់ទី៤',
    program: 'khmer_primary',
    type: 'lesson',
    teacher: 'លោកគ្រូ លី សុវណ្ណ',
    school: 'សាលាអន្តរជាតិ ហេមតុន',
    createdAt: '2026-10-21',
    views: 810,
    bookmarks: 54,
    summary: 'ស្គាល់ Monitor, CPU, Mouse, Keyboard និងការហាត់វាយអក្សរខ្មែរ យូនីកូដ (Khmer Unicode Keyboard)។',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
### ១. ផ្នែករឹងសំខាន់ៗនៃកុំព្យូទ័រ (Computer Hardware)
- **Monitor (អេក្រង់)** ៖ បង្ហាញរូបភាព និងអត្ថបទ
- **System Unit / CPU (ប្រអប់ម៉ាស៊ីន)** ៖ ខួរក្បាលនៃកុំព្យូទ័រក្នុងការគណនា
- **Keyboard (ក្តារចុច)** ៖ វាយបញ្ចូលអក្សរ និងលេខ
- **Mouse (កណ្ដុរ)** ៖ ចង្អុល បញ្ជា និងចុច Click

### ២. គន្លឹះប្រើប្រាស់ Mouse
- **Left Click** ៖ ជ្រើសរើស ឬបើកកម្មវិធី
- **Right Click** ៖ បង្ហាញបញ្ជីជម្រើសបន្ថែម (Context Menu)
- **Scroll Wheel** ៖ អូសឡើងចុះលើទំព័រ
    `,
    attachments: [
      { name: 'Computer_Basics_Grade4.pdf', size: '1.9 MB', url: '#' }
    ],
    questions: [
      {
        question: 'តើឧបករណ៍ណាដែលដើរតួជា "ខួរក្បាល" សំខាន់នៃកុំព្យូទ័រ?',
        options: ['Mouse', 'Monitor', 'CPU', 'Speaker'],
        answer: 2,
        explanation: 'CPU (Central Processing Unit) គឺជាខួរក្បាលគណនា និងដំណើរការបញ្ជាទាំងអស់របស់កុំព្យូទ័រ។'
      }
    ]
  }
];
