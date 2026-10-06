/**
 * 演示数据填充脚本
 *
 * 用法:npm run db:seed
 * 行为:数据库已有用户数据时跳过;空库时写入板块、演示用户、帖子等示例数据。
 * 演示账号密码统一为 123456。
 */
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { scryptSync, randomBytes } from 'crypto';
import postgres from 'postgres';

import * as schema from './schema';

config();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('缺少 DATABASE_URL 环境变量,请先配置 .env');
    process.exit(1);
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client, { schema });

  const existing = await db.select({ id: schema.forumUser.id }).from(schema.forumUser).limit(1);
  if (existing.length > 0) {
    console.log('数据库已有用户数据,跳过 seed。如需重置请先清空数据库。');
    await client.end();
    return;
  }

  console.log('开始写入演示数据...');

  const hashPassword = (password: string): string => {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
  };

  const password = hashPassword('123456');
  const users = await db
    .insert(schema.forumUser)
    .values([
      {
        username: 'admin',
        passwordHash: password,
        displayName: '守夜人总部',
        isAdmin: true,
        organization: '守夜人总部',
        position: '论坛管理员',
        bio: '维护论坛秩序,发布官方通报。',
        reputation: 9999,
        dangerLevel: 'normal',
      },
      {
        username: 'yeshexing',
        passwordHash: password,
        displayName: '夜行者',
        organization: '自由驭鬼者',
        position: '资深驭鬼者',
        bio: '专精 C 级以下怨灵收容,接单中。',
        reputation: 2350,
        postCount: 48,
        ghostInfo: '馗道之影(B级,已签订契约)',
        ghostItems: '桃木剑(勉强能用)',
        dangerLevel: 'dangerous',
      },
      {
        username: 'zhirenzhang',
        passwordHash: password,
        displayName: '纸人张',
        organization: '纸扎铺',
        position: '手艺人',
        bio: '纸人替身,童叟无欺。别问原料哪来的。',
        reputation: 1180,
        postCount: 21,
        dangerLevel: 'normal',
      },
      {
        username: 'guijianchou',
        passwordHash: password,
        displayName: '鬼见愁',
        organization: '无',
        position: '新人',
        bio: '上周才觉醒,现在还活着,感觉良好。',
        reputation: 66,
        postCount: 3,
        dangerLevel: 'normal',
      },
    ])
    .returning({ id: schema.forumUser.id, username: schema.forumUser.username });

  const userId = Object.fromEntries(users.map((u) => [u.username, u.id]));

  const boards = await db
    .insert(schema.board)
    .values([
      {
        slug: 'newbie',
        name: '新人报到',
        description: '刚觉醒?先来这里报到。看清三条铁律,再谈别的。',
        icon: 'door-open',
        sortOrder: 1,
      },
      {
        slug: 'ghost-discuss',
        name: '鬼事讨论',
        description: '诡异见闻、经历分享。注明地点与时间,别拿假事刷存在感。',
        icon: 'message-square',
        sortOrder: 2,
      },
      {
        slug: 'ghost-rules',
        name: '规则怪谈',
        description: '洞察鬼的规律,是活命的根本。规则收集、验证、讨论。',
        icon: 'scroll-text',
        sortOrder: 3,
      },
      {
        slug: 'battle-log',
        name: '历练实录',
        description: '驭鬼战斗复盘。死人不会发帖,发帖的都有资格骄傲。',
        icon: 'swords',
        sortOrder: 4,
      },
      {
        slug: 'help',
        name: '紧急求援',
        description: '遭遇鬼袭,请求支援。务必写清位置、鬼的等级与特征。',
        icon: 'siren',
        sortOrder: 5,
      },
    ])
    .returning({ id: schema.board.id, slug: schema.board.slug });

  const boardId = Object.fromEntries(boards.map((b) => [b.slug, b.id]));

  const posts = await db
    .insert(schema.post)
    .values([
      {
        boardId: boardId['newbie'],
        userId: userId['guijianchou'],
        title: '【新人报到】觉醒第三天,暂时还活着',
        content:
          '如题。上周三在家撞见了不该看的东西,醒来后手心多了一道疤,疤里有字。\n\n看版规说觉醒后 72 小时内死亡率最高,我已经过了这个坎。求各位前辈指点:第一只鬼一般多久会找上门?\n\n在线等,挺急的。',
        viewCount: 356,
      },
      {
        boardId: boardId['ghost-rules'],
        userId: userId['yeshexing'],
        title: '【精华】红衣怨灵行为规律整理(附验证记录)',
        content:
          '三个月,十七次接触,同一只东西。以下规律全部经过实测:\n\n1. 它只在凌晨 2:14-2:41 之间移动,误差不超过一分钟;\n2. 镜子对它无效,但对镜中你看得到的东西有效——别问,记住就行;\n3. 黄金制品能延缓它的行动约 3 秒,3 秒够跑一个楼层;\n4. 它不进有烟火气的房子。\n\n欢迎补充,但请附验证方式。没验证过的东西发在这里,害死的是活人。',
        isEssence: true,
        isPinned: true,
        viewCount: 1280,
      },
      {
        boardId: boardId['ghost-discuss'],
        userId: userId['zhirenzhang'],
        title: '最近老城区的纸扎生意突然变好了,有点不对劲',
        content:
          '做了十几年纸扎,第一次连着一个月每天有人来订纸人,而且订的都说不出用途。有个客人订了七个,一模一样的脸。\n\n那张脸我认识,是我二十年前亲手烧掉的一个人。\n\n有没有同行遇到类似情况?',
        viewCount: 892,
      },
      {
        boardId: boardId['battle-log'],
        userId: userId['yeshexing'],
        title: 'C级怨灵收容实录:纺织厂宿舍楼',
        content:
          '委托方:守夜人总部。地点:城西纺织厂宿舍楼 3 号楼。\n\n目标:怨灵「缝口婆」,等级 C。特征:手持缝衣针,专挑凌晨上夜班的工人。\n\n过程不赘述,结论:鬼打鬼是真的可行。我带了另一只低阶怨灵做诱饵,它俩互相撕了四十分钟,缝口婆被拖回笼子里的时候只剩半张脸。\n\n损失:诱饵怨灵,阵亡。工钱照付,谢谢。',
        viewCount: 640,
      },
      {
        boardId: boardId['help'],
        userId: userId['guijianchou'],
        title: '【求援】大学城西区宿舍楼,疑似 B 级,速来',
        content:
          '现在凌晨 2 点,我在宿舍楼天台发帖。\n\n楼里所有人开始梦游,往同一个方向走。我用黄金吊坠能挡住自己,但撑不了多久。这东西的压迫感和我上次见的 C 级完全不是一个量级。\n\n坐标在跟帖里发。有空的来,救命之恩,做牛做马。',
        viewCount: 2105,
      },
    ])
    .returning({ id: schema.post.id, title: schema.post.title });

  await db.insert(schema.reply).values([
    {
      postId: posts[0].id,
      userId: userId['yeshexing'],
      content: '能上来发帖说明已经不是最危险的阶段了。把疤拍下来发到规则区,有人认识那个字的话,会告诉你的。',
      floor: 1,
    },
    {
      postId: posts[0].id,
      userId: userId['zhirenzhang'],
      content: '别照镜子,别数楼梯,别答应任何声音提出的要求。做完这三条,你至少能撑到有人来。',
      floor: 2,
    },
    {
      postId: posts[2].id,
      userId: userId['guijianchou'],
      content: '……我订的七个纸人里,好像也有你说的那个脸。地址我私发你。',
      floor: 1,
    },
    {
      postId: posts[4].id,
      userId: userId['yeshexing'],
      content: '收到。20 分钟后到,天台别动,把你所有的金饰摊开放脚边。',
      floor: 1,
    },
  ]);

  // 同步帖子回复数,保持列表页计数一致
  const replyCounts = [2, 0, 1, 0, 1];
  for (const [index, post] of posts.entries()) {
    const replyCount = replyCounts[index] ?? 0;
    if (replyCount > 0) {
      await db
        .update(schema.post)
        .set({ replyCount })
        .where(eq(schema.post.id, post.id));
    }
  }

  await db.insert(schema.bounty).values([
    {
      userId: userId['admin'],
      title: '【官方悬赏】收集「镜中人」活动规律的独立验证记录',
      description:
        '需要至少三份不同地点、不同驭鬼者的独立验证记录,证明或证伪以下规律:镜面破碎会导致镜中人暂时获得实体,持续约 9 秒。\n\n验证过程需完整记录,接受 视频/文字 提交。虚假记录将被永久拉入论坛黑名单。',
      dangerLevel: 'A',
      reward: 5000,
      ghostName: '镜中人',
      ghostRules: '镜面破碎后短暂实体化,约 9 秒。',
      status: 'open',
    },
    {
      userId: userId['zhirenzhang'],
      title: '求购线索:老城区订纸人的神秘客人',
      description:
        '近一个月连续出现的不明订货人,特征:只订纸人、说不出用途、付款用旧版纸币。\n\n提供有效线索者,酬谢纸人替身一只。',
      dangerLevel: 'C',
      reward: 800,
      status: 'open',
    },
  ]);

  await db.insert(schema.wantedPerson).values([
    {
      title: '通缉:驭鬼者「笑面先生」',
      targetName: '笑面先生',
      description:
        '真名不详。惯用微笑面具,身穿灰色长衫。以驱鬼为名诱杀觉醒者,至少七名新人驭鬼者失踪与其相关。\n\n极度危险,切勿单独接近。发现踪迹请立即上报总部。',
      dangerLevel: 'S',
      bountyAmount: 50000,
      status: 'active',
      lastSeen: '城南旧货市场',
    },
    {
      title: '通缉:脱管怨灵「缝口婆」的释放者',
      targetName: '(身份不明)',
      description:
        '纺织厂宿舍楼收容事故的肇事者。破环收容笼锁,导致 C 级怨灵脱管,致三名工人重伤。\n\n知情者请提供线索。',
      dangerLevel: 'B',
      bountyAmount: 3000,
      status: 'active',
      lastSeen: '城西纺织厂',
    },
  ]);

  await db.insert(schema.trade).values([
    {
      userId: userId['zhirenzhang'],
      title: '出售:纸人替身(受过香火,能挡一次)',
      content:
        '全新纸人替身,受过 49 天香火,关键时刻能替你挡一次致命伤。挡完即毁。\n\n价格面议,不接急单,只收现金或等价线索。',
      tradeType: 'sell',
      itemType: '灵性道具',
      price: '面议',
      status: 'open',
    },
    {
      userId: userId['yeshexing'],
      title: '求购:黄金制品(旧货最好)',
      content:
        '长期收黄金:金饰、金条、旧金器均可,成色不限。价格随行就市,量大的优先。\n\n别问我拿去干什么,问了也不说。',
      tradeType: 'buy',
      itemType: '黄金制品',
      price: '随行就市',
      status: 'open',
    },
  ]);

  await db.insert(schema.announcement).values([
    {
      title: '论坛规则与三条铁律(必读)',
      content:
        '欢迎来到驭鬼者论坛。\n\n在这里,先记住三条铁律:\n\n一、鬼,无法被杀死。你能做到的最多是收容、驱离、或者逃。\n二、只有鬼能对付鬼。驭鬼者驾驭的是鬼,不是宠物,代价随时会来。\n三、洞察鬼的规律。规律即生路,不了解规律的行动等于自杀。\n\n另:禁止发布未经验证的规则;禁止人肉交易涉及活人祭品;违者封号,情节严重者交由总部处理。',
      isPinned: true,
    },
  ]);

  await db.insert(schema.hqEvent).values([
    {
      userId: userId['admin'],
      title: '【S级事件】城南「无面列车」目击通报',
      content:
        '近两周,城南铁路支线多次出现不明列车,车厢内乘客均无面部特征。已确认三名目击驭鬼者失忆。\n\n总部判定为 S 级事件,全员禁止单独接近该支线。相关规律讨论请投稿至事件专帖。',
      dangerLevel: 'S',
      eventLocation: '城南铁路支线',
      ghostName: '无面列车',
      ghostRules: '收集验证中:不买票、不报站、不看窗外。',
      status: 'active',
      viewCount: 4310,
    },
    {
      userId: userId['yeshexing'],
      title: '大学城西区梦游事件已收容(后续通报)',
      content:
        '昨夜求援帖涉及的宿舍楼梦游事件,已由本人联合两名自由驭鬼者完成初步收容。\n\n肇事体为 B 级怨灵「引路童子」,已被送入总部收容库。宿舍楼恢复正常。\n\n感谢现场配合的诸位。',
      dangerLevel: 'B',
      eventLocation: '大学城西区宿舍楼',
      ghostName: '引路童子',
      ghostRules: '黄铜铃铛可使其停顿;黄金无效(已实测)。',
      status: 'contained',
      viewCount: 1876,
    },
  ]);

  await db.insert(schema.hqMission).values([
    {
      userId: userId['admin'],
      title: '【总部任务】护送收容笼:三号仓库至东区',
      content: '护送 B 级怨灵收容笼,途经两个闹鬼路段。需要至少三名驭鬼者随行,黄金武器优先。',
      missionType: 'transport',
      dangerLevel: 'B',
      location: '三号仓库 → 东区收容所',
      requirements: '驭鬼者等级不限,需持有可驱动怨灵的武器或道具。',
      status: 'pending',
      reward: 2000,
    },
    {
      userId: userId['zhirenzhang'],
      title: '【求助】纸扎铺夜间看守',
      content: '连续两周夜里有人往铺子门口放纸钱,放纸钱的人第二天必死。求有经验的驭鬼者夜里帮忙守一守。',
      missionType: 'support',
      dangerLevel: 'C',
      location: '老城区纸扎铺',
      requirements: '熟悉怨灵夜行规律者优先。',
      status: 'pending',
      reward: 600,
    },
  ]);

  console.log('演示数据写入完成。');
  console.log('演示账号:admin / yeshexing / zhirenzhang / guijianchou,密码均为 123456');
  await client.end();
}

main().catch((err) => {
  console.error('seed 失败:', err);
  process.exit(1);
});
