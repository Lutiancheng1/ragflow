import { Button } from '@/components/ui/button';
import { Segmented, SegmentedValue } from '@/components/ui/segmented ';
import { useTranslate } from '@/hooks/common-hooks';
import { useNavigatePage } from '@/hooks/logic-hooks/navigate-hooks';
import { useNavigateWithFromState } from '@/hooks/route-hook';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { Cpu, House, Library, MessageSquareText, Search } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'umi';

export function Header() {
  const { t } = useTranslate('header');
  const { pathname } = useLocation();
  const navigate = useNavigateWithFromState();
  const { navigateToHome } = useNavigatePage();

  const tagsData = useMemo(
    () => [
      { path: Routes.Datasets, name: t('knowledgeBase'), icon: Library },
      { path: Routes.Chat, name: t('chat'), icon: MessageSquareText },
      { path: Routes.Search, name: t('search'), icon: Search },
      { path: Routes.Agent, name: t('flow'), icon: Cpu },
      // { path: '/file', name: t('fileManager'), icon: FileIcon },
    ],
    [t],
  );

  const options = useMemo(() => {
    return tagsData.map((tag) => {
      const HeaderIcon = tag.icon;

      return {
        label: (
          <div className="flex items-center gap-1">
            <HeaderIcon className="size-5"></HeaderIcon>
            <span>{tag.name}</span>
          </div>
        ),
        value: tag.path,
      };
    });
  }, [tagsData]);

  const currentPath = useMemo(() => {
    return (
      tagsData.find((x) => pathname.startsWith(x.path))?.path || Routes.Home
    );
  }, [pathname, tagsData]);

  const isHome = Routes.Home === currentPath;

  const handleChange = (path: SegmentedValue) => {
    navigate(path as Routes);
  };

  const handleLogoClick = useCallback(() => {
    navigate(Routes.Home);
  }, [navigate]);

  return (
    <section className="py-6 px-10 flex justify-between items-center border-b">
      <div className="flex items-center gap-4">
        <img
          src={'/logo.png'}
          alt="logo"
          className="w-[100] h-[100] mr-[12]"
          onClick={handleLogoClick}
        />
      </div>
      <div className="flex gap-2 items-center">
        <Button
          variant={'icon'}
          size={'icon'}
          onClick={navigateToHome}
          className={cn({
            'bg-colors-background-inverse-strong': isHome,
          })}
        >
          <House
            className={cn({
              'text-colors-text-inverse-strong': isHome,
            })}
          />
        </Button>
        <div className="h-8 w-[1px] bg-colors-outline-neutral-strong"></div>
        <Segmented
          options={options}
          value={currentPath}
          onChange={handleChange}
          className="bg-colors-background-inverse-standard text-backgroundInverseStandard-foreground"
        ></Segmented>
      </div>
    </section>
  );
}
