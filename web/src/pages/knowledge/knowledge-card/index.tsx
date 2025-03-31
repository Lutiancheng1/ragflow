import { KnowledgeRouteKey } from '@/constants/knowledge';
import { IKnowledge } from '@/interfaces/database/knowledge';
import { formatDate } from '@/utils/date';
import {
  CalendarOutlined,
  CopyOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Card, Space, message } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'umi';

import OperateDropdown from '@/components/operate-dropdown';
import { useTheme } from '@/components/theme-provider';
import { useDeleteKnowledge } from '@/hooks/knowledge-hooks';
import { useFetchUserInfo } from '@/hooks/user-setting-hooks';
import styles from './index.less';

// 添加备用的复制方法
const copyTextToClipboard = (text: string) => {
  // 创建一个临时的文本区域
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // 设置样式，使其不可见
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
};

interface IProps {
  item: IKnowledge;
}

const KnowledgeCard = ({ item }: IProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: userInfo } = useFetchUserInfo();
  const { theme } = useTheme();
  const { deleteKnowledge } = useDeleteKnowledge();

  const removeKnowledge = async () => {
    return deleteKnowledge(item.id);
  };

  const handleCardClick = () => {
    navigate(`/knowledge/${KnowledgeRouteKey.Dataset}?id=${item.id}`, {
      state: { from: 'list' },
    });
  };

  return (
    <Badge.Ribbon
      text={item.nickname}
      color={userInfo.nickname === item.nickname ? '#1677ff' : 'pink'}
      className={classNames(styles.ribbon, {
        [styles.hideRibbon]: item.permission !== 'team',
      })}
    >
      <Card className={styles.card} onClick={handleCardClick}>
        <div className={styles.container}>
          <div className={styles.content}>
            <Avatar size={34} icon={<UserOutlined />} src={item.avatar} />

            <OperateDropdown
              deleteItem={removeKnowledge}
              items={[
                {
                  key: '2',
                  label: (
                    <Space>
                      复制ID <CopyOutlined />
                    </Space>
                  ),
                  onClick: () => {
                    try {
                      // 尝试使用现代 Clipboard API
                      navigator.clipboard
                        .writeText(item.id)
                        .then(() => {
                          message.success('ID已复制到剪贴板');
                        })
                        .catch((error) => {
                          console.error(
                            'Clipboard API 失败, 尝试备用方法:',
                            error,
                          );
                          // 使用备用方法
                          if (copyTextToClipboard(item.id)) {
                            message.success('ID已复制到剪贴板');
                          } else {
                            message.error('复制失败，请手动复制');
                          }
                        });
                    } catch (error) {
                      console.error('复制失败:', error);
                      // 出错时尝试备用方法
                      if (copyTextToClipboard(item.id)) {
                        message.success('ID已复制到剪贴板');
                      } else {
                        message.error('复制失败，请手动复制');
                      }
                    }
                  },
                },
              ]}
            ></OperateDropdown>
          </div>
          <div className={styles.titleWrapper}>
            <span
              className={theme === 'dark' ? styles.titledark : styles.title}
            >
              {item.name}
            </span>
            <p
              className={
                theme === 'dark' ? styles.descriptiondark : styles.description
              }
            >
              {item.description}
            </p>
          </div>
          <div className={styles.footer}>
            <div className={styles.footerTop}>
              <div className={styles.bottomLeft}>
                <FileTextOutlined className={styles.leftIcon} />
                <span className={styles.rightText}>
                  <Space>
                    {item.doc_num}
                    {t('knowledgeList.doc')}
                  </Space>
                </span>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.bottomLeft}>
                <CalendarOutlined className={styles.leftIcon} />
                <span className={styles.rightText}>
                  {formatDate(item.update_time)}
                </span>
              </div>
              {/* <Avatar.Group size={25}>
                <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
                <a href="https://ant.design">
                  <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
                </a>
                <Tooltip title="Ant User" placement="top">
                  <Avatar
                    style={{ backgroundColor: '#87d068' }}
                    icon={<UserOutlined />}
                  />
                </Tooltip>
                <Avatar
                  style={{ backgroundColor: '#1677ff' }}
                  icon={<AntDesignOutlined />}
                />
              </Avatar.Group> */}
            </div>
          </div>
        </div>
      </Card>
    </Badge.Ribbon>
  );
};

export default KnowledgeCard;
