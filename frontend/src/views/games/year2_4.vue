<template>
  <div class="archive-game">
    <div class="header">
      <h2><i class="fas fa-scroll"></i> {{ t('pages.y2_4.title') }}</h2>
      <p>{{ currentLanguage === 'en' ? 'Choose the school that admitted this applicant. Each case has one offer and two rejection distractors.' : '请选择该案例真正申请到的学校。每题 1 个录取选项，2 个拒信干扰项。' }}</p>
      <div class="progress-bar" v-if="gamePhase === 'caseAnswering'">
        <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-text" v-if="gamePhase === 'caseAnswering'">
        {{ currentLanguage === 'en' ? `Case ${Math.min(currentCaseIndex + 1, currentTrackCases.length)} of ${currentTrackCases.length}` : `第 ${Math.min(currentCaseIndex + 1, currentTrackCases.length)} / ${currentTrackCases.length} 案` }}
      </div>
      <div class="health-panel" v-if="gamePhase === 'caseAnswering'">
        <div class="health-meta">
          <span><i class="fas fa-check-circle"></i> {{ currentLanguage === 'en' ? 'Correct' : '答对' }} {{ completedCorrect }}</span>
          <span><i class="fas fa-times-circle"></i> {{ currentLanguage === 'en' ? 'Wrong' : '答错' }} {{ totalMistakes }}</span>
        </div>
        <div class="health-bar" :class="{ danger: healthPercent <= 40 }">
          <div class="health-fill" :style="{ width: `${healthPercent}%` }"></div>
        </div>
        <p class="health-warning" v-if="totalMistakes >= warningMistakes">
          {{ currentLanguage === 'en' ? 'Careful: too many misses will restart this archive.' : '注意：错误过多会建议返回重新答题。' }}
        </p>
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
            <span class="label">{{ currentLanguage === 'en' ? 'Internship' : '实习' }}:</span>
            <span class="value evidence">{{ currentCase.profile.internship[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
          </div>
          <div class="profile-row">
            <span class="label">{{ currentLanguage === 'en' ? 'Research' : '科研' }}:</span>
            <span class="value evidence">{{ currentCase.profile.research[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
          </div>
          <div class="profile-row weakness" v-if="currentCase.profile.weakness">
            <span class="label">{{ t('pages.y2_4.labels.weakness') }}:</span>
            <span class="value">{{ currentCase.profile.weakness[currentLanguage === 'en' ? 'en' : 'zh'] }}</span>
          </div>
        </div>

        <!-- 选择按钮 -->
        <div class="choices" :class="{ answered }">
          <button
            v-for="(choice, index) in currentChoices"
            :key="index"
            type="button"
            class="btn-choice"
            :class="{ selected: answered && selectedChoiceIndex === index, correct: answered && index === currentCorrectIndex, rejected: answered && index !== currentCorrectIndex }"
            :disabled="answered"
            @click="judgeCase(index)"
          >
            {{ choice[currentLanguage === 'en' ? 'en' : 'zh'] }}
          </button>
        </div>

        <!-- 反馈 -->
        <div v-if="answered" ref="resultRef" class="feedback-box" :class="{ correct: feedbackCorrect, wrong: feedbackWrong }">
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

      <div v-if="gamePhase === 'failed'" class="completion-screen failed-screen">
        <div class="completion-icon"><i class="fas fa-heart-broken"></i></div>
        <h3>{{ currentLanguage === 'en' ? 'Too Many Wrong Predictions' : '预测失误过多' }}</h3>
        <p>{{ currentLanguage === 'en' ? `You answered ${completedCorrect} correctly and missed ${totalMistakes}. Return and try the archive again.` : `你已答对 ${completedCorrect} 题，答错 ${totalMistakes} 题。建议返回重新答题。` }}</p>
        <div class="completion-actions">
          <button type="button" class="btn-retry" @click="retryGame">
            {{ t('common.actions.retry') }}
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
          <button type="button" class="btn-claim" @click="emit('complete', buildCompletionPayload())">
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

const caseDB = {
  ee: [
    {
      id: 'ee1', icon: '🧑‍💻',
      name: { en: 'EE Case 1', zh: 'EE 案例1' },
      profile: {
        gpa: { en: '58 / 61 / 75', zh: '58 / 61 / 75' },
        background: { en: 'Electrical and Electronic Engineering', zh: '电气工程（EE）' },
        internship: { en: 'Ruolin production outsourcing data analysis; Bosch Thermotechnology Shanghai data analysis', zh: '若邻生产加工外包服务有限公司（数据分析）、博世热力技术（上海）有限公司（数据分析）' },
        research: { en: 'Wearable ECG/SpO2/temperature system; 3D printed bone-defect repair robot; photovoltaic MPPT controller', zh: '可穿戴心电血氧温度检测系统、3D打印骨缺损修复机器人、光伏MPPT控制器' },
        weakness: { en: 'Low early averages made top UK power programmes risky.', zh: '前两年均分偏低，冲刺英国顶尖电力项目风险高。' }
      },
      choices: [
        { en: 'Nanyang Technological University - Green Energy Technologies', zh: '南洋理工大学（Green Energy Technologies）' },
        { en: 'University College London - Power Systems / Finance and Engineering', zh: '伦敦大学学院（Power Systems / Finance and Engineering）' },
        { en: 'Imperial College London - Future Power', zh: '帝国理工学院（Future Power）' }
      ],
      correctIndex: 0,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Offer: Nanyang Technological University', zh: '录取：南洋理工大学' },
        description: { en: 'The applied energy profile matched NTU Green Energy Technologies, while UCL and Imperial were rejected.', zh: '能源项目和实习与南洋理工绿色能源方向更匹配；UCL和帝国理工冲刺失败。' }
      },
      rejectionAnalysis: {
        en: 'The two rejected UK options were more GPA-sensitive. Rich projects helped, but the 58/61 early record still weakened the most selective power applications.',
        zh: '两个拒信选项更看重硬成绩。项目经历丰富，但58/61的早期均分仍削弱了顶尖电力方向竞争力。'
      }
    },
    {
      id: 'ee2', icon: '👩‍🎓',
      name: { en: 'EE Case 2', zh: 'EE 案例2' },
      profile: {
        gpa: { en: '72 / 78 / 83', zh: '72 / 78 / 83' },
        background: { en: 'Electrical and Electronic Engineering', zh: '电气工程（EE）' },
        internship: { en: 'State Grid Suzhou Power Supply carbon neutrality; NARI Group automation', zh: '国网苏州供电公司（碳中和）、南瑞集团（自动化）' },
        research: { en: 'Smart shopping cart; neural-network inverter; renewable energy system in Nigeria', zh: '智能购物车、神经网络逆变器、尼日利亚可再生能源系统' },
        weakness: { en: 'Good upward trend, but not a clear top-tier academic profile.', zh: '成绩稳步上升，但对顶尖项目仍不是绝对高分。' }
      },
      choices: [
        { en: 'University of Oxford - Energy Systems', zh: '牛津大学（Energy Systems）' },
        { en: 'The University of Hong Kong - Electrical and Electronic Engineering', zh: '香港大学（Electrical and Electronic Engineering）' },
        { en: 'National University of Singapore - Electrical Engineering', zh: '新加坡国立大学（Electrical Engineering）' }
      ],
      correctIndex: 1,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Offer: The University of Hong Kong', zh: '录取：香港大学' },
        description: { en: 'HKU EEE was the successful outcome; Oxford Energy Systems and NUS Electrical Engineering were rejected.', zh: '最终录取为港大EEE；牛津能源系统和新国立电气均为拒信。' }
      },
      rejectionAnalysis: {
        en: 'Oxford and NUS were less forgiving because the profile had solid projects but lacked a decisive GPA or publication advantage.',
        zh: '牛津和新国立竞争池更强，该案例项目扎实但缺少压倒性均分或高影响力论文。'
      }
    },
    {
      id: 'ee3', icon: '🧑‍🔬',
      name: { en: 'EE Case 3', zh: 'EE 案例3' },
      profile: {
        gpa: { en: '61 / 69 / 77', zh: '61 / 69 / 77' },
        background: { en: 'Electrical and Electronic Engineering', zh: '电气工程（EE）' },
        internship: { en: 'None', zh: '无' },
        research: { en: 'GaN reference source; GaN comparator; new-energy EV research; SHEPWM optimization algorithm', zh: 'GaN基准源、GaN比较器、新能源电动汽车研究、SHEPWM优化算法' },
        weakness: { en: 'No internship, but research direction was unusually concentrated.', zh: '无实习，但科研方向集中。' }
      },
      choices: [
        { en: 'Georgia Institute of Technology - Electrical and Computer Engineering', zh: '佐治亚理工学院（Electrical and Computer Engineering）' },
        { en: 'University of Pennsylvania - Electrical Engineering', zh: '宾夕法尼亚大学（Electrical Engineering）' },
        { en: 'University of Illinois Urbana-Champaign - Electrical and Computer Engineering', zh: '伊利诺伊大学厄巴纳-香槟分校（Electrical and Computer Engineering）' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Offer: University of Pennsylvania', zh: '录取：宾夕法尼亚大学' },
        description: { en: 'Research depth helped secure UPenn Electrical Engineering, while UIUC ECE and Georgia Tech ECE rejected the application.', zh: '科研深度帮助拿到宾大EE；UIUC ECE和佐治亚理工ECE为拒信。' }
      },
      rejectionAnalysis: {
        en: 'The offer shows research can compensate, but the rejected ECE programmes were still extremely selective and likely wanted stronger overall evidence.',
        zh: '这个案例说明科研可补短板，但被拒的ECE项目竞争极强，仍可能要求更稳的综合背景。'
      }
    },
    {
      id: 'ee4', icon: '🧑‍🏭',
      name: { en: 'EE Case 4', zh: 'EE 案例4' },
      profile: {
        gpa: { en: '65 / 61 / 61', zh: '65 / 61 / 61' },
        background: { en: 'Electrical and Electronic Engineering', zh: '电气工程（EE）' },
        internship: { en: 'New Oriental teaching assistant', zh: '新东方（助教）' },
        research: { en: 'Quadruped robot for chimney inspection', zh: '四足机器人（烟囱检测）' },
        weakness: { en: 'Low and stagnant GPA; only one recorded rejection in the source table.', zh: 'GPA低且停滞；原表仅记录1个拒信。' }
      },
      choices: [
        { en: 'Imperial College London - Security and Resilience: Science and Technology', zh: '帝国理工学院（Security and Resilience: Science and Technology）' },
        { en: "King's College London - Robotics", zh: '伦敦国王学院（Robotics）' },
        { en: 'University of Edinburgh - Robotics', zh: '爱丁堡大学（Robotics）' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: "Offer: King's College London", zh: '录取：伦敦国王学院' },
        description: { en: "KCL Robotics was the recorded offer. Imperial was rejected; Edinburgh is used as the second close distractor because the table has only one recorded rejection.", zh: '记录中的录取是KCL机器人；帝国理工为拒信。原表仅1个拒信，因此爱丁堡作为相近干扰项。' }
      },
      rejectionAnalysis: {
        en: 'The focused robotics project helped the KCL fit, but Imperial was too ambitious for a 65/61/61 transcript.',
        zh: '四足机器人项目支撑了KCL机器人方向匹配；但65/61/61冲帝国理工过于冒险。'
      }
    },
    {
      id: 'ee5', icon: '👩‍💻',
      name: { en: 'EE Case 5', zh: 'EE 案例5' },
      profile: {
        gpa: { en: '64 / 73 / 77', zh: '64 / 73 / 77' },
        background: { en: 'Electrical and Electronic Engineering', zh: '电气工程（EE）' },
        internship: { en: 'Anhui Electric Power Research Institute; Anhui Hongyuan Electric Power Design Consulting', zh: '安徽省电力科学研究院、安徽宏源电力设计咨询有限公司' },
        research: { en: 'Voltage-controlled oscillator; current-steering DAC', zh: '压控振荡器（VCO）、数模转换器（IDAC）' },
        weakness: { en: 'Strong microelectronics fit, but still not enough for every elite target.', zh: '微电子方向匹配强，但并非所有顶尖项目都买单。' }
      },
      choices: [
        { en: 'University of Washington - Electrical Engineering', zh: '华盛顿大学（Electrical Engineering）' },
        { en: 'University of Cambridge - Micro and Nanotechnology Enterprise', zh: '剑桥大学（Micro and Nanotechnology Enterprise）' },
        { en: 'Carnegie Mellon University - Electrical and Computer Engineering', zh: '卡内基梅隆大学（Electrical and Computer Engineering）' }
      ],
      correctIndex: 2,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Offer: Carnegie Mellon University', zh: '录取：卡内基梅隆大学' },
        description: { en: 'CMU ECE admitted the applicant; Cambridge and University of Washington rejected.', zh: 'CMU ECE发放录取；剑桥和华盛顿大学为拒信。' }
      },
      rejectionAnalysis: {
        en: 'Concrete VCO/IDAC work was highly relevant to CMU ECE, but Cambridge and UW remained more selective for this profile.',
        zh: 'VCO/IDAC经历与CMU ECE高度匹配；但剑桥和华盛顿大学仍因竞争强度给出拒信。'
      }
    }
  ],
  ics: [
    {
      id: 'cs1', icon: '🧑‍💻',
      name: { en: 'ICS Case 1', zh: 'ICS 案例1' },
      profile: {
        gpa: { en: 'GPA 3.5', zh: 'GPA 3.5' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Data analysis; game development', zh: '数据分析、游戏开发' },
        research: { en: 'None', zh: '无' },
        weakness: { en: 'Industry exposure was stronger than research evidence.', zh: '实习强于科研，纯CS冲刺难度较高。' }
      },
      choices: [
        { en: 'Johns Hopkins University - Computer Science', zh: '约翰霍普金斯大学（Computer Science）' },
        { en: 'Carnegie Mellon University - Information Systems', zh: '卡内基梅隆大学（Information Systems）' },
        { en: 'Columbia University - Computer Science', zh: '哥伦比亚大学（Computer Science）' }
      ],
      correctIndex: 1,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Offer: Carnegie Mellon University Information Systems', zh: '录取：卡内基梅隆大学信息系统' },
        description: { en: 'The information-systems path matched the internships; Johns Hopkins CS was rejected. Columbia CS is used as a different-school distractor because the table has only one recorded rejection.', zh: '信息系统方向更匹配实习经历；JHU CS为拒信。原表仅1个拒信，因此哥大CS作为不同学校干扰项。' }
      },
      rejectionAnalysis: {
        en: 'This is a track-fit lesson: industry internships can win IS, but they may not satisfy research-heavy CS review.',
        zh: '这是专业匹配题：实习能支持信息系统，但不一定撑得住偏科研的纯CS审核。'
      }
    },
    {
      id: 'cs2', icon: '👩‍🎓',
      name: { en: 'ICS Case 2', zh: 'ICS 案例2' },
      profile: {
        gpa: { en: 'Average 67', zh: '均分67' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Three data analysis internships', zh: '三段数据分析' },
        research: { en: 'Human-computer interaction', zh: '人机交互' },
        weakness: { en: 'The source table records no rejection, so distractors are close alternatives.', zh: '原表无拒信记录，因此干扰项为相近方向。' }
      },
      choices: [
        { en: 'The University of Manchester - Data Science', zh: '曼彻斯特大学（Data Science）' },
        { en: 'University College London - Connected Environment', zh: '伦敦大学学院（Connected Environment）' },
        { en: 'The University of Edinburgh - Design Informatics', zh: '爱丁堡大学（Design Informatics）' }
      ],
      correctIndex: 1,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Offer: University College London Connected Environment', zh: '录取：伦敦大学学院 Connected Environment' },
        description: { en: 'The table records UCL Connected Environment as the offer. Manchester and Edinburgh are used as different-school distractors because no rejection was recorded.', zh: '原表记录的录取是UCL Connected Environment；因原表无拒信，曼大和爱丁堡作为不同学校干扰项。' }
      },
      rejectionAnalysis: {
        en: 'The correct answer depends on precise programme fit: data visualization and HCI point more naturally to Connected Environment.',
        zh: '关键是精准项目匹配：数据可视化和HCI线索更指向Connected Environment。'
      }
    },
    {
      id: 'cs3', icon: '👨‍💼',
      name: { en: 'ICS Case 3', zh: 'ICS 案例3' },
      profile: {
        gpa: { en: 'GPA 3.3', zh: 'GPA 3.3' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Two data analysis internships', zh: '两段数据分析' },
        research: { en: 'Two Chinese core journal papers', zh: '两篇中文核心论文' },
        weakness: { en: 'Low GPA and modest internship brands.', zh: 'GPA偏低，实习平台不强。' }
      },
      choices: [
        { en: 'The University of Sydney - Computer Science', zh: '悉尼大学（Computer Science）' },
        { en: 'The University of Melbourne - Computer Science', zh: '墨尔本大学（Computer Science）' },
        { en: 'The University of Edinburgh - Computer Science', zh: '爱丁堡大学（Computer Science）' }
      ],
      correctIndex: 0,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Offer: The University of Sydney', zh: '录取：悉尼大学' },
        description: { en: 'Sydney Computer Science admitted the applicant; Melbourne CS and Edinburgh CS rejected.', zh: '悉尼大学计算机录取；墨尔本计算机和爱丁堡计算机为拒信。' }
      },
      rejectionAnalysis: {
        en: 'The papers helped, but Melbourne and Edinburgh were less forgiving of the 3.3 GPA and weaker internship brands.',
        zh: '论文有帮助，但墨尔本和爱丁堡对3.3 GPA与实习平台短板更敏感。'
      }
    },
    {
      id: 'cs4', icon: '👩‍🔬',
      name: { en: 'ICS Case 4', zh: 'ICS 案例4' },
      profile: {
        gpa: { en: 'Average 72', zh: '均分72' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Navigation software development; AI product manager', zh: '导航软件开发、AI产品经理' },
        research: { en: 'HCI mental-healing app', zh: '人机交互（心理疗愈app）' },
        weakness: { en: 'The table records no rejection; distinguish by programme fit.', zh: '原表无拒信记录，需要按项目匹配度判断。' }
      },
      choices: [
        { en: 'University College London - Knowledge, Information and Data Science', zh: '伦敦大学学院（Knowledge, Information and Data Science）' },
        { en: 'The University of Manchester - Artificial Intelligence', zh: '曼彻斯特大学（Artificial Intelligence）' },
        { en: 'The University of Edinburgh - Cognitive Science', zh: '爱丁堡大学（Cognitive Science）' }
      ],
      correctIndex: 0,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Offer: University College London KIDS', zh: '录取：伦敦大学学院 KIDS' },
        description: { en: 'The recorded offer is UCL Knowledge, Information and Data Science; the other two are close programme distractors.', zh: '原表记录的录取是UCL Knowledge, Information and Data Science；另两个为相近项目干扰项。' }
      },
      rejectionAnalysis: {
        en: 'The case is about reading the evidence: navigation software, AI product work, and HCI point toward an information/data programme.',
        zh: '本题考读证据：导航软件、AI产品和HCI更指向信息与数据类项目。'
      }
    },
    {
      id: 'cs5', icon: '🧑‍🎨',
      name: { en: 'ICS Case 5', zh: 'ICS 案例5' },
      profile: {
        gpa: { en: 'Average 55', zh: '均分55' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'None', zh: '无' },
        research: { en: 'None; repeated Year 2 once', zh: '无（大二留级）' },
        weakness: { en: 'Very high academic-risk signal; no rejection recorded in the source table.', zh: '学术风险信号很强；原表无拒信记录。' }
      },
      choices: [
        { en: 'Monash University - Information Technology', zh: '莫纳什大学（Information Technology）' },
        { en: 'The University of Sydney - Computer Science', zh: '悉尼大学（Computer Science）' },
        { en: 'University of New South Wales - Information Technology', zh: '新南威尔士大学（Information Technology）' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Offer: The University of Sydney', zh: '录取：悉尼大学' },
        description: { en: 'The table records Sydney Computer Science as the offer. The other options are close distractors because no rejection was recorded.', zh: '原表记录的录取是悉尼大学计算机；另两个因原表无拒信作为相近干扰项。' }
      },
      rejectionAnalysis: {
        en: 'This is a reminder that some coursework programmes can still leave room for an offer, even when the academic history looks weak.',
        zh: '这个案例提醒学生：部分授课型项目仍可能给机会，即使学术记录看起来很弱。'
      }
    },
    {
      id: 'cs6', icon: '👩‍💻',
      name: { en: 'ICS Case 6', zh: 'ICS 案例6' },
      profile: {
        gpa: { en: 'GPA 3.79', zh: 'GPA 3.79' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Alibaba algorithm; AISpeech robot NLP', zh: '阿里（算法）、思必驰（机器人NLP）' },
        research: { en: 'Three SURF projects; external mentor research; CMU professor deep-learning research; two papers', zh: '三段SURF、校外导师科研、CMU教授科研（深度学习），两篇论文' },
        weakness: { en: 'Extremely strong profile, but not every adjacent ECE target admitted.', zh: '背景很强，但并非所有相邻ECE项目都录。' }
      },
      choices: [
        { en: 'University of Illinois Urbana-Champaign - Electrical and Computer Engineering', zh: '伊利诺伊大学厄巴纳-香槟分校（Electrical and Computer Engineering）' },
        { en: 'Harvard University - Health Data Science', zh: '哈佛大学（Health Data Science）' },
        { en: 'University of Washington - Electrical Engineering', zh: '华盛顿大学（Electrical Engineering）' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Offer: Harvard University', zh: '录取：哈佛大学' },
        description: { en: 'Harvard Health Data Science admitted the applicant; UIUC ECE and UW EE rejected.', zh: '哈佛健康数据科学录取；UIUC ECE和华盛顿大学EE为拒信。' }
      },
      rejectionAnalysis: {
        en: 'The profile was excellent for health data science and applied AI, but adjacent ECE programmes still judged fit differently.',
        zh: '该背景对健康数据科学和应用AI极强，但相邻ECE项目会按不同匹配标准审查。'
      }
    },
    {
      id: 'cs7', icon: '👨‍💻',
      name: { en: 'ICS Case 7', zh: 'ICS 案例7' },
      profile: {
        gpa: { en: 'GPA 3.71', zh: 'GPA 3.71' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Computer vision algorithm intern at East China Normal University', zh: 'CV算法实习生（华东师大）' },
        research: { en: 'Kaggle bronze medal', zh: 'Kaggle竞赛铜牌' },
        weakness: { en: 'Only one recorded rejection in the source table.', zh: '原表仅记录1个拒信。' }
      },
      choices: [
        { en: 'The Chinese University of Hong Kong - Robotics', zh: '香港中文大学（Robotics）' },
        { en: 'Nanyang Technological University - Artificial Intelligence', zh: '南洋理工大学（Artificial Intelligence）' },
        { en: 'City University of Hong Kong - Artificial Intelligence', zh: '香港城市大学（Artificial Intelligence）' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Offer: Nanyang Technological University', zh: '录取：南洋理工大学' },
        description: { en: 'NTU Artificial Intelligence admitted the applicant. CUHK Robotics was rejected; CityU AI is a close distractor because the table has only one recorded rejection.', zh: '南洋理工AI录取。港中文机器人为拒信；原表仅1个拒信，因此港城AI作为相近干扰项。' }
      },
      rejectionAnalysis: {
        en: 'CV practice and competition evidence matched NTU AI well, while robotics at CUHK was a less direct fit.',
        zh: 'CV实习与竞赛证据更匹配南洋理工AI；港中文机器人方向匹配度相对弱。'
      }
    },
    {
      id: 'cs8', icon: '👩‍🎓',
      name: { en: 'ICS Case 8', zh: 'ICS 案例8' },
      profile: {
        gpa: { en: 'Year 3 average 82', zh: '大三均分82' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Mid-sized tech company backend development', zh: '中厂后端开发' },
        research: { en: 'Three research projects in robotics and deep learning', zh: '三段科研（机器人+深度学习）' },
        weakness: { en: 'Strong, but HK CS/AI options still rejected.', zh: '背景强，但港校CS/AI仍有拒信。' }
      },
      choices: [
        { en: 'The University of Hong Kong - Artificial Intelligence', zh: '香港大学（Artificial Intelligence）' },
        { en: 'National University of Singapore - Robotics', zh: '新加坡国立大学（Robotics）' },
        { en: 'The Chinese University of Hong Kong - Computer Science', zh: '香港中文大学（Computer Science）' }
      ],
      correctIndex: 1,
      wrongType: 'overPessimistic',
      truth: {
        title: { en: 'Offer: National University of Singapore', zh: '录取：新加坡国立大学' },
        description: { en: 'NUS Robotics admitted the applicant; CUHK Computer Science and HKU Artificial Intelligence rejected.', zh: 'NUS机器人录取；港中文计算机和港大AI为拒信。' }
      },
      rejectionAnalysis: {
        en: 'Robotics plus deep-learning research matched NUS Robotics directly. The Hong Kong CS/AI programmes remained highly competitive.',
        zh: '机器人与深度学习科研直接匹配NUS机器人；港校CS/AI竞争仍然很强。'
      }
    },
    {
      id: 'cs9', icon: '🧑‍🎨',
      name: { en: 'ICS Case 9', zh: 'ICS 案例9' },
      profile: {
        gpa: { en: 'GPA 3.5 / average 71', zh: 'GPA 3.5 / 均分71' },
        background: { en: 'Information and Computer Science', zh: '计算机（ICS）' },
        internship: { en: 'Social network analysis for collaborative video work', zh: '社交网络分析（合作视频）' },
        research: { en: 'Firefighting robot with ML and SLAM point cloud', zh: '消防机器人（ML+SLAM点云）' },
        weakness: { en: 'Low language score and ambitious UK targets.', zh: '语言成绩偏低，英国冲刺项目难度高。' }
      },
      choices: [
        { en: 'Imperial College London', zh: '帝国理工学院' },
        { en: 'University of Bristol - Robotics', zh: '布里斯托大学（Robotics）' },
        { en: 'University College London', zh: '伦敦大学学院' }
      ],
      correctIndex: 1,
      wrongType: 'overOptimistic',
      truth: {
        title: { en: 'Offer: University of Bristol', zh: '录取：布里斯托大学' },
        description: { en: 'Bristol Robotics admitted the applicant; UCL and Imperial rejected.', zh: '布里斯托机器人录取；UCL和帝国理工为拒信。' }
      },
      rejectionAnalysis: {
        en: 'The robotics project was relevant enough for Bristol, but UCL and Imperial were harder to unlock with a 71 average and weaker language score.',
        zh: '机器人项目足以支撑布里斯托方向；但71均分与较弱语言成绩难以撬动UCL和帝国理工。'
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
const selectedChoiceIndex = ref(null)
const shuffledChoiceIndexes = ref([])
const resultRef = ref(null)

// 性格日志
const personalityLog = ref([])
const totalOptimisticMistakes = ref(0)
const totalPessimisticMistakes = ref(0)

const currentTrackCases = computed(() => selectedTrack.value ? caseDB[selectedTrack.value] : [])
const currentCase = computed(() => currentTrackCases.value[currentCaseIndex.value] ?? null)
const currentChoiceIndexes = computed(() => shuffledChoiceIndexes.value[currentCaseIndex.value] || [0, 1, 2])
const currentChoices = computed(() => currentCase.value?.choices ? currentChoiceIndexes.value.map(index => currentCase.value.choices[index]) : [])
const currentCorrectIndex = computed(() => {
  if (!currentCase.value) return -1
  return currentChoiceIndexes.value.indexOf(currentCase.value.correctIndex)
})
const maxMistakes = computed(() => selectedTrack.value === 'ee' ? 3 : 5)
const warningMistakes = computed(() => selectedTrack.value === 'ee' ? 2 : 3)
const progressPercent = computed(() => {
  if (!currentTrackCases.value.length) return 0
  return ((currentCaseIndex.value + 1) / currentTrackCases.value.length) * 100
})

// 总错误数
const totalMistakes = computed(() => totalOptimisticMistakes.value + totalPessimisticMistakes.value)
const healthPercent = computed(() => Math.max(0, Math.round(((maxMistakes.value - totalMistakes.value) / maxMistakes.value) * 100)))

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
  selectedChoiceIndex.value = null
  personalityLog.value = []
  totalOptimisticMistakes.value = 0
  totalPessimisticMistakes.value = 0
  shuffledChoiceIndexes.value = buildShuffledChoiceIndexes(caseDB[track] || [])
}

function judgeCase(choiceIndex) {
  if (!currentCase.value) return
  const correct = choiceIndex === currentCorrectIndex.value
  answered.value = true
  selectedChoiceIndex.value = choiceIndex
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
  if (!correct && totalMistakes.value >= maxMistakes.value) {
    gamePhase.value = 'failed'
    return
  }
  nextTick(() => {
    resultRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function nextCase() {
  currentCaseIndex.value++
  answered.value = false
  feedbackCorrect.value = false
  feedbackWrong.value = false
  selectedChoiceIndex.value = null
}

function completeArchive() {
  gamePhase.value = 'complete'
}

function buildCompletionPayload() {
  const trackLabel = selectedTrack.value === 'ee'
    ? { en: 'Electrical and Electronic Engineering', zh: '电气工程（EE）' }
    : { en: 'Information and Computer Science', zh: '计算机（ICS）' }

  return {
    completed: true,
    passed: true,
    rewardCoins,
    resultType: 'result',
    resultData: {
      track: trackLabel,
      correct: completedCorrect.value,
      wrong: totalMistakes.value,
      total: currentTrackCases.value.length,
      accuracy: `${Math.round((completedCorrect.value / currentTrackCases.value.length) * 100)}%`,
      explanation: {
        en: getCompletionAnalysis('en'),
        zh: getCompletionAnalysis('zh'),
      },
    },
  }
}

function retryGame() {
  gamePhase.value = 'trackSelect'
  selectedTrack.value = null
  currentCaseIndex.value = 0
  answered.value = false
  feedbackCorrect.value = false
  feedbackWrong.value = false
  completedCorrect.value = 0
  selectedChoiceIndex.value = null
  personalityLog.value = []
  totalOptimisticMistakes.value = 0
  totalPessimisticMistakes.value = 0
  shuffledChoiceIndexes.value = []
}

function buildShuffledChoiceIndexes(cases) {
  return cases.map((caseItem) => shuffleIndexes(caseItem.choices.length))
}

function shuffleIndexes(length) {
  const indexes = Array.from({ length }, (_, index) => index)
  for (let index = indexes.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]]
  }
  return indexes
}

const guideItems = computed(() => {
  const items = tm('pages.y2_4.guide.items') || []
  return items.map(item => {
    if (typeof item === 'object' && item.title) return item
    return { title: '', content: item }
  })
})

function getCompletionAnalysis(language = currentLanguage.value) {
  const total = totalOptimisticMistakes.value + totalPessimisticMistakes.value + completedCorrect.value
  if (total === 0) return ''
  const optR = totalOptimisticMistakes.value / total
  const pessR = totalPessimisticMistakes.value / total

  // 基于你的要求设计多种人格分析
  if (completedCorrect.value === total) {
    return language === 'en'
      ? 'Perfect Oracle! You have an uncanny, balanced view of applications. You value evidence but remain clear‑eyed about the brutal weight of GPA.'
      : '完美预言家！你对申请的判断出奇的平衡与准确。你重视经历的价值，但同时也对GPA的残酷权重保持着清醒的认知。'
  } else if (optR > 0.6) {
    return language === 'en'
      ? 'The Optimistic Dreamer. You tend to see the bright side and may underestimate the ruthless GPA cutoffs of top schools. Remember, a shining project cannot always save a subpar GPA.'
      : '乐观梦想家。你倾向于看到背景中的闪光点，但可能低估了顶尖学校对GPA的无情筛选。请记住，一个亮眼的项目有时也无法完全拯救一个平庸的均分。'
  } else if (pessR > 0.6) {
    return language === 'en'
      ? 'The Cautious Guardian. You often overestimate difficulty, potentially missing out on ambitious applications. Daring to dream is as important as playing safe.'
      : '谨慎守卫者。你常常高估申请难度，这可能会让你错过大胆一搏的机会。敢于梦想和稳妥保底同样重要。'
  } else if (optR > 0.4 && optR > pessR) {
    return language === 'en'
      ? 'Slightly Over‑Optimistic. You have faith in good profiles, but take care to check hard academic thresholds before getting carried away.'
      : '轻度乐观倾向。你对优秀的背景抱有信心，但在热血上头前，记得先核查硬性的学术门槛。'
  } else if (pessR > 0.4 && pessR > optR) {
    return language === 'en'
      ? 'Moderately Pessimistic. You play safe, which can protect you, but might also prevent you from reaching schools that truly match your potential.'
      : '适度悲观。你行事谨慎，这能保护你，但也可能使你错过那些与你潜力真正匹配的学校。'
  } else {
    return language === 'en'
      ? 'Passionate Analyst. Your judgments swing between extremes, yet you already sense the factors at play. Focus on objective data first, then let the narrative evidence tip the scale.'
      : '激情分析师。你的判断常在两个极端间摆动，但你已经能感知到不同因素的作用。请先聚焦客观数据，再让经历证据成为最终砝码。'
  }
}

const completionAnalysis = computed(() => {
  return getCompletionAnalysis(currentLanguage.value)
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

.health-panel {
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(249, 217, 118, 0.18);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
}

.health-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #e8dfc5;
  font-weight: 900;
  font-size: 0.9rem;
}

.health-meta i {
  margin-right: 6px;
}

.health-meta .fa-check-circle {
  color: #2ecc71;
}

.health-meta .fa-times-circle {
  color: #e74c3c;
}

.health-bar {
  height: 10px;
  margin-top: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.health-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);
  transition: width 0.35s ease;
}

.health-bar.danger .health-fill {
  background: linear-gradient(90deg, #991b1b, #ef4444);
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.45);
}

.health-warning {
  margin: 8px 0 0;
  color: #fca5a5;
  font-size: 0.82rem;
  font-style: normal;
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

.choices.answered .btn-choice {
  cursor: default;
}

.choices.answered .btn-choice:hover {
  transform: none;
}

.btn-choice.correct {
  border-color: rgba(46, 204, 113, 0.9);
  background: rgba(46, 204, 113, 0.18);
  color: #dcfce7;
  box-shadow: 0 0 18px rgba(46, 204, 113, 0.24);
}

.btn-choice.rejected {
  border-color: rgba(231, 76, 60, 0.45);
  background: rgba(231, 76, 60, 0.08);
  color: #f1c7c1;
  opacity: 0.72;
}

.btn-choice.selected {
  box-shadow: 0 0 0 3px rgba(249, 217, 118, 0.18), 0 12px 24px rgba(0,0,0,0.38);
}

.btn-choice.selected.rejected {
  border-color: rgba(231, 76, 60, 0.9);
  background: rgba(231, 76, 60, 0.18);
  opacity: 1;
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

.failed-screen {
  border-color: rgba(231, 76, 60, 0.35);
}

.failed-screen .completion-icon {
  color: #e74c3c;
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
