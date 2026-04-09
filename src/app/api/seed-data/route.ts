import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const HALAKAT_DATA = [
  { name: 'حلقة غالية', teacher: 'غالية', branch: 'وبرة', time: '', location: 'وبرة' },
  { name: 'حلقة شمس محمد احمد علي', teacher: 'شمس محمد احمد علي', branch: 'وبرة', time: '', location: 'وبرة' },
  { name: 'حلقة رواد سيف', teacher: 'رواد سيف', branch: 'الوادي', time: '', location: 'الوادي' },
  { name: 'حلقة وحدة قحطان احمد', teacher: 'وحدة قحطان احمد', branch: 'الوادي', time: '', location: 'الوادي' },
  { name: 'حلقة اشكال سعيد', teacher: 'اشكال سعيد', branch: 'السرور', time: '', location: 'السرور' },
  { name: 'حلقة عفاف', teacher: 'عفاف', branch: 'السرور', time: '', location: 'السرور' },
  { name: 'حلقة بلقيس احمد', teacher: 'بلقيس احمد', branch: 'الوادي', time: '', location: 'الوادي' },
  { name: 'حلقة اسيا عبد الله نعمان', teacher: 'اسيا عبد الله نعمان', branch: 'السرور', time: '', location: 'السرور' },
  { name: 'حلقة رحاب حسن', teacher: 'رحاب حسن', branch: 'السرور', time: '', location: 'السرور' },
  { name: 'حلقة عبد العزيز احمد عبد الله', teacher: 'عبد العزيز احمد عبد الله', branch: 'السرور', time: '', location: 'السرور' },
]

const STUDENTS_DATA: Record<string, { name: string; age: number; surah: string; category: string }[]> = {
  'حلقة غالية': [
    { name: 'نجم الدين احمد عبده علي', age: 10, surah: 'النبأ', category: '1-10' },
    { name: 'اياد عبد الله غالب', age: 11, surah: 'البروج', category: '1-10' },
    { name: 'محمد مكرد سلطان', age: 11, surah: 'الشمس', category: '1-10' },
    { name: 'محمد يوسف الحمادي', age: 9, surah: 'قريش', category: '1-10' },
    { name: 'هيلان عبد السلام سيف', age: 8, surah: 'العاديات', category: '1-10' },
    { name: 'احمد عبد السلام سعيد', age: 8, surah: 'الهمزة', category: '1-10' },
    { name: 'محمد عبد السلام سعيد', age: 8, surah: 'الهمزة', category: '1-10' },
    { name: 'حبيب علي عبد الله سيف', age: 12, surah: 'القارعة', category: '1-10' },
    { name: 'لؤي قائد احمد', age: 11, surah: 'الشمس', category: '1-10' },
    { name: 'رحمة علي عبد الله', age: 14, surah: 'النبأ', category: '1-10' },
    { name: 'تهاني زائد عبده علي', age: 12, surah: 'الضحى', category: '1-10' },
    { name: 'نجوى عبد الله محمد', age: 10, surah: 'الناس', category: '1-10' },
    { name: 'توكل احمد غالب', age: 10, surah: 'الناس', category: '1-10' },
  ],
  'حلقة شمس محمد احمد علي': [
    { name: 'وفاء احمد محمد علي', age: 12, surah: 'المجادلة', category: '1-10' },
    { name: 'اثار احمد محمد علي', age: 11, surah: 'القيامة', category: '1-10' },
    { name: 'عصماء عادل حزام', age: 13, surah: 'المرسلات', category: '1-10' },
    { name: 'هبة محمد احمد علي', age: 10, surah: 'الليل', category: '1-10' },
    { name: 'ميار زائد سلطان', age: 9, surah: 'الليل', category: '1-10' },
    { name: 'غناء أنور علي الصغير', age: 10, surah: 'التين', category: '1-10' },
    { name: 'مروان محمد عبد القوي', age: 12, surah: 'النبأ', category: '1-10' },
    { name: 'نهاد سالم علي الصغير', age: 10, surah: 'البينة', category: '1-10' },
    { name: 'مبارك محمد حزام', age: 11, surah: 'الزلزلة', category: '1-10' },
    { name: 'مهند المجيدي', age: 11, surah: 'القارعة', category: '1-10' },
  ],
  'حلقة رواد سيف': [
    { name: 'اعتصام عبد الله قحطان', age: 11, surah: 'المجادلة', category: '1-10' },
    { name: 'الماس عبد الله عبده', age: 12, surah: 'الملك', category: '1-10' },
    { name: 'ريمان سمير عبد الجبار', age: 17, surah: 'الذاريات', category: '1-10' },
    { name: 'رينا سمير عبد الجبار', age: 15, surah: 'الاحقاف', category: '1-10' },
    { name: 'رهام وضاح عبده علي', age: 11, surah: 'المجادلة', category: '1-10' },
    { name: 'رندا عبده مهيوب', age: 30, surah: 'الملك', category: '1-10' },
    { name: 'سيتا محمد سعيد', age: 29, surah: 'الملك', category: '1-10' },
    { name: 'سبأ محمد سعيد', age: 30, surah: 'الملك', category: '1-10' },
    { name: 'حفيظة عبد الله علي', age: 49, surah: 'النبأ', category: '1-10' },
    { name: 'منى عبد الله علي', age: 33, surah: 'المجادلة', category: '1-10' },
    { name: 'افنان وضاح عبده علي', age: 15, surah: 'الاحقاف', category: '1-10' },
    { name: 'روضة سيف قاسم', age: 22, surah: 'الذاريات', category: '1-10' },
    { name: 'ايناس عامر عبد الواحد', age: 18, surah: 'الملك', category: '1-10' },
    { name: 'غدير صادق غالب قحطان', age: 13, surah: 'النبأ', category: '1-10' },
    { name: 'رغد صادق غالب قحطان', age: 16, surah: 'الملك', category: '1-10' },
    { name: 'فردوس نعمان سعيد', age: 31, surah: 'المجادلة', category: '1-10' },
    { name: 'شهيرة طه نعمان سعيد', age: 22, surah: 'المجادلة', category: '1-10' },
    { name: 'فوزية عبد الله عامر', age: 53, surah: 'النبأ', category: '1-10' },
  ],
  'حلقة وحدة قحطان احمد': [
    { name: 'سعيد عماد سعيد سيف', age: 12, surah: 'المجادلة', category: '1-10' },
    { name: 'مبارك يونس قحطان حسن', age: 13, surah: 'المجادلة', category: '1-10' },
    { name: 'محمد عماد سعيد سيف', age: 11, surah: 'الملك', category: '1-10' },
    { name: 'مشعل بليغ سعيد سيف', age: 12, surah: 'النبأ', category: '1-10' },
    { name: 'أمجد خليل سعيد مقبل', age: 11, surah: 'النبأ', category: '1-10' },
    { name: 'معاذ عبد الباسط سلطان', age: 13, surah: 'النبأ', category: '1-10' },
    { name: 'ثابت احمد سعيد مهند', age: 12, surah: 'المطففين', category: '1-10' },
    { name: 'ثابت احمد سعيد اسام', age: 9, surah: 'الضحى', category: '1-10' },
    { name: 'احمد بليغ سعيد سيف', age: 10, surah: 'المطففين', category: '1-10' },
  ],
  'حلقة اشكال سعيد': [
    { name: 'سارة سلطان قائد سعيد', age: 16, surah: 'القصص', category: '10-20' },
    { name: 'رفيف نور الدين سيف', age: 16, surah: 'القصص', category: '10-20' },
    { name: 'امنة طلال محمد شداد', age: 11, surah: 'سبأ', category: '1-10' },
    { name: 'ريناس غالب قائد سعيد', age: 12, surah: 'سبأ', category: '1-10' },
    { name: 'رهف نبيل علي قائد', age: 15, surah: 'الدخان', category: '1-10' },
    { name: 'أيارم مهيب قائد', age: 14, surah: 'الاحقاف', category: '1-10' },
    { name: 'مناهل مامون عبده', age: 13, surah: 'الملك', category: '1-10' },
  ],
  'حلقة عفاف': [
    { name: 'روان عبد الله محمد', age: 16, surah: 'الانعام', category: '20-30' },
    { name: 'بشائر بشير سيف', age: 18, surah: 'مريم', category: '10-20' },
    { name: 'سعاد مشير سيف', age: 14, surah: 'مريم', category: '10-20' },
    { name: 'سلوى محمد صالح', age: 20, surah: 'مريم', category: '10-20' },
    { name: 'دعاء فائد قائد', age: 19, surah: 'الروم', category: '1-10' },
    { name: 'نهلة بليغ إبراهيم', age: 13, surah: 'الأحزاب', category: '1-10' },
    { name: 'اجلال إبراهيم محمد', age: 17, surah: 'يس', category: '1-10' },
    { name: 'رقية إبراهيم سعيد', age: 17, surah: 'يس', category: '1-10' },
    { name: 'اريحة محمد حسن', age: 18, surah: 'الاحقاف', category: '1-10' },
    { name: 'اميمة عوض حزام', age: 18, surah: 'الطور', category: '1-10' },
    { name: 'رقية توفيق أبا الحسن', age: 16, surah: 'المجادلة', category: '1-10' },
    { name: 'روان صادق علي', age: 10, surah: 'الجمعة', category: '1-10' },
    { name: 'منال عمر علي', age: 13, surah: 'الملك', category: '1-10' },
    { name: 'ردينة عبد السلام', age: 7, surah: 'الشمس', category: '1-10' },
    { name: 'شيماء مختار علي غالب', age: 17, surah: 'الملك', category: '1-10' },
  ],
  'حلقة بلقيس احمد': [
    { name: 'اركان سيف محمد عبده القذافي', age: 13, surah: 'الطلاق', category: '1-10' },
    { name: 'سفيان علي عبده', age: 13, surah: 'البلد', category: '1-10' },
    { name: 'المحتشم سفيان علي عبده', age: 11, surah: 'العاديات', category: '1-10' },
    { name: 'مبارك علي احمد', age: 11, surah: 'الممتحنة', category: '1-10' },
    { name: 'بشیر احمد حسن سنان', age: 12, surah: 'الواقعة', category: '1-10' },
    { name: 'حسام مبارك حسن محمد', age: 11, surah: 'الانسان', category: '1-10' },
    { name: 'حكيم مبارك علي احمد', age: 13, surah: 'الحديد', category: '1-10' },
    { name: 'رامز عبد الله احمد عبده', age: 12, surah: 'الفجر', category: '1-10' },
    { name: 'ايمان عبد الله احمد عبده', age: 18, surah: 'الفاتحة', category: '1-10' },
    { name: 'ريناس احمد سعيد علي', age: 14, surah: 'الحاقة', category: '1-10' },
    { name: 'غدير مبارك حسن محمد', age: 13, surah: 'النجم', category: '1-10' },
    { name: 'وفاق رفيق مهيوب سعيد', age: 11, surah: 'النازعات', category: '1-10' },
  ],
  'حلقة اسيا عبد الله نعمان': [
    { name: 'اروى حسن قاسم عبده', age: 40, surah: 'سبأ', category: 'محو الامية' },
    { name: 'افتكار حسن مقبل ناجي', age: 42, surah: 'المزمل', category: 'محو الامية' },
    { name: 'تقية سيف قائد حسن', age: 53, surah: 'المطففين', category: 'محو الامية' },
    { name: 'رضية حسان مهيوب', age: 43, surah: 'الحشر', category: 'محو الامية' },
    { name: 'رفيقة عبد الله قاسم عبده', age: 41, surah: 'الحشر', category: 'محو الامية' },
    { name: 'زينب قائد حسن علي', age: 54, surah: 'الحديد', category: 'محو الامية' },
    { name: 'صباح حسان مهيوب حسن', age: 38, surah: 'الغاشية', category: 'محو الامية' },
    { name: 'صفية صالح مقبل ناجي', age: 54, surah: 'المعارج', category: 'محو الامية' },
    { name: 'فاطمة علي حزام قائد', age: 38, surah: 'الذاريات', category: 'محو الامية' },
    { name: 'منى عبد الله قاسم عبده', age: 37, surah: 'يس', category: 'محو الامية' },
    { name: 'منى علي مهيوب حسن', age: 50, surah: 'الغاشية', category: 'محو الامية' },
    { name: 'ماجدة علي عبده عبد الله', age: 40, surah: 'الذاريات', category: 'محو الامية' },
    { name: 'منيرة احمد مهيوب حسن', age: 42, surah: 'يس', category: 'محو الامية' },
    { name: 'نبيلة محمد عبد الولي', age: 41, surah: 'عبسى', category: 'محو الامية' },
    { name: 'ياقوت حسن قاسم عبده', age: 43, surah: 'الذاريات', category: 'محو الامية' },
  ],
  'حلقة رحاب حسن': [
    { name: 'رهف سلطان احمد عبد الله', age: 14, surah: 'الشعراء', category: '10-20' },
    { name: 'بسمة احمد عبد الله نعمان', age: 30, surah: 'الشورى', category: '1-10' },
    { name: 'هيام محمد احمد مقبل', age: 23, surah: 'الزخرف', category: '1-10' },
    { name: 'ابرار مجيب حسن قاسم', age: 10, surah: 'ق', category: '1-10' },
    { name: 'اية بسام علي عبده', age: 10, surah: 'النجم', category: '1-10' },
    { name: 'اوصاف عبده هزاع عبد الله', age: 17, surah: 'القمر', category: '1-10' },
    { name: 'سيناء منصور حسن مقبل', age: 16, surah: 'الممتحنة', category: '1-10' },
    { name: 'ميسون سعيد احمد مقبل', age: 9, surah: 'المعارج', category: '1-10' },
    { name: 'غدير سعيد احمد مقبل', age: 10, surah: 'المعارج', category: '1-10' },
    { name: 'فريضة فضل محمد احمد', age: 11, surah: 'الانسان', category: '1-10' },
    { name: 'رغد صدام محمد احمد', age: 10, surah: 'البروج', category: '1-10' },
    { name: 'عبد اللطيف بسام علي عبده', age: 6, surah: 'البروج', category: '1-10' },
    { name: 'براء نادر احمد', age: 8, surah: 'الطارق', category: '1-10' },
    { name: 'روان خالد قائد عبده', age: 11, surah: 'العلق', category: '1-10' },
    { name: 'انتظار محمد احمد', age: 40, surah: 'المعارج', category: '1-10' },
  ],
  'حلقة عبد العزيز احمد عبد الله': [
    { name: 'عمر فؤاد سيف محمد', age: 14, surah: 'الطلاق', category: '1-10' },
    { name: 'رغد طه احمد عبد الله', age: 13, surah: 'الملك', category: '1-10' },
    { name: 'قسام محمد هائل فرحان', age: 9, surah: 'المدثر', category: '1-10' },
    { name: 'شامل فؤاد سيف محمد', age: 11, surah: 'الغاشية', category: '1-10' },
    { name: 'بسمة احمد عبد الله', age: 30, surah: 'النبأ', category: '1-10' },
    { name: 'حفيظ محفوظ احمد عبده', age: 10, surah: 'الانسان', category: '1-10' },
    { name: 'نائف سعيد سلطان', age: 29, surah: 'التكوير', category: '1-10' },
    { name: 'ريماس طه احمد عبد الله', age: 11, surah: 'التكوير', category: '1-10' },
    { name: 'راغب طه احمد عبد الله', age: 9, surah: 'المرسلات', category: '1-10' },
  ],
}

export async function GET() {
  try {
    const existingCount = await db.halaka.count()
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'تم تحميل البيانات مسبقاً',
        halakatCount: existingCount,
        studentsCount: await db.student.count()
      })
    }

    // Seed admin
    const adminCount = await db.admin.count()
    if (adminCount === 0) {
      await db.admin.create({
        data: { username: 'admin', password: 'admin123', name: 'المدير' }
      })
    }

    // Create halakat and students
    let totalStudents = 0
    for (const halakaData of HALAKAT_DATA) {
      const halaka = await db.halaka.create({
        data: {
          name: halakaData.name,
          teacher: halakaData.teacher,
          branch: halakaData.branch,
          time: halakaData.time,
          location: halakaData.location,
        }
      })

      const students = STUDENTS_DATA[halakaData.name] || []
      for (const s of students) {
        try {
          await db.student.create({
            data: {
              name: s.name,
              age: s.age,
              surah: s.surah,
              category: s.category,
              halakaId: halaka.id,
              parentName: '',
              parentPhone: '',
            }
          })
          totalStudents++
        } catch (studentError) {
          console.error(`Failed to create student ${s.name}:`, studentError)
        }
      }
    }

    return NextResponse.json({
      message: 'تم تحميل البيانات بنجاح',
      halakatCount: HALAKAT_DATA.length,
      studentsCount: totalStudents,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'فشل في تحميل البيانات', details: String(error) }, { status: 500 })
  }
}
