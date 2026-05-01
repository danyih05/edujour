const actionLabels = {
  click: { zh: '点击 / 轻触', en: 'Click / tap' },
  select: { zh: '选择', en: 'Select' },
  drag: { zh: '拖拽', en: 'Drag' },
  drop: { zh: '放置', en: 'Drop' },
  submit: { zh: '提交', en: 'Submit' },
  scroll: { zh: '滚动', en: 'Scroll' },
}

const dragFallbackNote = {
  zh: '桌面端可以直接拖拽；如果是触屏或拖拽不顺手，优先使用本关提供的“先点选、再点目标”的替代操作。',
  en: 'On desktop, drag directly. On touch screens, or whenever dragging feels awkward, use the level fallback: tap/select first, then tap the target.',
}

function step(action, zh, en) {
  return {
    action,
    label: actionLabels[action],
    description: { zh, en },
  }
}

const onboardingGuides = {
  y2: {
    1: {
      title: { zh: '身份锻造操作指引', en: 'Identity Forge Controls' },
      summary: {
        zh: '本关主要通过点击选项来生成你的地图角色。每次点击都会更新右侧预览，确认后再封印身份。',
        en: 'This level is mainly click-based. Each choice updates the live preview before you seal the final identity.',
      },
      steps: [
        step('click', '点击学习原型、发色、服装和工具卡片，观察角色预览变化。', 'Click archetype, hair, outfit, and tool cards to update the character preview.'),
        step('select', '在经历、语言、GRE 等问题中点选合适答案。', 'Select answers for experience, language, and GRE questions.'),
        step('submit', '所有必填项完成后点击“封印”按钮，保存角色并返回地图。', 'After all required fields are ready, click the seal button to save the profile and return to the map.'),
      ],
    },
    2: {
      title: { zh: '地区罗盘操作指引', en: 'Region Compass Controls' },
      summary: {
        zh: '依次点击题目选项完成匹配，最后选择你想记录的地区结果。',
        en: 'Click through the question choices, then select the region result you want to record.',
      },
      steps: [
        step('click', '阅读当前题目后点击一个答案卡片，系统会记录你的倾向。', 'Read the prompt, then click one answer card to record your preference.'),
        step('click', '使用上一题 / 下一题按钮检查或继续答题。', 'Use Previous / Next to review or continue through the questions.'),
        step('submit', '结果出现后点击目标地区，再领取奖励完成本关。', 'When the result appears, click the target region and claim the reward to finish.'),
      ],
    },
    3: {
      title: { zh: '选校分层操作指引', en: 'School Tiering Controls' },
      summary: {
        zh: '本关包含点击和拖拽：先筛选国家与案例，再把学校卡片放进 Reach / Match / Safety 分层。',
        en: 'This level uses both clicking and dragging: filter country/cases first, then place school cards into Reach / Match / Safety tiers.',
      },
      steps: [
        step('click', '先点击国家/地区，再点击“加入案例”把学校卡加入牌组。', 'Click a country/region, then click Add Case to add school cards to the deck.'),
        step('drag', '按住学校卡片并拖到 Reach、Match 或 Safety 分区。', 'Hold a school card and drag it into the Reach, Match, or Safety tier.'),
        step('click', '不方便拖拽时，先点击卡片选中，再点击目标分区完成放置。', 'If dragging is inconvenient, click a card to select it, then click the target tier to place it.'),
        step('submit', '所有卡片分层后点击预测/评估按钮查看结果。', 'After tiering all cards, click Predict/Evaluate to review the result.'),
      ],
      note: dragFallbackNote,
    },
    4: {
      title: { zh: '学长档案操作指引', en: 'Senior Case Controls' },
      summary: {
        zh: '本关用点击完成轨道选择、案例判断和下一题推进。',
        en: 'This level is click-based: choose a track, judge each case, and move through the archive.',
      },
      steps: [
        step('click', '先点击 EE 或 ICS 轨道，进入对应案例库。', 'Click the EE or ICS track to enter its case archive.'),
        step('click', '阅读案例后点击你认为正确的判断选项。', 'Read each case and click the judgment option you think is correct.'),
        step('submit', '完成一题后点击下一题，最后点击完成/领取奖励。', 'After each case, click Next, then finish or claim the reward at the end.'),
      ],
    },
    5: {
      title: { zh: '行动点分配操作指引', en: 'Action Point Controls' },
      summary: {
        zh: '通过加减按钮分配有限行动点，观察每项行动的投入变化。',
        en: 'Allocate limited action points with plus/minus buttons and watch how each action changes.',
      },
      steps: [
        step('click', '点击 + / - 调整每个任务投入的行动点。', 'Click + / - to adjust action points for each task.'),
        step('select', '留意剩余行动点，避免把点数用在低回报行动上。', 'Watch remaining action points and avoid spending too much on low-return actions.'),
        step('submit', '分配完成后点击生成预言/计划，再点击完成。', 'When allocation is ready, generate the prophecy/plan, then complete the level.'),
      ],
    },
    6: {
      title: { zh: '合约守门人操作指引', en: 'Contract Guardian Controls' },
      summary: {
        zh: '本关重点是拖拽：把安全盾牌匹配到有风险的条款上，也支持点击替代操作。',
        en: 'This level focuses on drag-and-drop: match safety shields to risky clauses, with a tap fallback available.',
      },
      steps: [
        step('drag', '从盾牌区按住一个安全盾牌，拖向对应风险条款。', 'Hold a safety shield from the shield area and drag it toward the matching risky clause.'),
        step('drop', '把盾牌放到条款右侧的投放区域，条款会显示已保护状态。', 'Drop the shield on the clause drop zone; the clause will show as protected.'),
        step('click', '触屏端可先点击盾牌，再点击条款或 + 投放区完成匹配。', 'On touch screens, tap a shield first, then tap the clause or + drop zone to match it.'),
        step('submit', '全部条款保护完成后点击完成按钮。', 'After every clause is protected, click Complete.'),
      ],
      note: dragFallbackNote,
    },
    7: {
      title: { zh: '年终试炼操作指引', en: 'Final Trial Controls' },
      summary: {
        zh: '点击答案完成测试，成功后点击抽奖机领取毕业奖励。',
        en: 'Click answers to clear the trial, then click the gacha machine to claim the graduation reward.',
      },
      steps: [
        step('click', '阅读题目后点击你认为正确的答案。', 'Read each prompt and click the answer you think is correct.'),
        step('click', '通过测试后点击抽奖机开始抽取奖励。', 'After passing, click the gacha machine to draw a reward.'),
        step('submit', '奖励出现后点击领取/完成，返回地图。', 'When the reward appears, click claim/complete to return to the map.'),
      ],
    },
  },
  y3: {
    1: {
      title: { zh: '真相熔炉操作指引', en: 'Timeline Crucible Controls' },
      summary: {
        zh: '点击材料放入两个槽位，组合出真实申请材料链；提示纸条也需要点击查看。',
        en: 'Click materials into two slots to build the application material chain; click notes to reveal hints.',
      },
      steps: [
        step('click', '点击材料卡片，把它放入空槽位；点击槽位可移除已选材料。', 'Click a material card to put it into an empty slot; click a slot to remove its material.'),
        step('submit', '两个槽位都有材料后点击融合按钮，查看是否解锁新材料。', 'Once both slots are filled, click Fuse to see whether a new material unlocks.'),
        step('click', '点击提示纸条查看隐藏线索，帮助判断下一组组合。', 'Click hint notes to reveal hidden clues for the next combination.'),
      ],
    },
    2: {
      title: { zh: '魔法事务局操作指引', en: 'Bureau of Magic Controls' },
      summary: {
        zh: '阅读卷轴片段，点击正确印章完成材料分类。',
        en: 'Read each parchment fragment and click the correct stamp to classify the material.',
      },
      steps: [
        step('click', '阅读中央卷轴内容，判断它属于 CV、PS 还是推荐信。', 'Read the central fragment and decide whether it belongs to CV, PS, or recommendation letter.'),
        step('click', '点击下方对应印章，系统会播放盖章反馈。', 'Click the matching stamp below; the board will show feedback.'),
        step('submit', '连续完成所有片段后自动结算本关。', 'Classify all fragments to settle the level automatically.'),
      ],
    },
    3: {
      title: { zh: 'CV 诊所操作指引', en: 'CV Clinic Controls' },
      summary: {
        zh: '在简历稿中点击可疑文字，逐个清除核心错误。',
        en: 'Click suspicious text in the CV draft to remove each core issue.',
      },
      steps: [
        step('click', '点击文件名、字体、邮箱、GPA、经历描述等可疑区域。', 'Click suspicious areas such as filename, font, email, GPA, and experience descriptions.'),
        step('click', '需要复习规则时点击右上角 Guide 按钮。', 'Click the Guide button when you need to review the rules.'),
        step('submit', '全部问题修复后点击领取奖励。', 'After all issues are fixed, click to claim the reward.'),
      ],
    },
    4: {
      title: { zh: '记忆星图操作指引', en: 'Memory Star Map Controls' },
      summary: {
        zh: '按叙事逻辑点击星星，组成个人陈述素材线。',
        en: 'Click stars in a logical narrative order to build the personal statement storyline.',
      },
      steps: [
        step('click', '观察星图提示，按“动机-行动-反思-目标”等逻辑点击星星。', 'Use the star-map hints and click stars in a motivation-action-reflection-goal flow.'),
        step('click', '点错或顺序不满意时点击重置重新编排。', 'If the sequence is wrong or unsatisfying, click Reset and arrange again.'),
        step('submit', '完成正确星链后点击完成按钮。', 'When the star chain is correct, click Complete.'),
      ],
    },
    5: {
      title: { zh: '推荐信导师操作指引', en: 'Mentor Dialogue Controls' },
      summary: {
        zh: '通过点击对话选项推进导师沟通，选择更礼貌、更具体的表达。',
        en: 'Click dialogue choices to progress the mentor conversation, favoring polite and specific wording.',
      },
      steps: [
        step('click', '阅读导师回复后点击一个对话选项进入下一节点。', 'Read the mentor reply and click one dialogue choice to move to the next node.'),
        step('select', '优先选择有自我介绍、具体请求和感谢的表达。', 'Prefer choices with introduction, specific requests, and appreciation.'),
        step('submit', '到达结局弹窗后点击确认完成，或重开复盘。', 'At the ending dialog, confirm completion or restart for review.'),
      ],
    },
    6: {
      title: { zh: '暗影要塞操作指引', en: 'Dark Citadel Controls' },
      summary: {
        zh: '点击城门进入月份战斗，在战斗弹窗里点击技能推进回合。',
        en: 'Click gates to enter monthly battles, then click skills in the battle dialog to advance turns.',
      },
      steps: [
        step('click', '点击已解锁城门进入该阶段；最终门需要清完前置阶段后才可点击。', 'Click an unlocked gate to enter that stage; the final gate unlocks after prior stages are cleared.'),
        step('click', '在战斗开始页点击开战，再点击技能按钮进行攻击、防护或恢复。', 'On the intro screen, click Engage, then click skill buttons to attack, defend, or recover.'),
        step('scroll', '弹窗内容较长时点击或滚动右下角提示，查看后续按钮。', 'If a dialog is long, scroll or click the lower-right cue to reach later actions.'),
        step('submit', '清完所有城门后进入最终结算并点击返回地图。', 'After clearing all gates, enter the final settlement and return to the map.'),
      ],
    },
    7: {
      title: { zh: 'DIY 沼泽排雷操作指引', en: 'DIY Bog Sweeper Controls' },
      summary: {
        zh: '读取中央风险描述，点击合适法术判断风险等级。',
        en: 'Read the central risk statement, then click the spell that matches its risk level.',
      },
      steps: [
        step('click', '阅读中央文本，判断它是致命、严重还是轻微风险。', 'Read the central text and decide whether it is fatal, severe, or minor.'),
        step('click', '点击下方对应法术按钮，等待反馈弹窗。', 'Click the matching spell button below and wait for the feedback toast.'),
        step('submit', '点击弹窗按钮进入下一条，直到完成全部排雷。', 'Click the toast button to continue until all risks are cleared.'),
      ],
    },
    8: {
      title: { zh: '星界加冕操作指引', en: 'Astral Coronation Controls' },
      summary: {
        zh: '这是结尾展示关。阅读证书和奖励后点击完成即可收束旅程。',
        en: 'This is the finale display level. Review the certificate and rewards, then click Complete to close the journey.',
      },
      steps: [
        step('click', '浏览证书、称号和奖励列表。', 'Review the certificate, title, and reward list.'),
        step('submit', '点击完成按钮记录最终通关。', 'Click Complete to record final completion.'),
        step('click', '需要退出时点击返回按钮。', 'Click Back if you need to exit.'),
      ],
    },
  },
}

const baseLevelDefinitions = {
  y2: [
    { id: 1, mapNode: 1, i18nKey: 'levels.y2.1', file: 'year2_1.vue' },
    { id: 2, mapNode: 2, i18nKey: 'levels.y2.2', file: 'year2_2.vue' },
    { id: 3, mapNode: 3, i18nKey: 'levels.y2.3', file: 'year2_3.vue' },
    { id: 4, mapNode: 4, i18nKey: 'levels.y2.4', file: 'year2_4.vue' },
    { id: 5, mapNode: 5, i18nKey: 'levels.y2.5', file: 'year2_5.vue' },
    { id: 6, mapNode: 6, i18nKey: 'levels.y2.6', file: 'year2_6.vue' },
    { id: 7, mapNode: 7, i18nKey: 'levels.y2.7', file: 'year2_7.vue' },
  ],
  y3: [
    { id: 1, mapNode: 1, i18nKey: 'levels.y3.1', file: 'year3_1.vue' },
    { id: 2, mapNode: 2, i18nKey: 'levels.y3.2', file: 'year3_2.vue' },
    { id: 3, mapNode: 3, i18nKey: 'levels.y3.3', file: 'year3_3.vue' },
    { id: 4, mapNode: 4, i18nKey: 'levels.y3.4', file: 'year3_4.vue' },
    { id: 5, mapNode: 5, i18nKey: 'levels.y3.5', file: 'year3_5.vue' },
    { id: 6, mapNode: 6, i18nKey: 'levels.y3.6', file: 'year3_6.vue' },
    { id: 7, mapNode: 7, i18nKey: 'levels.y3.7', file: 'year3_7.vue' },
    { id: 8, mapNode: 8, i18nKey: 'levels.y3.8', file: 'year3_8.vue' },
  ],
}

function attachOnboarding(year, levels) {
  return levels.map((level) => ({
    ...level,
    onboarding: onboardingGuides[year]?.[level.id] || null,
  }))
}

const levelDefinitions = {
  y2: attachOnboarding('y2', baseLevelDefinitions.y2),
  y3: attachOnboarding('y3', baseLevelDefinitions.y3),
}

export const LEVEL_DEFINITIONS = levelDefinitions

export const createInitialLevels = (year) => (
  (levelDefinitions[year] || []).map((level, index) => ({
    ...level,
    unlocked: index === 0,
    completed: false,
    skipped: false,
  }))
)

export const getLevelDefinition = (year, levelId) => (
  levelDefinitions[year]?.find((level) => level.id === levelId) ?? null
)
