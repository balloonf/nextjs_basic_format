"use client";

import { useNavigation } from "@/components/providers/context/navigation-context";
import { loadComponentByUrl } from "@/utils/page-loader";

export default function Home() {
  const { activeMainItem, activeSubItem } = useNavigation();

  const renderContent = () => {
    // 서브 아이템이 선택된 경우
    if (activeSubItem) {
      return loadComponentByUrl(activeSubItem.url);
    }
    
    // 메인 아이템만 선택된 경우 (서브 아이템이 없는 경우)
    if (activeMainItem && activeMainItem.url && activeMainItem.url !== "#") {
      return loadComponentByUrl(activeMainItem.url);
    }
    
    // 선택된 항목이 없는 경우 기본 컨텐츠 표시
    return (
      <>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {renderContent()}
    </div>
  );
}
