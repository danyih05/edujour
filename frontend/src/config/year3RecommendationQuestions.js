export const YEAR3_RECOMMENDATION_ROUTES = Object.freeze([
  {
    id: 'inPerson',
    emoji: '🐶',
    title: {
      zh: '汪仔的推荐信当面大冒险',
      en: 'Wangzai’s In-Person Recommendation Adventure',
    },
    subtitle: {
      zh: '见面时只开口和递清单，见面后邮件发材料。这才是现实中体面小狗的操作。',
      en: 'Ask politely in person, show that your checklist is ready, then send the full materials by email afterward.',
    },
    questions: [
      {
        id: 'in-person-timing',
        title: { zh: '第一关：时机汪', en: 'Round 1: Timing' },
        prompt: {
          zh: '汪仔站在老师办公室门口，爪子悬在半空：“如果我打算当面跟老师要推荐信，我该提前多久第一次开口？”',
          en: 'Wangzai stands outside the professor’s office, paw raised. “If I want to ask for a recommendation in person, how early should I first ask?”',
        },
        options: [
          { zh: 'A. 提前 1-2 天（临时抱佛脚汪）', en: 'A. 1-2 days ahead, last-minute panic mode' },
          { zh: 'B. 提前 2-4 周（见面黄金窗口）', en: 'B. 2-4 weeks ahead, the golden in-person window', correct: true },
          { zh: 'C. 提前一学期（老师：这位同学怎么天天来？）', en: 'C. One semester ahead, so early the professor forgets why you came' },
          { zh: 'D. 当场直接说（措手不及汪）', en: 'D. Ask on the spot with no warning' },
        ],
        explanation: {
          zh: '见面要推荐信，太早老师记不住你，太晚来不及写。提前 2-4 周，找一次课后或办公时间自然地开口。汪仔别在走廊截胡，约个 office hour 最加分。',
          en: 'For an in-person request, too early is forgettable and too late is stressful. Ask 2-4 weeks ahead, ideally after class or during office hours. Do not ambush the professor in the hallway.',
        },
      },
      {
        id: 'in-person-recommender',
        title: { zh: '第二关：选人汪', en: 'Round 2: Recommender Choice' },
        prompt: {
          zh: '汪仔走在教学楼走廊，心里盘算：“哪些老师最适合当面去要推荐信？”',
          en: 'Walking through the academic building, Wangzai wonders: “Which professor is best to ask in person?”',
        },
        options: [
          { zh: 'A. 院长（头衔大但一周见不到一次）', en: 'A. The dean, impressive title but barely knows you' },
          { zh: 'B. 课堂或项目里互动最多的老师', en: 'B. The teacher who interacted with you most in class or projects', correct: true },
          { zh: 'C. 给分最高的老师（见面不尴尬）', en: 'C. The teacher who gave you the highest grade' },
          { zh: 'D. 办公室离我最近的那个', en: 'D. The one whose office is closest' },
        ],
        explanation: {
          zh: '见面要推荐信，选那个你在他面前刷过脸的老师。上课坐前排、课后问过问题、做过项目，这些自然话题比头衔更好用。',
          en: 'Choose someone who actually knows you. Front-row participation, questions after class, and project interaction give the recommender real examples to write about.',
        },
      },
      {
        id: 'in-person-materials-before',
        title: { zh: '第三关：准备汪（见面之前）', en: 'Round 3: Preparation Before the Meeting' },
        prompt: {
          zh: '汪仔打算去老师办公室之前，在电脑/文件夹里应该准备好什么？',
          en: 'Before going to the professor’s office, what should Wangzai have ready on the computer or in a folder?',
        },
        options: [
          { zh: 'A. 空着手去，靠口才征服老师', en: 'A. Go empty-handed and rely on charm' },
          { zh: 'B. 完整材料包：简历、成绩单、项目清单、截止日期表', en: 'B. A full materials pack: CV, transcript, project list, and deadline table', correct: true },
          { zh: 'C. 只准备一肚子好话', en: 'C. Only prepare flattering words' },
          { zh: 'D. 只带一张嘴，让老师帮我想', en: 'D. Bring nothing and ask the professor to figure it out' },
        ],
        explanation: {
          zh: '见面之前不准备好材料，等于去考试不带笔。老师一同意，你就能说“我都准备好了，稍后邮件发您”。从容不迫，才是高手汪。',
          en: 'Going without materials is like taking an exam without a pen. If the professor agrees, you should be able to say the materials are ready and will be emailed shortly.',
        },
      },
      {
        id: 'in-person-opening',
        title: { zh: '第四关：开场汪', en: 'Round 4: Opening Line' },
        prompt: {
          zh: '汪仔敲开老师办公室的门，第一句话该说什么？',
          en: 'Wangzai knocks on the office door. What should the first sentence be?',
        },
        options: [
          { zh: 'A. “老师，您吃了吗？”（太绕了）', en: 'A. “Professor, have you eaten?” Too indirect' },
          { zh: 'B. “老师，我想出国，您能不能帮我写推荐信？”（太直球）', en: 'B. “I want to study abroad. Can you write me a letter?” Too abrupt' },
          { zh: 'C. “老师好，我最近在准备留学申请，您之前教过我 XX 课，想请教您是否方便帮我写封推荐信？”', en: 'C. “Hello Professor, I’m preparing graduate applications. I took your XX course and wanted to ask whether you might be comfortable writing me a recommendation.”', correct: true },
          { zh: 'D. “老师，您还记得我吗？”（死亡提问）', en: 'D. “Do you remember me?” The fatal question' },
        ],
        explanation: {
          zh: '开场就是“我是谁 + 我上过您什么课 + 我想干嘛”。别让老师猜，也别让老师尴尬。',
          en: 'A strong opening says who you are, how the professor knows you, and what you are asking for. Do not make the professor guess.',
        },
      },
      {
        id: 'in-person-rejection',
        title: { zh: '第五关：撤退汪', en: 'Round 5: Graceful Retreat' },
        prompt: {
          zh: '老师面露难色：“我最近特别忙，可能不太合适。”当面场景下，汪仔该怎么接话？',
          en: 'The professor hesitates: “I’m very busy recently, so I may not be the best fit.” What should Wangzai say in person?',
        },
        options: [
          { zh: 'A. 继续施压：“老师您就帮我一次吧”', en: 'A. Keep pushing: “Please, just help me once.”' },
          { zh: 'B. 立刻微笑：“没关系老师，完全理解，打扰您了，谢谢您的时间！”', en: 'B. Smile and say: “No problem, Professor. I completely understand. Thank you for your time.”', correct: true },
          { zh: 'C. 沉默 5 秒后转身走', en: 'C. Stand silently for five seconds and leave' },
          { zh: 'D. 当场哭出来（教室名场面）', en: 'D. Cry on the spot' },
        ],
        explanation: {
          zh: '当面被拒更要体面。优雅撤退，老师反而会记住你的情商。可以补一句“以后有机会再向您请教”。',
          en: 'If rejected in person, leave gracefully. A calm response protects the relationship and shows emotional intelligence.',
        },
      },
      {
        id: 'in-person-confirm-materials',
        title: { zh: '第六关：确认汪', en: 'Round 6: Confirming the Materials' },
        prompt: {
          zh: '老师点头答应了！当面要不要立刻展示已经准备好的材料？',
          en: 'The professor agrees. Should Wangzai immediately show that the materials are prepared?',
        },
        options: [
          { zh: 'A. 说声“谢谢”就跑，回去再发', en: 'A. Say thanks and run away' },
          { zh: 'B. 当场说：“太感谢了！我已经把所有材料整理好了，稍后邮件发给您，可以吗？”', en: 'B. Say: “Thank you so much. I’ve organized all materials and will email them shortly, if that works for you.”', correct: true },
          { zh: 'C. 拉着老师聊 20 分钟人生', en: 'C. Keep the professor talking for 20 minutes' },
          { zh: 'D. 当场掏出电脑让老师看所有材料', en: 'D. Open the laptop and make the professor review everything immediately' },
        ],
        explanation: {
          zh: '当面答应后，说“我都准备好了”是高光时刻。不要一股脑全塞给老师看，说“稍后邮件发”最得体。',
          en: 'After the professor agrees, showing that everything is ready builds trust. Do not force the professor to review files on the spot; send them neatly by email afterward.',
        },
      },
      {
        id: 'in-person-send-email',
        title: { zh: '第七关：材料汪（邮件发送）', en: 'Round 7: Sending the Materials Email' },
        prompt: {
          zh: '老师点头后，汪仔回到宿舍。材料邮件应该在什么时候发？',
          en: 'After the in-person agreement, Wangzai returns to the dorm. When should the materials email be sent?',
        },
        options: [
          { zh: 'A. 等一周再发，不急', en: 'A. Wait a week; no rush' },
          { zh: 'B. 当天或第二天内发一封邮件：“老师好，今天谢谢您！附上您需要的所有材料如下……”', en: 'B. Send it the same day or next day with a clean list of attached materials', correct: true },
          { zh: 'C. 再跑一趟办公室送 U 盘', en: 'C. Visit the office again with a USB drive' },
          { zh: 'D. 分 10 封邮件慢慢发', en: 'D. Send ten separate emails' },
        ],
        explanation: {
          zh: '见面开了口，邮件要跟上。24 小时内发一封清爽的材料邮件，标题写清楚：Materials for Recommendation – 汪仔 – [课程名]。',
          en: 'Once you ask in person, follow up quickly. Send a clean materials email within 24 hours with a clear subject line.',
        },
      },
      {
        id: 'in-person-reminder',
        title: { zh: '第八关：提醒汪', en: 'Round 8: Reminder' },
        prompt: {
          zh: '距离截止日期还有一周，老师还没动静。当面场景下，怎么提醒最自然？',
          en: 'One week before the deadline, there is still no update. What is the most natural in-person reminder?',
        },
        options: [
          { zh: 'A. 每天去办公室门口晃悠', en: 'A. Hover outside the office every day' },
          { zh: 'B. 课后或办公时间轻声说：“老师好，我上周给您发了材料邮件，第一个截止日期是下周五，想跟您确认一下。”', en: 'B. During office hours or after class, gently mention the materials email and the first deadline', correct: true },
          { zh: 'C. 发邮件（可以，但当面提醒更温柔）', en: 'C. Email only; acceptable, but less warm for this scenario' },
          { zh: 'D. 让同学帮忙递纸条', en: 'D. Ask a classmate to pass a note' },
        ],
        explanation: {
          zh: '当面提醒的秘诀是“顺便 + 轻声 + 提邮件 + 提截止日期”。不必再给纸质材料，说“我上周发了邮件”就够了。',
          en: 'A good in-person reminder is casual, quiet, and specific: mention the email and the deadline. No need to hand over paper materials again.',
        },
      },
      {
        id: 'in-person-thanks',
        title: { zh: '第九关：感恩汪', en: 'Round 9: Thanking the Professor' },
        prompt: {
          zh: '老师终于提交了推荐信。当面场景下，汪仔该怎么感谢？',
          en: 'The professor finally submits the letter. How should Wangzai thank them in an in-person scenario?',
        },
        options: [
          { zh: 'A. 只发一封邮件（偷懒汪）', en: 'A. Only send one email' },
          { zh: 'B. 当面去办公室说声谢谢 + 发一封感谢邮件（双重保险）', en: 'B. Say thank you in person and send a thank-you email', correct: true },
          { zh: 'C. 只在心里感谢', en: 'C. Only feel thankful silently' },
          { zh: 'D. 等拿到 offer 再当面感谢', en: 'D. Wait until an offer arrives' },
        ],
        explanation: {
          zh: '见面开口要，见面开口谢。当面说一句感谢，再补一封邮件留底。可以带小零食或手写卡，不贵重但有心。',
          en: 'If you asked in person, thank them in person too, then follow up by email. A small card or snack is fine; avoid anything expensive.',
        },
      },
      {
        id: 'in-person-backup',
        title: { zh: '第十关：备份汪', en: 'Round 10: Backup Recommender' },
        prompt: {
          zh: '万一当面答应的老师突然出差、生病或失联了，能不能也找一位“替补老师”？',
          en: 'If the professor who agreed in person suddenly travels, gets sick, or becomes unreachable, can Wangzai also prepare a backup recommender?',
        },
        options: [
          { zh: 'A. 不可以，当面答应就是承诺', en: 'A. No, one in-person agreement is final' },
          { zh: 'B. 可以，但不告诉任何人谁是替补，且最终只用需要的数量', en: 'B. Yes, quietly prepare a backup and only use the number of letters needed', correct: true },
          { zh: 'C. 必须在见面前就跟老师坦白“您是备选”', en: 'C. Tell the professor directly that they are a backup' },
          { zh: 'D. 只找一位老师，赌运气', en: 'D. Ask only one professor and gamble' },
        ],
        explanation: {
          zh: '现实操作中可以有“隐形备份”。但不要让两位老师知道彼此存在，更不要说“您是 Plan B”。多准备一个选项叫稳妥。',
          en: 'A quiet backup is realistic risk control. Do not tell a professor they are Plan B, and do not use extra letters beyond what the application needs.',
        },
      },
    ],
  },
  {
    id: 'email',
    emoji: '✉️',
    title: {
      zh: '汪仔的推荐信邮件大冒险',
      en: 'Wangzai’s Recommendation Email Adventure',
    },
    subtitle: {
      zh: '全程用邮件跟老师要推荐信：写之前要做足功课，写的时候要字字讲究。',
      en: 'Requesting a recommendation entirely by email: prepare before writing, then make every line clear and professional.',
    },
    questions: [
      {
        id: 'email-timing',
        title: { zh: '第一关：时机汪（写之前）', en: 'Round 1: Timing Before Writing' },
        prompt: {
          zh: '汪仔打开空白邮件：“我在写邮件之前，应该提前多久发出第一封请求，才不算空降？”',
          en: 'Wangzai opens a blank email: “How early should I send the first request so it does not feel like a surprise drop-in?”',
        },
        options: [
          { zh: 'A. 提前 1-2 天（邮件空降兵）', en: 'A. 1-2 days ahead, pure inbox parachute' },
          { zh: 'B. 提前 1 周（还行，但老师可能排队中）', en: 'B. One week ahead, acceptable but tight' },
          { zh: 'C. 提前 2-4 周（邮件黄金窗口）', en: 'C. 2-4 weeks ahead, the golden email window', correct: true },
          { zh: 'D. 提前一学期（老师：这位同学是谁来着？）', en: 'D. One semester ahead, too early to remember' },
        ],
        explanation: {
          zh: '写邮件之前先看日历。提前 2-4 周，既给足老师时间，又不会让他在收件箱深处把你遗忘。',
          en: 'Check the calendar before writing. Two to four weeks gives the professor enough time without letting the request disappear into the inbox.',
        },
      },
      {
        id: 'email-recommender',
        title: { zh: '第二关：选人汪（写之前）', en: 'Round 2: Recommender Before Writing' },
        prompt: {
          zh: '汪仔对着老师列表发呆：“我在写邮件之前，应该优先选哪位老师？”',
          en: 'Staring at the professor list, Wangzai wonders: “Whom should I prioritize before writing the email?”',
        },
        options: [
          { zh: 'A. 院长（邮件头衔最大）', en: 'A. The dean, biggest title' },
          { zh: 'B. 助教（邮件回复最快）', en: 'B. The teaching assistant, fastest replies' },
          { zh: 'C. 专业课老师，邮件回复慢但记得汪仔的作业', en: 'C. The course professor who may reply slowly but remembers Wangzai’s work', correct: true },
          { zh: 'D. 群发三个人（广撒网等谁先回）', en: 'D. Mass email three people and see who replies first' },
        ],
        explanation: {
          zh: '写邮件之前先问：这位老师能写出“汪仔那次作业如何惊艳我”吗？能，就选他。不能，头衔再大也没用。',
          en: 'Ask whether this professor can write a concrete example about your work. If yes, choose them. If not, title alone does not help.',
        },
      },
      {
        id: 'email-materials-before',
        title: { zh: '第三关：材料汪（写之前）', en: 'Round 3: Materials Before Writing' },
        prompt: {
          zh: '汪仔准备写邮件了。“我在写邮件之前，应该把哪些材料提前准备好？”',
          en: 'Before writing the request email, what materials should Wangzai prepare?',
        },
        options: [
          { zh: 'A. 什么都不准备，等老师要了再说', en: 'A. Prepare nothing until the professor asks' },
          { zh: 'B. CV、成绩单、项目清单、截止日期表，全部整理好随时能附上', en: 'B. CV, transcript, project list, and deadline table, ready to attach', correct: true },
          { zh: 'C. 只准备一肚子好话', en: 'C. Only prepare compliments' },
          { zh: 'D. 只准备成绩单', en: 'D. Only prepare the transcript' },
        ],
        explanation: {
          zh: '写邮件之前，材料要先躺在文件夹里。老师一同意，你就能秒回附件。别等老师问“你有 CV 吗”才去翻电脑。',
          en: 'Before writing, the materials should already be organized. If the professor agrees, you can send attachments immediately.',
        },
      },
      {
        id: 'email-subject',
        title: { zh: '第四关：标题汪（邮件内容）', en: 'Round 4: Email Subject' },
        prompt: {
          zh: '邮件标题要注意什么，才能让老师一眼认出我，又不被扔进垃圾箱？',
          en: 'What should the email subject do so the professor recognizes the request and does not ignore it?',
        },
        options: [
          { zh: 'A. “老师救我！！！”（太浮夸）', en: 'A. “Professor, save me!!!” Too dramatic' },
          { zh: 'B. “一封推荐信请求”（太模糊）', en: 'B. “A recommendation request” Too vague' },
          { zh: 'C. “Recommendation Request for 汪仔 – 您的[课程名]学生”', en: 'C. “Recommendation Request for Wangzai – Student from Your [Course Name]”', correct: true },
          { zh: 'D. “【请尽快阅读】重要邮件”（太像诈骗）', en: 'D. “Important, please read immediately” Too spam-like' },
        ],
        explanation: {
          zh: '邮件标题就是第一印象。把“我是谁 + 我要干嘛”写清楚。别玩花活，老师没时间猜谜。',
          en: 'The subject line is the first impression. Clearly state who you are and what you are requesting.',
        },
      },
      {
        id: 'email-opening',
        title: { zh: '第五关：开场汪（邮件内容）', en: 'Round 5: Opening Paragraph' },
        prompt: {
          zh: '邮件正文第一段要注意什么，才能让老师迅速想起来我是谁？',
          en: 'What should the first paragraph do so the professor quickly remembers who you are?',
        },
        options: [
          { zh: 'A. “您好，我是汪仔。”（太简单）', en: 'A. “Hello, I am Wangzai.” Too simple' },
          { zh: 'B. “我是您[学期][课程名]课上的学生汪仔，学号 XXX，那门课我得了 A。”', en: 'B. “I am Wangzai, student ID XXX, from your [semester] [course name] class, where I received an A.”', correct: true },
          { zh: 'C. “您还记得我吗？”（死亡提问）', en: 'C. “Do you remember me?” The fatal question' },
          { zh: 'D. “这是一封很重要的邮件。”（废话）', en: 'D. “This is a very important email.” Empty filler' },
        ],
        explanation: {
          zh: '邮件开头要一秒钟唤醒记忆：哪学期、哪门课、成绩如何（如果好）。别让老师翻三页通讯录才想起你。',
          en: 'The opening should trigger memory instantly: semester, course name, and grade if strong. Do not make the professor search for context.',
        },
      },
      {
        id: 'email-waive-right',
        title: { zh: '第六关：自信汪（邮件内容）', en: 'Round 6: Waive Right' },
        prompt: {
          zh: '汪仔写到推荐信系统的选项：“邮件里要不要主动提放弃查看权（waive right）？”',
          en: 'When discussing the recommendation system, should Wangzai mention waiving the right to view the letter?',
        },
        options: [
          { zh: 'A. 不提，等老师自己发现', en: 'A. Do not mention it; let the professor find out' },
          { zh: 'B. 主动写“我已勾选放弃查看权，这份推荐信您可以直接提交”', en: 'B. State that you have waived the right to view it and the professor may submit directly', correct: true },
          { zh: 'C. 告诉老师“我会偷偷看一眼的”', en: 'C. Say you will secretly peek at it' },
          { zh: 'D. 这个选项不重要，随便', en: 'D. It does not matter' },
        ],
        explanation: {
          zh: '邮件里主动提“我已 waive”，等于表达信任和自信。招生官看了更放心，老师写起来也更踏实。',
          en: 'Mentioning that you waived the right shows trust and confidence. It also makes the letter more credible to admissions readers.',
        },
      },
      {
        id: 'email-attachments',
        title: { zh: '第七关：材料附上汪（邮件内容）', en: 'Round 7: Attachments' },
        prompt: {
          zh: '老师回复“可以，发材料来”。汪仔写回复邮件时，附件的注意事项是什么？',
          en: 'The professor replies, “Sure, send me the materials.” What should Wangzai do with attachments?',
        },
        options: [
          { zh: 'A. 直接甩 5 个文件，不解释', en: 'A. Drop five files with no explanation' },
          { zh: 'B. 正文里写“附件共 X 个文件：1.CV 2.成绩单 3.项目清单 4.截止日期表 5.推荐信模板”', en: 'B. List every attachment clearly in the email body', correct: true },
          { zh: 'C. 只发成绩单，保持神秘', en: 'C. Only send the transcript and keep everything mysterious' },
          { zh: 'D. 把文件压缩成一个叫“新建文件夹.zip”的包', en: 'D. Zip everything into “New Folder.zip”' },
        ],
        explanation: {
          zh: '附件要有说明书。正文里列清楚有几个、分别是什么，老师不用猜，也不怕漏。',
          en: 'Attachments need a table of contents. List how many files there are and what each one is so the professor does not have to guess.',
        },
      },
      {
        id: 'email-deadline',
        title: { zh: '第八关：截止日期汪（邮件内容）', en: 'Round 8: Deadline' },
        prompt: {
          zh: '截止日期在邮件里应该怎么呈现，才不显得像催命？',
          en: 'How should deadlines be presented in the email without sounding like an order?',
        },
        options: [
          { zh: 'A. “请在下周五前提交！”（命令式）', en: 'A. “Please submit by next Friday!” Too commanding' },
          { zh: 'B. “截止日期是 X 月 X 日，您看方便吗？”（推卸式）', en: 'B. “The deadline is X date. Is that convenient?” Too vague' },
          { zh: 'C. “第一个截止日期是 X 月 X 日（还有 X 周）。我会在截止前一周再提醒您一次。”', en: 'C. “The first deadline is X date, X weeks away. I will send a reminder one week before the deadline.”', correct: true },
          { zh: 'D. 不写截止日期，等老师主动问', en: 'D. Do not mention deadlines until the professor asks' },
        ],
        explanation: {
          zh: '邮件里写截止日期，是给老师一张时间地图。明确日期 + 提前告知会提醒，专业又贴心。',
          en: 'A deadline is a time map. State the date clearly and say when you will remind them.',
        },
      },
      {
        id: 'email-refusal',
        title: { zh: '第九关：拒绝信号汪（邮件内容）', en: 'Round 9: Refusal Signal' },
        prompt: {
          zh: '老师回复：“你可能找其他老师更合适。”汪仔在回复邮件时要注意什么？',
          en: 'The professor replies, “You may be better off asking another teacher.” What should Wangzai do?',
        },
        options: [
          { zh: 'A. 再发三封追问：“老师再考虑一下嘛”', en: 'A. Send three follow-ups asking them to reconsider' },
          { zh: 'B. 回复“谢谢老师考虑，我明白了，打扰您了”并停止', en: 'B. Thank the professor, say you understand, and stop pushing', correct: true },
          { zh: 'C. 不回复，装没看见', en: 'C. Do not reply and pretend nothing happened' },
          { zh: 'D. 回复“老师您是不是误会了”', en: 'D. Reply, “Did you misunderstand?”' },
        ],
        explanation: {
          zh: '邮件里的婉拒就是真婉拒。回复要短、要谢、要撤。别把收件箱变成辩论场。',
          en: 'A polite refusal is still a refusal. Keep the reply short, thankful, and final.',
        },
      },
      {
        id: 'email-thanks',
        title: { zh: '第十关：感恩汪（邮件内容）', en: 'Round 10: Thank-You Email' },
        prompt: {
          zh: '老师终于提交了推荐信。感谢邮件要注意什么？',
          en: 'The professor finally submits the recommendation letter. What should the thank-you email look like?',
        },
        options: [
          { zh: 'A. 只写“谢谢”两个字', en: 'A. Only write “thanks”' },
          { zh: 'B. “老师太感谢您了！等我拿到 offer 一定邮件跟您报喜。祝您一切顺利！”', en: 'B. “Thank you so much, Professor. I’ll update you when I receive offers. Wishing you all the best!”', correct: true },
          { zh: 'C. 什么都不发', en: 'C. Send nothing' },
          { zh: 'D. 发一封 3000 字人生总结', en: 'D. Send a 3,000-word life story' },
        ],
        explanation: {
          zh: '感谢邮件要真诚但不啰嗦。一句话感谢 + 一句未来报喜 + 一句祝福。别太长，老师没时间读小说。',
          en: 'A thank-you email should be sincere and concise: thanks, a promise to update them, and a brief good wish.',
        },
      },
    ],
  },
])
