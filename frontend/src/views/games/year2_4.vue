<template>
  <div class="archive-game">
    <div class="header">
      <h2><i class="fas fa-scroll"></i> {{ t('pages.y2_4.title') }}</h2>
      <p v-if="gamePhase === 'trackSelect'">{{ t('pages.y2_4.selectTrack.intro') }}</p>
      <p v-else>{{ t('pages.y2_4.intro') }}</p>
      <div class="progress-bar" v-if="gamePhase === 'caseAnswering'">
        <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-text" v-if="gamePhase === 'caseAnswering'">
        {{ t('pages.y2_4.caseIndicator', { current: Math.min(currentCaseIndex + 1, currentTrackCases.length), total: currentTrackCases.length, track: t(`pages.y2_4.tracks.${selectedTrack}`) }) }}
      </div>
    </div>

    <section class="case-arena">
      <!-- 路线选择画面 -->
      <div v-if="gamePhase === 'trackSelect'" class="track-selection screen-center">
        <KnowledgeGuidePanel
          :title="t('pages.y2_4.guide.button')"
          :body="t('pages.y2_4.guide.body')"
          :items="guideItems"
        />
        <div class="track-buttons">
          <button class="btn-track ee" @click="selectTrack('ee')">
            <i class="fas fa-bolt"></i> {{ t('pages.y2_4.selectTrack.ee') }}
          </button>
          <button class="btn-track ics" @click="selectTrack('ics')">
            <i class="fas fa-laptop-code"></i> {{ t('pages.y2_4.selectTrack.ics') }}
          </button>
        </div>
      </div>

      <!-- 答题中 -->
      <div v-if="gamePhase === 'caseAnswering' && currentCase" class="case-card" :class="{ 'reveal-correct': feedbackCorrect, 'reveal-wrong': feedbackWrong }">
        <div class="portrait">{{ currentCase.icon }}</div>
        <div class="profile-data">
          <div class="profile-row">
            <span class="label">{{ currentCase.name[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
            <span class="value track-info">{{ currentCase.profile.background[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
          </div>
          <div class="profile-row">
            <span class="label">{{ t('pages.y2_4.labels.gpa') }}:</span>
            <span class="value gpa">{{ currentCase.profile.gpa[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
          </div>
          <div class="profile-row">
            <span class="label">{{ t('pages.y2_4.labels.evidence') }}:</span>
            <span class="value evidence">{{ currentCase.profile.keyEvidence[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
          </div>
          <div class="profile-row weakness" v-if="currentCase.profile.weakness">
            <span class="label">{{ t('pages.y2_4.labels.weakness') }}:</span>
            <span class="value">{{ currentCase.profile.weakness[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
          </div>
        </div>

        <!-- 选择按钮 -->
        <div v-if="!answered" class="choices">
          <button v-for="(choice, index) in currentCase.choices" :key="index" type="button" class="btn-choice" @click="judgeCase(index)">
            {{ choice[currentLanguage === 'en' ? 'en' : 'zh'] }}
          </button>
        </div>

        <!-- 反馈 -->
        <div v-else ref="resultRef" class="feedback-box" :class="{ correct: feedbackCorrect, wrong: feedbackWrong }">
          <div v-if="feedbackCorrect" class="feedback">
            <i class="fas fa-check-circle"></i>
            <div class="truth-title">{{ currentCase.truth.title[currentLanguage === 'en' ? 'en' : 'zh'] }}</div>
            <div class="truth-text">{{ currentCase.truth.description[currentLanguage === 'en' ? 'en' : 'zh'] }}</div>
          </div>
          <div v-else class="feedback">
            <i class="fas fa-times-circle"></i>
            <div class="error-title">{{ t('pages.y2_4.wrongAnswer') }}</div>
            <div class="truth-text">{{ currentCase.truth.title[currentLanguage === 'en' ? 'en' : 'zh'] }}: {{ currentCase.truth.description[currentLanguage === 'en' ? 'en' : 'zh'] }}</div>
          </div>

          <!-- 实时分析：拒信/性格线索 -->
          <div class="rejection-spoiler">
            <i class="fas fa-search"></i>
            <strong>{{ t('pages.y2_4.analysisLabel') }}:</strong>
            <p>{{ currentCase.rejectionAnalysis[currentLanguage === 'en' ? 'en' : 'zh'] }}</p>
          </div>
          <div v-if="!feedbackCorrect && personalityLog.length && personalityLog[personalityLog.length-1].personalityHint" class="personality-hint-badge">
            {{ personalityLog[personalityLog.length-1].personalityHint.label[currentLanguage === 'en' ? 'en' : 'zh'] }}
          </div>

          <button v-if="currentCaseIndex < currentTrackCases.length - 1" type="button" class="btn-next" @click="nextCase">
            <i class="fas fa-arrow-right"></i> {{ t('common.actions.next') }}
          </button>
          <button v-else type="button" class="btn-complete" @click="completeArchive">
            <i class="fas fa-check"></i> {{ t('pages.y2_4.complete') }}
          </button>
        </div>
      </div>

      <!-- 完成画面 -->
      <div v-if="gamePhase === 'complete'" class="completion-screen">
        <div class="completion-icon">✨</div>
        <h3>{{ t('pages.y2_4.completionTitle') }}</h3>
        <p>{{ completedCorrect }} / {{ currentTrackCases.length }} {{ t('pages.y2_4.correctLabel') }}</p>
        <div class="personality-analysis-card">
          <h4>{{ t('pages.y2_4.personalityReport.title') }}</h4>
          <p class="analysis-text">{{ completionAnalysis }}</p>
          <div class="index-bars" v-if="totalMistakes > 0">
            <div class="bar optimistic" :style="{ width: optimisticPercent + '%' }">
              🟡 {{ t('pages.y2_4.personalityReport.optimistic') }} {{ optimisticPercent }}%
            </div>
            <div class="bar pessimistic" :style="{ width: pessimisticPercent + '%' }">
              🟤 {{ t('pages.y2_4.personalityReport.pessimistic') }} {{ pessimisticPercent }}%
            </div>
          </div>
          <div v-else class="perfect-badge">
            ✨ {{ t('pages.y2_4.personalityReport.perfectBalance') }}
          </div>
        </div>
        <div class="completion-actions">
          <button type="button" class="btn-retry" @click="retryGame">
            {{ t('common.actions.retry') }}
          </button>
          <button type="button" class="btn-claim" @click="emit('complete', { rewardCoins })">
            {{ t('pages.y2_4.claimAndContinue', { coins: rewardCoins }) }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const rewardCoins = 30
const emit = defineEmits(['complete', 'close'])
const { tm, t, currentLanguage } = useAppI18n()

// 案例数据库 —— 严格按照上传的两个文档构建
const caseDB = {
  ee: [
    {
      id: 'ee1', icon: '🧑‍💻',
      name: { en: 'Senior EE-1', zh: '学长 EE-1' },
      profile: {
        gpa: { en: 'Y1–Y3 Avg: 58 / 61 / 75', zh: '大一~大三均分：58 / 61 / 75' },
        background: { en: 'EE track, multiple research & internship', zh: 'EE专业，多段科研与实习' },
        keyEvidence: { en: '2 patents, MPPT controller project, Bosch internship, etc.', zh: '2项专利，MPPT控制器项目，博世热力实习等' },
        weakness: { en: 'Low GPA, especially in junior year', zh: 'GPA偏低，尤其大三专业课' }
      },
      choices: [
        { en: 'A. Rejection Storm: IC Future Power, UCL Power System', zh: 'A. 拒信风暴：IC未来电网、UCL电力系统发拒信' },
        { en: 'B. Mixed Success: IC Advanced Computing rejected, NUS EE accepted', zh: 'B. 喜忧参半：IC高级计算被拒，NUS电气录取' }
      ],
      correctIndex: 0,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Rejection Storm', zh: '真相：拒信风暴' },
        description: { en: 'Despite rich experience, his low GPA proved to be a fatal block for top UK programmes.', zh: '尽管经历丰富，偏低的GPA成为冲刺英国顶尖项目的致命伤。' }
      },
      rejectionAnalysis: {
        en: 'IC and UCL are highly GPA‑centric. A sub‑60 average in a key year (Y3:75) often triggers an automatic filter, overshadowing even strong practical projects.',
        zh: 'IC与UCL极度重视均分，大三75分这一关键年份的弱势往往触发机筛，让丰富的项目经历也难以补救。'
      }
    },
    {
      id: 'ee2', icon: '👩‍🎓',
      name: { en: 'Senior EE-2', zh: '学长 EE-2' },
      profile: {
        gpa: { en: 'Y1–Y3 Avg: 72 / 78 / 83', zh: '大一~大三均分：72 / 78 / 83' },
        background: { en: 'EE track, strong projects & internship', zh: 'EE专业，项目与实习扎实' },
        keyEvidence: { en: 'IEEE conference paper, NARI internship, SURF project', zh: 'IEEE会议论文，南瑞集团实习，SURF科研项目' },
        weakness: { en: 'GPA not top‑tier for hyper‑competitive CS/EE programmes', zh: '对于最顶尖项目，GPA并非绝对优势' }
      },
      choices: [
        { en: 'A. Dream Shot: Oxford Energy Systems, NUS EE both accepted', zh: 'A. 冲刺成功：牛津能源系统、新国立EE双录取' },
        { en: 'B. Realistic Mix: Oxford & NUS rejected, HKU & Manchester accepted', zh: 'B. 现实情况：牛津、新国立被拒，港大、曼大录取' }
      ],
      correctIndex: 1,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Truth: Missed the Very Top, Landed Solid Offers', zh: '真相：失之东隅，收之桑榆' },
        description: { en: 'Strong but not exceptional GPA + good evidence couldn’t break the Oxford ceiling, yet still secured quality admissions.', zh: 'GPA扎实但未达天花板，牛津仍差一口气，不过整体录取质量很高。' }
      },
      rejectionAnalysis: {
        en: 'Oxford energy programmes often expect an average above 85/100 or equivalent, plus high‑profile publications. A solid but not stellar profile often falls just short.',
        zh: '牛津能源类项目通常期望均分85+或等效成绩，以及高影响力论文。踏实的背景仍有微弱差距。'
      }
    },
    {
      id: 'ee3', icon: '🧑‍🔬',
      name: { en: 'Senior EE-3', zh: '学长 EE-3' },
      profile: {
        gpa: { en: 'Y1–Y3 Avg: 61 / 69 / 77', zh: '大一~大三均分：61 / 69 / 77' },
        background: { en: 'EE track, GaN research, multiple publications', zh: 'EE专业，GaN半导体研究，多篇论文' },
        keyEvidence: { en: '3 papers (1st author conference), APMCM award', zh: '3篇论文（一作会议），亚太建模二等奖' },
        weakness: { en: 'GPA upward trend but early years weak', zh: 'GPA呈上升趋势但前期较低' }
      },
      choices: [
        { en: 'A. Swept by US top tiers: UW, UPenn, Rice, TAMU, NEU', zh: 'A. 美硕丰收：华盛顿、宾大、莱斯、德州农工、东北大学录取' },
        { en: 'B. Crushed: Rejected by all target US schools', zh: 'B. 全军覆没：所有目标美校均被拒' }
      ],
      correctIndex: 0,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: US EE Success', zh: '真相：美硕全面开花' },
        description: { en: 'Strong research output offset a moderate GPA, earning multiple respectable US admissions.', zh: '硬核的科研成果弥补了中等的GPA，拿下了多个优质美国EE录取。' }
      },
      rejectionAnalysis: {
        en: 'US committees often value research richness. His GaN chip design papers and modelling competition showed clear technical depth, convincing UW and UPenn despite the 61–69 early grades.',
        zh: '美国招生委常更看重科研深度。他的GaN芯片设计论文与建模竞赛展示了扎实技术能力，弥补了前两年均分不高的短板。'
      }
    },
    {
      id: 'ee4', icon: '🧑‍🏭',
      name: { en: 'Senior EE-4', zh: '学长 EE-4' },
      profile: {
        gpa: { en: 'Y1–Y3 Avg: 65 / 61 / 61', zh: '大一~大三均分：65 / 61 / 61' },
        background: { en: 'EE track, average grades, basic projects', zh: 'EE专业，成绩平平，项目基础' },
        keyEvidence: { en: 'Quadruped robot project, SAT club volunteer', zh: '四足机器人项目，社团宣传经历' },
        weakness: { en: 'Low & stagnant GPA, no strong technical internship', zh: 'GPA低且停滞，缺乏硬核技术实习' }
      },
      choices: [
        { en: 'A. Miracle Escape: KCL Robotics, Edinburgh, Warwick all admitted', zh: 'A. 低分逆袭：KCL机器人、爱丁堡、华威全部录取' },
        { en: 'B. Logical Outcome: All rejections from target schools', zh: 'B. 意料之中：目标学校全部拒信' }
      ],
      correctIndex: 0,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Low GPA Still Opened Doors', zh: '真相：低分也有春天' },
        description: { en: 'Even with a 65/61/61, a focused robot project and decent campus involvement secured respectable UK offers.', zh: '即使均分仅65/61/61，聚焦的机器人项目与校园活动仍帮他拿下了不错的英国录取。' }
      },
      rejectionAnalysis: {
        en: 'Not all UK programmes use a rigid GPA cutoff. A well‑presented project on a trendy topic (robotics) can sometimes swing the decision, especially at universities that value practical skills.',
        zh: '并非所有英国项目都卡死均分。一个呈现在热门领域（机器人）上的具体项目，有时能打动看重动手能力的学校。'
      }
    },
    {
      id: 'ee5', icon: '👩‍💻',
      name: { en: 'Senior EE-5', zh: '学长 EE-5' },
      profile: {
        gpa: { en: 'Y1–Y3 Avg: 64 / 73 / 77', zh: '大一~大三均分：64 / 73 / 77' },
        background: { en: 'EE, circuit design VCO/IDAC, power institute internship', zh: 'EE，压控振荡器/数模芯片设计，电力科学研究院实习' },
        keyEvidence: { en: 'SURF VCO & IDAC design, Cadence layout, UPenn/JHU/IC/CMU offers', zh: 'SURF芯片设计项目，Cadence版图，斩获UPenn/JHU/IC/CMU录取' },
        weakness: { en: 'GPA not outstanding, lacked top‑tier publications', zh: 'GPA不算突出，缺乏顶级论文' }
      },
      choices: [
        { en: 'A. Decent but not elite: Only mid‑tier US admissions', zh: 'A. 中规中矩：仅获得美国中档学校录取' },
        { en: 'B. Elite Breakthrough: UPenn, JHU, CMU, IC all admitted', zh: 'B. 顶尖突破：UPenn、JHU、CMU、IC全部录取' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Circuit Design Won Big', zh: '真相：电路设计大胜' },
        description: { en: 'Hands‑on chip design experience on Cadence proved highly attractive, landing multiple top‑tier EE/ECE offers.', zh: '基于Cadence的真实芯片设计经历极具说服力，一举拿下多个顶尖ECE/EE录取。' }
      },
      rejectionAnalysis: {
        en: 'In VLSI and microelectronics, concrete tape‑out or design experience is rare and highly valued. His SURF projects directly matched the research interests of target labs, overshadowing a modest GPA.',
        zh: '在VLSI和微电子领域，实际的芯片设计或流片经验稀缺且极受重视。他的SURF项目直接对上了目标实验室的科研兴趣，弱化了GPA的劣势。'
      }
    }
  ],
  ics: [
    {
      id: 'cs1', icon: '🧑‍💻',
      name: { en: 'Senior CS-1', zh: '学长 CS-1' },
      profile: {
        gpa: { en: 'GPA 3.5 / 4.0', zh: 'GPA 3.5 / 4.0' },
        background: { en: 'ICS track, data analysis & game dev internship', zh: 'ICS专业，数据分析+游戏开发实习' },
        keyEvidence: { en: 'IELTS 7.0, two solid internships', zh: '雅思7.0，两段扎实实习' },
        weakness: { en: 'GPA good but not exceptional for top US CS', zh: 'GPA不错但对顶尖美硕CS仍非绝对优势' }
      },
      choices: [
        { en: 'A. Dream Rejected by JHU CS, but CMU Information Systems accepted', zh: 'A. 折衷：JHU计算机被拒，CMU信息系统录取' },
        { en: 'B. Sweep: Both JHU CS and CMU INI accepted', zh: 'B. 横扫：JHU与CMU同时录取' }
      ],
      correctIndex: 0,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Truth: CMU Opened, JHU Closed', zh: '真相：CMU开门，JHU关门' },
        description: { en: 'CMU’s information system track valued the internship mix; JHU CS expected a higher GPA and stronger research.', zh: 'CMU信息系统看重实习组合，JHU纯CS则期望更高的GPA和科研背景。' }
      },
      rejectionAnalysis: {
        en: 'JHU CS is highly selective and research‑heavy. A 3.5 with no research papers often can’t compete, even with good internships. CMU’s MISM, on the other hand, loves industry exposure.',
        zh: 'JHU计算机偏重科研，3.5且无论文的情况下很难竞争；CMU信息系统则更青睐产业经验。'
      }
    },
    {
      id: 'cs2', icon: '👩‍🎓',
      name: { en: 'Senior CS-2', zh: '学长 CS-2' },
      profile: {
        gpa: { en: 'Average 67/100', zh: '均分67/100' },
        background: { en: 'ICS, HCI research + 3 data internships', zh: 'ICS，人机交互科研+3段数据分析实习' },
        keyEvidence: { en: 'UCL Connected Environment offer', zh: '已获UCL互联环境录取' },
        weakness: { en: 'Mediocre GPA, IELTS 6.5 (borderline)', zh: '均分普通，雅思6.5（刚过线）' }
      },
      choices: [
        { en: 'A. Only UCL Connected Environment admitted, Urban Spatial Science pending', zh: 'A. 仅UCL互联环境录取，城市空间科学无消息' },
        { en: 'B. Both UCL programmes admitted', zh: 'B. UCL两个专业均被录取' }
      ],
      correctIndex: 0,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Truth: One Out of Two', zh: '真相：二取一' },
        description: { en: 'The HCI-oriented internship matched Connected Environment well, but Urban Spatial Science likely wanted stronger quantitative background.', zh: '人机交互实习匹配了互联环境，城市空间科学则对量化背景要求更高。' }
      },
      rejectionAnalysis: {
        en: 'UCL looks for precise fit. The Connected Environment programme valued his interaction design and data vis experience, while Spatial Science probably required more GIS or statistics skills beyond his profile.',
        zh: 'UCL非常看重精准匹配。互联环境看重交互设计与数据可视化，空间科学则更需GIS或统计背景，他的履历未能完全覆盖后者。'
      }
    },
    {
      id: 'cs3', icon: '👨‍💼',
      name: { en: 'Senior CS-3', zh: '学长 CS-3' },
      profile: {
        gpa: { en: 'GPA 3.3 / 4.0', zh: 'GPA 3.3 / 4.0' },
        background: { en: 'ICS, 2 Chinese core papers, small company internships', zh: 'ICS，两篇中文核心论文，小企业数据分析实习' },
        keyEvidence: { en: 'No language score submitted', zh: '未提交语言成绩' },
        weakness: { en: 'Low GPA, no IELTS, weak brand internships', zh: 'GPA偏低，无雅思，实习公司不知名' }
      },
      choices: [
        { en: 'A. Shutout: Rejected by Melbourne, Edinburgh, etc.', zh: 'A. 全军覆没：被墨尔本、爱丁堡等拒绝' },
        { en: 'B. Diversified Wins: Sydney CS, Bristol Robotics, UCL Global Leadership, Manchester Health Data Science', zh: 'B. 多元录取：悉尼计算机、布里斯托机器人、UCL全球领导力、曼大健康数据科学' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Papers Opened Unexpected Doors', zh: '真相：论文撬开意外之门' },
        description: { en: 'Even without IELTS, the two publications demonstrated research ability, leading to multiple decent offers.', zh: '即使没有雅思，两篇核心论文证明了研究潜力，仍拿到多个不错录取。' }
      },
      rejectionAnalysis: {
        en: 'Some universities issue conditional offers without IELTS. The Chinese journal papers signaled research involvement, which appealed to programmes like Bristol Robotics and health data science.',
        zh: '部分学校可发有条件录取。中文核心论文表明科研参与度，吸引了布里斯托机器人、健康数据科学等强调研究的项目。'
      }
    },
    {
      id: 'cs4', icon: '👩‍🔬',
      name: { en: 'Senior CS-4', zh: '学长 CS-4' },
      profile: {
        gpa: { en: 'Average 72/100', zh: '均分72/100' },
        background: { en: 'ICS, HCI course project, navigation app + AI PM internship', zh: 'ICS，人机交互作业，导航软件开发+AI产品经理实习' },
        keyEvidence: { en: 'UCL KIDS, Manchester AI, Edinburgh Cognitive Science offers', zh: 'UCL KIDS、曼大AI、爱丁堡认知科学录取' },
        weakness: { en: 'IELTS 6.5 (5.5 in one component), course project only', zh: '雅思6.5（有一项5.5），仅课程项目' }
      },
      choices: [
        { en: 'A. Rejected everywhere due to low IELTS writing/speaking', zh: 'A. 雅思小分低，全部被拒' },
        { en: 'B. Admitted to UCL, Manchester, Edinburgh', zh: 'B. 成功拿下UCL、曼大、爱丁堡录取' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: IELTS Sub‑score Not a Wall', zh: '真相：小分未成高墙' },
        description: { en: 'A weak IELTS component didn’t block offers; the overall profile and internship carried the application.', zh: '雅思小分缺陷并未阻挡录取；整体背景与实习成功弥补。' }
      },
      rejectionAnalysis: {
        en: 'Many UK programmes accept lower IELTS sub‑scores if the overall score meets the threshold, and some even offer pre‑sessional courses. The AI PM internship signalled modern tech relevance.',
        zh: '很多英国项目允许小分略低或配语言班。AI产品经理实习体现前沿产业意识，加了分。'
      }
    },
    {
      id: 'cs5', icon: '🧑‍🎨',
      name: { en: 'Senior CS-5', zh: '学长 CS-5' },
      profile: {
        gpa: { en: 'Average 55/100', zh: '均分55/100' },
        background: { en: 'ICS, once repeated a year', zh: 'ICS，大二曾留级' },
        keyEvidence: { en: 'IELTS 6.5, perseverance', zh: '雅思6.5，坚韧不拔' },
        weakness: { en: 'Very low GPA, academic struggle history', zh: '均分极低，有学术困难史' }
      },
      choices: [
        { en: 'A. Miraculous Rebound: Monash IT, Sydney CS admitted', zh: 'A. 奇迹翻身：莫纳什IT、悉尼计算机录取' },
        { en: 'B. Unsurprising Outcome: All rejections', zh: 'B. 不出意料：全部拒信' }
      ],
      correctIndex: 0,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Second Chances Happen', zh: '真相：第二次机会存在' },
        description: { en: 'Even with a 55 and a repeated year, Australian universities valued the commitment and gave offers.', zh: '即使均分55且留过级，澳洲大学仍看重其坚持与潜力，发出了录取。' }
      },
      rejectionAnalysis: {
        en: 'Australian universities often apply holistic review. The personal growth story and decent IELTS may have convinced them, especially for coursework masters.',
        zh: '澳洲大学常采用整体审查，个人的成长故事和达标的雅思可能说服了招生官，尤其对授课型硕士。'
      }
    },
    {
      id: 'cs6', icon: '👩‍💻',
      name: { en: 'Senior CS-6', zh: '学长 CS-6' },
      profile: {
        gpa: { en: 'GPA 3.79 / 4.0', zh: 'GPA 3.79 / 4.0' },
        background: { en: 'ICS, 3 SURF + CMU research, 2 papers, Alibaba NLP internship', zh: 'ICS，3段SURF+CMU科研，2篇论文，阿里NLP实习' },
        keyEvidence: { en: 'Harvard Health Data Science, UCSD CS, NTU AI offers', zh: '哈佛健康数据科学、UCSD计算机、南洋理工AI录取' },
        weakness: { en: 'IELTS 6.5(6), could be higher for top US', zh: '雅思6.5(6)，对顶尖美校不算高' }
      },
      choices: [
        { en: 'A. Crushed by rejections: Only UIUC/Wisconsin level schools', zh: 'A. 惨遭重创：仅UIUC级别学校录取' },
        { en: 'B. Elite Sweep: Harvard, UCSD, NTU all accepted', zh: 'B. 横扫精英：哈佛、UCSD、南洋理工全录取' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Ivy-Level Success', zh: '真相：藤校级收割' },
        description: { en: 'Exceptional research depth and industry AI experience landed one of the best health data science programmes.', zh: '极佳的科研深度与阿里AI实习，叩开了顶级健康数据科学的大门。' }
      },
      rejectionAnalysis: {
        en: 'Harvard’s Health DS programme values real‑world AI application. His Alibaba NLP experience and deep learning papers made him a perfect fit, even with a slightly modest IELTS.',
        zh: '哈佛健康数据科学看重AI的实际应用。阿里NLP实习与深度学习论文完美契合，雅思的小瑕疵被忽略。'
      }
    },
    {
      id: 'cs7', icon: '👨‍💻',
      name: { en: 'Senior CS-7', zh: '学长 CS-7' },
      profile: {
        gpa: { en: 'GPA 3.71 / 4.0', zh: 'GPA 3.71 / 4.0' },
        background: { en: 'ICS, CV intern at ECNU, Kaggle bronze', zh: 'ICS，华东师大CV算法实习，Kaggle铜牌' },
        keyEvidence: { en: 'CityU AI, NTU AI, Edinburgh HPC offers', zh: '港城AI、南洋理工AI、爱丁堡高性能计算录取' },
        weakness: { en: 'IELTS 6.5, no research papers', zh: '雅思6.5，无论文' }
      },
      choices: [
        { en: 'A. Hong Kong & Singapore doors closed', zh: 'A. 港新大门关闭' },
        { en: 'B. CityU and NTU AI both admitted', zh: 'B. 港城与南洋理工AI双双录取' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: AI Experience Carried', zh: '真相：AI经历撑起大局' },
        description: { en: 'Hands‑on CV internship and competition results demonstrated practical AI skills, convincing top Asian AI programmes.', zh: '实际的CV实习与竞赛奖牌证明了AI动手能力，说服了亚洲顶尖AI项目。' }
      },
      rejectionAnalysis: {
        en: 'NTU AI especially appreciates project‑heavy CV students. His ECNU internship and Kaggle record directly matched the programme’s applied focus.',
        zh: '南洋理工AI尤其青睐有项目落地经验的学生，华师大CV实习与Kaggle记录直接对标项目应用导向。'
      }
    },
    {
      id: 'cs8', icon: '👩‍🎓',
      name: { en: 'Senior CS-8', zh: '学长 CS-8' },
      profile: {
        gpa: { en: 'Y3 Avg 82/100', zh: '大三均分82/100' },
        background: { en: 'ICS, full scholarship, 3 robotics/deep learning research, backend internship', zh: 'ICS，大二大三全奖，3段机器人/深度学习科研，中厂后端实习' },
        keyEvidence: { en: 'NUS Robotics, IC ACSE, UCL Medical Robot offers', zh: 'NUS机器人、IC高级计算科学、UCL医疗机器人录取' },
        weakness: { en: 'IELTS 6.5(6), no published papers', zh: '雅思6.5(6)，无论文发表' }
      },
      choices: [
        { en: 'A. Elite rejection spree', zh: 'A. 精英项目集体拒信' },
        { en: 'B. NUS, IC, UCL all admitted', zh: 'B. NUS、IC、UCL全录取' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Scholarship + Experience = Win', zh: '真相：奖学金+经验=胜利' },
        description: { en: 'Continuous scholarship and hands‑on robotics research made him a strong candidate despite the lack of formal papers.', zh: '连续奖学金与机器人实战经验让他成为强有力候选人，即使没有正式论文。' }
      },
      rejectionAnalysis: {
        en: 'Imperial and NUS highly value practical engineering projects. The combination of funding (scholarship) and a clear robotics narrative outweighed the IELTS 6.5.',
        zh: '帝国理工与新国立非常看重实际工程项目。奖学金背书与清晰的机器人叙事压过了雅思6.5的不足。'
      }
    },
    {
      id: 'cs9', icon: '🧑‍🎨',
      name: { en: 'Senior CS-9', zh: '学长 CS-9' },
      profile: {
        gpa: { en: 'GPA 3.5, average 71/100', zh: 'GPA 3.5，均分71/100' },
        background: { en: 'ICS, firefighting robot research, social network analysis intern', zh: 'ICS，消防机器人科研，社交网络分析实习' },
        keyEvidence: { en: 'Bristol Robotics, UNSW, Sydney offers', zh: '布里斯托机器人、新南威尔士、悉尼录取' },
        weakness: { en: 'IELTS 5.5, very low for top choices', zh: '雅思仅5.5，远低于多数名校要求' }
      },
      choices: [
        { en: 'A. IELTS 5.5 blocks everything', zh: 'A. 雅思5.5导致全拒' },
        { en: 'B. Conditional offers from Bristol, Sydney, UNSW', zh: 'B. 获得布里斯托、悉尼、新南有条件录取' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Truth: Conditional Love', zh: '真相：有条件的爱' },
        description: { en: 'The IELTS 5.5 didn’t cause immediate rejection; universities issued conditional offers with language requirements.', zh: '雅思5.5并未直接导致据信；学校发放了需要补语言成绩的有条件录取。' }
      },
      rejectionAnalysis: {
        en: 'UK and Australian universities frequently issue conditional offers below the language threshold. The robotics project demonstrated sufficient academic readiness for a conditional acceptance.',
        zh: '英澳学校经常对语言不佳的申请者发有条件录取。机器人项目展示了专业匹配度，学校愿意先发con‑offer。'
      }
    }
  ]
}

// 游戏状态
const gamePhase = ref('trackSelect') // 'trackSelect' | 'caseAnswering' | 'complete'
const selectedTrack = ref(null)
const currentCaseIndex = ref(0)
const answered = ref(false)
const feedbackCorrect = ref(false)
const feedbackWrong = ref(false)
const completedCorrect = ref(0)
const resultRef = ref(null)

// 性格日志
const personalityLog = ref([])
const totalOptimisticMistakes = ref(0)
const totalPessimisticMistakes = ref(0)

const currentTrackCases = computed(() => selectedTrack.value ? caseDB[selectedTrack.value] : [])
const currentCase = computed(() => currentTrackCases.value[currentCaseIndex.value] ?? null)
const progressPercent = computed(() => {
  if (!currentTrackCases.value.length) return 0
  return ((currentCaseIndex.value + 1) / currentTrackCases.value.length) * 100
})

// 总错误数
const totalMistakes = computed(() => totalOptimisticMistakes.value + totalPessimisticMistakes.value)

// 乐观错误占比（基于总错误数）
const optimisticPercent = computed(() => {
  if (totalMistakes.value === 0) return 0
  return Math.round((totalOptimisticMistakes.value / totalMistakes.value) * 100)
})

// 悲观错误占比（基于总错误数）
const pessimisticPercent = computed(() => {
  if (totalMistakes.value === 0) return 0
  return Math.round((totalPessimisticMistakes.value / totalMistakes.value) * 100)
})

function selectTrack(track) {
  selectedTrack.value = track
  gamePhase.value = 'caseAnswering'
  currentCaseIndex.value = 0
  answered.value = false
  feedbackCorrect.value = false
  feedbackWrong.value = false
  completedCorrect.value = 0
  personalityLog.value = []
  totalOptimisticMistakes.value = 0
  totalPessimisticMistakes.value = 0
}

function judgeCase(choiceIndex) {
  if (!currentCase.value) return
  const correct = choiceIndex === currentCase.value.correctIndex
  answered.value = true
  feedbackCorrect.value = correct
  feedbackWrong.value = !correct

  const entry = {
    caseId: currentCase.value.id,
    caseName: currentCase.value.name[currentLanguage.value === 'en' ? 'en' : 'zh'],
    isCorrect: correct,
    rejectionReason: currentCase.value.rejectionAnalysis
  }

  if (correct) {
    completedCorrect.value++
    entry.personalityHint = null
  } else {
    if (currentCase.value.wrongType === 'overOptimistic') {
      totalOptimisticMistakes.value++
      entry.personalityHint = {
        type: 'overOptimistic',
        label: { en: 'Over‑Optimistic', zh: '过度乐观' },
        description: { en: 'You may overvalue experience and undervalue GPA cutoffs.', zh: '你或许高估了经历，低估了GPA硬门槛。' }
      }
    } else if (currentCase.value.wrongType === 'overPessimistic') {
      totalPessimisticMistakes.value++
      entry.personalityHint = {
        type: 'overPessimistic',
        label: { en: 'Over‑Pessimistic', zh: '过度悲观' },
        description: { en: 'You may underestimate how much a strong focus can compensate for weak GPA.', zh: '你或许低估了强聚焦背景对低分的弥补能力。' }
      }
    }
  }
  personalityLog.value.push(entry)
  nextTick(() => {
    resultRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function nextCase() {
  currentCaseIndex.value++
  answered.value = false
  feedbackCorrect.value = false
  feedbackWrong.value = false
}

function completeArchive() {
  gamePhase.value = 'complete'
}

function retryGame() {
  gamePhase.value = 'trackSelect'
  selectedTrack.value = null
  currentCaseIndex.value = 0
  answered.value = false
  feedbackCorrect.value = false
  feedbackWrong.value = false
  completedCorrect.value = 0
  personalityLog.value = []
  totalOptimisticMistakes.value = 0
  totalPessimisticMistakes.value = 0
}

const guideItems = computed(() => {
  const items = tm('pages.y2_4.guide.items') || []
  return items.map(item => {
    if (typeof item === 'object' && item.title) return item
    return { title: '', content: item }
  })
})

const completionAnalysis = computed(() => {
  const total = totalOptimisticMistakes.value + totalPessimisticMistakes.value + completedCorrect.value
  if (total === 0) return ''
  const optR = totalOptimisticMistakes.value / total
  const pessR = totalPessimisticMistakes.value / total

  // 基于你的要求设计多种人格分析
  if (completedCorrect.value === total) {
    return currentLanguage.value === 'en'
      ? 'Perfect Oracle! You have an uncanny, balanced view of applications. You value evidence but remain clear‑eyed about the brutal weight of GPA.'
      : '完美预言家！你对申请的判断出奇的平衡与准确。你重视经历的价值，但同时也对GPA的残酷权重保持着清醒的认知。'
  } else if (optR > 0.6) {
    return currentLanguage.value === 'en'
      ? 'The Optimistic Dreamer. You tend to see the bright side and may underestimate the ruthless GPA cutoffs of top schools. Remember, a shining project cannot always save a subpar GPA.'
      : '乐观梦想家。你倾向于看到背景中的闪光点，但可能低估了顶尖学校对GPA的无情筛选。请记住，一个亮眼的项目有时也无法完全拯救一个平庸的均分。'
  } else if (pessR > 0.6) {
    return currentLanguage.value === 'en'
      ? 'The Cautious Guardian. You often overestimate difficulty, potentially missing out on ambitious applications. Daring to dream is as important as playing safe.'
      : '谨慎守卫者。你常常高估申请难度，这可能会让你错过大胆一搏的机会。敢于梦想和稳妥保底同样重要。'
  } else if (optR > 0.4 && optR > pessR) {
    return currentLanguage.value === 'en'
      ? 'Slightly Over‑Optimistic. You have faith in good profiles, but take care to check hard academic thresholds before getting carried away.'
      : '轻度乐观倾向。你对优秀的背景抱有信心，但在热血上头前，记得先核查硬性的学术门槛。'
  } else if (pessR > 0.4 && pessR > optR) {
    return currentLanguage.value === 'en'
      ? 'Moderately Pessimistic. You play safe, which can protect you, but might also prevent you from reaching schools that truly match your potential.'
      : '适度悲观。你行事谨慎，这能保护你，但也可能使你错过那些与你潜力真正匹配的学校。'
  } else {
    return currentLanguage.value === 'en'
      ? 'Passionate Analyst. Your judgments swing between extremes, yet you already sense the factors at play. Focus on objective data first, then let the narrative evidence tip the scale.'
      : '激情分析师。你的判断常在两个极端间摆动，但你已经能感知到不同因素的作用。请先聚焦客观数据，再让经历证据成为最终砝码。'
  }
})
</script>

<style scoped>
/* ============================================
   AI 档案馆 · 暗金学术魔法主题
   ============================================ */
.archive-game {
  min-height: 100%;
  padding: 28px 20px 40px;
  color: #e8e6e3;
  background: radial-gradient(ellipse at 20% 30%, #2a2218 0%, #0b090a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;
}

/* 羊皮纸纹理叠加 */
.archive-game::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.08;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(200, 180, 140, 0.03) 2px,
    rgba(200, 180, 140, 0.03) 4px
  );
  pointer-events: none;
  z-index: 0;
}

/* 顶部光晕 */
.archive-game::after {
  content: '';
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(249, 217, 118, 0.12), transparent 70%);
  z-index: 0;
  pointer-events: none;
}

/* 主内容层级 */
.header,
.case-arena,
.completion-screen {
  z-index: 1;
}

.header {
  width: 100%;
  max-width: 680px;
  text-align: center;
  margin-bottom: 36px;
}

.header h2 {
  margin: 0 0 12px;
  color: #f9d976;
  font-size: 2.4rem;
  font-family: 'Cinzel', 'Georgia', serif;
  letter-spacing: 2px;
  text-shadow: 0 0 18px rgba(249, 217, 118, 0.3);
}

.header h2 i {
  margin-right: 10px;
  animation: soft-glow 2s infinite alternate;
}

.header p {
  margin: 0 0 22px;
  color: #bfb59e;
  line-height: 1.6;
  font-family: 'Georgia', serif;
  font-style: italic;
  font-size: 1.05rem;
}

/* 进度条美化 */
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.4);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f9d976, #ffe08a);
  border-radius: 999px;
  box-shadow: 0 0 12px rgba(249, 217, 118, 0.6);
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.progress-text {
  font-size: 0.9rem;
  color: #a69b7c;
  font-weight: 700;
  letter-spacing: 1px;
}

/* 路线选择画面 */
.track-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  padding: 40px 0;
}

.track-buttons {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-track {
  padding: 24px 44px;
  border: 2px solid rgba(212, 175, 55, 0.5);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(30, 28, 24, 0.9), rgba(18, 16, 13, 0.9));
  color: #e6d7a3;
  font-size: 1.4rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.35s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
  min-width: 240px;
}

.btn-track i {
  margin-right: 12px;
  font-size: 1.6rem;
  color: #f9d976;
}

.btn-track::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(249, 217, 118, 0.15), transparent);
  transition: left 0.6s;
}

.btn-track:hover {
  border-color: #f9d976;
  box-shadow: 0 0 28px rgba(249, 217, 118, 0.35), 0 8px 32px rgba(0,0,0,0.6);
  transform: translateY(-4px);
  color: #fff;
}

.btn-track:hover::before {
  left: 100%;
}

.btn-track:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(249, 217, 118, 0.5);
}

/* 案例卡片 */
.case-arena {
  width: min(680px, 100%);
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-card {
  width: 100%;
  padding: 42px 36px;
  background: linear-gradient(160deg, #2f2b22, #1b1915);
  border: 2px solid rgba(180, 150, 90, 0.4);
  border-radius: 28px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  animation: card-appear 0.5s ease;
  position: relative;
}

.case-card.reveal-correct {
  border-color: #2ecc71;
  background: linear-gradient(160deg, #243b2e, #1b2a1c);
  box-shadow: 0 0 38px rgba(46, 204, 113, 0.35), inset 0 0 28px rgba(46, 204, 113, 0.06);
}

.case-card.reveal-wrong {
  border-color: #e74c3c;
  background: linear-gradient(160deg, #3c2325, #2a1a1c);
  box-shadow: 0 0 38px rgba(231, 76, 60, 0.35), inset 0 0 28px rgba(231, 76, 60, 0.06);
}

.portrait {
  margin-bottom: 24px;
  font-size: 4.4rem;
  text-align: center;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 12px rgba(0,0,0,0.5));
}

.profile-data {
  margin: 26px 0;
  padding: 22px 24px;
  border: 1px solid rgba(180, 150, 90, 0.25);
  border-radius: 18px;
  background: rgba(12, 10, 8, 0.5);
  backdrop-filter: blur(5px);
  text-align: left;
}

.profile-row {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
  line-height: 1.6;
  align-items: baseline;
}

.profile-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 700;
  min-width: 110px;
  color: #d1b896;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.value {
  flex: 1;
  color: #ddd8cc;
  font-size: 1.02rem;
}

.value.evidence {
  color: #f9d976;
  font-weight: 800;
  text-shadow: 0 0 6px rgba(249, 217, 118, 0.2);
}

.weakness .value {
  color: #e07b7b;
}

/* 选项按钮 */
.choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-top: 32px;
}

.btn-choice {
  padding: 18px 20px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: #e8edf9;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.4;
  backdrop-filter: blur(4px);
  letter-spacing: 0.3px;
}

.btn-choice:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(249, 217, 118, 0.6);
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.4), 0 0 18px rgba(249, 217, 118, 0.15);
  color: #fff;
}

.btn-choice:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(249, 217, 118, 0.2);
}

/* 反馈区域 */
.feedback-box {
  margin-top: 30px;
  padding: 26px 28px;
  border-radius: 20px;
  background: rgba(46, 204, 113, 0.06);
  border: 1px solid rgba(46, 204, 113, 0.25);
  animation: fade-in-up 0.45s ease;
}

.feedback-box.wrong {
  background: rgba(231, 76, 60, 0.06);
  border-color: rgba(231, 76, 60, 0.25);
}

.feedback {
  text-align: center;
  margin-bottom: 18px;
}

.feedback i {
  font-size: 2.6rem;
  margin-bottom: 14px;
  display: block;
}

.feedback-box.correct .feedback i {
  color: #2ecc71;
  filter: drop-shadow(0 0 10px rgba(46, 204, 113, 0.5));
}

.feedback-box.wrong .feedback i {
  color: #e74c3c;
  filter: drop-shadow(0 0 10px rgba(231, 76, 60, 0.5));
}

.truth-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: #f9d976;
  margin-bottom: 10px;
  letter-spacing: 0.4px;
}

.error-title {
  font-size: 1rem;
  font-weight: 900;
  color: #e74c3c;
  margin-bottom: 10px;
}

.truth-text {
  color: #ccc5b5;
  line-height: 1.6;
  font-style: italic;
}

/* 实时分析卡片 */
.rejection-spoiler {
  margin: 20px 0 10px;
  padding: 18px 20px;
  background: rgba(0,0,0,0.3);
  border-radius: 14px;
  border-left: 4px solid #f9d976;
  font-size: 0.95rem;
  color: #d9cdab;
}

.rejection-spoiler i {
  color: #f9d976;
  margin-right: 8px;
}

.rejection-spoiler p {
  margin: 8px 0 0;
  line-height: 1.6;
}

/* 性格标签 */
.personality-hint-badge {
  display: inline-block;
  margin: 12px 0 6px;
  padding: 8px 18px;
  background: rgba(249, 217, 118, 0.15);
  border: 1px solid rgba(249, 217, 118, 0.4);
  border-radius: 30px;
  font-weight: 800;
  font-size: 0.9rem;
  color: #f9d976;
  letter-spacing: 0.5px;
}

.btn-next,
.btn-complete {
  width: 100%;
  max-width: 320px;
  margin: 24px auto 0;
  padding: 16px 22px;
  border: none;
  border-radius: 40px;
  background: linear-gradient(135deg, #2ecc71, #1f9f5a);
  color: #fff;
  font-weight: 900;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(46, 204, 113, 0.25);
  letter-spacing: 0.6px;
}

.btn-next:hover,
.btn-complete:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(46, 204, 113, 0.45);
  background: linear-gradient(135deg, #3ddb84, #28b86c);
}

.btn-complete {
  background: linear-gradient(135deg, #f9d976, #d4af37);
  color: #1e1b14;
  box-shadow: 0 8px 20px rgba(249, 217, 118, 0.25);
}

.btn-complete:hover {
  box-shadow: 0 12px 28px rgba(249, 217, 118, 0.5);
  background: linear-gradient(135deg, #ffe08a, #e6c24a);
}

/* 完成画面 */
.completion-screen {
  width: 100%;
  max-width: 600px;
  text-align: center;
  padding: 48px 32px;
  background: rgba(20, 18, 14, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 36px;
  border: 1px solid rgba(249, 217, 118, 0.3);
  box-shadow: 0 24px 48px rgba(0,0,0,0.6);
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

.completion-screen h3 {
  color: #f9d976;
  font-size: 2rem;
  margin-bottom: 14px;
  text-shadow: 0 0 12px rgba(249, 217, 118, 0.3);
}

.completion-screen p {
  color: #beb7a6;
  font-size: 1.1rem;
  margin-bottom: 14px;
  font-weight: 600;
}

.personality-analysis-card {
  margin: 30px 0;
  padding: 24px 22px;
  background: rgba(0,0,0,0.4);
  border-radius: 22px;
  border: 1px solid rgba(249, 217, 118, 0.2);
}

.personality-analysis-card h4 {
  color: #f9d976;
  font-size: 1.25rem;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.analysis-text {
  color: #eee5cc;
  font-size: 1rem;
  line-height: 1.7;
  font-style: italic;
  margin-bottom: 24px;
}

.index-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
  padding: 0 10px;
}

.bar {
  padding: 10px 16px;
  border-radius: 30px;
  font-weight: 800;
  font-size: 0.9rem;
  color: #1e1b14;
  text-align: left;
  background: linear-gradient(90deg, #f9d976, #e6be5e);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 0 14px rgba(249, 217, 118, 0.3);
}

.bar.pessimistic {
  background: linear-gradient(90deg, #b0a08b, #8f7e65);
  color: #2b2418;
  box-shadow: 0 0 14px rgba(150, 130, 100, 0.3);
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.btn-retry {
  min-width: 140px;
  padding: 14px 22px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: #ddd;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 800;
  transition: all 0.3s;
  backdrop-filter: blur(4px);
}

.btn-retry:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255,255,255,0.4);
  transform: translateY(-2px);
}

.btn-claim {
  width: 220px;
  margin: 0 auto;
  padding: 16px 24px;
  border: none;
  border-radius: 40px;
  background: linear-gradient(135deg, #f9d976, #e0b84c);
  color: #2c2818;
  font-weight: 900;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(249, 217, 118, 0.25);
}

.btn-claim:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(249, 217, 118, 0.5);
  background: linear-gradient(135deg, #ffe08a, #efc95c);
}

/* 动画关键帧 */
@keyframes card-appear {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes soft-glow {
  from { text-shadow: 0 0 8px rgba(249, 217, 118, 0.2); }
  to { text-shadow: 0 0 18px rgba(249, 217, 118, 0.5); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .archive-game {
    padding: 12px 10px 32px;
  }

  .header {
    margin-bottom: 14px;
  }
  .header h2 {
    font-size: 1.35rem;
  }
  .header p {
    font-size: 0.78rem;
    margin-bottom: 10px;
  }
  .progress-text {
    font-size: 0.75rem;
  }

  /* 路线选择按钮 */
  .track-buttons {
    gap: 12px;
  }
  .btn-track {
    padding: 14px 22px;
    font-size: 1rem;
    min-width: 160px;
    min-height: 52px;
  }

  /* 案例卡片 */
  .case-card {
    padding: 18px 12px;
  }
  .portrait {
    font-size: 2.6rem;
    margin-bottom: 10px;
  }
  .profile-data {
    padding: 10px;
  }
  .profile-row {
    gap: 8px;
    margin-bottom: 6px;
    font-size: 0.78rem;
  }
  .label {
    min-width: 80px;
    font-size: 0.75rem;
  }
  .value {
    font-size: 0.78rem;
  }

  /* 选项 */
  .choices {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .btn-choice {
    padding: 12px;
    min-height: 52px;
    font-size: 0.88rem;
  }

  /* 反馈区 */
  .feedback-box {
    padding: 14px;
  }
  .rejection-spoiler {
    padding: 10px;
    font-size: 0.82rem;
  }

  /* 完成画面 */
  .completion-screen {
    padding: 20px 14px;
  }
  .completion-icon {
    font-size: 3rem;
    margin-bottom: 10px;
  }
  .completion-screen h3 {
    font-size: 1.3rem;
  }
  .completion-actions {
    flex-direction: column;
    gap: 10px;
  }
  .btn-retry,
  .btn-claim {
    width: 100%;
    min-height: 48px;
  }
}
</style>